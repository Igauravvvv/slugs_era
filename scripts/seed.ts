import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = 'https://usymwbefimqcsxbbojyt.supabase.co';
const supabaseKey = 'sb_secret_rY7NVlkt0NxooNmIX2n3pw_4LgHxLX2';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

// Mock import.meta.env for tsx
(globalThis as any).import = { meta: { env: process.env } };

const supabase = createClient(supabaseUrl, supabaseKey);

// We need the products directly from the TS file
// But since this is a seed script, we can just fetch the raw list
// We'll read the array and push to supabase
import { products } from '../src/data/products';

import crypto from 'crypto';

function generateUUID(str: string) {
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    '8' + hash.substring(17, 20),
    hash.substring(20, 32)
  ].join('-');
}

async function seedProducts() {
  console.log(`Starting migration for ${products.length} products...`);
  
  for (const product of products) {
    console.log(`Processing product: ${product.name}`);
    
    // Convert static product format to database row format
    const dbProduct = {
      id: generateUUID(product.id),
      name: product.name,
      slug: product.id,
      description: `${product.slogan}. ${product.description}`,
      price: product.price,
      compare_price: null,
      stock_quantity: product.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0,
      category: product.category,
      tags: [product.badge, ...(product.features || [])].filter(Boolean),
      colors: product.colors || [],
      images: (product.images || []).map((url, i) => ({
        url,
        alt: product.name,
        isPrimary: i === 0
      })),
      sizes: product.sizes,
      // size_stock is missing from schema, maybe we save it in meta or skip it for now. The previous code didn't use size_stock column in the old schema either, but wait, useProducts had a fallback for size_stock. We can just use the sizes array for now and stock_quantity.
      is_published: product.status === 'active',
    };

    const { error } = await supabase
      .from('products')
      .upsert(dbProduct, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Failed to upsert ${product.name}:`, error.message);
    } else {
      console.log(`✅ Upserted ${product.name}`);
    }
  }
}

async function seedSiteSections() {
  console.log('Seeding site sections...');
  
  const sections = [
    {
      id: 'ff47bcbf-ff15-4848-88ce-3f712115a32c',
      section_key: 'hero',
      title: 'SLUG\'S ERA',
      subtitle: 'MOVEMENT. NOT MERCH — NEW SEASON',
      cta_text: 'SHOP NOW',
      cta_link: '#products',
      meta: { 
        active: true,
        images: [
          '/images/Female_model_vinyl.webp',
          '/images/turtlemodelimage.webp',
          '/images/slow_down_model.webp',
          '/images/seedhe%20pahad%20se%20model.webp'
        ]
      }
    },
    {
      id: 'e6a8e63a-7a54-4a47-a8a2-2d854e4c92e1',
      section_key: 'sale_banner',
      title: 'SEASON END SALE - GET 20% OFF ON ALL ORDERS',
      cta_link: '/collections',
      meta: { active: true, bgColor: '#C0132A', textColor: '#FFFFFF' }
    },
    {
      id: 'b8b9e63a-7a54-4a47-a8a2-2d854e4c92e2',
      section_key: 'products',
      title: 'The Essential Five',
      subtitle: 'T-Shirt Collection',
      cta_text: 'View All',
      cta_link: '/collections',
      meta: { active: true }
    }
  ];

  for (const section of sections) {
    const { error } = await supabase
      .from('site_sections')
      .upsert(section, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Failed to upsert section ${section.id}:`, error.message);
    } else {
      console.log(`✅ Upserted section ${section.id}`);
    }
  }
}

async function run() {
  await seedProducts();
  await seedSiteSections();
  console.log('🎉 Migration completed!');
  process.exit(0);
}

run();
