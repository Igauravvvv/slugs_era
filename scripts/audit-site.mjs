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

for (const route of ['/privacy-policy', '/terms', '/faq']) {
  check(app.includes(`path="${route}"`), `route exists: ${route}`);
  check(sitemap.includes(`path: '${route}'`), `sitemap includes: ${route}`);
}
check(app.includes('path="*"'), 'custom 404 route exists');
check(robots.includes('Sitemap: https://www.slugsera.com/sitemap.xml'), 'robots.txt points to sitemap');
check(existsSync(resolve(root, 'public/favicon.svg')), 'favicon exists');
check(index.includes('google-site-verification'), 'search verification remains configured');
check(!index.includes('googletagmanager.com/gtag/js'), 'analytics is not loaded before consent');
check(analytics.includes("=== 'accepted'"), 'analytics is gated by explicit consent');
check(footer.includes('/privacy-policy') && footer.includes('/terms'), 'legal links are discoverable');
check(contact.includes('/api/contact'), 'contact form uses a real endpoint');
check(app.includes('structuredData'), 'FAQ structured data is present');

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
