import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const productsData = [
  {
    name: 'Let The Moment Play',
    slug: 'let-the-moment-play',
    description: 'Black oversized tee featuring a vintage vinyl record graphic. "Vinyl teaches patience. You don\'t skip life, you listen to it. Every groove holds a moment."',
    category: 'tops',
    price: 1899,
    stock_quantity: 45,
    is_published: true,
    is_featured: false,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: '#1A1A1A', hex: '#1A1A1A' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/vinyl-moment.webp', alt: 'Let The Moment Play', isPrimary: true }],
    tags: ['Premium Cotton', 'Oversized Fit', 'Graphic Back Print', 'New Arrival']
  },
  {
    name: 'The Tortoise',
    slug: 'the-tortoise',
    description: 'Light blue relaxed tee featuring a beautifully patterned sea turtle graphic and the steady motivation: "The Tortoise Always FINISHES".',
    category: 'tops',
    price: 1899,
    stock_quantity: 11,
    is_published: true,
    is_featured: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: '#42C0FB', hex: '#42C0FB' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/tortoise.webp', alt: 'The Tortoise', isPrimary: true }],
    tags: ['Premium Cotton', 'Relaxed Fit', 'Graphic Back Print', 'Bestseller']
  },
  {
    name: 'Slow Down',
    slug: 'slow-down',
    description: 'Forest green oversized tee with a relaxed sloth resting on bamboo. A gentle reminder to slow down, you\'re doing fine.',
    category: 'tops',
    price: 1899,
    stock_quantity: 36,
    is_published: true,
    is_featured: false,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: '#1E4D2B', hex: '#1E4D2B' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/sloth.webp', alt: 'Slow Down', isPrimary: true }],
    tags: ['Premium Cotton', 'Oversized Fit', 'Graphic Back Print', 'New Arrival']
  },
  {
    name: 'The Slow Club',
    slug: 'the-slow-club',
    description: 'Black oversized tee featuring "THE SLOW CLUB" typography filled with diverse character imagery. A cinematic tribute for the ones who know.',
    category: 'tops',
    price: 1899,
    stock_quantity: 0,
    is_published: false,
    is_featured: false,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: '#1A1A1A', hex: '#1A1A1A' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/slow-club.webp', alt: 'The Slow Club', isPrimary: true }],
    tags: ['Premium Cotton', 'Oversized Fit', 'Typography Print', 'Limited']
  },
  {
    name: 'Slugs Era Intro',
    slug: 'slugs-era-intro',
    description: 'Dark gray/faded black oversized tee intertwined with an intricate barbed wire pattern, featuring a subtle "SLUGS ERA" center chest detail.',
    category: 'tops',
    price: 1899,
    stock_quantity: 28,
    is_published: true,
    is_featured: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: '#3A3A3A', hex: '#3A3A3A' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/barbed-wire.webp', alt: 'Slugs Era Intro', isPrimary: true }],
    tags: ['Washed Cotton', 'Barbed Wire Pattern', 'Center Chest Detail', 'Exclusive']
  },
  {
    name: 'NYT & WAVES',
    slug: 'nyt-waves',
    description: 'A striking button-up shirt featuring dark midnight waves intertwined with NYT artistic graphics. Perfect for late night outings.',
    category: 'tops',
    price: 2299,
    stock_quantity: 12,
    is_published: true,
    is_featured: false,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: '#0A192F', hex: '#0A192F' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/NYT-and-WAVES.webp', alt: 'NYT & WAVES', isPrimary: true }],
    tags: ['Premium Rayon', 'Relaxed Fit', 'Graphic Print', 'Limited']
  },
  {
    name: 'SUNLIGHT & WAVES',
    slug: 'sunlight-waves',
    description: 'A vibrant button-up shirt capturing the essence of golden hour waves shining under the warmth of the sun.',
    category: 'tops',
    price: 2299,
    stock_quantity: 33,
    is_published: true,
    is_featured: false,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: '#D4A574', hex: '#D4A574' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/SUNLIGHT-and-WAVES.webp', alt: 'SUNLIGHT & WAVES', isPrimary: true }],
    tags: ['Premium Rayon', 'Relaxed Fit', 'Graphic Print', 'New Arrival']
  },
  {
    name: 'Classic Embroidered Logo',
    slug: 'classic-embroidered-logo',
    description: 'Heavyweight cotton hoodie with subtle embroidered logo on the chest. Built to last.',
    category: 'outerwear',
    price: 3499,
    stock_quantity: 12,
    is_published: true,
    is_featured: false,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: '#1A1A1A', hex: '#1A1A1A' }, { name: '#F5F5F3', hex: '#F5F5F3' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/hoodie-black.webp', alt: 'Classic Embroidered Logo', isPrimary: true }],
    tags: ['Heavyweight Cotton', 'Embroidered Chest', 'Relaxed Fit', 'New']
  },
  {
    name: 'Vintage Patchwork',
    slug: 'vintage-patchwork',
    description: 'Unique patchwork design featuring cut-and-sew panels in earthy tones.',
    category: 'outerwear',
    price: 3999,
    compare_price: 3499,
    stock_quantity: 0,
    is_published: false,
    is_featured: false,
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: '#8B4513', hex: '#8B4513' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/patchwork-hoodie.webp', alt: 'Vintage Patchwork', isPrimary: true }],
    tags: ['Cut & Sew', 'Unique Pattern', 'Oversized', 'Limited']
  },
  {
    name: 'Graphic Print Club',
    slug: 'graphic-print-club',
    description: 'Soft brushed interior hoodie with large back print featuring our signature characters.',
    category: 'outerwear',
    price: 3299,
    stock_quantity: 29,
    is_published: true,
    is_featured: false,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: '#000000', hex: '#000000' }],
    images: [{ url: 'https://usymwbefimqcsxbbojyt.supabase.co/storage/v1/object/public/assets/printed-hoodie.webp', alt: 'Graphic Print Club', isPrimary: true }],
    tags: ['Screen Print', 'Brushed Fleece', 'True to Size']
  }
];

async function main() {
  console.log('🚀 Seeding products to Supabase...');
  
  for (const p of productsData) {
    const { error } = await supabase
      .from('products')
      .upsert(p, { onConflict: 'slug' });
      
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
