import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.slugsera.com';

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/collections', priority: '0.9', changefreq: 'weekly' },
  { path: '/collections/tshirts', priority: '0.8', changefreq: 'weekly' },
  { path: '/collections/shirts', priority: '0.8', changefreq: 'weekly' },
  { path: '/collections/hoodies', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/lookbook', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/what-is-slugsera-slow-fashion-movement', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/why-were-called-slugs-era', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/slugsera-guide-oversized-t-shirts', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/slow-fashion-vs-fast-fashion-slugsera', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/slugsera-lookbook-styling-streetwear', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/shipping-policy', priority: '0.4', changefreq: 'monthly' },
  { path: '/return-policy', priority: '0.4', changefreq: 'monthly' },
];

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const productSlug = (product: { slug?: string | null; name: string }) => product.slug
  || product.name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function sitemapUrl(path: string, priority: string, changefreq: string) {
  return `  <url>\n    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  let products: Array<{ slug?: string | null; name: string }> = [];

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('products')
      .select('slug,name')
      .eq('is_published', true);

    if (error) {
      console.error('Could not add products to sitemap:', error.message);
    } else {
      products = data || [];
    }
  }

  const urls = [
    ...STATIC_PAGES.map((page) => sitemapUrl(page.path, page.priority, page.changefreq)),
    ...products.map((product) => sitemapUrl(`/product/${productSlug(product)}`, '0.8', 'weekly')),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
