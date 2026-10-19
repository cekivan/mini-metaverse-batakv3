// scratch/test_slot_custom_bet_and_house_roulette.js
const path = require('path');
const { io } = require(path.join(process.cwd(), 'node_modules/socket.io-client'));
const assert = require('assert');
const fs = require('fs');

const SERVER_URL = 'http://127.0.0.1:3000';

async function runTests() {
    console.log("=================================================================");
    console.log("🎰 TEST: SLOT CUSTOM BET, 5% COMMISSION & HOUSE ROULETTE TABLE 🎡");
    console.log("=================================================================\n");

    // 1. Verify Codebase Assertions
    console.log("--- 1. Statik Kod Analizi Doğrulaması ---");
<<<<<<< HEAD
<<<<<<< HEAD
    const config = require('../src/config');
    assert.strictEqual(config.FURNITURE_PRICES.roulette_table, 5950, "Shared price config must set roulette_table to 5950");
=======
    const configContent = fs.readFileSync('src/config.js', 'utf8');
    assert(configContent.includes("'roulette_table': 850"), "src/config.js must contain roulette_table: 850 in FURNITURE_PRICES");
>>>>>>> 1970266af90dc7109f9dabca9189fef5685ad2db
=======
    const configContent = fs.readFileSync('src/config.js', 'utf8');
    assert(configContent.includes("'roulette_table': 850"), "src/config.js must contain roulette_table: 850 in FURNITURE_PRICES");
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
    console.log("✓ src/config.js içinde roulette_table: 850 TL tanımlı!");

    const housingContent = fs.readFileSync('public/js/housing.js', 'utf8');
    assert(housingContent.includes("'roulette_table': {"), "FURNITURE_CATALOG must contain roulette_table");
    assert(housingContent.includes("%5 komisyon"), "FURNITURE_CATALOG slot_machine desc must state %5 komisyon");
    assert(housingContent.includes("if (!window.isHouseEditMode) {\n                    if (typeof openSlotModal === 'function')"), "housing.js must guard openSlotModal with !window.isHouseEditMode");
    assert(housingContent.includes("if (!window.isHouseEditMode) {\n                    if (typeof openRouletteModal === 'function')"), "housing.js must guard openRouletteModal with !window.isHouseEditMode");
    console.log("✓ public/js/housing.js katalog ve ev düzenleme korumaları doğrulandı!");

    const slotHandlerContent = fs.readFileSync('src/handlers/slotHandler.js', 'utf8');
    assert(slotHandlerContent.includes("betAmount * 0.05"), "slotHandler must use 0.05 (5%) for house commission");
    assert(slotHandlerContent.includes("betAmount > 10000000"), "slotHandler must accept custom bet amounts up to 10M");
    console.log("✓ src/handlers/slotHandler.js %5 komisyon ve özel bahis desteği doğrulandı!");

    const cssContent = fs.readFileSync('public/style.css', 'utf8');
    assert(cssContent.includes(".roulette-table-container {\n    width: 1080px;"), "roulette-table-container must be 1080px wide");
    assert(cssContent.includes("overflow-x: hidden;"), "roulette-main-area must have overflow-x: hidden");
    console.log("✓ public/style.css 1080px genişlik ve yatay kaydırma koruması doğrulandı!");

    // 2. Canlı Soket Testi: Özel Bahis (Custom Bet) & %5 Komisyon
    console.log("\n--- 2. Canlı Soket Testi: Özel Bahis ve %5 Komisyon ---");
    const p1 = io(SERVER_URL, { transports: ['websocket'], forceNew: true });
    const p2 = io(SERVER_URL, { transports: ['websocket'], forceNew: true });

    await new Promise(r => p1.on('connect', r));
    await new Promise(r => p2.on('connect', r));
    console.log("✓ 2 test soketi bağlandı.");

    let p1Name = 'slothost_' + Math.floor(Math.random() * 10000);
    let p2Name = 'slotguest_' + Math.floor(Math.random() * 10000);

    p1.emit('register', { name: p1Name, pass: "123456", gender: 'male' });
    await new Promise(r => p1.on('loginSuccess', r));
    console.log(`✓ Oyuncu 1 giriş yaptı: ${p1Name}`);

    p2.emit('register', { name: p2Name, pass: "123456", gender: 'female' });
    await new Promise(r => p2.on('loginSuccess', r));
    console.log(`✓ Oyuncu 2 giriş yaptı: ${p2Name}`);

    // Oyuncu 2, Oyuncu 1'in evine gidiyor
    p2.emit('changeRoom', `house_${p1Name}`);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Oyuncu 2, standart listede OLMAYAN özel bir bahis oynuyor (Örn: 350 TL)
    let customBet = 350;
    let expectedCommission = Math.round(customBet * 0.05); // 17.5 -> 18 TL

    let p1ReceivedCommission = false;
    p1.on('toastNotification', (data) => {
        if (data.title === 'Slot Geliri!') {
            p1ReceivedCommission = true;
            console.log(`✓ Ev Sahibi (%5) Bildirimi Aldı: ${data.desc}`);
        }
    });

    let slotResultReceived = false;
    let slotResultObj = null;
    p2.on('slot_result', (data) => {
        slotResultReceived = true;
        slotResultObj = data;
    });

    p2.emit('slot_spin', { betAmount: customBet, houseOwner: p1Name });

    await new Promise(resolve => {
        let check = setInterval(() => {
            if (slotResultReceived) {
                clearInterval(check);
                resolve();
            }
        }, 50);
        setTimeout(() => { clearInterval(check); resolve(); }, 3000);
    });

    assert(slotResultReceived, "Oyuncu 2 özel bahisle slot çevirme sonucunu almalı");
    assert.strictEqual(slotResultObj.betAmount, customBet, `Bahis miktarı ${customBet} olmalı`);
    assert.strictEqual(slotResultObj.commissionPaid, expectedCommission, `Ev sahibine %5 (${expectedCommission} TL) komisyon ödenmeli`);
    assert(p1ReceivedCommission, "Ev sahibi slot gelir bildirimini gerçek zamanlı almış olmalı");
    console.log(`✓ Özel bahis (${customBet} TL) başarıyla kabul edildi!`);
    console.log(`✓ Ev sahibine tam %5 (+${slotResultObj.commissionPaid} TL) komisyon aktarıldı!`);

    // 3. Canlı Soket Testi: Eve Rulet Masası Satın Alma (buyFurniture)
    console.log("\n--- 3. Canlı Soket Testi: Rulet Masası Satın Alma (buyFurniture) ---");
    let buySuccess = false;
    p1.on('furnitureBuySuccess', (data) => {
        if (data.itemId === 'roulette_table') {
            buySuccess = true;
            console.log(`✓ Rulet Masası Satın Alındı! Kalan Para: ${data.remainingMoney} TL`);
        }
    });

    p1.emit('buyFurniture', 'roulette_table');

    await new Promise(resolve => {
        let check = setInterval(() => {
            if (buySuccess) {
                clearInterval(check);
                resolve();
            }
        }, 50);
        setTimeout(() => { clearInterval(check); resolve(); }, 3000);
    });

    assert(buySuccess, "Oyuncu 1 mağazadan roulette_table satın alabilmeli");
    console.log("✓ Rulet masası mobilya envanterine başarıyla eklendi!");

    p1.disconnect();
    p2.disconnect();

    console.log("\n=================================================================");
    console.log("🎉 TÜM ÖZEL BAHİS, %5 KOMİSYON VE RULET TESTLERİ %100 GEÇTİ! 🎉");
    console.log("=================================================================");
    process.exit(0);
}

runTests().catch(err => {
    console.error("Test hatası:", err);
    process.exit(1);
});
