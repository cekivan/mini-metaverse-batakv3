const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkDir(dir) {
    let files = fs.readdirSync(dir);
    for (let file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'scratch') checkDir(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                execSync(`node --check "${fullPath}"`);
                console.log(`[OK] ${fullPath}`);
            } catch(e) {
                console.error(`[SYNTAX ERROR] ${fullPath}:`, e.message);
            }
        }
    }
}

console.log('Checking syntax in src/ and public/js/ ...');
checkDir('src');
checkDir('public/js');
console.log('Done checking all files!');
