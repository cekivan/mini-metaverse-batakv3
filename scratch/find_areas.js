const fs = require('fs');
const lines = fs.readFileSync('public/index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('id="batakArea"') || l.includes('id="okey101Area"') || l.includes('id="gameModal"')) {
        console.log((i + 1) + ': ' + l.trim());
    }
});
