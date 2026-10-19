// scratch/test_lufer_and_houses.js
const assert = require('assert');
const config = require('../src/config');
const io = require('c:/Users/WIN11/Desktop/Project01 - Kopya/node_modules/socket.io-client');

console.log("🚀 Testing Lüfer Fish (8 TL) & Tripled House Prices...");

// 1. Verify config.HOUSE_PRICES
console.log("📌 Checking config.HOUSE_PRICES...");
assert.strictEqual(config.HOUSE_PRICES.standart, 4125, "Standart house price should be 4125 TL");
assert.strictEqual(config.HOUSE_PRICES.garden, 8250, "Garden house price should be 8250 TL");
assert.strictEqual(config.HOUSE_PRICES.pool, 12375, "Pool house price should be 12375 TL");
console.log("✅ House prices in config.js: Standart: 4125 TL, Garden: 8250 TL, Pool: 12375 TL");

// 2. Verify FISH_LOOT_TABLE has Lüfer with value 8
console.log("📌 Checking FISH_LOOT_TABLE for Lüfer...");
let luferCoast = config.FISH_LOOT_TABLE.find(f => f.id === 'lufer');
assert.ok(luferCoast, "Lüfer must exist in FISH_LOOT_TABLE");
assert.strictEqual(luferCoast.value, 8, "Lüfer price must be 8 TL");
console.log(`✅ Lüfer found in coastal fishing: ${luferCoast.name} (${luferCoast.emoji}) -> ${luferCoast.value} TL`);

// 3. Verify SWAN_BOAT_LOOT_TABLE has Lüfer with value 8
console.log("📌 Checking SWAN_BOAT_LOOT_TABLE for Lüfer...");
let luferSwan = config.SWAN_BOAT_LOOT_TABLE.find(f => f.id === 'lufer');
assert.ok(luferSwan, "Lüfer must exist in SWAN_BOAT_LOOT_TABLE");
assert.strictEqual(luferSwan.value, 8, "Lüfer price in swan boat must be 8 TL");
console.log(`✅ Lüfer found in open sea fishing: ${luferSwan.name} (${luferSwan.emoji}) -> ${luferSwan.value} TL`);

// 4. Test socket connection & buying a house at new price
const SERVER_URL = 'http://localhost:3000';

function testSocketPurchase() {
    return new Promise((resolve, reject) => {
        const username = "HouseBuyer_" + Date.now().toString().slice(-4);
        const socket = io(SERVER_URL, {
            transports: ['websocket'],
            forceNew: true
        });

        socket.on('connect', () => {
            socket.emit('register', { name: username, pass: '123456', gender: 'male' });
        });

        socket.on('registerFailed', (err) => reject(new Error(err)));

        socket.on('loginSuccess', (userData) => {
            console.log(`✅ ${username} registered with ${userData.money} TL`);

            socket.once('gameError', (message) => {
                assert(message.includes('4125 TL'), "Insufficient-balance error must show the 4125 TL house price");
                console.log("✅ House purchase correctly reports the new 4125 TL price.");
                socket.disconnect();
                resolve();
            });

            socket.emit('buyHouse', 'standart');
        });

        setTimeout(() => reject(new Error("Timeout socket test")), 5000);
    });
}

testSocketPurchase()
    .then(() => {
        console.log("\n🎉 ALL TESTS PASSED! Lüfer (8 TL) and tripled house prices verified successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Test error:", err);
        process.exit(1);
    });
