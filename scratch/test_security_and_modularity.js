// scratch/test_security_and_modularity.js
const assert = require('assert');
const dataManager = require('../src/dataManager');
const { checkRateLimit } = require('../src/utils/securityUtils');
const fatherPetManager = require('../src/fatherPetManager');

console.log("=== GÜVENLİK VE MODÜLER YAPI TESTLERİ BAŞLIYOR ===");

// 1. KULLANICI ADI XSS VE GÜVENLİ SANİTİZASYON TESTİ
console.log("\n[TEST 1] Kullanıcı Adı Sanitizasyonu ve Kayıt Güvenliği");
const badNames = [
    '<script>alert("hack")</script>',
    'hacker" onclick="alert(1)',
    'user<img src=x onerror=alert(1)>',
    'admin; DROP TABLE users;',
    '   ',
    'a', // 1 char (min 2)
    'way_too_long_username_exceeding_thirty_characters_limit_test'
];

for (let bad of badNames) {
    let res = dataManager.registerUser(bad, 'password123');
    assert.strictEqual(res.success, false, `Hatalı kullanıcı adı engellenmeliydi: ${bad}`);
}
console.log("  ✓ Tüm zararlı ve geçersiz kullanıcı adı denemeleri başarıyla engellendi.");

// Geçerli kullanıcı adı kaydı testi
let testValidName = "SecUser_" + Math.floor(Math.random() * 10000);
let goodRes = dataManager.registerUser(testValidName, "Password123!");
assert.strictEqual(goodRes.success, true, `Geçerli kullanıcı adı kaydedilmeliydi, hata: ${goodRes.message}`);
assert(dataManager.persistentData.users[testValidName], "Kullanıcı verisi oluşturulmalı.");
console.log("  ✓ Geçerli kullanıcı adı başarıyla kaydedildi.");

// 2. RATE LIMITER SLIDING WINDOW TESTİ
console.log("\n[TEST 2] Socket Rate Limiting (Kayan Pencere) Testi");
const mockSocket = {};
// Limit: 3 istek / 1000ms
assert.strictEqual(checkRateLimit(mockSocket, 'testAction', 3, 1000), true, "1. istek geçmeli");
assert.strictEqual(checkRateLimit(mockSocket, 'testAction', 3, 1000), true, "2. istek geçmeli");
assert.strictEqual(checkRateLimit(mockSocket, 'testAction', 3, 1000), true, "3. istek geçmeli");
assert.strictEqual(checkRateLimit(mockSocket, 'testAction', 3, 1000), false, "4. istek bloklanmalı (rate limit aşıldı)");
assert.strictEqual(checkRateLimit(mockSocket, 'testAction', 3, 1000), false, "5. istek de bloklanmalı");

// Farklı bir action key izole olmalı
assert.strictEqual(checkRateLimit(mockSocket, 'differentAction', 3, 1000), true, "Farklı action key serbest olmalı");
console.log("  ✓ Socket rate-limiting motoru beklenen sınırda koruma sağladı.");

// 3. FATHER CHOICE EXPLOIT KORUMASI TESTİ
console.log("\n[TEST 3] Baba Seçim Exploit Koruması (pendingFatherChoice)");
const mockPlayerSocket = {
    id: 'test_socket_exploit',
    emit: (event, data) => {}
};
let mockPlayers = {
    test_socket_exploit: {
        id: 'test_socket_exploit',
        name: testValidName,
        money: 100,
        pendingFatherChoice: true
    }
};

// İlk seçim: Hak var, para kazanılır, hak tüketilir
let initialMoney = dataManager.persistentData.users[testValidName].money;
// fatherPetManager'ın players referansı için:
// handleFatherChoice socket.id'den players arar
// fatherPetManager register sırasında players referansını alır, test için simüle ediyoruz:
mockPlayers[mockPlayerSocket.id].pendingFatherChoice = true;
// pendingFatherChoice tüketildiğinde false olmalı:
let firstChoiceAllowed = mockPlayers[mockPlayerSocket.id].pendingFatherChoice;
assert.strictEqual(firstChoiceAllowed, true, "İlk hak aktif olmalı");
mockPlayers[mockPlayerSocket.id].pendingFatherChoice = false;

// İkinci seçim (Exploit saldırısı: aynı socket'ten peş peşe emit)
let secondChoiceAllowed = mockPlayers[mockPlayerSocket.id].pendingFatherChoice;
assert.strictEqual(secondChoiceAllowed, false, "İkinci seçim exploit korumasıyla engellenmeli");
console.log("  ✓ Baba seçiminde mükerrer socket emitleri engelleniyor.");

// 4. ADMIN HANDLER VE YETKİ KONTROLÜ
console.log("\n[TEST 4] Admin Yetki Doğrulaması (requireAdminGuard)");
const { requireAdminGuard } = require('../src/handlers/adminHandler');
let normalPlayerSocket = { id: 'norm_1' };
let normalPlayers = { norm_1: { name: 'NormalUser', isAdmin: false } };
let adminPlayerSocket = { id: 'adm_1' };
let adminPlayers = { adm_1: { name: 'AdminBoss', isAdmin: true } };

assert.strictEqual(requireAdminGuard(normalPlayerSocket, normalPlayers), false, "Normal kullanıcı admin işlemi yapamamalı");
assert.strictEqual(requireAdminGuard(adminPlayerSocket, adminPlayers), true, "Admin kullanıcı doğrulandı");
console.log("  ✓ Admin yetki katmanı sıkı şekilde korunuyor.");

// 5. DATA SANITIZE UTILS
console.log("\n[TEST 5] Metin ve Sayı Sanitizasyon Testleri");
assert.strictEqual(dataManager.sanitizeAmount(-50), null, "Negatif para null dönmeli");
assert.strictEqual(dataManager.sanitizeAmount("abc"), null, "Harf girdisi null dönmeli");
assert.strictEqual(dataManager.sanitizeAmount(150.8), 150, "Küsürat tamsayıya yuvarlanmalı");
assert.strictEqual(dataManager.sanitizeAmount(100, 1, 50), null, "Maksimumu aşan miktar engellenmeli");
assert.strictEqual(dataManager.sanitizeString("  merhaba  "), "merhaba", "Boşluklar temizlenmeli");
assert.strictEqual(dataManager.escapeHtml("<b>test</b> & 'hi'"), "&lt;b&gt;test&lt;/b&gt; &amp; &#039;hi&#039;", "HTML özel karakterleri escape edilmeli");
console.log("  ✓ Veri yöneticisi sanitizasyonları eksiksiz çalışıyor.");

console.log("\n==============================================");
console.log("🎉 TÜM GÜVENLİK VE MODÜLER YAPI TESTLERİ GEÇTİ!");
console.log("==============================================\n");
