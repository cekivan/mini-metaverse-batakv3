const io = require('socket.io-client');
const assert = require('assert');

console.log("=== TEST: E2E Socket Integration for Classic 2 & Watches ===");

const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    forceNew: true
});

const testUser = `c2_tester_${Math.floor(Math.random() * 9000 + 1000)}`;

socket.on('connect', () => {
    console.log("✔ Socket connected to server");
    socket.emit('register', { name: testUser, pass: '123456', gender: 'male' });
});

socket.on('loginSuccess', (data) => {
    console.log(`✔ Logged in as ${testUser}`);

    // 1. Test setAvatarModel to classic_2
    socket.emit('setAvatarModel', { model: 'classic_2' });
});

let modelChanged = false;
let watchEquipped = false;
let outfitEquipped = false;

socket.on('playerAvatarChange', (data) => {
    if (data.id !== socket.id) return;

    if (data.model === 'classic_2' && !modelChanged) {
        modelChanged = true;
        console.log("✔ Server confirmed model change to classic_2");

        // 2. Buy/equip watch_gold_rolex
        socket.emit('buyWardrobeItem', { category: 'watches', id: 'watch_gold_rolex' });
    }

    if (data.watch === 'watch_gold_rolex' && !watchEquipped) {
        watchEquipped = true;
        console.log("✔ Server confirmed watch_gold_rolex equipped!");

        // 3. Buy/equip outfit_c2_gentleman
        socket.emit('buyWardrobeItem', { category: 'outfits', id: 'outfit_c2_gentleman' });
    }

    if (data.outfit === 'outfit_c2_gentleman' && !outfitEquipped) {
        outfitEquipped = true;
        console.log("✔ Server confirmed outfit_c2_gentleman equipped!");

        console.log("\n🎉 ALL E2E SOCKET TESTS FOR CLASSIC 2 PASSED 100%!");
        socket.disconnect();
        process.exit(0);
    }
});

setTimeout(() => {
    console.error("❌ E2E test timed out!");
    socket.disconnect();
    process.exit(1);
}, 6000);
