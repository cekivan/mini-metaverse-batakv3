const ioClient = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3000';

async function testOnlinePlayersFeature() {
    console.log('Testing Online Players & Whisper Socket Functionality...');

    const s1 = ioClient(SOCKET_URL);
    const s2 = ioClient(SOCKET_URL);

    await new Promise((resolve) => {
        let connectedCount = 0;
        const check = () => {
            connectedCount++;
            if (connectedCount === 2) resolve();
        };
        s1.on('connect', check);
        s2.on('connect', check);
    });

    console.log('Both sockets connected.');

    const u1 = 'test_u_' + Math.floor(Math.random() * 100000);
    const u2 = 'test_u_' + Math.floor(Math.random() * 100000);

    const loginPromise1 = new Promise((resolve) => s1.once('loginSuccess', resolve));
    const loginPromise2 = new Promise((resolve) => s2.once('loginSuccess', resolve));

    s1.emit('register', { name: u1, pass: '123456', gender: 'male' });
    s2.emit('register', { name: u2, pass: '123456', gender: 'female' });

    await Promise.all([loginPromise1, loginPromise2]);
    console.log(`Both test users registered and logged in: ${u1}, ${u2}`);

    await new Promise(r => setTimeout(r, 400));

    // Test getOnlinePlayers
    const onlineList = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for onlinePlayersListUpdate')), 4000);
        s1.once('onlinePlayersListUpdate', (data) => {
            clearTimeout(timeout);
            resolve(data);
        });
        s1.emit('getOnlinePlayers');
    });

    console.log('Received onlinePlayersListUpdate. Total count:', onlineList.total);
    if (!onlineList || !Array.isArray(onlineList.players)) {
        throw new Error('onlinePlayersListUpdate did not return players array!');
    }

    const foundP1 = onlineList.players.find(p => p.username.toLowerCase() === u1.toLowerCase());
    const foundP2 = onlineList.players.find(p => p.username.toLowerCase() === u2.toLowerCase());

    if (!foundP1 || !foundP2) {
        throw new Error(`Could not find ${u1} or ${u2} in online players list!`);
    }
    console.log('Found P1:', foundP1.username, '| Location:', foundP1.location, '| IsSelf:', foundP1.isSelf);
    console.log('Found P2:', foundP2.username, '| Location:', foundP2.location, '| Gender:', foundP2.gender);

    if (foundP1.isSelf !== true) {
        throw new Error('P1 should have isSelf: true for s1 requester!');
    }
    if (foundP2.isSelf !== false) {
        throw new Error('P2 should have isSelf: false for s1 requester!');
    }

    // Test Whisper (/w <u2> Gizli selam!)
    const whisperPromiseS2 = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for whisper on s2')), 4000);
        s2.on('chatUpdate', (msg) => {
            if (msg.channel === 'whisper') {
                clearTimeout(timeout);
                resolve(msg);
            }
        });
    });

    const whisperPromiseS1 = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for whisper on s1')), 4000);
        s1.on('chatUpdate', (msg) => {
            if (msg.channel === 'whisper') {
                clearTimeout(timeout);
                resolve(msg);
            }
        });
    });

    s1.emit('chatMessage', { msg: `/w ${u2} Gizli selam!`, channel: 'room' });

    const [s1Msg, s2Msg] = await Promise.all([whisperPromiseS1, whisperPromiseS2]);
    console.log('S1 sender saw whisper:', s1Msg.name, '->', s1Msg.msg);
    console.log('S2 recipient received whisper:', s2Msg.name, '->', s2Msg.msg);

    if (!s2Msg.msg.includes('Gizli selam!')) {
        throw new Error('Whisper message content mismatch!');
    }

    s1.disconnect();
    s2.disconnect();
    console.log('✅ ALL TESTS PASSED WITH 100% SUCCESS!');
    process.exit(0);
}

testOnlinePlayersFeature().catch(err => {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
});
