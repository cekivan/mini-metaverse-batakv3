const fs = require('fs');

const code = fs.readFileSync('public/js/worldRenderer.js', 'utf8');
const lines = code.split('\n');

let depth = 0;
let stack = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Strip comments and strings roughly
    let clean = line.replace(/\/\/.*$/, '');
    clean = clean.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""').replace(/`[^`]*`/g, '``');
    
    for (let j = 0; j < clean.length; j++) {
        let ch = clean[j];
        if (ch === '{') {
            depth++;
            stack.push(i + 1);
        } else if (ch === '}') {
            depth--;
            stack.pop();
        }
    }
}

console.log("Final brace depth:", depth);
if (depth > 0) {
    console.log("Unclosed braces opened at lines:", stack.slice(-10));
}
