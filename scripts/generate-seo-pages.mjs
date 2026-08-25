import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const siteUrl = 'https://www.slugsera.com';
const pages = JSON.parse(readFileSync(resolve(root, 'src/data/seo-pages.json'), 'utf8'));
const template = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const summarize = (value, max = 132) => {
  const clean = stripHtml(value).replace(/["“”]/g, '');
  if (clean.length <= max) return clean.replace(/[.,;:]?$/, '.');
  const clipped = clean.slice(0, max + 1);
  return `${clipped.slice(0, clipped.lastIndexOf(' ')).replace(/[.,;:]?$/, '')}…`;
};
const slugify = (value = '') => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const absolute = (value = '') => value.startsWith('http') ? value : `${siteUrl}${value}`;

function headMarkup(page) {
  const url = `${siteUrl}${page.path === '/' ? '/' : page.path}`;
  const image = absolute(page.image || '/images/Female_model_vinyl.webp');
  const schema = page.schema || {
    '@context': 'https://schema.org', '@type': 'WebPage', name: page.h1 || page.title,
    url, description: page.description, isPartOf: { '@id': `${siteUrl}/#website` },
  };
  return `\n    <!-- GENERATED_SEO_START -->\n    <meta data-static-seo="true" name="description" content="${escapeHtml(page.description)}" />\n    <meta data-static-seo="true" name="robots" content="index, follow, max-image-preview:large" />\n    <link data-static-seo="true" rel="canonical" href="${url}" />\n    <link data-static-seo="true" rel="alternate" hreflang="en-IN" href="${url}" />\n    <link data-static-seo="true" rel="alternate" hreflang="x-default" href="${url}" />\n    <meta data-static-seo="true" property="og:type" content="${page.type || 'website'}" />\n    <meta data-static-seo="true" property="og:site_name" content="Slug's Era" />\n    <meta data-static-seo="true" property="og:locale" content="en_IN" />\n    <meta data-static-seo="true" property="og:url" content="${url}" />\n    <meta data-static-seo="true" property="og:title" content="${escapeHtml(page.title)}" />\n    <meta data-static-seo="true" property="og:description" content="${escapeHtml(page.description)}" />\n    <meta data-static-seo="true" property="og:image" content="${escapeHtml(image)}" />\n    <meta data-static-seo="true" name="twitter:card" content="summary_large_image" />\n    <meta data-static-seo="true" name="twitter:title" content="${escapeHtml(page.title)}" />\n    <meta data-static-seo="true" name="twitter:description" content="${escapeHtml(page.description)}" />\n    <meta data-static-seo="true" name="twitter:image" content="${escapeHtml(image)}" />\n    <script data-static-seo="true" type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>\n    <!-- GENERATED_SEO_END -->`;
}

function renderPage(page) {
  const cleanTemplate = template.replace(/\s*<!-- GENERATED_SEO_START -->[\s\S]*?<!-- GENERATED_SEO_END -->/g, '');
  const base = page.path === '/' ? cleanTemplate : cleanTemplate.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, (block) => block.includes('#homepage') ? '' : block);
  return base
    .replace(/<title(?:\s+[^>]*)?>[\s\S]*?<\/title>/, `<title data-rh="true">${escapeHtml(page.title)}</title>`)
    .replace('    <meta name="author"', `${headMarkup(page)}\n    <meta name="author"`);
}

function writePage(page) {
  if (page.path === '/') {
    writeFileSync(resolve(root, 'dist/index.html'), renderPage(page));
    return;
  }
  const file = resolve(root, `dist${page.path}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderPage(page));
}

async function loadProducts() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=*&is_published=eq.true`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
    if (response.ok) return response.json();
  }
  try {
    const xml = await (await fetch(`${siteUrl}/merchant-feed.xml`)).text();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
      const value = (tag) => (item.match(new RegExp(`<g:${tag}>([\\s\\S]*?)<\\/g:${tag}>`))?.[1] || '')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      return { id: value('id'), name: value('title'), description: value('description'), image: value('image_link'), price: Number(value('price').split(' ')[0]), category: value('product_type'), status: value('availability') === 'in_stock' ? 'active' : 'sold_out' };
    });
  } catch { return []; }
}

pages.forEach(writePage);
const products = await loadProducts();
for (const product of products) {
  if (!product.name || product.status === 'coming_soon' || product.status === 'pre_book') continue;
  const slug = slugify(product.name);
  const categoryValue = String(product.category || '').toLowerCase();
  const category = categoryValue.includes('hood')
    ? 'Oversized Hoodie'
    : /\b(?:t[\s-]?shirts?|tshirts?|tees?)\b/.test(categoryValue)
      ? 'Oversized T-Shirt'
      : categoryValue.includes('shirt')
        ? 'Printed Shirt'
        : 'Oversized T-Shirt';
  const description = stripHtml(product.description) || `${product.name}, a premium ${category.toLowerCase()} by Slugsera.`;
  const productImage = product.image || product.images?.find?.((image) => image.isPrimary)?.url || product.images?.[0]?.url || '';
  writePage({
    path: `/product/${slug}`,
    title: `${product.name} ${category} | Slugsera`,
    description: `${summarize(description)} Shop online in India.`,
    h1: product.name,
    image: productImage,
    type: 'product',
    schema: {
      '@context': 'https://schema.org', '@type': 'Product', name: product.name, description,
      ...(productImage ? { image: [absolute(productImage)] } : {}), sku: product.id,
      brand: { '@type': 'Brand', name: 'Slugsera' },
      offers: {
        '@type': 'Offer', url: `${siteUrl}/product/${slug}`, priceCurrency: 'INR', price: String(Number(product.price) || 0), availability: `https://schema.org/${product.status === 'sold_out' ? 'OutOfStock' : 'InStock'}`, itemCondition: 'https://schema.org/NewCondition',
        shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'INR' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' } } },
        hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', applicableCountry: 'IN', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 7, returnMethod: 'https://schema.org/ReturnByMail', returnFees: 'https://schema.org/ReturnShippingFees' },
      },
    },
  });
}
console.log(`Generated SEO HTML for ${pages.length} pages and ${products.length} product records.`);
