// ============================================================
// Slugs Era — Dashboard Migration Runner
// Connects directly to Supabase PostgreSQL and executes
// the dashboard_upgrade.sql migration.
// ============================================================

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Supabase direct connection (transaction / session mode)
// Format: postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
// Or via the pooler: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
//
// The database password is set when you create your Supabase project.
// Find it at: Supabase Dashboard > Project Settings > Database > Connection string

const PROJECT_REF = 'usymwbefimqcsxbbojyt';

// Try environment variable first, then fallback to direct connection string
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://postgres.${PROJECT_REF}:${process.env.DB_PASSWORD || ''}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

// Alternative direct connection (non-pooler)
const DIRECT_URL = `postgresql://postgres:${process.env.DB_PASSWORD || ''}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

async function executeMigration() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     🐌 Slugs Era — Dashboard Migration Runner       ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // Check for DB password
  if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
    console.log('❌ Missing database credentials!\n');
    console.log('You need to provide your Supabase database password.');
    console.log('Find it at: Supabase Dashboard → Project Settings → Database\n');
    console.log('Run with:');
    console.log('  set DB_PASSWORD=your_database_password && node migrations/run_migration.cjs');
    console.log('');
    console.log('Or provide the full connection string:');
    console.log('  set DATABASE_URL=postgresql://postgres:PASSWORD@db.usymwbefimqcsxbbojyt.supabase.co:5432/postgres && node migrations/run_migration.cjs');
    console.log('');
    console.log('─── Alternative: Copy-paste into Supabase SQL Editor ───');
    console.log('1. Go to: https://supabase.com/dashboard/project/usymwbefimqcsxbbojyt/sql/new');
    console.log('2. Paste the contents of migrations/dashboard_upgrade.sql');
    console.log('3. Click "Run"\n');
    process.exit(1);
  }

  // Read SQL file
  const sqlFile = fs.readFileSync(
    path.join(__dirname, 'dashboard_upgrade.sql'),
    'utf-8'
  );

  console.log(`📄 Loaded: dashboard_upgrade.sql`);
  console.log(`🎯 Target: Supabase project ${PROJECT_REF}\n`);

  // Connect to database — try pooler first, then direct
  let client;
  const connectionUrl = process.env.DATABASE_URL || DATABASE_URL;
  
  console.log('🔌 Connecting to database...');
  
  client = new Client({
    connectionString: connectionUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!\n');
  } catch (err) {
    console.log(`⚠️  Pooler connection failed: ${err.message}`);
    console.log('🔌 Trying direct connection...\n');
    
    client = new Client({
      connectionString: DIRECT_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
    
    try {
      await client.connect();
      console.log('✅ Connected via direct connection!\n');
    } catch (err2) {
      console.error(`❌ Both connections failed: ${err2.message}`);
      console.log('\nPlease check your database password and try again.');
      console.log('You can find it at: Supabase Dashboard → Project Settings → Database\n');
      process.exit(1);
    }
  }

  // Execute the entire SQL file as a single transaction
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Executing migration...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Execute as a single transaction for atomicity
    await client.query('BEGIN');
    await client.query(sqlFile);
    await client.query('COMMIT');

    console.log('🎉 Migration executed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ What was created / updated:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('  📦 orders table — enhanced with 11 new columns:');
    console.log('     order_number, shipping_address, shipping_status,');
    console.log('     tracking_number, courier, admin_note, discount_code,');
    console.log('     discount_amount, subtotal, shipping_cost, updated_at');
    console.log('');
    console.log('  📋 order_items — normalized line items (with RLS)');
    console.log('  🔄 returns — return/refund management (with RLS)');
    console.log('  🔔 notifications — real-time admin alerts (with RLS)');
    console.log('  🏷️  discount_codes — promo code management (with RLS)');
    console.log('  👤 admin_roles — role-based access control (with RLS)');
    console.log('');
    console.log('  🗂️  9 performance indexes created');
    console.log('  ⚡ Auto-generated order numbers (SE-YYYYMMDD-NNN)');
    console.log('  🔔 Auto-notification trigger on new orders');
    console.log('');

    // Verify tables exist
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🔍 Verification:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const tables = ['order_items', 'returns', 'notifications', 'discount_codes', 'admin_roles'];
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM public.${table}`);
        console.log(`  ✅ ${table} — exists (${res.rows[0].count} rows)`);
      } catch (e) {
        console.log(`  ❌ ${table} — ${e.message.split('\n')[0]}`);
      }
    }

    // Check orders columns
    try {
      const colRes = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders'
        ORDER BY ordinal_position
      `);
      const cols = colRes.rows.map(r => r.column_name);
      const newCols = ['order_number', 'shipping_address', 'shipping_status', 'tracking_number', 'courier', 'admin_note', 'discount_code', 'discount_amount', 'subtotal', 'shipping_cost', 'updated_at'];
      const found = newCols.filter(c => cols.includes(c));
      console.log(`  ✅ orders — ${found.length}/${newCols.length} new columns verified`);
    } catch (e) {
      console.log(`  ⚠️  orders columns check: ${e.message.split('\n')[0]}`);
    }

    // Check triggers
    try {
      const trigRes = await client.query(`
        SELECT trigger_name FROM information_schema.triggers 
        WHERE event_object_table = 'orders'
      `);
      const triggers = trigRes.rows.map(r => r.trigger_name);
      console.log(`  ✅ triggers — ${[...new Set(triggers)].join(', ') || 'none found'}`);
    } catch (e) {
      console.log(`  ⚠️  trigger check: ${e.message.split('\n')[0]}`);
    }

    console.log('\n🚀 Your dashboard database is now fully upgraded!\n');

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(`❌ Migration failed: ${err.message}\n`);
    
    // Provide helpful context for common errors
    if (err.message.includes('already exists')) {
      console.log('💡 This error usually means the migration was already applied (partially or fully).');
      console.log('   The "IF NOT EXISTS" clauses should handle this, but some statements');
      console.log('   like CREATE POLICY may fail if the policy already exists.\n');
      console.log('   Try running the SQL manually in the Supabase SQL Editor to see which');
      console.log('   specific statements need adjustment.\n');
    } else if (err.message.includes('permission denied')) {
      console.log('💡 Permission error — make sure you are using the database owner password,');
      console.log('   not the anon key or service role key.\n');
    } else if (err.message.includes('does not exist')) {
      console.log('💡 A referenced table or column does not exist. Check that the base schema');
      console.log('   (schema.sql) was applied before this migration.\n');
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
}

executeMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
