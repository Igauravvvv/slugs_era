const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, 'public', 'images');

async function optimizeImages() {
  console.log('Starting image optimization...');
  
  try {
    const files = fs.readdirSync(IMAGES_DIR);
    let optimizedCount = 0;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      
      // Skip files that are already webp, or aren't images
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        const inputPath = path.join(IMAGES_DIR, file);
        const filenameWithoutExt = path.basename(file, ext);
        const outputPath = path.join(IMAGES_DIR, `${filenameWithoutExt}.webp`);

        console.log(`Processing: ${file} ...`);
        
        try {
          // Get metadata to check size
          const metadata = await sharp(inputPath).metadata();
          let pipeline = sharp(inputPath);

          // Resize if it's massive (width > 2000px)
          if (metadata.width > 2000) {
            pipeline = pipeline.resize({ width: 2000, withoutEnlargement: true });
          }

          // Convert to webp with compression
          await pipeline
            .webp({ quality: 80, effort: 6 })
            .toFile(outputPath);
            
          console.log(`  ✓ Converted to ${filenameWithoutExt}.webp`);
          
          // Optionally delete the original file to save space
          fs.unlinkSync(inputPath);
          console.log(`  - Deleted original ${file}`);
          
          optimizedCount++;
        } catch (err) {
          console.error(`  X Failed to process ${file}:`, err);
        }
      }
    }
    
    console.log(`\nOptimization complete! Processed ${optimizedCount} images.`);
  } catch (err) {
    console.error('Failed to read images directory:', err);
  }
}

optimizeImages();
