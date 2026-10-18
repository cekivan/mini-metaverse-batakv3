// scratch/test_tavla_e2e.js - End to end socket test for symmetrical Tavla
const path = require('path');
const assert = require('assert');
const { io } = require(path.join(process.cwd(), 'node_modules/socket.io-client'));

async function testTavlaE2E() {
    console.log("=== TAVLA UÇTAN UCA SOKET VE SİMETRİK TAHTA TESTİ ===");

    const socket1 = io('http://localhost:3000', { transports: ['websocket'], forceNew: true });
    await new Promise(r => socket1.on('connect', r));
    console.log("✓ Oyuncu 1 bağlandı.");

    const u1 = "tavla_p1_" + Math.floor(Math.random() * 10000);
    socket1.emit('register', { name: u1, pass: "123456", gender: 'male' });
    await new Promise(r => socket1.on('loginSuccess', r));
    console.log(`✓ Oyuncu 1 giriş yaptı: ${u1}`);

    const socket2 = io('http://localhost:3000', { transports: ['websocket'], forceNew: true });
    await new Promise(r => socket2.on('connect', r));
    console.log("✓ Oyuncu 2 bağlandı.");

    const u2 = "tavla_p2_" + Math.floor(Math.random() * 10000);
    socket2.emit('register', { name: u2, pass: "123456", gender: 'male' });
    await new Promise(r => socket2.on('loginSuccess', r));
    console.log(`✓ Oyuncu 2 giriş yaptı: ${u2}`);

    let gameStartPromise = new Promise(resolve => {
        socket1.once('startGame', mode => {
            console.log(`✓ Oyun başladı! Mod: ${mode}`);
            resolve(mode);
        });
    });

    let tavlaStatePromise = new Promise(resolve => {
        socket1.once('tavlaUpdate', state => {
            console.log("✓ İlk tavlaUpdate alındı!");
            resolve(state);
        });
    });

    // Masa oluştur ve katıl
    let tableLobbyPromise = new Promise(resolve => {
        socket1.once('updateTableLobby', data => {
            resolve(data.tableId);
        });
    });
    socket1.emit('createNewTable', { baseType: 'tavla', bet: 0 });
    const tavlaTableId = await tableLobbyPromise;
    console.log(`✓ Masa oluşturuldu: ${tavlaTableId}`);

    socket2.emit('joinTable', tavlaTableId);

    const mode = await gameStartPromise;
    assert.strictEqual(mode, 'tavla', "Oyun modu tavla olmalı");

    const state = await tavlaStatePromise;

    // 1. Simetri doğrulaması
    console.log("--- Tahta Taş Dağılımı Doğrulaması ---");
    assert.strictEqual(state.board[24].count, 2, "24'te 2 Beyaz taş olmalı");
    assert.strictEqual(state.board[24].player, 'white');
    assert.strictEqual(state.board[1].count, 2, "1'de 2 Siyah taş olmalı");
    assert.strictEqual(state.board[1].player, 'black');

    assert.strictEqual(state.board[13].count, 5, "13'te 5 Beyaz taş olmalı");
    assert.strictEqual(state.board[13].player, 'white');
    assert.strictEqual(state.board[12].count, 5, "12'de 5 Siyah taş olmalı");
    assert.strictEqual(state.board[12].player, 'black');

    assert.strictEqual(state.board[8].count, 3, "8'de 3 Beyaz taş olmalı");
    assert.strictEqual(state.board[8].player, 'white');
    assert.strictEqual(state.board[17].count, 3, "17'de 3 Siyah taş olmalı");
    assert.strictEqual(state.board[17].player, 'black');

    assert.strictEqual(state.board[6].count, 5, "6'da 5 Beyaz taş olmalı");
    assert.strictEqual(state.board[6].player, 'white');
    assert.strictEqual(state.board[19].count, 5, "19'da 5 Siyah taş olmalı");
    assert.strictEqual(state.board[19].player, 'black');

    console.log("✓ Simetrik tahta yerleşimi sunucu ve istemcide %100 doğrulandı!");

    // 2. Zar atma testi
    let rollUpdatePromise = new Promise(resolve => {
        socket1.once('tavlaUpdate', updated => {
            resolve(updated);
        });
    });

    socket1.emit('tavlaRoll');
    const rolledState = await rollUpdatePromise;
    console.log(`✓ Zar atıldı: [${rolledState.dice.join(', ')}] | Kalan Hamleler: [${rolledState.remainingMoves.join(', ')}]`);
    assert.strictEqual(rolledState.hasRolled, true, "hasRolled true olmalı");
    assert(rolledState.dice.length === 2, "2 zar atılmış olmalı");

    // 3. Hamle sorgusu (Beyaz 24'ten 1'e doğru ilerler)
    let movesPromise = new Promise(resolve => {
        socket1.once('tavlaValidMovesResponse', data => {
            resolve(data.moves);
        });
    });
    socket1.emit('getTavlaValidMoves', { fromPoint: 24 });
    const moves = await movesPromise;
    console.log("✓ 24 numaralı kapıdan geçerli hamleler:", moves);
    assert(moves.length > 0, "24'ten en az bir hamle olmalı");

    moves.forEach(m => {
        assert(m.target < 24, `Beyaz hedefi (${m.target}) 24'ten küçük olmalı!`);
    });
    console.log("✓ Beyaz taşların 1'e doğru ilerlediği doğrulandı!");

    // Hamle yap
    let moveUpdatePromise = new Promise(resolve => {
        socket1.once('tavlaUpdate', updated => {
            resolve(updated);
        });
    });
    socket1.emit('tavlaMove', {
        fromPoint: 24,
        toPoint: moves[0].target,
        usedDie: moves[0].die
    });
    const afterMoveState = await moveUpdatePromise;
    console.log(`✓ Hamle yapıldı: 24 -> ${moves[0].target} (Zar: ${moves[0].die})`);
    assert.strictEqual(afterMoveState.board[24].count, 1, "24'te 1 taş kalmalı");
    assert.strictEqual(afterMoveState.board[moves[0].target].player, 'white', "Hedef kapıda beyaz taş olmalı");

    socket1.disconnect();
    socket2.disconnect();

    console.log("\n=======================================================");
    console.log("🎉 TAVLA SİMETRİSİ VE OYUN MEKANİKLERİ BAŞARIYLA GEÇTİ!");
    console.log("=======================================================\n");
    process.exit(0);
}

testTavlaE2E().catch(err => {
    console.error("❌ Test hatası:", err);
    process.exit(1);
});
