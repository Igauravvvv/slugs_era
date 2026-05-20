// Migration runner — executes SQL statements against Supabase via Management API
// Run: node migrations/run_dashboard_upgrade.cjs

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://usymwbefimqcsxbbojyt.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_rY7NVlkt0NxooNmIX2n3pw_4LgHxLX2';

// We'll use the Supabase PostgREST-compatible approach:
// Execute each DDL statement by calling the pg_catalog or using rpc

async function executeSql(sql) {
  // Use Supabase's built-in SQL execution endpoint (available on all projects)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ query: sql }),
  });
  return response;
}

async function runMigration() {
  console.log('🚀 Running dashboard upgrade migration via Supabase...\n');

  const sqlPath = path.join(__dirname, 'dashboard_upgrade.sql');
  const fullSql = fs.readFileSync(sqlPath, 'utf-8');

  // Split into logical blocks — each CREATE TABLE / ALTER TABLE / CREATE INDEX is one block
  // We split on semicolons followed by newlines, keeping the CREATE FUNCTION blocks together
  const blocks = [];
  let current = '';
  let inFunction = false;

  for (const line of fullSql.split('\n')) {
    const trimmed = line.trim();

    // Track if we're inside a function body (between $$ ... $$)
    const dollarCount = (line.match(/\$\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      inFunction = !inFunction;
    }

    current += line + '\n';

    // If line ends with ; and we're not inside a function body, it's a statement boundary
    if (trimmed.endsWith(';') && !inFunction) {
      const stmt = current.trim();
      if (stmt && !stmt.startsWith('--') && stmt.length > 5) {
        blocks.push(stmt);
      }
      current = '';
    }
  }

  // If there's remaining content
  if (current.trim()) {
    blocks.push(current.trim());
  }

  console.log(`Found ${blocks.length} SQL statements to execute.\n`);

  // Since direct SQL execution via REST isn't available,
  // we'll print the SQL blocks for manual execution in the Supabase SQL Editor.
  // But first, let's try each statement individually via the service client.

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let success = 0;
  let skipped = 0;
  let needsManual = [];

  for (let i = 0; i < blocks.length; i++) {
    const stmt = blocks[i];
    const label = stmt.split('\n')
      .find(l => l.trim() && !l.trim().startsWith('--'))?.trim().slice(0, 80) || `Statement ${i + 1}`;

    // Try to detect and execute DDL operations that we can do via Supabase client
    // Most DDL needs raw SQL access which requires the SQL editor or management API

    // Check if this is something we can handle via the client SDK
    if (stmt.toLowerCase().includes('create table if not exists public.order_items')) {
      // Try creating via RPC or direct table creation
      const { error } = await supabase.from('order_items').select('id').limit(1);
      if (!error) {
        console.log(`  ⏭️  order_items table — already exists`);
        skipped++;
        continue;
      }
    }

    if (stmt.toLowerCase().includes('create table if not exists public.returns')) {
      const { error } = await supabase.from('returns').select('id').limit(1);
      if (!error) {
        console.log(`  ⏭️  returns table — already exists`);
        skipped++;
        continue;
      }
    }

    if (stmt.toLowerCase().includes('create table if not exists public.notifications')) {
      const { error } = await supabase.from('notifications').select('id').limit(1);
      if (!error) {
        console.log(`  ⏭️  notifications table — already exists`);
        skipped++;
        continue;
      }
    }

    if (stmt.toLowerCase().includes('create table if not exists public.discount_codes')) {
      const { error } = await supabase.from('discount_codes').select('id').limit(1);
      if (!error) {
        console.log(`  ⏭️  discount_codes table — already exists`);
        skipped++;
        continue;
      }
    }

    if (stmt.toLowerCase().includes('create table if not exists public.admin_roles')) {
      const { error } = await supabase.from('admin_roles').select('id').limit(1);
      if (!error) {
        console.log(`  ⏭️  admin_roles table — already exists`);
        skipped++;
        continue;
      }
    }

    // For DDL statements, we need the SQL Editor
    needsManual.push(stmt);
    console.log(`  📋 ${label.slice(0, 70)}... → needs SQL Editor`);
  }

  console.log(`\n📊 Results: ${success} auto-executed, ${skipped} already exist, ${needsManual.length} need SQL Editor`);

  if (needsManual.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  The migration requires running SQL directly in Supabase.');
    console.log('    Opening Supabase SQL Editor in your browser...');
    console.log('='.repeat(60));

    // Open browser to Supabase SQL Editor
    const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
    const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
    console.log(`\n🔗 URL: ${sqlEditorUrl}`);
    console.log('\nPaste the contents of: migrations/dashboard_upgrade.sql');
    console.log('Then click "Run" to execute all statements.\n');

    // Try to open browser
    const { exec } = require('child_process');
    exec(`start ${sqlEditorUrl}`);
  }
}

runMigration().catch(console.error);
