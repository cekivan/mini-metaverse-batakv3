// scratch/test_voice_chat.js - Blackjack ve Açık Dünya Canlı Sesli Sohbet Testi
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { io } = require(path.join(process.cwd(), 'node_modules/socket.io-client'));

async function runVoiceTests() {
    console.log("=== CANLI SESLİ SOHBET TESTLERİ BAŞLIYOR ===\n");

    // 1. BLACKJACK SESLİ SOHBETİ VE WEBRTC SİNYAL TESTİ
    console.log("--- 1. Blackjack Masası Sesli Sohbet (WebRTC Sinyal ve Speaking) Testi ---");
    const socketA = io('http://localhost:3000', { transports: ['websocket'], forceNew: true });
    const socketB = io('http://localhost:3000', { transports: ['websocket'], forceNew: true });

    await Promise.all([
        new Promise(r => socketA.on('connect', r)),
        new Promise(r => socketB.on('connect', r))
    ]);
    console.log("✓ İki test soketi bağlandı.");

    const userA = "v_user_a_" + Math.floor(Math.random() * 10000);
    const userB = "v_user_b_" + Math.floor(Math.random() * 10000);

    socketA.emit('register', { name: userA, pass: "123456", gender: 'male' });
    socketB.emit('register', { name: userB, pass: "123456", gender: 'female' });

    await Promise.all([
        new Promise(r => socketA.on('loginSuccess', r)),
        new Promise(r => socketB.on('loginSuccess', r))
    ]);
    console.log(`✓ Kullanıcılar oluşturuldu: ${userA} & ${userB}`);

    // Kullanıcı A Blackjack ses odasına katılıyor
    socketA.emit('voiceJoinRoom', { tableId: 'blackjack' });
    await new Promise(r => setTimeout(r, 200));

    // Kullanıcı B Blackjack ses odasına katıldığında:
    let userJoinedPromise = new Promise(resolve => {
        socketA.once('voiceUserJoined', data => {
            console.log("✓ Kullanıcı A 'voiceUserJoined' aldı:", data.username);
            assert.strictEqual(data.socketId, socketB.id);
            resolve();
        });
    });

    let peersListPromise = new Promise(resolve => {
        socketB.once('voicePeersList', data => {
            console.log("✓ Kullanıcı B 'voicePeersList' aldı. Peer sayısı:", data.peers.length);
            assert.strictEqual(data.tableId, 'blackjack');
            assert(data.peers.some(p => p.socketId === socketA.id), "Kullanıcı A listede olmalı");
            resolve();
        });
    });

    socketB.emit('voiceJoinRoom', { tableId: 'blackjack' });
    await Promise.all([userJoinedPromise, peersListPromise]);

    // Konuşma Göstergesi (VAD speaking) testi
    let speakingPromise = new Promise(resolve => {
        socketB.once('voiceUserSpeaking', data => {
            console.log("✓ Kullanıcı B 'voiceUserSpeaking' aldı:", data.username, "isSpeaking:", data.isSpeaking);
            assert.strictEqual(data.socketId, socketA.id);
            assert.strictEqual(data.isSpeaking, true);
            resolve();
        });
    });

    socketA.emit('voiceSpeaking', { tableId: 'blackjack', isSpeaking: true });
    await speakingPromise;

    // WebRTC Sinyal (Offer/Answer/Candidate) testi
    let signalPromise = new Promise(resolve => {
        socketB.once('voiceSignal', data => {
            console.log("✓ Kullanıcı B WebRTC sinyalini aldı. Tip:", data.signal.type);
            assert.strictEqual(data.from, socketA.id);
            assert.strictEqual(data.signal.type, 'offer');
            resolve();
        });
    });

    socketA.emit('voiceSignal', {
        to: socketB.id,
        signal: { type: 'offer', sdp: 'dummy_sdp_test' }
    });
    await signalPromise;

    // 2. AÇIK DÜNYA (ROOM) SESLİ SOHBET VE ODA DEĞİŞİMİ TESTİ
    console.log("\n--- 2. Oyun Dışı / Açık Dünya (Meydan -> Kafe) Ses Geçiş Testi ---");
    // Kullanıcı A ve B 'room_sokak' (Meydan) ses kanalına geçiyor
    socketA.emit('voiceLeaveRoom', { tableId: 'blackjack' });
    socketB.emit('voiceLeaveRoom', { tableId: 'blackjack' });
    await new Promise(r => setTimeout(r, 150));

    let roomPeersPromise = new Promise(resolve => {
        socketB.once('voicePeersList', data => {
            console.log("✓ Kullanıcı B 'room_sokak' için peers list aldı:", data.tableId);
            assert.strictEqual(data.tableId, 'room_sokak');
            resolve();
        });
    });

    socketA.emit('voiceJoinRoom', { tableId: 'room_sokak' });
    await new Promise(r => setTimeout(r, 100));
    socketB.emit('voiceJoinRoom', { tableId: 'room_sokak' });
    await roomPeersPromise;

    // Kullanıcı A Kafe'ye giriyor (room_kafe)
    let userLeftPromise = new Promise(resolve => {
        socketB.once('voiceUserLeft', data => {
            console.log("✓ Kullanıcı B Kullanıcı A'nın Meydan sesinden ayrıldığını aldı:", data.socketId);
            assert.strictEqual(data.socketId, socketA.id);
            resolve();
        });
    });

    socketA.emit('voiceLeaveRoom', { tableId: 'room_sokak' });
    socketA.emit('voiceJoinRoom', { tableId: 'room_kafe' });
    await userLeftPromise;

    socketA.disconnect();
    socketB.disconnect();

    // 3. İSTEMCİ KOD VE HTML BİLEŞENLERİ DOĞRULAMASI
    console.log("\n--- 3. İstemci Kod ve Arayüz Butonları Doğrulaması ---");
    const indexHtml = fs.readFileSync(path.join(process.cwd(), 'public/index.html'), 'utf8');
    const mainJs = fs.readFileSync(path.join(process.cwd(), 'public/js/main.js'), 'utf8');
    const bjJs = fs.readFileSync(path.join(process.cwd(), 'public/js/blackjack.js'), 'utf8');
    const voiceJs = fs.readFileSync(path.join(process.cwd(), 'public/js/voiceChat.js'), 'utf8');
    const styleCss = fs.readFileSync(path.join(process.cwd(), 'public/style.css'), 'utf8');

    // index.html
    assert(indexHtml.includes('id="globalVoiceNavBtn"'), "index.html üst barda globalVoiceNavBtn bulunmalıdır!");
    assert(indexHtml.includes('id="bjVoiceToggleBtn"'), "index.html Blackjack modalında bjVoiceToggleBtn bulunmalıdır!");
    console.log("✓ index.html butonları mevcut.");

    // main.js: C tuşu ve changeRoom
    assert(mainJs.includes("if (e.key === 'c' || e.key === 'C')"), "main.js C tuşunu ses toggle için dinlemelidir!");
    assert(mainJs.includes("handleRoomChangedVoice(newRoom)"), "main.js changeRoom içinde ses odasını güncellemelidir!");
    console.log("✓ main.js 'C' tuşu ve mekan değiştirme entegrasyonu mevcut.");

    // blackjack.js: open/close ses kanalı ve renderSeats voice-speaking
    assert(bjJs.includes("switchVoiceChannel('blackjack')"), "blackjack.js modal açılınca ses kanalını blackjack yapmalıdır!");
    assert(bjJs.includes("switchVoiceChannel('room_'"), "blackjack.js modal kapanınca odanın sesine geri dönmelidir!");
    assert(bjJs.includes("box.classList.add('voice-speaking')"), "blackjack.js koltuktaki oyuncu konuşunca parlamalıdır!");
    console.log("✓ blackjack.js ses kanalı yönetimi ve koltuk parıldaması mevcut.");

    // voiceChat.js: C tuşu, getEffectiveVoiceChannel, switchVoiceChannel
    assert(voiceJs.includes("function getEffectiveVoiceChannel()"), "voiceChat.js dinamik ses kanalı belirlemelidir!");
    assert(voiceJs.includes("window.addEventListener('keydown'"), "voiceChat.js global 'c' tuşunu dinlemelidir!");
    assert(voiceJs.includes("toggleGlobalVoiceChat"), "voiceChat.js toggleGlobalVoiceChat fonksiyonuna sahip olmalıdır!");
    console.log("✓ voiceChat.js tam kapsamlı motor doğrulaması tamamlandı.");

    // style.css
    assert(styleCss.includes(".bj-seat-box.voice-speaking"), "style.css içinde Blackjack konuşma parıldama efekti olmalıdır!");
    assert(styleCss.includes(".voice-toast"), "style.css içinde voice-toast sınıfı olmalıdır!");
    console.log("✓ style.css stilleri mevcut.");

    console.log("\n=======================================================");
    console.log("🎉 BLACKJACK VE AÇIK DÜNYA SESLİ SOHBET TESTLERİ %100 BAŞARILI!");
    console.log("=======================================================\n");
    process.exit(0);
}

runVoiceTests().catch(err => {
    console.error("❌ Test hatası:", err);
    process.exit(1);
});
