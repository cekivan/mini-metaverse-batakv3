const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');

// Find all elements with id and style
const idStyleRegex = /id=["']([^"']+)["'][^>]*style=["']([^"']+)["']/g;
let match;
console.log('--- INDEX.HTML Z-INDEX ANALYSIS ---');
while ((match = idStyleRegex.exec(html)) !== null) {
    const id = match[1];
    const style = match[2];
    if (style.includes('z-index')) {
        const zMatch = style.match(/z-index:\s*(\d+)/);
        if (zMatch) {
            console.log(`${id.padEnd(30)} z-index: ${zMatch[1]}`);
        }
    }
}

// Also check style.css
const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');
console.log('\n--- STYLE.CSS Z-INDEX ANALYSIS ---');
const cssRegex = /([#\.][^{]+)\{[^}]*z-index:\s*(\d+)[^}]*\}/g;
while ((match = cssRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const z = match[2];
    console.log(`${selector.padEnd(30)} z-index: ${z}`);
}
