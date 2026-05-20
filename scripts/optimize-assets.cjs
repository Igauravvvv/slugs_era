const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const IMAGES_DIR = path.join(__dirname, '../public/images');
const CDN_FILE = path.join(__dirname, '../src/lib/cdn.ts');
const SEED_FILE = path.join(__dirname, '../migrations/seed-standalone.ts');
const PRODUCTS_DATA = path.join(__dirname, '../src/data/products.ts');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'assets';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function sanitizeStoragePath(filename) {
  return filename
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9.\-_\/]/g, '');
}

async function processImages() {
  console.log('🚀 Starting Image Optimization & Upload...\n');
  const files = fs.readdirSync(IMAGES_DIR);
  let convertedCount = 0;

  for (const file of files) {
    if (file.match(/\.(png|jpg|jpeg)$/i)) {
      const oldPath = path.join(IMAGES_DIR, file);
      const newFileName = file.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      const newPath = path.join(IMAGES_DIR, newFileName);

      const stats = fs.statSync(oldPath);
      const sizeMB = stats.size / (1024 * 1024);

      console.log(`Processing: ${file} (${sizeMB.toFixed(2)} MB)`);

      try {
        await sharp(oldPath)
          .resize(1600, null, { withoutEnlargement: true }) // Max width 1600px
          .webp({ quality: 80, effort: 4 })
          .toFile(newPath);

        const newStats = fs.statSync(newPath);
        const newSizeMB = newStats.size / (1024 * 1024);
        console.log(`  ✅ Converted to WebP: ${newSizeMB.toFixed(2)} MB (Saved ${((sizeMB - newSizeMB) / sizeMB * 100).toFixed(1)}%)`);

        // Upload to Supabase
        const storagePath = sanitizeStoragePath(newFileName);
        const fileBuffer = fs.readFileSync(newPath);
        
        console.log(`  📤 Uploading to CDN...`);
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, {
            contentType: 'image/webp',
            upsert: true,
            cacheControl: '31536000',
          });

        if (error) {
          console.error(`  ❌ Upload failed:`, error.message);
        } else {
          console.log(`  ✅ Uploaded successfully!`);
          // Safely delete original
          if (oldPath !== newPath) {
            fs.unlinkSync(oldPath);
          }
          convertedCount++;
        }
      } catch (err) {
        console.error(`  ❌ Error processing ${file}:`, err.message);
      }
    }
  }

  console.log(`\n🎉 Successfully optimized and uploaded ${convertedCount} images.`);

  // Update Codebase
  console.log('\n📝 Updating codebase to use .webp extensions...');
  
  [CDN_FILE, SEED_FILE, PRODUCTS_DATA].forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const updated = content.replace(/\.(png|jpg|jpeg)/gi, '.webp');
      if (content !== updated) {
        fs.writeFileSync(filePath, updated, 'utf-8');
        console.log(`  ✅ Updated ${path.basename(filePath)}`);
      }
    }
  });

  // Re-seed DB to use new URLs
  console.log('\n🔄 Re-running seeder to update database URLs...');
  const { execSync } = require('child_process');
  try {
    execSync('npx tsx migrations/seed-standalone.ts', { cwd: path.join(__dirname, '..'), stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: '--dns-result-order=ipv4first' } });
    console.log('  ✅ Database URLs updated!');
  } catch (err) {
    console.error('  ❌ Seeder failed:', err.message);
  }

  console.log('\n✨ All optimization tasks complete! Your site is now blazing fast.');
}

processImages().catch(console.error);
