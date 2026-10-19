const fs = require('fs');
const path = require('path');

function searchDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory() && ent.name !== 'node_modules') {
            searchDir(full);
        } else if (ent.isFile() && ent.name.endsWith('.js')) {
            const content = fs.readFileSync(full, 'utf8');
            if (content.includes("changeRoom")) {
                console.log('Found changeRoom in:', full);
            }
        }
    }
}
searchDir(path.join(process.cwd(), 'src'));
searchDir(process.cwd());
