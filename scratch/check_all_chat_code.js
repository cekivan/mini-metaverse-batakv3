const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../public/js');
const files = fs.readdirSync(jsDir);

for (const f of files) {
    if (!f.endsWith('.js')) continue;
    const content = fs.readFileSync(path.join(jsDir, f), 'utf8');
    // Search for any code that changes display of chat, or hides elements
    const matches = content.match(/sideChatContainer[^\n]*/g);
    if (matches) {
        console.log(`File: ${f}`);
        matches.forEach(m => console.log('  ', m));
    }
}
