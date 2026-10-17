const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

let errors = 0;
function checkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        checkDir(full);
      }
    } else if (entry.name.endsWith('.js')) {
      try {
        execSync(`node -c "${full}"`);
      } catch (err) {
        console.error('Syntax error in:', full);
        errors++;
      }
    }
  }
}

checkDir('public');
checkDir('src');

if (errors === 0) {
  console.log('✅ ALL public and src JavaScript files passed syntax check with 0 errors!');
} else {
  console.error(`❌ Total syntax errors found: ${errors}`);
  process.exit(1);
}
