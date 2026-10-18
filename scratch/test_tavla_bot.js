// scratch/test_tavla_bot.js - Test human vs bot in Tavla
const path = require('path');
const assert = require('assert');
const { io } = require(path.join(process.cwd(), 'node_modules/socket.io-client'));

async function testTavlaBot() {
    console.log("=== TAVLA BOT İLE OYUN TESTİ ===");

    const socket1 = io('http://localhost:3000', { transports: ['websocket'], forceNew: true });
    await new Promise(r => socket1.on('connect', r));

    const u1 = "tavla_human_" + Math.floor(Math.random() * 10000);
    socket1.emit('register', { name: u1, pass: "123456", gender: 'male' });
    await new Promise(r => socket1.on('loginSuccess', r));
    console.log(`✓ Oyuncu giriş yaptı: ${u1}`);

    let tableLobbyPromise = new Promise(resolve => {
        socket1.once('updateTableLobby', data => {
            resolve(data.tableId);
        });
    });
    socket1.emit('createNewTable', { baseType: 'tavla', bet: 0 });
    const tableId = await tableLobbyPromise;
    console.log(`✓ Masa açıldı: ${tableId}`);

    let statePromise = new Promise(r => socket1.once('tavlaUpdate', r));

    // Bota karşı oyna (addBotToTable)
    socket1.emit('addBotToTable', tableId);

    let state = await statePromise;
    console.log(`✓ Oyun durumu alındı. Sıra: ${state.players[state.turnIndex]}`);

    // Zar at
    let rollPromise = new Promise(r => socket1.once('tavlaUpdate', r));
    socket1.emit('tavlaRoll');
    let rolled = await rollPromise;
    console.log(`✓ Oyuncu zar attı: [${rolled.dice.join(', ')}]`);

    // Hamle al
    let moves = await new Promise(r => {
        socket1.once('tavlaValidMovesResponse', data => r(data.moves));
        socket1.emit('getTavlaValidMoves', { fromPoint: 24 });
    });
    console.log("✓ Geçerli hamleler:", moves);

    if (moves && moves.length > 0) {
        let movePromise = new Promise(r => socket1.once('tavlaUpdate', r));
        socket1.emit('tavlaMove', {
            fromPoint: 24,
            toPoint: moves[0].target,
            usedDie: moves[0].die
        });
        await movePromise;
        console.log(`✓ Hamle yapıldı: 24 -> ${moves[0].target}`);
    }

    socket1.disconnect();
    console.log("✓ Bot ve insan akışı hatasız tamamlandı!");
    process.exit(0);
}

testTavlaBot().catch(err => {
    console.error("❌ Hata:", err);
    process.exit(1);
});
