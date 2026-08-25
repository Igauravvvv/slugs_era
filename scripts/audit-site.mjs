import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const failures = [];
const checks = [];
const check = (condition, message) => {
  checks.push(message);
  if (!condition) failures.push(message);
};

const app = read('src/App.tsx');
const index = read('index.html');
const robots = read('public/robots.txt');
const sitemap = read('api/sitemap.ts');
const footer = read('src/sections/Footer.tsx');
const analytics = read('src/lib/analytics.ts');
const contact = read('src/pages/Contact.tsx');
const productCard = read('src/components/ProductCard.tsx');
const productDetail = read('src/pages/ProductDetail.tsx');
const vercel = read('vercel.json');
const seoPages = JSON.parse(read('src/data/seo-pages.json'));

for (const route of ['/privacy-policy', '/terms', '/faq']) {
  check(app.includes(`path="${route}"`), `route exists: ${route}`);
  check(sitemap.includes(`path: '${route}'`), `sitemap includes: ${route}`);
}
check(app.includes('path="*"'), 'custom 404 route exists');
check(existsSync(resolve(root, 'public/404.html')), 'static custom 404 fallback exists');
check(!vercel.includes('"source": "/(.*)"'), 'unknown URLs can return a real HTTP 404');
check(robots.includes('Sitemap: https://www.slugsera.com/sitemap.xml'), 'robots.txt points to sitemap');
check(existsSync(resolve(root, 'public/favicon.svg')), 'favicon exists');
check(existsSync(resolve(root, 'public/favicon.ico')) && existsSync(resolve(root, 'public/apple-touch-icon.png')), 'multi-format favicon set exists');
check(index.includes('google-site-verification'), 'search verification remains configured');
check(!index.includes('googletagmanager.com/gtag/js'), 'analytics is not loaded before consent');
check(analytics.includes("=== 'accepted'"), 'analytics is gated by explicit consent');
check(footer.includes('/privacy-policy') && footer.includes('/terms'), 'legal links are discoverable');
check(contact.includes('/api/contact'), 'contact form uses a real endpoint');
check(app.includes('structuredData'), 'FAQ structured data is present');
check(footer.includes('<Link') && !footer.includes("navigate('/privacy-policy')"), 'footer navigation uses crawlable links');
check(productCard.includes('to={productUrl}'), 'product cards expose crawlable product links');
check(productDetail.includes("generateSlug(selectedProduct.name)"), 'product canonicals use descriptive name slugs');
check(sitemap.includes('xmlns:image='), 'XML sitemap includes image discovery markup');
check(read('package.json').includes('generate-seo-pages.mjs'), 'build generates route-specific HTML metadata');
check(!index.includes('fonts.googleapis.com') && !read('src/index.css').includes('fonts.googleapis.com'), 'landing fonts are self-hosted and non-blocking');
check(!app.includes('<Loader isLoading='), 'landing page has no artificial loading overlay');
check(read('src/sections/Hero.tsx').includes('srcSet='), 'hero uses responsive CDN image variants');
check(read('src/components/ui/expand-cards.tsx').includes('IntersectionObserver') && read('src/components/ui/expand-cards.tsx').includes('loading="lazy"'), 'below-fold value images load only near the viewport');
check(existsSync(resolve(root, 'api/image.ts')) && productCard.includes('optimizedProductImageUrl'), 'dynamic product images use the cached WebP CDN endpoint');

const titles = seoPages.map((page) => page.title.trim().toLowerCase());
const descriptions = seoPages.map((page) => page.description.trim().toLowerCase());
check(new Set(titles).size === titles.length, 'all indexable page titles are unique');
check(new Set(descriptions).size === descriptions.length, 'all indexable page descriptions are unique');
for (const page of seoPages) {
  check(page.title.length >= 30 && page.title.length <= 70, `${page.path} title is descriptive and concise`);
  check(page.description.length >= 110 && page.description.length <= 170, `${page.path} description has useful search context`);
  if (page.path.startsWith('/blog/')) check(sitemap.includes(`path: '${page.path}'`), `sitemap includes article: ${page.path}`);
  if (!page.path.startsWith('/product/')) check(sitemap.includes(`path: '${page.path}'`), `sitemap includes page: ${page.path}`);
}

const sourceFiles = ['src/App.tsx', 'src/sections/Footer.tsx', 'src/pages/Contact.tsx'];
for (const file of sourceFiles) {
  check(!read(file).includes('<img src=') || /alt=/.test(read(file)), `${file} image markup includes alt text`);
}

if (failures.length) {
  console.error(`Site audit failed (${failures.length}/${checks.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Site audit passed: ${checks.length} checks.`);
