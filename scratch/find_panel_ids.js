const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const idMatches = html.match(/id="([^"]+)"/g) || [];
const ids = idMatches.map(m => m.replace(/^id="|"$|'/g, '')).filter(id => /modal|panel|container|game|table/i.test(id));
console.log('Matching IDs:', ids);
