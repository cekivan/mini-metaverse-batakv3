// scratch/test_sanalika_cadde.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const io = require('socket.io-client');

async function testSanalikaCadde() {
    console.log("--- 1. Testing roomSpawns and playerHelpers ---");
    const { getRoomSpawn } = require('../src/config/roomSpawns');
    const spawn = getRoomSpawn('sanalika_cadde', 'sokak');
    console.log("sanalika_cadde spawn from sokak:", spawn);
    assert.strictEqual(spawn.x, 750);
    assert.strictEqual(spawn.y, 520);

    const { getPlayerDetailedLocation } = require('../src/utils/playerHelpers');
    const locText = getPlayerDetailedLocation('dummy_sid', { room: 'sanalika_cadde', x: 750, y: 520 });
    console.log("Detailed location string:", locText);
    assert(locText.includes('1. Cadde (İzometrik 3D)'), "Location string should contain 1. Cadde (İzometrik 3D)");

    console.log("\n--- 2. Validating Javascript syntax of modified files ---");
    const filesToTest = [
        'public/js/renderers/renderSanalikaCadde.js',
        'public/js/worldRenderer.js',
        'public/js/roomInteractions.js',
        'public/js/seatRegistry.js',
        'public/js/social.js',
        'public/js/chatBubbles.js',
        'public/js/voiceChat.js',
        'public/js/main.js'
    ];

    for (let f of filesToTest) {
        const fullPath = path.resolve(__dirname, '..', f);
        const code = fs.readFileSync(fullPath, 'utf8');
        try {
            new Function(code);
            console.log(`✅ Syntax OK: ${f}`);
        } catch (err) {
            // Some files might use browser globals like window, document, socket.
            // Let's test with a simulated browser window scope if pure eval fails.
            try {
                const browserMock = 'var window = global, document = { addEventListener:()=>{}, querySelectorAll:()=>[], getElementById:()=>null, createElement:()=>({ getContext:()=>({}) }) }, io = ()=>{ return { on:()=>{}, emit:()=>{} }; }, canvas = { getContext:()=>({}), width:800, height:500 }, ctx = { getContext:()=>({}) }, socket = { on:()=>{}, emit:()=>{} };\n' + code;
                new Function(browserMock);
                console.log(`✅ Syntax OK (Browser mock): ${f}`);
            } catch (innerErr) {
                console.error(`❌ Syntax Error in ${f}:`, innerErr.message);
                throw innerErr;
            }
        }
    }

    console.log("\n--- 3. Testing live socket connection and room change ---");
    const socket = io('http://localhost:3000', {
        transports: ['websocket'],
        forceNew: true
    });

    await new Promise((resolve, reject) => {
        socket.on('connect', () => {
            console.log("Socket connected with id:", socket.id);
            // Register a temporary test user
            const testName = 'CaddeTest_' + Math.floor(Math.random() * 10000);
            socket.emit('register', {
                name: testName,
                pass: '123456',
                avatar: { shirtColor: '#38bdf8' },
                gender: 'male'
            });
        });

        socket.on('loginSuccess', (data) => {
            console.log("Login success for user:", data.name, "starting in room:", data.room || 'sokak');
            socket.emit('changeRoom', 'sanalika_cadde');
        });

        let switchedToCadde = false;
        socket.on('currentPlayers', (roomPlayers) => {
            console.log("currentPlayers received, count:", Object.keys(roomPlayers).length);
            const me = roomPlayers[socket.id];
            if (me) {
                console.log("My player in room:", me.room, "at coordinates:", me.x, me.y);
                if (me.room === 'sanalika_cadde') {
                    switchedToCadde = true;
                    assert.strictEqual(me.room, 'sanalika_cadde');
                    assert.strictEqual(me.x, 750);
                    assert.strictEqual(me.y, 520);

                    // Test player movement in large 1600x960 world
                    socket.emit('playerMovement', { x: 1350, y: 780, isMoving: true, facing: 'down-right' });
                    setTimeout(() => {
                        socket.disconnect();
                        resolve();
                    }, 300);
                }
            }
        });

        socket.on('connect_error', reject);
        setTimeout(() => reject(new Error("Socket timeout")), 6000);
    });

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
}

testSanalikaCadde().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
