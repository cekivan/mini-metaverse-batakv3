const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('public/index.html', 'utf8');
const idRegex = /id=["']([^"']+)["']/g;
const htmlIds = new Set();
let match;
while ((match = idRegex.exec(html)) !== null) {
    htmlIds.add(match[1]);
}

const jsDir = path.join(process.cwd(), 'public', 'js');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && !f.includes('backup'));

const missingByFile = {};

for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(jsDir, file), 'utf8');
    const getElemRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
    let m;
    while ((m = getElemRegex.exec(content)) !== null) {
        const id = m[1];
        if (!htmlIds.has(id)) {
            // Check if dynamically created in JS
            if (!content.includes(`id = '${id}'`) && !content.includes(`id = "${id}"`) && !content.includes(`id="${id}"`)) {
                if (!missingByFile[file]) missingByFile[file] = new Set();
                missingByFile[file].add(id);
            }
        }
    }
}

console.log("=== Missing DOM Element IDs Report ===");
for (const file in missingByFile) {
    console.log(`\nIn ${file}:`);
    for (const id of missingByFile[file]) {
        console.log(`  - ${id}`);
    }
}
