import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.slugsera.com';

type ProductImage = { url?: string; isPrimary?: boolean };
type SizeStock = { stock?: number; preOrder?: boolean };

type DbProduct = {
  id: string;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  price?: number | string | null;
  images?: ProductImage[] | null;
  image?: string | null;
  stock_quantity?: number | null;
  size_stock?: SizeStock[] | null;
  status?: string | null;
  is_published?: boolean | null;
  colors?: Array<{ name?: string; hex?: string } | string> | null;
  sizes?: string[] | null;
  material?: string | null;
};

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const plainText = (value: string | null | undefined) => (value || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const productSlug = (product: DbProduct) => (product.name || 'product')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const absoluteUrl = (url: string) => url.startsWith('http') ? url : `${SITE_URL}${url}`;

const categoryLabel = (category: string | null | undefined) => ({
  tshirts: 'T-Shirts',
  shirts: 'Shirts',
  hoodies: 'Hoodies',
  accessories: 'Accessories',
}[category || ''] || 'Clothing');

const availability = (product: DbProduct) => {
  if (product.status === 'coming_soon' || product.status === 'pre_book') return 'preorder';
  if (product.status === 'sold_out') return 'out_of_stock';

  const sizeStock = Array.isArray(product.size_stock)
    ? product.size_stock.reduce((total, item) => total + (Number(item.stock) || 0), 0)
    : null;
  const stock = sizeStock === null ? Number(product.stock_quantity) || 0 : sizeStock;
  return stock > 0 ? 'in_stock' : 'out_of_stock';
};

function tag(name: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '';
  return `      <g:${name}>${escapeXml(String(value))}</g:${name}>\n`;
}

function itemXml(product: DbProduct) {
  const images = Array.isArray(product.images) ? product.images : [];
  const primaryImage = images.find((image) => image.isPrimary)?.url || images[0]?.url || product.image || '';
  const additionalImages = images
    .map((image) => image.url)
    .filter((url): url is string => Boolean(url) && url !== primaryImage)
    .slice(0, 9);
  const colors = (product.colors || [])
    .map((color) => typeof color === 'string' ? color : color.name || color.hex || '')
    .filter(Boolean)
    .join(', ');
  const price = Number(product.price) || 0;
  const name = product.name || 'Slugsera product';
  const description = plainText(product.description) || `${name} by Slugsera.`;

  return `  <item>\n${tag('id', product.id)}${tag('title', name)}${tag('description', description)}${tag('link', `${SITE_URL}/product/${productSlug(product)}`)}${tag('image_link', primaryImage ? absoluteUrl(primaryImage) : '')}${additionalImages.map((url) => tag('additional_image_link', absoluteUrl(url))).join('')}${tag('availability', availability(product))}${tag('price', `${price.toFixed(2)} INR`)}${tag('condition', 'new')}${tag('brand', 'Slugsera')}${tag('google_product_category', 'Apparel & Accessories > Clothing')}${tag('product_type', categoryLabel(product.category))}${tag('color', colors)}${tag('size', (product.sizes || []).join(', '))}${tag('material', product.material)}    </item>`;
}

/**
 * Google Merchant Center RSS feed. It is sourced from the same published
 * products table as the storefront, so price, stock, URLs, and imagery stay
 * aligned with the dashboard instead of requiring a manual spreadsheet.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  let products: DbProduct[] = [];

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('products')
      // Keep this schema-tolerant: dashboard migrations may add or rename
      // optional product fields, but a feed should never become empty because
      // one enrichment field is unavailable in an older project.
      .select('*')
      .eq('is_published', true);

    if (error) {
      console.error('Could not build Merchant Center feed:', error.message);
    } else {
      // Coming-soon cards belong in the storefront collection, not Google
      // Shopping. Merchant Center requires an availability_date for preorders;
      // submitting a teaser without a confirmed date causes a disapproval.
      // Keep the feed limited to items shoppers can buy now (or sold-out items
      // that can correctly be shown as out_of_stock).
      products = ((data || []) as DbProduct[])
        .filter((product) => product.status !== 'coming_soon' && product.status !== 'pre_book');
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>Slugsera product feed</title>\n    <link>${SITE_URL}</link>\n    <description>Published Slugsera products for Google Merchant Center.</description>\n${products.map(itemXml).join('\n')}\n  </channel>\n</rss>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
