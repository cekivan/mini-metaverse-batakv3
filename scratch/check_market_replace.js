const fs = require('fs');
const path = require('path');

const worldRendererPath = path.join(__dirname, '../public/js/worldRenderer.js');
let content = fs.readFileSync(worldRendererPath, 'utf8');

// Let's create the dedicated function drawFurnitureMarketExterior
const marketCode = `    // E) 🛒 MOBİLYA & EV MARKETİ (LÜKS VİTRİNLİ & ŞIK CEPHE)
    drawFurnitureMarketExterior(bctx, 550, 345, 230, 125, isNightMode);`;

console.log("Found market section in worldRenderer:", content.includes("// E) 🛒 MOBİLYA & EV MARKETİ"));
