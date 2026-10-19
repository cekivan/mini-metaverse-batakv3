const fs = require('fs');
const lines = fs.readFileSync('src/gameCoordinator.js', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('function sendBatakUpdate') || l.includes('function sendOkey101Update')) {
        console.log((i + 1) + ': ' + l);
    }
});
