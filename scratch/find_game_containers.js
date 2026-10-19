const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');

// Find all game-related divs or screens in index.html
const matches = html.match(/<div[^>]*id=["']([^"']*(?:game|batak|okey|tavla|bilardo|billiard|modal|screen|canvas|table)[^"']*)["'][^>]*>/gi);
if (matches) {
    matches.forEach(m => console.log(m.substring(0, 150)));
}
