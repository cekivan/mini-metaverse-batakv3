// scratch/test_roulette_e2e.js - End to end test for roulette mechanics and server communication
const path = require('path');
const assert = require('assert');
const { io } = require(path.join(process.cwd(), 'node_modules/socket.io-client'));

async function testRouletteE2E() {
    console.log("=== RULET UÇTAN UCA SOKET VE KAZANAN SAYI TESTİ ===");

    const socket = io('http://localhost:3000', { transports: ['websocket'], forceNew: true });
    await new Promise(r => socket.on('connect', r));
    console.log("✓ Soket bağlandı.");

    const testUser = "r_tester_" + Math.floor(Math.random() * 10000);
    socket.emit('register', { name: testUser, pass: "123456", gender: 'male' });
    await new Promise(r => socket.on('loginSuccess', r));
    console.log(`✓ Kullanıcı oluşturuldu: ${testUser}`);

    // Rulet masasına katıl
    let initPromise = new Promise(resolve => {
        socket.once('roulette_init', data => {
            console.log("✓ roulette_init alındı. Çark dizilimi uzunluğu:", data.wheelOrder.length);
            assert.strictEqual(data.wheelOrder.length, 37);
            resolve(data.wheelOrder);
        });
    });
    socket.emit('roulette_join');
    const wheelOrder = await initPromise;

    // 5 tur spin testi
    for (let round = 1; round <= 5; round++) {
        let resultPromise = new Promise(resolve => {
            socket.once('roulette_result', data => {
                resolve(data);
            });
        });

        // 50 TL kırmızıya, 50 TL 0'a bahis koy
        socket.emit('roulette_spin', { bets: { red: 50, '0': 50 } });
        const res = await resultPromise;

        console.log(`✓ Tur ${round}: Kazanan Numara = ${res.winningNumber} (${res.color}), WheelIndex = ${res.wheelIndex}`);
        assert.strictEqual(wheelOrder[res.wheelIndex], res.winningNumber, "WheelIndex ile kazanan numara birebir eşleşmeli!");
        assert(res.wheelIndex >= 0 && res.wheelIndex < 37, "WheelIndex 0-36 aralığında olmalı!");
    }

    socket.disconnect();
    console.log("\n=======================================================");
    console.log("🎉 RULET SUNUCU VE İSTEMCİ HESAPLAMA DOĞRULAMASI BAŞARILI!");
    console.log("=======================================================\n");
    process.exit(0);
}

testRouletteE2E().catch(err => {
    console.error("❌ Test hatası:", err);
    process.exit(1);
});
