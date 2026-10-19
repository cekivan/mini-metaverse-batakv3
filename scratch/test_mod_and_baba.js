// scratch/test_mod_and_baba.js
const assert = require('assert');
const { io } = require('socket.io-client');
const dataManager = require('../src/dataManager');
const { isAdmin, isStaff, requireAdminGuard, requireStaffGuard, registerAdminHandlers } = require('../src/handlers/adminHandler');
const fatherPetManager = require('../src/fatherPetManager');

const SERVER_URL = 'http://localhost:3000';

async function runTests() {
    console.log("=== 1. DATA & ROLES DOĞRULAMA TESTİ ===");

    // Test 1: Elyesa moderatör kontrolü
    assert.strictEqual(dataManager.isUserMod('elyesa'), true, "'elyesa' isUserMod true olmalı");
    assert.strictEqual(dataManager.isUserMod('Elyesa'), true, "'Elyesa' isUserMod true olmalı");
    assert.strictEqual(dataManager.isUserAdmin('elyesa'), false, "'elyesa' admin olmamalı");
    assert.strictEqual(dataManager.isUserAdmin('yasin'), true, "'yasin' admin olmalı");
    assert.strictEqual(dataManager.isUserAdmin('maltoroz'), true, "'maltoroz' admin olmalı");
    console.log("  ✓ dataManager yetki fonksiyonları doğru sonuç veriyor.");

    // Test 2: Guard fonksiyonları
    const mockPlayers = {
        'sock_admin': { name: 'Yasin', isAdmin: true, role: 'admin' },
        'sock_mod': { name: 'Elyesa', isMod: true, role: 'mod' },
        'sock_user': { name: 'Ahmet', isAdmin: false, isMod: false, role: 'user' }
    };

    const adminSock = { id: 'sock_admin', emit: (ev, data) => {} };
    const modSock = { id: 'sock_mod', emit: (ev, data) => {} };
    const userSock = { id: 'sock_user', emit: (ev, data) => {} };

    assert.strictEqual(isAdmin(adminSock, mockPlayers), true, "Admin isAdmin = true olmalı");
    assert.strictEqual(isAdmin(modSock, mockPlayers), false, "Mod isAdmin = false olmalı");
    assert.strictEqual(isAdmin(userSock, mockPlayers), false, "User isAdmin = false olmalı");

    assert.strictEqual(isStaff(adminSock, mockPlayers), true, "Admin isStaff = true olmalı");
    assert.strictEqual(isStaff(modSock, mockPlayers), true, "Mod isStaff = true olmalı");
    assert.strictEqual(isStaff(userSock, mockPlayers), false, "User isStaff = false olmalı");

    assert.strictEqual(requireAdminGuard(adminSock, mockPlayers), true, "requireAdminGuard admine izin vermeli");
    assert.strictEqual(requireAdminGuard(modSock, mockPlayers), false, "requireAdminGuard moda izin vermemeli");
    assert.strictEqual(requireAdminGuard(userSock, mockPlayers), false, "requireAdminGuard usera izin vermemeli");

    assert.strictEqual(requireStaffGuard(adminSock, mockPlayers), true, "requireStaffGuard admine izin vermeli");
    assert.strictEqual(requireStaffGuard(modSock, mockPlayers), true, "requireStaffGuard moda izin vermeli");
    assert.strictEqual(requireStaffGuard(userSock, mockPlayers), false, "requireStaffGuard usera izin vermemeli");
    console.log("  ✓ Staff & Admin guardları kusursuz çalışıyor.");

    console.log("\n=== 2. HİYERARŞİ KURALI BİRİM TESTLERİ (Moderatör vs Admin) ===");
    // AdminHandler event simülasyonu
    let lastError = null;
    let lastSystemMsg = null;
    let mockIo = {
        to: () => ({ emit: () => {} }),
        emit: () => {},
        sockets: { sockets: new Map() }
    };
    let testModSocket = {
        id: 'sock_mod',
        handlers: {},
        on(event, fn) { this.handlers[event] = fn; },
        emit(event, data) {
            if (event === 'gameError') lastError = data;
            if (event === 'systemMessage') lastSystemMsg = data;
        }
    };

    registerAdminHandlers(mockIo, testModSocket, mockPlayers, {
        getPlayersInRoom: () => ({}),
        getAdminOnlineUsers: () => [],
        getAdminSanctionsList: () => []
    });

    // 2.1 Moderatör admini banlamaya kalkışırsa
    lastError = null;
    testModSocket.handlers['adminBanUser']({ targetUsername: 'yasin', minutes: 15, reason: 'test' });
    assert.ok(lastError && lastError.includes("Adminler banlanamaz"), "Moderatörün admin banlaması engellenmeli!");
    console.log("  ✓ Moderatörün admini banlaması engellendi:", lastError);

    // 2.2 Moderatör admini susturmaya kalkışırsa
    lastError = null;
    testModSocket.handlers['adminMuteUser']({ targetUsername: 'yasin', minutes: 5, reason: 'test' });
    assert.ok(lastError && lastError.includes("Adminler susturulamaz"), "Moderatörün admin susturması engellenmeli!");
    console.log("  ✓ Moderatörün admini susturması engellendi:", lastError);

    // 2.3 Moderatör admin bakiyesini değiştirmeye kalkışırsa
    lastError = null;
    testModSocket.handlers['adminModifyMoney']({ targetUsername: 'yasin', amount: 500, mode: 'add' });
    assert.ok(lastError && lastError.includes("Moderatörler admin bakiyesini değiştiremez"), "Moderatörün admin bakiyesi değiştirmesi engellenmeli!");
    console.log("  ✓ Moderatörün admin bakiyesini değiştirmesi engellendi:", lastError);

    // 2.4 Moderatör admini yanına çekmeye (summon) kalkışırsa
    lastError = null;
    testModSocket.handlers['adminSummon']({ targetUsername: 'yasin' });
    assert.ok(lastError && lastError.includes("Moderatörler adminleri yanına çekemez"), "Moderatörün admini summon etmesi engellenmeli!");
    console.log("  ✓ Moderatörün admini summon etmesi engellendi:", lastError);

    console.log("\n=== 3. CANLI SUNUCU BAĞLANTISI & /BABA KOMUT TESTİ ===");
    const client = io(SERVER_URL, { reconnection: false, transports: ['websocket'] });
    const testUsername = 'BabaTester_' + Math.floor(Math.random() * 9000);

    await new Promise((resolve, reject) => {
        client.on('connect', () => {
            console.log("  Connected to live server. Registering:", testUsername);
            client.emit('register', { name: testUsername, pass: '123456', gender: 'male' });
        });

        client.on('loginSuccess', (data) => {
            console.log("  ✓ Login success:", data.username);
            resolve();
        });

        client.on('loginFailed', (err) => reject(new Error("Login failed: " + err)));
        setTimeout(() => reject(new Error("Socket timeout")), 5000);
    });

    // /baba komutunu gönder
    console.log("  Sending '/baba' command in chatMessage...");
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("/baba response timeout")), 5000);

        let gotSystemMsg = false;
        let gotSpawnMsg = false;

        client.on('systemMessage', (msg) => {
            console.log("  Received systemMessage:", msg);
            if (msg.includes('Babayı tuttun') || msg.includes('babayı tuttu')) {
                gotSystemMsg = true;
                if (gotSpawnMsg || gotSystemMsg) {
                    clearTimeout(timeout);
                    resolve();
                }
            }
        });

        client.on('fatherMiracleSpawn', (data) => {
            console.log("  ✓ fatherMiracleSpawn event triggered:", data?.pet?.name);
            gotSpawnMsg = true;
            clearTimeout(timeout);
            resolve();
        });

        client.emit('chatMessage', { msg: '/baba', channel: 'room' });
    });

    console.log("  ✓ Tüm kullanıcılar için /baba komutu başarıyla çalışıyor!");

    client.disconnect();

    console.log("\n==========================================");
    console.log("🎉 BÜTÜN TESTLER BAŞARIYLA TAMAMLANDI!");
    console.log("==========================================");
    process.exit(0);
}

runTests().catch(err => {
    console.error("❌ TEST HATASI:", err);
    process.exit(1);
});
