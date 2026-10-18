const fs = require('fs');
const content = fs.readFileSync('src/engines/okey101.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.includes('startOkey101') || l.includes('function start') || l.includes('createDeck')) {
        console.log((i + 1) + ': ' + l);
    }
});
