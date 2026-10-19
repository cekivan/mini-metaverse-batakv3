const fs = require('fs');
const path = require('path');

const gameFiles = ['batak.js', 'okey101.js', 'tavla.js', 'billiard.js', 'blackjack.js', 'roulette.js', 'slotMachine.js', 'ganyan.js', 'main.js'];

gameFiles.forEach(file => {
    const filePath = path.join(__dirname, '../public/js', file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
        if (/chat/i.test(l) && !/voicechat/i.test(l) && !/chatpop/i.test(l)) {
            console.log(`[${file}:${idx+1}] ${l.trim()}`);
        }
    });
});
