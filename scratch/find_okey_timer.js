const fs = require('fs');
const lines = fs.readFileSync('src/gameCoordinator.js', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('function startOkey101AfkTimer') || l.includes('function resetOkey101AfkTimer')) {
        console.log((i + 1) + ': ' + l);
    }
});
