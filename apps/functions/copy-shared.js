const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../../packages/shared');
const destDir = path.resolve(__dirname, './shared');

// Helper to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'src' || entry.name === '.turbo') {
        continue; // skip source and dev folders
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clear existing and copy
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

console.log(`Copying built shared package from ${srcDir} to ${destDir}...`);
copyDir(srcDir, destDir);
console.log('Successfully copied shared package.');
