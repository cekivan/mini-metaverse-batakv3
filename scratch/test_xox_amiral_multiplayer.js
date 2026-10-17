// scratch/test_xox_amiral_multiplayer.js - Comprehensive E2E Socket Test for XOX & Amiral Batti Multiplayer
const path = require('path');
const assert = require('assert');
const { io } = require(path.join(process.cwd(), 'node_modules/socket.io-client'));

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log("=================================================================");
    console.log("🎮 E2E TEST: XOX & AMİRAL BATTI ÇOK OYUNCULU (PVP + BOT + BAHİS)");
    console.log("=================================================================\n");

    const socket1 = io('http://localhost:3000', { transports: ['websocket'], forceNew: true });
    await new Promise(r => socket1.on('connect', r));
    console.log("✓ Socket 1 bağlandı.");

    const u1 = "gamer_" + Math.floor(Math.random() * 10000);
    socket1.emit('register', { name: u1, pass: "123456", gender: 'male' });
    const loginData = await new Promise(r => socket1.on('loginSuccess', r));
    console.log(`✓ Socket 1 giriş yaptı: ${u1} (Bakiye: ${loginData.money || 1000} TL)`);

    // ==========================================
    // 1. TEST XOX MULTIPLAYER (PVP / BOT + BAHİS)
    // ==========================================
    console.log("\n--- [TEST 1: XOX Masası, Bahis ve Bot Entegrasyonu] ---");

    let tableIdPromise = new Promise(resolve => {
        socket1.once('updateTableLobby', data => resolve(data.tableId));
    });

    socket1.emit('createNewTable', { baseType: 'xox', bet: 100 });
    const xoxTableId = await tableIdPromise;
    console.log(`✓ XOX masası oluşturuldu: ${xoxTableId} (Bahis: 100 TL)`);

    let xoxStartPromise = new Promise(resolve => {
        socket1.once('startGame', mode => resolve(mode));
    });

    let xoxInitialUpdatePromise = new Promise(resolve => {
        socket1.once('xoxUpdate', update => resolve(update));
    });

    console.log("✓ XOX masasına bot ekleniyor...");
    socket1.emit('addBotToTable', xoxTableId);

    const xoxMode = await xoxStartPromise;
    assert.strictEqual(xoxMode, 'xox', "Oyun modu xox olmalı");
    console.log(`✓ Oyun başladı sinyali alındı: mod = ${xoxMode}`);

    const initialXoxState = await xoxInitialUpdatePromise;
    assert.strictEqual(initialXoxState.tableId, xoxTableId);
    assert.strictEqual(initialXoxState.bet, 100);
    assert.strictEqual(initialXoxState.pot, 200, "Pot 2 * 100 = 200 olmalı");
    assert.strictEqual(initialXoxState.board.length, 9, "Tahta 9 kare olmalı");
    assert.strictEqual(initialXoxState.status, 'playing', "Durum playing olmalı");
    console.log(`✓ XOX başlangıç durumu doğrulandı: Pot = ${initialXoxState.pot} TL, Sıra = ${initialXoxState.turnSymbol}`);

    // Hamle testi: Eğer oyuncunun sırasıysa hamle yap, değilse botun oynamasını bekle
    let mySymbol = initialXoxState.mySymbol;
    console.log(`✓ Oyuncunun sembolü: ${mySymbol}`);

    if (initialXoxState.turnSymbol !== mySymbol) {
        console.log("⏳ Sıra botta, bot hamlesi bekleniyor...");
        await new Promise(resolve => socket1.once('xoxUpdate', resolve));
        console.log("✓ Bot hamlesini yaptı!");
    }

    // Şimdi oyuncu hamle yapsın
    let moveUpdatePromise = new Promise(resolve => {
        socket1.once('xoxUpdate', updated => resolve(updated));
    });

    // Boş bir kare bul
    const emptyIndex = 4; // Merkez
    console.log(`👉 Oyuncu hamle yapıyor: Hücre ${emptyIndex}`);
    socket1.emit('xoxMove', { index: emptyIndex });

    const stateAfterMyMove = await moveUpdatePromise;
    assert.strictEqual(stateAfterMyMove.board[emptyIndex], mySymbol, "Seçilen hücrede oyuncu sembolü olmalı");
    console.log(`✓ Oyuncu hamlesi kaydedildi: board[${emptyIndex}] = ${stateAfterMyMove.board[emptyIndex]}`);

    // Botun cevabını bekle
    console.log("⏳ Botun cevabi hamlesi bekleniyor...");
    const stateAfterBotMove = await new Promise(resolve => socket1.once('xoxUpdate', resolve));
    const botMoves = stateAfterBotMove.board.filter(cell => cell && cell !== mySymbol);
    assert(botMoves.length > 0, "Bot tahtaya en az bir hamle yapmış olmalı");
    console.log(`✓ Bot hamlesini başarıyla yaptı! (Bot sembol sayısı: ${botMoves.length})`);

    // Masadan ayrıl
    console.log("🚪 XOX Masasından ayrılınıyor...");
    socket1.emit('leaveTable');
    await sleep(300);

    // ==========================================
    // 2. TEST AMİRAL BATTI (PVP / BOT + BAHİS)
    // ==========================================
    console.log("\n--- [TEST 2: Amiral Battı Masası, Bahis ve Bot Entegrasyonu] ---");

    tableIdPromise = new Promise(resolve => {
        socket1.once('updateTableLobby', data => resolve(data.tableId));
    });

    socket1.emit('createNewTable', { baseType: 'amiral', bet: 150 });
    const amiralTableId = await tableIdPromise;
    console.log(`✓ Amiral Battı masası oluşturuldu: ${amiralTableId} (Bahis: 150 TL)`);

    let amiralStartPromise = new Promise(resolve => {
        socket1.once('startGame', mode => resolve(mode));
    });

    let amiralInitialUpdatePromise = new Promise(resolve => {
        socket1.once('amiralUpdate', update => resolve(update));
    });

    console.log("✓ Amiral Battı masasına bot ekleniyor...");
    socket1.emit('addBotToTable', amiralTableId);

    const amiralMode = await amiralStartPromise;
    assert.strictEqual(amiralMode, 'amiral', "Oyun modu amiral olmalı");
    console.log(`✓ Amiral Battı başladı sinyali alındı: mod = ${amiralMode}`);

    const initialAmiralState = await amiralInitialUpdatePromise;
    assert.strictEqual(initialAmiralState.tableId, amiralTableId);
    assert.strictEqual(initialAmiralState.bet, 150);
    assert.strictEqual(initialAmiralState.pot, 300, "Pot 2 * 150 = 300 olmalı");
    assert.strictEqual(initialAmiralState.phase, 'SETUP', "İlk aşama SETUP olmalı");
    console.log(`✓ Amiral Battı SETUP aşaması doğrulandı! Pot: ${initialAmiralState.pot} TL`);

    // Oyuncu gemilerini dizip 'amiralReady' göndersin
    console.log("🚢 Oyuncu filosu hazırlanıyor ve hazır sinyali veriliyor...");
    const sampleShips = [
        { id: 1, name: 'Amiral Gemisi', size: 4, coords: [{r:0,c:0},{r:0,c:1},{r:0,c:2},{r:0,c:3}] },
        { id: 2, name: 'Kruvazör', size: 3, coords: [{r:2,c:0},{r:2,c:1},{r:2,c:2}] },
        { id: 3, name: 'Muhrip', size: 2, coords: [{r:4,c:0},{r:4,c:1}] },
        { id: 4, name: 'Hücumbot 1', size: 1, coords: [{r:6,c:0}] },
        { id: 5, name: 'Hücumbot 2', size: 1, coords: [{r:6,c:3}] }
    ];

    let battlePhasePromise = new Promise(resolve => {
        socket1.on('amiralUpdate', update => {
            if (update.phase === 'BATTLE') resolve(update);
        });
    });

    socket1.emit('amiralReady', { ships: sampleShips });
    const battleState = await battlePhasePromise;
    assert.strictEqual(battleState.phase, 'BATTLE', "Aşama BATTLE'a geçmiş olmalı");
    console.log(`✓ Savaş başladı! Aşama: ${battleState.phase}, Sıra: ${battleState.isMyTurn ? 'Oyuncuda' : 'Botta'}`);

    // Eğer sıra botta ise botun ateş etmesini bekle
    if (!battleState.isMyTurn) {
        console.log("⏳ Sıra botta, botun ateş etmesi bekleniyor...");
        await new Promise(resolve => {
            const handler = update => {
                if (update.isMyTurn) {
                    socket1.off('amiralUpdate', handler);
                    resolve(update);
                }
            };
            socket1.on('amiralUpdate', handler);
        });
        console.log("✓ Bot ateş etti, sıra oyuncuya geçti!");
    }

    // Oyuncu düşman radarına ateş etsin (r: 1, c: 1)
    console.log("💥 Oyuncu düşman radarına ateş ediyor (r: 1, c: 1)...");
    let fireUpdatePromise = new Promise(resolve => {
        socket1.once('amiralUpdate', update => resolve(update));
    });

    socket1.emit('amiralFire', { r: 1, c: 1 });
    const stateAfterFire = await fireUpdatePromise;
    const enemyCell = stateAfterFire.oppShots[1][1];
    assert(enemyCell.hit === true || enemyCell.miss === true, "Vurulan hücre hit veya miss olmalı");
    console.log(`✓ Oyuncu atışı işlendi: Sonuç = ${enemyCell.hit ? 'HIT' : 'MISS'}`);

    // Masadan ayrıl
    console.log("🚪 Amiral Battı Masasından ayrılınıyor...");
    socket1.emit('leaveTable');
    await sleep(300);

    // ==========================================
    // 3. İZLEYİCİ / YANCI MODU TESTİ
    // ==========================================
    console.log("\n--- [TEST 3: İzleyici / Yancı Modu (Spectate)] ---");
    // Yeni bir XOX masası açıp bot ekleyelim
    tableIdPromise = new Promise(resolve => {
        socket1.once('updateTableLobby', data => resolve(data.tableId));
    });
    socket1.emit('createNewTable', { baseType: 'xox', bet: 50 });
    const spectateTableId = await tableIdPromise;
    socket1.emit('addBotToTable', spectateTableId);
    await new Promise(resolve => socket1.once('startGame', resolve));

    // Socket 2 bağlansın ve izleyici olsun
    const socket2 = io('http://localhost:3000', { transports: ['websocket'], forceNew: true });
    await new Promise(r => socket2.on('connect', r));
    const u2 = "spectator_" + Math.floor(Math.random() * 10000);
    socket2.emit('register', { name: u2, pass: "123456", gender: 'female' });
    await new Promise(r => socket2.on('loginSuccess', r));

    let spectateUpdatePromise = new Promise(resolve => {
        socket2.once('xoxUpdate', update => resolve(update));
    });

    console.log(`👁️ ${u2} masayı izlemek için katılıyor (spectateTable)...`);
    socket2.emit('spectateTable', spectateTableId);

    const spectatorState = await spectateUpdatePromise;
    assert.strictEqual(spectatorState.isSpectator, true, "isSpectator true olmalı");
    console.log(`✓ İzleyici masanın durumunu canlı aldı! Pot: ${spectatorState.pot} TL, Durum: ${spectatorState.status}`);

    socket1.disconnect();
    socket2.disconnect();

    console.log("\n=================================================================");
    console.log("🎉 TÜM XOX VE AMİRAL BATTI E2E SOKET VE OYUN TESTLERİ %100 BAŞARILI!");
    console.log("=================================================================\n");
}

runTests().catch(err => {
    console.error("❌ TEST BAŞARISIZ:", err);
    process.exit(1);
});
