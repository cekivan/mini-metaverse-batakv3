const fs = require('fs');
const assert = require('assert');

console.log('Testing XOX and Amiral Batti Integration...');

// 1. Check index.html
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const requiredIds = [
    'xoxModal', 'xoxModalContent', 'xoxModalHeader', 'xoxChatToggleBtn',
    'xoxDifficultyContainer', 'xoxScoreX', 'xoxScoreO', 'xoxScoreTies',
    'xoxPlayerOName', 'xoxStatusText', 'xoxBoardGrid',
    'amiralBattiModal', 'amiralBattiModalContent', 'amiralModalHeader',
    'amiralChatToggleBtn', 'amiralStatusBanner', 'amiralToast',
    'amiralFleetHUD', 'enemyBoardGrid', 'playerBoardGrid', 'amiralSetupControls'
];
requiredIds.forEach(id => {
    assert(indexHtml.includes(`id="${id}"`), `Missing element id: ${id} in index.html`);
});
assert(indexHtml.includes('js/xoxGame.js'), 'Missing script xoxGame.js in index.html');
assert(indexHtml.includes('js/amiralBatti.js'), 'Missing script amiralBatti.js in index.html');
console.log('✔ index.html element IDs and script tags verified.');

// 2. Check main.js
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
assert(mainJs.includes("id: 'xox'"), "Missing xox in cafeTables in main.js");
assert(mainJs.includes("id: 'amiral'"), "Missing amiral in cafeTables in main.js");
assert(mainJs.includes("openXoxModal()"), "Missing openXoxModal() in main.js");
assert(mainJs.includes("openAmiralBattiModal()"), "Missing openAmiralBattiModal() in main.js");
console.log('✔ main.js cafeTables, clicks, and interact keys verified.');

// 3. Check worldRenderer.js
const worldRendererJs = fs.readFileSync('public/js/worldRenderer.js', 'utf8');
assert(worldRendererJs.includes("drawXoxTableObj"), "Missing drawXoxTableObj in worldRenderer.js");
assert(worldRendererJs.includes("drawAmiralBattiTableObj"), "Missing drawAmiralBattiTableObj in worldRenderer.js");
console.log('✔ worldRenderer.js table drawings verified.');

// 4. Check seatRegistry.js
const seatRegistryJs = fs.readFileSync('public/js/seatRegistry.js', 'utf8');
assert(seatRegistryJs.includes("game: 'xox'"), "Missing xox seat in seatRegistry.js");
assert(seatRegistryJs.includes("game: 'amiral'"), "Missing amiral seat in seatRegistry.js");
console.log('✔ seatRegistry.js seats verified.');

// 5. Check style.css
const styleCss = fs.readFileSync('public/style.css', 'utf8');
assert(styleCss.includes('.xox-board-container'), "Missing .xox-board-container in style.css");
assert(styleCss.includes('.naval-grid'), "Missing .naval-grid in style.css");
console.log('✔ style.css classes verified.');

console.log('All tests passed successfully! 🎉');
