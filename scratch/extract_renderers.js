const fs = require('fs');
const path = require('path');
const vm = require('vm');

const worldRendererPath = path.join(__dirname, '../public/js/worldRenderer.js');
const originalCode = fs.readFileSync(worldRendererPath, 'utf8');
const lines = originalCode.split('\n');

function getSlice(startLine1Indexed, endLine1Indexed) {
    return lines.slice(startLine1Indexed - 1, endLine1Indexed).join('\n');
}

// 1. Sahil (lines 2460 to 3338)
const sahilCode = `// public/js/renderers/renderSahil.js - Martı Sahili ve Balıkçılık İskelesi Çizim Modülü
` + getSlice(2460, 3338) + `

if (typeof window !== 'undefined') {
    window.renderStaticBeachTo = renderStaticBeachTo;
    window.drawBeachEnvironment = drawBeachEnvironment;
    window.getBeachShoreX = getBeachShoreX;
    window.drawDetailedPalmTree = drawDetailedPalmTree;
    window.drawTikiBeachBar = drawTikiBeachBar;
    window.drawBeachLoungers = drawBeachLoungers;
    window.drawHorizonYacht = drawHorizonYacht;
}
`;

// 2. Nargile Lounge (lines 3339 to 3608 + lines 3891 to 4120)
const nargileCode = `// public/js/renderers/renderNargile.js - Otantik Nargile & Okey Salonu Çizim Modülü
` + getSlice(3339, 3608) + `\n\n` + getSlice(3891, 4120) + `

if (typeof window !== 'undefined') {
    window.renderStaticNargileCafeTo = renderStaticNargileCafeTo;
    window.drawNargileCafeEnvironment = drawNargileCafeEnvironment;
    window.drawKitchenDoor = drawKitchenDoor;
    window.drawNargileOkeyTable = drawNargileOkeyTable;
    window.drawLuxuryLoungeSuite = drawLuxuryLoungeSuite;
    window.drawSilkPillow = drawSilkPillow;
    window.drawLoungeHoverOverlay = drawLoungeHoverOverlay;
    window.drawHookahCounter = drawHookahCounter;
}
`;

// 3. Market (lines 3609 to 3890)
const marketCode = `// public/js/renderers/renderMarket.js - Mobilya Marketi & Showroom Çizim Modülü
` + getSlice(3609, 3890) + `

if (typeof window !== 'undefined') {
    window.renderStaticMarketTo = renderStaticMarketTo;
    window.drawMarketEnvironment = drawMarketEnvironment;
    window.drawMarketWallShelves = drawMarketWallShelves;
    window.drawCeilingTrackLights = drawCeilingTrackLights;
    window.drawShowroomPodium = drawShowroomPodium;
}
`;

// 4. Casino (Ganyan lines 4211 to 4972 + Dedenin Yeri lines 5241 to 5420)
const casinoCode = `// public/js/renderers/renderCasino.js - Ganyan Hipodrom & Dedenin Yeri Casino Çizim Modülü
` + getSlice(4211, 4972) + `\n\n` + getSlice(5241, 5420) + `

if (typeof window !== 'undefined') {
    window.renderStaticGanyanTo = renderStaticGanyanTo;
    window.drawGanyanEnvironment = drawGanyanEnvironment;
    window.renderStaticDedeninYeriTo = renderStaticDedeninYeriTo;
    window.drawDedeninYeriEnvironment = drawDedeninYeriEnvironment;
}
`;

// 5. Cadde (lines 4973 to 5240)
const caddeCode = `// public/js/renderers/renderCadde.js - Cadde & Bulvar Çizim Modülü
` + getSlice(4973, 5240) + `

if (typeof window !== 'undefined') {
    window.renderStaticCaddeTo = renderStaticCaddeTo;
    window.drawCaddeEnvironment = drawCaddeEnvironment;
}
`;

// 6. Emlakci (lines 5421 to 5826)
const emlakciCode = `// public/js/renderers/renderEmlakci.js - Prestij Gayrimenkul Emlak Ofisi Çizim Modülü
` + getSlice(5421, 5826) + `

if (typeof window !== 'undefined') {
    window.renderStaticEmlakciTo = renderStaticEmlakciTo;
    window.drawMaketPedestal = drawMaketPedestal;
    window.drawMiniApartmentBuilding = drawMiniApartmentBuilding;
    window.drawMiniCountryHouse = drawMiniCountryHouse;
    window.drawMiniLuxuryVilla = drawMiniLuxuryVilla;
    window.drawEmlakciEnvironment = drawEmlakciEnvironment;
}
`;

// Verify syntax of all 6 files
const filesToCreate = [
    { name: 'renderSahil.js', code: sahilCode },
    { name: 'renderNargile.js', code: nargileCode },
    { name: 'renderMarket.js', code: marketCode },
    { name: 'renderCasino.js', code: casinoCode },
    { name: 'renderCadde.js', code: caddeCode },
    { name: 'renderEmlakci.js', code: emlakciCode },
];

console.log("Verifying syntax for all 6 renderers...");
filesToCreate.forEach(f => {
    try {
        new vm.Script(f.code);
        console.log(`✓ ${f.name} syntax is VALID!`);
    } catch (e) {
        console.error(`✗ ${f.name} syntax ERROR:`, e);
        process.exit(1);
    }
});

// Now construct new worldRenderer.js
// It will contain:
// 1) lines 1 to 2459 (General setup, cache, Cafe, Street, table objects 1..6, portals)
// 2) lines 4121 to 4210 (drawBlackjackTableObj)
// 3) References to extracted modules
const blackjackCode = getSlice(4121, 4210);

const newWorldRenderer = lines.slice(0, 2459).join('\n') + `\n\n` +
`// ============================================================================\n` +
`// 8.8 CANLI BLACKJACK 21 MASASI ÇİZİMİ (Masa Objeleri Arasında Tutulur)\n` +
`// ============================================================================\n` +
blackjackCode + `\n\n` +
`// ============================================================================\n` +
`// ODA MODÜLLERİ (public/js/renderers/ DİZİNİNE TAŞINDI)\n` +
`// - renderSahil.js   : Martı Sahili ve Balıkçılık İskelesi\n` +
`// - renderNargile.js : Otantik Nargile & Okey Salonu\n` +
`// - renderMarket.js  : Mobilya Marketi & Showroom\n` +
`// - renderCasino.js  : Ganyan Hipodrom & Dedenin Yeri Casino\n` +
`// - renderCadde.js   : Cadde & Bulvar\n` +
`// - renderEmlakci.js : Prestij Gayrimenkul Emlak Ofisi\n` +
`// ============================================================================\n`;

console.log("Verifying new worldRenderer.js syntax...");
try {
    new vm.Script(newWorldRenderer);
    console.log("✓ New worldRenderer.js syntax is VALID!");
} catch (e) {
    console.error("✗ New worldRenderer.js syntax ERROR:", e);
    process.exit(1);
}

// Write the files!
const renderersDir = path.join(__dirname, '../public/js/renderers');
if (!fs.existsSync(renderersDir)) fs.mkdirSync(renderersDir, { recursive: true });

filesToCreate.forEach(f => {
    const target = path.join(renderersDir, f.name);
    fs.writeFileSync(target, f.code, 'utf8');
    console.log(`Wrote ${target} (${f.code.split('\n').length} lines)`);
});

fs.writeFileSync(worldRendererPath, newWorldRenderer, 'utf8');
console.log(`Updated ${worldRendererPath} (${newWorldRenderer.split('\n').length} lines)`);

console.log("\nRenderer extraction successfully completed!");
