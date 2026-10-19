const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = path.join(__dirname, '../src/gameCoordinator.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Cut the monolithic Tavla/XOX/Amiral section
const startMarker = "// --- TAVLA SİSTEMİ ---";
const endMarker = "// --- 101 OKEY SİSTEMİ ---";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found:", { startIndex, endIndex });
    process.exit(1);
}

const replacement = "// --- MASA & KUTU OYUNLARI (Tavla, XOX, Amiral Battı) koordinatörü: ./coordinators/boardGameCoordinator.js ---\r\n\r\n";
content = content.slice(0, startIndex) + replacement + content.slice(endIndex);

// 2. Replace timer declarations with boardGameCoordinator imports
const targetDeclCRLF = "const xoxBotTimers = {};\r\nconst amiralBotTimers = {};";
const targetDeclLF = "const xoxBotTimers = {};\nconst amiralBotTimers = {};";

const newImports = `const {
    sendTavlaUpdate,
    sendXoxUpdate,
    handleXoxVoteRematch,
    sendAmiralUpdate,
    handleAmiralVoteRematch,
    xoxBotTimers,
    amiralBotTimers
} = require('./coordinators/boardGameCoordinator');`;

if (content.includes(targetDeclCRLF)) {
    content = content.replace(targetDeclCRLF, newImports);
} else if (content.includes(targetDeclLF)) {
    content = content.replace(targetDeclLF, newImports);
} else {
    console.error("Timer declarations not found in content");
    process.exit(1);
}

// 3. Test syntax before saving
try {
    new vm.Script(content);
    console.log("Syntax check passed!");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("src/gameCoordinator.js successfully updated!");
} catch (err) {
    console.error("Syntax check failed:", err);
    process.exit(1);
}
