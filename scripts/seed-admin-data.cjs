/**
 * Seed admin dashboard tables using Supabase JS Client (service role).
 * This approach inserts data via PostgREST — tables must exist first.
 * If tables don't exist, it falls back to opening the SQL Editor.
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkAndSeed() {
  console.log('🔍 Checking if admin tables exist...\n');

  // Test if tables exist
  const { error: testErr } = await supabase.from('admin_products').select('id').limit(1);
  
  if (testErr) {
    console.log(`❌ Table "admin_products" not found: ${testErr.message}`);
    console.log('\n📋 You need to run the SQL migration first.');
    console.log('   Please paste the contents of migrations/admin_dashboard_v2.sql');
    console.log('   into your Supabase SQL Editor and click Run.\n');
    
    const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
    const url = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`;
    console.log(`   🔗 ${url}\n`);
    
    const { exec } = require('child_process');
    exec(`start ${url}`);
    return;
  }

  console.log('✅ Tables exist! Checking if data is already seeded...\n');

  // Check if products already exist
  const { data: existing } = await supabase.from('admin_products').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('⏭️  Products already seeded. Skipping.\n');
    
    // Just verify counts
    const counts = {};
    for (const table of ['admin_products', 'admin_orders', 'admin_customers', 'admin_analytics_events', 'admin_site_settings']) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      counts[table] = count;
    }
    console.log('📊 Current data:');
    Object.entries(counts).forEach(([t, c]) => console.log(`   ${t}: ${c} rows`));
    return;
  }

  // ─── Seed Products ──────────────────────────────────────────
  console.log('📦 Seeding products...');
  const products = [
    { name: 'Owns The Game II', description: 'Oversized graphic tee with bold typography. Premium 240 GSM cotton.', category: 'Tee', sku: 'SLG-OTG2', price: 1499, compare_at_price: 1999, on_sale: true, discount_value: 25, discount_type: 'percent', sale_price: 1499, cost_of_goods: 450, stock_quantity: 24, low_stock_threshold: 5, ribbon: 'Bestseller', is_visible: true, product_info: 'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized\nNeck: Round Neck', return_policy: '7-day exchange policy.', shipping_info: 'Free shipping across India.' },
    { name: 'HoLLy', description: 'Streetwear-inspired oversized tee with vintage wash finish.', category: 'Tee', sku: 'SLG-HLLY', price: 1499, cost_of_goods: 420, stock_quantity: 18, low_stock_threshold: 5, ribbon: 'New', is_visible: true, product_info: 'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized\nFinish: Vintage Enzyme Wash', return_policy: '7-day exchange policy.', shipping_info: 'Free shipping across India.' },
    { name: 'Emotionally Unavailable', description: 'Statement oversized tee. Slow fashion for the emotionally guarded.', category: 'Tee', sku: 'SLG-EMUN', price: 1499, cost_of_goods: 380, stock_quantity: 31, low_stock_threshold: 5, is_visible: true, product_info: 'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized\nPrint: Screen Print', return_policy: '7-day exchange policy.', shipping_info: 'Free shipping across India.' },
    { name: 'Cherry Blossom', description: 'Floral graphic oversized tee with sakura-inspired print.', category: 'Tee', sku: 'SLG-CHRB', price: 1499, compare_at_price: 1999, on_sale: true, discount_value: 25, discount_type: 'percent', sale_price: 1499, cost_of_goods: 440, stock_quantity: 12, low_stock_threshold: 5, ribbon: 'Sale', is_visible: true, product_info: 'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized', return_policy: '7-day exchange policy.', shipping_info: 'Free shipping across India.' },
    { name: 'Owns The Game', description: 'Original edition oversized tee. The one that started it all.', category: 'Tee', sku: 'SLG-OTG1', price: 1299, cost_of_goods: 350, stock_quantity: 8, low_stock_threshold: 5, is_visible: true, product_info: 'Fabric: 100% Premium Cotton, 220 GSM\nFit: Oversized', return_policy: '7-day exchange policy.', shipping_info: 'Free shipping across India.' },
    { name: 'Loviee (Men)', description: 'Unisex-fit oversized tee with minimalist love-themed graphic.', category: 'Tee', sku: 'SLG-LOVM', price: 1499, cost_of_goods: 400, stock_quantity: 20, low_stock_threshold: 5, is_visible: true, product_info: 'Fabric: 100% Premium Cotton, 240 GSM\nFit: Oversized', return_policy: '7-day exchange policy.', shipping_info: 'Free shipping across India.' },
    { name: 'Loviee (Women)', description: "Women's-fit tee with minimalist love-themed graphic.", category: 'Tee', sku: 'SLG-LOVW', price: 1499, cost_of_goods: 400, stock_quantity: 15, low_stock_threshold: 5, is_visible: true, product_info: 'Fabric: 100% Premium Cotton, 200 GSM\nFit: Relaxed', return_policy: '7-day exchange policy.', shipping_info: 'Free shipping across India.' },
  ];

  for (const p of products) {
    const { error } = await supabase.from('admin_products').upsert([p], { onConflict: 'sku' });
    console.log(error ? `  ❌ ${p.name}: ${error.message}` : `  ✅ ${p.name}`);
  }

  // ─── Seed Variants ──────────────────────────────────────────
  console.log('\n🎨 Seeding variants...');
  const { data: allProducts } = await supabase.from('admin_products').select('id, name');
  for (const prod of (allProducts || [])) {
    const variants = [
      { product_id: prod.id, variant_name: 'S / Black', size: 'S', color: 'Black', sku_suffix: '-S-BLK', stock_quantity: Math.floor(Math.random() * 12) + 3 },
      { product_id: prod.id, variant_name: 'M / Black', size: 'M', color: 'Black', sku_suffix: '-M-BLK', stock_quantity: Math.floor(Math.random() * 12) + 3 },
    ];
    const { error } = await supabase.from('admin_product_variants').insert(variants);
    console.log(error ? `  ❌ ${prod.name}: ${error.message}` : `  ✅ ${prod.name} (2 variants)`);
  }

  // ─── Seed Orders ────────────────────────────────────────────
  console.log('\n📋 Seeding orders...');
  const orders = [
    { order_number: '#SLG-1001', customer_name: 'Rahul Sharma', customer_email: 'rahul@gmail.com', customer_phone: '9876543210', shipping_address: { street: 'B-42 Sector 18', city: 'Noida', state: 'UP', pincode: '201301', country: 'India' }, items: [{ name: 'Owns The Game II', qty: 1, price: 1499, size: 'M' }], subtotal: 1499, shipping_fee: 0, total: 1499, payment_method: 'UPI', payment_status: 'Paid', status: 'Delivered' },
    { order_number: '#SLG-1002', customer_name: 'Priya Patel', customer_email: 'priya.p@gmail.com', customer_phone: '9123456789', shipping_address: { street: 'A-101 Marine Drive', city: 'Mumbai', state: 'MH', pincode: '400002', country: 'India' }, items: [{ name: 'Cherry Blossom', qty: 1, price: 1499, size: 'S' }, { name: 'HoLLy', qty: 1, price: 1499, size: 'M' }], subtotal: 2998, shipping_fee: 0, total: 2998, payment_method: 'Card', payment_status: 'Paid', status: 'Dispatched' },
    { order_number: '#SLG-1003', customer_name: 'Arjun Mehta', customer_email: 'arjun.m@outlook.com', customer_phone: '9988776655', shipping_address: { street: '12 MG Road', city: 'Bangalore', state: 'KA', pincode: '560001', country: 'India' }, items: [{ name: 'Emotionally Unavailable', qty: 2, price: 1499, size: 'L' }], subtotal: 2998, shipping_fee: 0, total: 2998, payment_method: 'UPI', payment_status: 'Paid', status: 'Processing' },
    { order_number: '#SLG-1004', customer_name: 'Sneha Gupta', customer_email: 'sneha.g@gmail.com', customer_phone: '8877665544', shipping_address: { street: '45 Park Street', city: 'Kolkata', state: 'WB', pincode: '700016', country: 'India' }, items: [{ name: 'Loviee (Women)', qty: 1, price: 1499, size: 'S' }], subtotal: 1499, shipping_fee: 0, total: 1499, payment_method: 'COD', payment_status: 'Pending', status: 'Pending' },
    { order_number: '#SLG-1005', customer_name: 'Vikram Singh', customer_email: 'vikram@gmail.com', customer_phone: '7766554433', shipping_address: { street: '22 Civil Lines', city: 'Jaipur', state: 'RJ', pincode: '302001', country: 'India' }, items: [{ name: 'Owns The Game', qty: 1, price: 1299, size: 'M' }], subtotal: 1299, shipping_fee: 0, total: 1299, payment_method: 'UPI', payment_status: 'Paid', status: 'Pending' },
  ];
  for (const o of orders) {
    const { error } = await supabase.from('admin_orders').upsert([o], { onConflict: 'order_number' });
    console.log(error ? `  ❌ ${o.order_number}: ${error.message}` : `  ✅ ${o.order_number}`);
  }

  // ─── Seed Customers ─────────────────────────────────────────
  console.log('\n👥 Seeding customers...');
  const customers = [
    { name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '9876543210', city: 'Noida', state: 'UP', total_orders: 3, total_spent: 4497 },
    { name: 'Priya Patel', email: 'priya.p@gmail.com', phone: '9123456789', city: 'Mumbai', state: 'MH', total_orders: 2, total_spent: 5497 },
    { name: 'Arjun Mehta', email: 'arjun.m@outlook.com', phone: '9988776655', city: 'Bangalore', state: 'KA', total_orders: 1, total_spent: 2998 },
    { name: 'Sneha Gupta', email: 'sneha.g@gmail.com', phone: '8877665544', city: 'Kolkata', state: 'WB', total_orders: 1, total_spent: 1499 },
    { name: 'Vikram Singh', email: 'vikram@gmail.com', phone: '7766554433', city: 'Jaipur', state: 'RJ', total_orders: 1, total_spent: 1299 },
    { name: 'Ananya Reddy', email: 'ananya.r@gmail.com', phone: '9654321876', city: 'Hyderabad', state: 'TS', total_orders: 4, total_spent: 7996 },
    { name: 'Karan Chopra', email: 'karan.c@gmail.com', phone: '8899001122', city: 'Delhi', state: 'DL', total_orders: 2, total_spent: 2998 },
  ];
  for (const c of customers) {
    const { error } = await supabase.from('admin_customers').upsert([c], { onConflict: 'email' });
    console.log(error ? `  ❌ ${c.name}: ${error.message}` : `  ✅ ${c.name}`);
  }

  // ─── Seed Analytics ─────────────────────────────────────────
  console.log('\n📊 Seeding analytics (30 days)...');
  const sources = ['Direct', 'Instagram', 'Google', 'Twitter', 'Facebook'];
  const analyticsRows = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    analyticsRows.push({
      date: d.toISOString().split('T')[0],
      sessions: Math.floor(Math.random() * 200 + 50),
      unique_visitors: Math.floor(Math.random() * 150 + 30),
      page_views: Math.floor(Math.random() * 600 + 100),
      source: sources[Math.floor(Math.random() * sources.length)],
    });
  }
  const { error: aErr } = await supabase.from('admin_analytics_events').insert(analyticsRows);
  console.log(aErr ? `  ❌ Analytics: ${aErr.message}` : `  ✅ 31 days of analytics seeded`);

  // ─── Seed Settings ──────────────────────────────────────────
  console.log('\n⚙️  Seeding site settings...');
  const { error: sErr } = await supabase.from('admin_site_settings').insert([{
    store_name: 'Slugsera', founder_name: 'Gaurav', founder_email: 'slugsera@gmail.com',
    currency: 'INR', currency_symbol: '₹', timezone: 'Asia/Kolkata',
  }]);
  console.log(sErr ? `  ❌ Settings: ${sErr.message}` : `  ✅ Settings seeded`);

  console.log('\n🎉 All done! Refresh your browser at http://localhost:5173/admin');
}

checkAndSeed().catch(console.error);
