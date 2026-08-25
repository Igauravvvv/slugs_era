import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const outputDirectory = resolve(root, 'public/images/cdn');
await mkdir(outputDirectory, { recursive: true });

const heroImages = [
  ['Female_model_vinyl.webp', 'hero-vinyl'],
  ['turtlemodelimage.webp', 'hero-tortoise'],
  ['slow_down_model.webp', 'hero-slow-down'],
  ['seedhe pahad se model.webp', 'hero-pahad'],
];

const valueImages = [
  ['Fluidfits.webp', 'value-fluid-fits'],
  ['transparency.webp', 'value-transparency'],
  ['ArtWork.webp', 'value-artwork'],
  ['Red_on_table.webp', 'value-print'],
  ['fabricloading.webp', 'value-sourcing'],
  ['community.webp', 'value-community'],
];

for (const [input, output] of heroImages) {
  for (const width of [640, 1280, 1920]) {
    await sharp(resolve(root, 'public/images', input))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72, smartSubsample: true })
      .toFile(resolve(outputDirectory, `${output}-${width}.webp`));
  }
}

for (const [input, output] of valueImages) {
  for (const width of [480, 960]) {
    await sharp(resolve(root, 'public/images', input))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72, smartSubsample: true })
      .toFile(resolve(outputDirectory, `${output}-${width}.webp`));
  }
}

console.log(`Generated ${(heroImages.length * 3) + (valueImages.length * 2)} responsive CDN images.`);
