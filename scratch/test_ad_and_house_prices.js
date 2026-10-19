const fs = require('fs');
const assert = require('assert');
const path = require('path');
const config = require('../src/config');
const adManager = require('../src/adManager');

<<<<<<< HEAD
<<<<<<< HEAD
console.log("=== Testing Ad Price (1100 TL) & House Prices (3x) ===");
=======
console.log("=== Testing Ad Price (1100 TL) & House Prices (+10%) ===");
>>>>>>> 1970266af90dc7109f9dabca9189fef5685ad2db
=======
console.log("=== Testing Ad Price (1100 TL) & House Prices (+10%) ===");
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b

// 1. Verify adManager.AD_PRICE
assert.strictEqual(adManager.AD_PRICE, 1100, "AdManager AD_PRICE must be 1100 TL");
console.log("✔ Backend adManager.AD_PRICE is 1100 TL");

// 2. Verify config.HOUSE_PRICES
<<<<<<< HEAD
<<<<<<< HEAD
assert.strictEqual(config.HOUSE_PRICES.standart, 4125, "Standart house price must be 4125 TL");
assert.strictEqual(config.HOUSE_PRICES.garden, 8250, "Garden house price must be 8250 TL");
assert.strictEqual(config.HOUSE_PRICES.pool, 12375, "Pool house price must be 12375 TL");
console.log("✔ Backend config.HOUSE_PRICES updated to 3x (4125, 8250, 12375 TL)");

// 3. Verify public/js/housing.js
const housingCode = fs.readFileSync(path.resolve(__dirname, '../public/js/housing.js'), 'utf8');
assert(housingCode.includes("price: SHARED_PRICES.HOUSE_PRICES.standart"), "housing.js must read standart price from the shared price book");
assert(housingCode.includes("price: SHARED_PRICES.HOUSE_PRICES.garden"), "housing.js must read garden price from the shared price book");
assert(housingCode.includes("price: SHARED_PRICES.HOUSE_PRICES.pool"), "housing.js must read pool price from the shared price book");
console.log("✔ Frontend housing.js HOUSE_INFO prices verified (4125, 8250, 12375 TL)");
=======
=======
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
assert.strictEqual(config.HOUSE_PRICES.standart, 1375, "Standart house price must be 1375 TL (1250 + 10%)");
assert.strictEqual(config.HOUSE_PRICES.garden, 2750, "Garden house price must be 2750 TL (2500 + 10%)");
assert.strictEqual(config.HOUSE_PRICES.pool, 4125, "Pool house price must be 4125 TL (3750 + 10%)");
console.log("✔ Backend config.HOUSE_PRICES updated by +10% (1375, 2750, 4125 TL)");

// 3. Verify public/js/housing.js
const housingCode = fs.readFileSync(path.resolve(__dirname, '../public/js/housing.js'), 'utf8');
assert(housingCode.includes("price: 1375"), "housing.js must have price: 1375 for standart");
assert(housingCode.includes("price: 2750"), "housing.js must have price: 2750 for garden");
assert(housingCode.includes("price: 4125"), "housing.js must have price: 4125 for pool");
console.log("✔ Frontend housing.js HOUSE_INFO prices verified (1375, 2750, 4125 TL)");
<<<<<<< HEAD
>>>>>>> 1970266af90dc7109f9dabca9189fef5685ad2db
=======
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b

// 4. Verify public/index.html
const indexHtml = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8');
assert(indexHtml.includes("💰 1,100 TL"), "index.html billboard modal must display 💰 1,100 TL");
assert(indexHtml.includes("1100 TL Öde ve Yayınla"), "index.html button must display 1100 TL Öde ve Yayınla");
console.log("✔ Frontend index.html billboard modal verified (1,100 TL)");

// 5. Verify public/js/billboardAd.js
const billboardJs = fs.readFileSync(path.resolve(__dirname, '../public/js/billboardAd.js'), 'utf8');
assert(billboardJs.includes("Tıkla Reklam Ver (1100 TL)"), "billboardAd.js must show 1100 TL on street billboard");
assert(billboardJs.includes("1 Dakika • 1100 TL"), "billboardAd.js must show 1100 TL in empty billboard notice");
console.log("✔ Frontend billboardAd.js canvas texts verified (1100 TL)");

console.log("\nALL AD PRICE AND HOUSE PRICE TESTS PASSED WITH 100% SUCCESS!");
