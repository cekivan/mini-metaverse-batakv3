const fs = require('fs');
const path = require('path');

const files = ['batak.js', 'okey101.js', 'tavla.js', 'billiard.js', 'main.js'];

files.forEach(file => {
    const filePath = path.join(__dirname, '../public/js', file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
        if (/chat/i.test(l) && /display|hide|none|flex|show/i.test(l)) {
            console.log(`[${file}:${idx+1}] ${l.trim()}`);
        }
    });
});
