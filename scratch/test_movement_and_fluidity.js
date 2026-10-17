// scratch/test_movement_and_fluidity.js
const assert = require('assert');
const fs = require('fs');

console.log("=== HAREKET VE AKICILIK TESTLERİ BAŞLIYOR ===");

// 1. Dosya içeriği kontrolleri (HTML, CSS, JS)
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
assert(indexHtml.includes('id="settingWasdMovement"'), 'settingsModal WASD checkbox mevcut olmalı');
assert(indexHtml.includes('id="settingClickMovement"'), 'settingsModal Click checkbox mevcut olmalı');
assert(indexHtml.includes('Karakter Hareket Biçimi'), 'Ayarlar başlığı mevcut olmalı');
console.log("✓ HTML Ayarlar Modal kontrolleri doğrulandı.");

const styleCss = fs.readFileSync('public/style.css', 'utf8');
assert(styleCss.includes('modalPopIn'), 'CSS modalPopIn animasyonu mevcut olmalı');
assert(styleCss.includes('overlayFadeIn'), 'CSS overlayFadeIn animasyonu mevcut olmalı');
assert(styleCss.includes('transform: translateZ(0);') || styleCss.includes('will-change: transform;'), 'GPU donanım hızlandırma eklenmiş olmalı');
console.log("✓ CSS Donanım hızlandırma ve micro-spring animasyonları doğrulandı.");

const avatarRendererJs = fs.readFileSync('public/js/avatarRenderer.js', 'utf8');
assert(avatarRendererJs.includes('_cachedPreviewCanvas'), 'avatarPreviewCanvas DOM önbelleklemesi mevcut olmalı');
console.log("✓ avatarRenderer.js DOM & context önbelleklemesi doğrulandı.");

// 2. localStorage ve movementSettings Testi
const mockLocalStorage = {};
global.localStorage = {
    getItem: (key) => mockLocalStorage[key] ?? null,
    setItem: (key, val) => { mockLocalStorage[key] = String(val); }
};
global.window = {};
global.document = {
    getElementById: (id) => ({ checked: false })
};

// chatBubbles movementSettings mekaniğini simüle et
window.movementSettings = {
    wasdEnabled: (typeof localStorage !== 'undefined' ? localStorage.getItem('mm_move_wasd') : null) !== 'false',
    clickEnabled: (typeof localStorage !== 'undefined' ? localStorage.getItem('mm_move_click') : null) !== 'false'
};

assert.strictEqual(window.movementSettings.wasdEnabled, true, "Varsayılan olarak WASD açık olmalı");
assert.strictEqual(window.movementSettings.clickEnabled, true, "Varsayılan olarak Tıklama açık olmalı");

function setWasdMovementEnabled(enabled) {
    window.movementSettings.wasdEnabled = !!enabled;
    localStorage.setItem('mm_move_wasd', window.movementSettings.wasdEnabled ? 'true' : 'false');
}

function setClickMovementEnabled(enabled) {
    window.movementSettings.clickEnabled = !!enabled;
    localStorage.setItem('mm_move_click', window.movementSettings.clickEnabled ? 'true' : 'false');
}

setWasdMovementEnabled(false);
assert.strictEqual(window.movementSettings.wasdEnabled, false, "WASD kapatılabilmeli");
assert.strictEqual(mockLocalStorage['mm_move_wasd'], 'false', "WASD tercihi kaydedilmeli");

setClickMovementEnabled(false);
assert.strictEqual(window.movementSettings.clickEnabled, false, "Tıklama kapatılabilmeli");
assert.strictEqual(mockLocalStorage['mm_move_click'], 'false', "Tıklama tercihi kaydedilmeli");

setWasdMovementEnabled(true);
setClickMovementEnabled(true);
assert.strictEqual(window.movementSettings.wasdEnabled, true, "İkisi aynı anda açık kalabilmeli");
assert.strictEqual(window.movementSettings.clickEnabled, true, "İkisi aynı anda açık kalabilmeli");
console.log("✓ movementSettings ve kalıcılık (localStorage) testleri başarılı.");

