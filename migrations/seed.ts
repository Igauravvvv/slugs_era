import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Polyfill import.meta.env for Node.js (Vite uses this in src/lib/cdn.ts)
(globalThis as any).import = { meta: { env: process.env } };

import { products } from '../src/data/products';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🚀 Migrating local products to Supabase...');
  
  for (const p of products) {
    // Calculate total stock
    const totalStock = p.sizeStock?.reduce((acc, curr) => acc + (curr.stock || 0), 0) || 0;
    
    // Map colors to { name, hex } format
    const mappedColors = p.colors?.map(c => ({ name: c, hex: c })) || [];
    
    // Map images to { url, alt, isPrimary } format
    const mappedImages = p.images?.map((url, i) => ({
      url,
      alt: `${p.name} - ${i + 1}`,
      isPrimary: i === 0
    })) || [];
    
    // Compile tags from features and badges
    const tags = [...(p.features || [])];
    if (p.badge) tags.push(p.badge);
    
    // Convert old ID to a valid slug format
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProduct = {
      name: p.name,
      slug: slug,
      description: p.description || '',
      category: p.category,
      price: p.price,
      stock_quantity: totalStock,
      is_published: p.status === 'active' || p.status === 'new',
      is_featured: p.badge === 'Bestseller' || p.badge === 'Exclusive',
      sizes: p.sizes || [],
      colors: mappedColors,
      images: mappedImages,
      tags: tags
    };

    console.log(`Inserting: ${p.name} (${slug})`);
    
    // Try to insert
    const { error } = await supabase
      .from('products')
      .upsert(newProduct, { onConflict: 'slug' });
      
    if (error) {
      console.error(`❌ Failed to insert ${p.name}:`, error.message);
    } else {
      console.log(`✅ Success: ${p.name}`);
    }
  }

  console.log('\n✨ Migration complete!');
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
