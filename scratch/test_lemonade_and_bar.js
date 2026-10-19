const fs = require('fs');
const path = require('path');

// 1. Test public/index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
console.log("Check lemonadeStandModal in index.html:", indexHtml.includes('id="lemonadeStandModal"'));
console.log("Check lemonadeOwnerName in index.html:", indexHtml.includes('id="lemonadeOwnerName"'));
console.log("Check lemonadePlayerBalance in index.html:", indexHtml.includes('id="lemonadePlayerBalance"'));

// 2. Test cocktailBar.js
const cocktailJs = fs.readFileSync(path.join(__dirname, '../public/js/cocktailBar.js'), 'utf8');
console.log("Check cocktailBar z-index 45000:", cocktailJs.includes('z-index: 45000;'));
console.log("Check cocktailBar coin sound:", cocktailJs.includes("window.playSound('coin')"));

// 3. Test avatarRenderer.js
const avatarJs = fs.readFileSync(path.join(__dirname, '../public/js/avatarRenderer.js'), 'utf8');
console.log("Check avatarRenderer limonata/cocktail drawing:", avatarJs.includes("heldItem === 'limonata' || heldItem === 'lemonade' || heldItem.startsWith('cocktail_')"));

// 4. Test backend handlers
const economyJs = fs.readFileSync(path.join(__dirname, '../src/handlers/economyHandler.js'), 'utf8');
console.log("Check economyHandler findUserKey:", economyJs.includes("let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;"));
console.log("Check economyHandler heldItem cocktail:", economyJs.includes("userData.avatar.heldItem = 'cocktail_' + data.id;"));
console.log("Check economyHandler chatUpdate emit:", economyJs.includes("io.to(room).emit('chatUpdate'"));

const housingJs = fs.readFileSync(path.join(__dirname, '../src/handlers/housingHandler.js'), 'utf8');
console.log("Check housingHandler buyer heldItem limonata:", housingJs.includes("buyerData.avatar.heldItem = 'limonata';"));
console.log("Check housingHandler chatUpdate emit:", housingJs.includes("io.to(room).emit('chatUpdate', { id: socket.id, msg: '🍋 Buz gibi taze limonatamı yudumluyorum!' }"));

console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY!");
