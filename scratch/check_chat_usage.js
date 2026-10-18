const fs = require('fs');
const path = require('path');

// Let's search all .js files in public/js for sideChatContainer and game opening functions
const jsDir = path.join(__dirname, '../public/js');
const files = fs.readdirSync(jsDir);

for (const f of files) {
    if (!f.endsWith('.js')) continue;
    const content = fs.readFileSync(path.join(jsDir, f), 'utf8');
    if (content.includes('sideChatContainer')) {
        console.log(`[${f}] mentions sideChatContainer`);
        const lines = content.split('\n');
        lines.forEach((l, i) => {
            if (l.includes('sideChatContainer')) {
                console.log(`  L${i+1}: ${l.trim()}`);
            }
        });
    }
}