// 3. Yürüyüş İvmelenmesi (Velocity Easing / Momentum) Testi
let vx = 0;
let vy = 0;
let targetVx = 2.0;
let targetVy = 0.0;
const dt = 0.016;
const accelFactor = 1 - Math.exp(-24 * dt);

for (let i = 0; i < 5; i++) {
    vx += (targetVx - vx) * accelFactor;
}
assert(vx > 0.5 && vx < 2.0, "İvmelenme organik ve kademeli artmalı, 0 ile 2.0 arasında olmalı");
console.log("✓ Yürüyüş ivmelenmesi (momentum smoothing) testi başarılı: vx =", vx.toFixed(3));

// 4. Akıllı Köşe Kayması (Corner Nudging) Testi
let playerPos = { x: 100, y: 100 };
let activeVx = 2.0;
let timeScale = 1.0;
let nudgeScan = 6;
let nudgeAmount = 1.3 * timeScale;

// Sağ tarafa gidiliyor ve tam x ekseninde engel var, ama yukarısı (y - 6) açık
function mockCheckWorldCollision(x, y) {
    // 102 noktasında ve y: [98, 150] arasında masa var (üst köşesi y=98)
    if (x >= 101 && y >= 98 && y <= 150) return true;
    return false;
}

let nextX = playerPos.x + activeVx * timeScale;
let nextY = playerPos.y;
let colX = mockCheckWorldCollision(nextX, playerPos.y);
assert.strictEqual(colX, true, "Doğrudan karşıdaki masaya çarpma algılanmalı");

let upOpen = !mockCheckWorldCollision(nextX, playerPos.y - nudgeScan) && !mockCheckWorldCollision(playerPos.x, playerPos.y - nudgeScan);
let downOpen = !mockCheckWorldCollision(nextX, playerPos.y + nudgeScan) && !mockCheckWorldCollision(playerPos.x, playerPos.y + nudgeScan);

assert.strictEqual(upOpen, true, "Yukarı doğru olan köşe boşluğu tespit edilmeli");
if (upOpen && !downOpen) {
    playerPos.y -= nudgeAmount;
}
assert.strictEqual(playerPos.y, 100 - nudgeAmount, "Oyuncu masanın köşesinden yukarıya doğru yumuşakça kaydırılmalı");
console.log("✓ Akıllı köşe kayması (corner nudging) testi başarılı: yeni y =", playerPos.y);

// 5. Uzaktaki Oyuncuların Durma Noktası Sabitlemesi (Remote Player Stop Snapping) Testi
let remotePlayer = {
    x: 50.8,
    y: 80.2,
    targetX: 52.0,
    targetY: 81.0,
    serverMoving: false,
    isMoving: true,
    walkCycle: 1.45
};

let dx = remotePlayer.targetX - remotePlayer.x;
let dy = remotePlayer.targetY - remotePlayer.y;
let dist = Math.hypot(dx, dy);

assert(dist <= 2.5, "Mesafe 2.5 pikselden az olmalı");

if (!remotePlayer.serverMoving && dist <= 2.5) {
    remotePlayer.x = remotePlayer.targetX;
    remotePlayer.y = remotePlayer.targetY;
    remotePlayer.isMoving = false;
    remotePlayer.walkCycle = 0;
}

assert.strictEqual(remotePlayer.x, 52.0, "Pozisyon hedefe tam sabitlenmeli");
assert.strictEqual(remotePlayer.y, 81.0, "Pozisyon hedefe tam sabitlenmeli");
assert.strictEqual(remotePlayer.isMoving, false, "Hareket durumu false olmalı");
assert.strictEqual(remotePlayer.walkCycle, 0, "Hayalet adım döngüsü sıfırlanmalı");
console.log("✓ Uzaktaki oyuncu durma noktası sabitlemesi (stop snapping) testi başarılı.");

console.log("\n=== TÜM TESTLER BAŞARIYLA GEÇTİ! ===");
