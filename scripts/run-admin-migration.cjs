/**
 * Runs admin_dashboard_v2.sql against Supabase using the service role key
 * via the SQL execution endpoint.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

async function run() {
  console.log('🚀 Running admin_dashboard_v2.sql migration...\n');

  const sqlFile = fs.readFileSync(path.join(__dirname, '../migrations/admin_dashboard_v2.sql'), 'utf-8');

  // Split into individual statements (respect $$ function blocks)
  const statements = [];
  let current = '';
  let inDollar = false;

  for (const line of sqlFile.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--') && !inDollar) { continue; } // Skip pure comments

    const dollarCount = (line.match(/\$\$/g) || []).length;
    if (dollarCount % 2 !== 0) inDollar = !inDollar;

    current += line + '\n';

    if (trimmed.endsWith(';') && !inDollar) {
      const stmt = current.trim();
      if (stmt && stmt.length > 5 && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      current = '';
    }
  }
  if (current.trim()) statements.push(current.trim());

  console.log(`Found ${statements.length} SQL statements.\n`);

  // Execute each statement via Supabase's pg_net or direct REST
  // Since we can't run DDL via PostgREST, we'll use the Supabase Management API
  // Endpoint: POST /v1/projects/{ref}/database/query
  
  const mgmtUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  
  // Try Management API first
  console.log('Trying Supabase Management API...');
  const testResp = await fetch(mgmtUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: 'SELECT 1' }),
  });

  if (testResp.ok) {
    console.log('✅ Management API available!\n');
    
    // Execute full SQL file at once
    const resp = await fetch(mgmtUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sqlFile }),
    });

    if (resp.ok) {
      console.log('🎉 Full migration executed successfully!\n');
      return;
    } else {
      const err = await resp.text();
      console.log(`⚠️  Full file failed, trying statement by statement...\n${err}\n`);
    }

    // Fallback: execute one by one
    let success = 0, failed = 0;
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const label = stmt.split('\n').find(l => l.trim() && !l.trim().startsWith('--'))?.trim().slice(0, 60) || `Statement ${i+1}`;
      
      const resp = await fetch(mgmtUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: stmt }),
      });

      if (resp.ok) {
        console.log(`  ✅ ${label}...`);
        success++;
      } else {
        const err = await resp.text();
        if (err.includes('already exists') || err.includes('duplicate') || err.includes('ON CONFLICT')) {
          console.log(`  ⏭️  ${label}... (already exists)`);
          success++;
        } else {
          console.log(`  ❌ ${label}... → ${err.slice(0, 80)}`);
          failed++;
        }
      }
    }
    console.log(`\n📊 Done: ${success} succeeded, ${failed} failed`);
  } else {
    console.log('❌ Management API not available with service role key.');
    console.log('   This requires a personal access token from supabase.com/dashboard.');
    console.log('\n📋 Alternative: Please run this SQL in Supabase SQL Editor:');
    console.log(`   File: migrations/admin_dashboard_v2.sql`);
    console.log(`   URL:  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    
    // Try opening browser
    const { exec } = require('child_process');
    exec(`start https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  }
}

run().catch(console.error);
