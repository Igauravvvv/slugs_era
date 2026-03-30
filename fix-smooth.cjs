const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/ease:\s*\[0\.16,\s*1,\s*0\.3,\s*1\]/g, 'ease: [0.22, 1, 0.36, 1]')
    .replace(/ease:\s*\[0\.33,\s*1,\s*0\.68,\s*1\]/g, 'ease: [0.22, 1, 0.36, 1]')
    .replace(/duration:\s*0\.9/g, 'duration: 1.2')
    .replace(/duration:\s*0\.8/g, 'duration: 1.1')
    .replace(/duration:\s*0\.6/g, 'duration: 0.8');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
});
