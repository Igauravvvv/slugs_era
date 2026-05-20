/**
 * Image Optimization Script
 * Converts all PNG images in /public/images to WebP format
 * with appropriate resizing for web delivery.
 */
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.resolve(__dirname, '..', 'public', 'images');

// Configuration: filename → max width for resize
const RESIZE_CONFIG = {
  'MODEL-WITH-SHIRT.png': 1200,   // Hero image: displayed at ~466×700, serve at 1200w for retina
  'sloth.png': 400,               // Product tee: displayed at ~200×160
  'tortoise.png': 400,            // Product tee: displayed at ~193×160
  'vinyl-moment.png': 400,        // Product tee: displayed at ~210×160
  'slow-club.png': 400,           // Product tee: displayed at ~187×160
  'barbed-wire.png': 400,         // Product tee: displayed at ~189×160
  'SUNLIGHT-and-WAVES.png': 400,  // Shirt: displayed at ~159×157
  'NYT-and-WAVES.png': 400,       // Shirt: displayed at ~164×157
  'TEXT-LOGO.png': 600,           // Footer marquee logo  
  'logo.png': 300,                // Header logo: displayed at ~181×96
  'hoodie-black.png': 500,        // Product image
  'patchwork-hoodie.png': 500,    // Product image
  'printed-hoodie.png': 500,      // Product image
};

const WEBP_QUALITY = 80;

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  const files = await readdir(IMAGES_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png'));

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of pngFiles) {
    const inputPath = path.join(IMAGES_DIR, file);
    const outputFile = file.replace('.png', '.webp');
    const outputPath = path.join(IMAGES_DIR, outputFile);

    const originalStat = await stat(inputPath);
    const originalSize = originalStat.size;
    totalOriginal += originalSize;

    try {
      let pipeline = sharp(inputPath);

      // Resize if configured
      const maxWidth = RESIZE_CONFIG[file];
      if (maxWidth) {
        pipeline = pipeline.resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        });
      }

      // Convert to WebP
      await pipeline
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);

      const optimizedStat = await stat(outputPath);
      const optimizedSize = optimizedStat.size;
      totalOptimized += optimizedSize;

      const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
      console.log(
        `  ✅ ${file.padEnd(28)} ${formatSize(originalSize).padStart(10)} → ${formatSize(optimizedSize).padStart(10)}  (${savings}% smaller)`
      );
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }

  console.log('\n' + '─'.repeat(70));
  console.log(`  Total original:  ${formatSize(totalOriginal)}`);
  console.log(`  Total optimized: ${formatSize(totalOptimized)}`);
  console.log(`  Total savings:   ${formatSize(totalOriginal - totalOptimized)} (${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%)`);
  console.log('─'.repeat(70));
  console.log('\n🎉 Done! WebP images saved alongside originals in /public/images/');
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

optimizeImages().catch(console.error);
