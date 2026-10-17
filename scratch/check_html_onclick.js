const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const onclickRegex = /onclick\s*=\s*["']([^"']+)["']/g;
let match;
const calls = new Set();
while ((match = onclickRegex.exec(html)) !== null) {
    let fnCall = match[1].trim();
    let fnName = fnCall.split('(')[0].trim().replace(/^window\./, '');
    if (fnName && !fnName.includes(';') && !fnName.includes('=') && !fnName.includes('{') && !fnName.includes(' ') && !fnName.includes('.')) {
        calls.add(fnName);
    }
}
const jsFiles = fs.readdirSync('public/js').filter(f => f.endsWith('.js') && !f.endsWith('.bak'));
let allJsContent = jsFiles.map(f => fs.readFileSync('public/js/' + f, 'utf8')).join('\n');
let missing = [];
for (let fn of calls) {
    if (!allJsContent.includes('function ' + fn) &&
        !allJsContent.includes(fn + ' =') &&
        !allJsContent.includes(fn + '=') &&
        !allJsContent.includes('window.' + fn)) {
        missing.push(fn);
    }
}
console.log('Total onclick functions:', calls.size);
console.log('Potentially missing functions:', missing);
