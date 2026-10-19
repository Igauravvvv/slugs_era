import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { loadEnv } from 'vite';
import sharp from 'sharp';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const snapshotPath = 'src/data/catalog-snapshot.json';
let products = JSON.parse(await readFile(snapshotPath, 'utf8'));
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
if (url && key) {
  // Only public storefront fields are embedded in the build.
  const fields = 'id,name,slug,description,price,compare_price,category,subcategory,images,colors,sizes,size_stock,stock_quantity,status,is_published,is_featured,tags';
  const response = await fetch(`${url}/rest/v1/products?select=${fields}&is_published=eq.true&order=sort_order.asc,created_at.desc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Catalog snapshot failed: ${response.status}`);
  products = await response.json();
  await writeFile(snapshotPath, JSON.stringify(products, null, 2) + '\n');
} else {
  console.log('Using checked-in public catalog snapshot (no database configuration).');
}

await mkdir('public/images/products', { recursive: true });
const images = {};
const tees = products.filter(p => p.category === 'tshirts' && p.status !== 'sold_out').slice(0, 5);
await Promise.all(tees.map(async product => {
  const source = product.images?.[0]?.url || product.image;
  if (!source || /\.(mp4|webm|mov)(\?|$)/i.test(source)) return;
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 16);
  const base = `/images/products/${hash}`;
  let original;
  for (const width of [320, 640, 960]) {
    const path = `public${base}-${width}.webp`;
    try { await access(path); } catch {
      if (!original) {
        const response = await fetch(source.startsWith('/') ? `https://www.slugsera.com${source}` : source, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error(`Product image failed: ${response.status}`);
        original = Buffer.from(await response.arrayBuffer());
      }
      await sharp(original).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 72 }).toFile(path);
    }
  }
  images[source] = base;
}));
await writeFile('src/data/catalog-images.json', JSON.stringify(images, null, 2) + '\n');
const links = tees.map(product => {
  const source = product.images?.[0]?.url || product.image;
  const base = images[source];
  if (!base) return '';
  return `    <link rel="preload" as="image" href="${base}-640.webp" imagesrcset="${base}-320.webp 320w, ${base}-640.webp 640w, ${base}-960.webp 960w" imagesizes="(min-width: 1024px) 20vw, 50vw" type="image/webp" />`;
}).filter(Boolean).join('\n');
const html = await readFile('index.html', 'utf8');
const block = `<!-- CATALOG_PRELOAD_START -->\n${links}\n    <!-- CATALOG_PRELOAD_END -->`;
await writeFile('index.html', html.includes('<!-- CATALOG_PRELOAD_START -->')
  ? html.replace(/<!-- CATALOG_PRELOAD_START -->[\s\S]*?<!-- CATALOG_PRELOAD_END -->/, block)
  : html.replace('    <!-- Preload Critical Assets -->', `    ${block}\n\n    <!-- Preload Critical Assets -->`));
console.log(`Prepared ${tees.length} homepage tees and their responsive images.`);
