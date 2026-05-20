/**
 * Upload Script: Migrate all public/images/ assets to Supabase Storage CDN
 * 
 * Usage: node upload-to-supabase.cjs
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'assets';
const IMAGES_DIR = path.join(__dirname, 'public', 'images');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Mime type map
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  };
  return mimes[ext] || 'application/octet-stream';
}

// Sanitize filename for Supabase storage (no spaces, no special chars)
function sanitizeStoragePath(filename) {
  return filename
    .replace(/\s+/g, '-')       // spaces → hyphens
    .replace(/&/g, 'and')       // & → and
    .replace(/'/g, '')          // remove apostrophes
    .replace(/[^a-zA-Z0-9.\-_\/]/g, ''); // remove other special chars
}

// Recursively get all files
function getAllFiles(dirPath, basePath = '') {
  const files = [];
  if (!fs.existsSync(dirPath)) return files;
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else {
      files.push({ fullPath, relativePath });
    }
  }
  return files;
}

async function main() {
  console.log('🚀 Supabase Storage CDN Upload Script');
  console.log('=====================================\n');
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`📁 Source: ${IMAGES_DIR}\n`);

  // Step 1: Create bucket if it doesn't exist
  console.log('1️⃣  Checking/Creating bucket...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Failed to list buckets:', listError.message);
    process.exit(1);
  }

  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'],
    });
    
    if (createError) {
      console.error('❌ Failed to create bucket:', createError.message);
      process.exit(1);
    }
    console.log('   ✅ Bucket created successfully (public)\n');
  } else {
    console.log('   ✅ Bucket already exists\n');
  }

  // Step 2: Gather all files
  const files = getAllFiles(IMAGES_DIR);
  console.log(`2️⃣  Found ${files.length} files to upload\n`);

  // Step 3: Upload each file
  console.log('3️⃣  Uploading files...\n');
  
  const results = { success: 0, skipped: 0, failed: 0 };
  const uploadedUrls = {};

  for (const file of files) {
    const storagePath = sanitizeStoragePath(file.relativePath);
    const mimeType = getMimeType(file.fullPath);
    const fileBuffer = fs.readFileSync(file.fullPath);
    const fileSizeKB = (fileBuffer.length / 1024).toFixed(1);

    process.stdout.write(`   📤 ${file.relativePath} (${fileSizeKB} KB) → ${storagePath} ... `);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true, // overwrite if exists
        cacheControl: '31536000', // 1 year cache
      });

    if (error) {
      console.log(`❌ ${error.message}`);
      results.failed++;
    } else {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
      console.log('✅');
      uploadedUrls[file.relativePath] = publicUrl;
      results.success++;
    }
  }

  // Step 4: Print summary
  console.log('\n=====================================');
  console.log('📊 Upload Summary:');
  console.log(`   ✅ Success: ${results.success}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ❌ Failed:  ${results.failed}`);
  console.log('=====================================\n');

  // Step 5: Print CDN URLs for use in code
  console.log('🔗 CDN URLs (for cdn.ts):');
  console.log('─────────────────────────');
  
  const mainAssets = Object.entries(uploadedUrls).filter(
    ([relPath]) => !relPath.includes('Logo_Animation_Slow_Crawl_frames')
  );
  
  for (const [relPath, url] of mainAssets) {
    console.log(`   ${relPath}`);
    console.log(`   → ${url}\n`);
  }

  const frameAssets = Object.entries(uploadedUrls).filter(
    ([relPath]) => relPath.includes('Logo_Animation_Slow_Crawl_frames')
  );
  
  if (frameAssets.length > 0) {
    console.log(`   📂 Logo Animation Frames: ${frameAssets.length} files uploaded to subfolder`);
    console.log(`   → ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/Logo_Animation_Slow_Crawl_frames/\n`);
  }

  console.log('✨ Done! Update your cdn.ts with the URLs above.');
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
