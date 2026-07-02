const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'images');

const files = [
  { in: '01  Owns the game B_blackbg.png', out: 'owns_the_game_b.webp' },
  { in: '01  Owns the game F_blackbg.png', out: 'owns_the_game_f.webp' },
  { in: 'brown patch hoodie b_blackbg.png', out: 'brown_patch_b.webp' },
  { in: 'brown patch hoodie f_blackbg.png', out: 'brown_patch_f.webp' },
  { in: 'cherry bloosm b_blackbg.png', out: 'cherry_blossom_b.webp' },
  { in: 'cherry bloosm f_blackbg.png', out: 'cherry_blossom_f.webp' },
  { in: 'Couple Heart Patch (EVER) B_blackbg.png', out: 'couple_ever_b.webp' },
  { in: 'Couple Heart Patch (FOR) & (EVER) F_blackbg.png', out: 'couple_for_ever_f.webp' },
  { in: 'Couple Heart Patch (FOR) B_blackbg.png', out: 'couple_for_b.webp' },
  { in: 'red hoodie f_blackbg.png', out: 'red_hoodie_f.webp' }
];

async function convert() {
  for (const file of files) {
    const inPath = path.join(dir, file.in);
    const outPath = path.join(dir, file.out);
    try {
      await sharp(inPath).webp({ quality: 80 }).toFile(outPath);
      console.log(`Converted ${file.in} to ${file.out}`);
      // Remove original png to clean up
      fs.unlinkSync(inPath);
    } catch (e) {
      console.error(`Error converting ${file.in}:`, e);
    }
  }
}

convert();
