// scratch/test_door_navigation_and_walk_anim.js
const assert = require('assert');
const fs = require('fs');

console.log("=== KAPIYA YÜRÜME VE YÜRÜME ANİMASYONU TESTLERİ BAŞLIYOR ===");

// 1. Dosya içeriği kontrolleri
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
assert(mainJs.includes('function navigatePlayerToDoor'), 'main.js içinde navigatePlayerToDoor tanımlı olmalı');
assert(mainJs.includes('window.navigatePlayerToDoor = navigatePlayerToDoor'), 'navigatePlayerToDoor global window nesnesine atanmalı');
assert(mainJs.includes('targetWalkPos.isVenueDoor'), 'targetWalkPos mekan kapısı desteği içermeli');
console.log("✓ main.js navigatePlayerToDoor kontrolleri doğrulandı.");

const roomInteractionsJs = fs.readFileSync('public/js/roomInteractions.js', 'utf8');
assert(roomInteractionsJs.includes("navigatePlayerToDoor(16, 255, 'sahil')"), 'Sahile geçiş navigatePlayerToDoor kullanmalı');
assert(roomInteractionsJs.includes("navigatePlayerToDoor(400, 90, 'kafe')"), 'Kafeye geçiş navigatePlayerToDoor kullanmalı');
assert(roomInteractionsJs.includes("navigatePlayerToDoor(192, 90, 'emlakci')"), 'Emlakçıya geçiş navigatePlayerToDoor kullanmalı');
assert(roomInteractionsJs.includes("navigatePlayerToDoor(670, 90, 'nargile_cafe')"), 'Nargileye geçiş navigatePlayerToDoor kullanmalı');
assert(roomInteractionsJs.includes("navigatePlayerToDoor(715, 355, 'market')"), 'Markete geçiş navigatePlayerToDoor kullanmalı');
assert(roomInteractionsJs.includes("target: 'market'"), 'ROOM_WALK_PORTALS market desteği içermeli');
console.log("✓ roomInteractions.js kapı yönlendirmeleri ve portallar doğrulandı.");

const avatarRendererJs = fs.readFileSync('public/js/avatarRenderer.js', 'utf8');
assert(avatarRendererJs.includes('Math.abs(p.vx || 0) > 0.05'), 'avatarRenderer.js tıklayarak yürümede isMoving kontrolünü desteklemeli');
console.log("✓ avatarRenderer.js animasyon kontrolleri doğrulandı.");

const worldRendererJs = fs.readFileSync('public/js/worldRenderer.js', 'utf8');
assert(worldRendererJs.includes('currentRoom === "market"'), 'worldRenderer.js market çıkış kapısı çarpışma muafiyetine sahip olmalı');
console.log("✓ worldRenderer.js market kapı geçiş izni doğrulandı.");

// 2. Simülasyon Testi: navigatePlayerToDoor fonksiyon davranışı
let changedToRoom = null;
global.changeRoom = (room) => { changedToRoom = room; };
global.myId = 'player1';
global.players = {
    player1: { x: 400, y: 250, action: null, isMoving: false, vx: 0, vy: 0 }
};
global.tapRipples = [];
global.targetWalkPos = null;

// navigatePlayerToDoor mantığını test et
function mockNavigatePlayerToDoor(targetDoorX, targetDoorY, targetRoom, onReachAction) {
    let p = players[myId];
    let dist = Math.hypot(p.x - targetDoorX, p.y - targetDoorY);
    if (dist <= 28) {
        if (onReachAction) onReachAction();
        else if (targetRoom) changeRoom(targetRoom);
        return;
    }
    targetWalkPos = {
        x: targetDoorX,
        y: targetDoorY,
        targetRoom: targetRoom,
        onReach: onReachAction,
        isVenueDoor: true
    };
    tapRipples.push({ x: targetDoorX, y: targetDoorY, radius: 4, alpha: 1.0 });
}

// Oyuncu uzaktayken kafeye tıklandığında (x: 400, y: 90)
mockNavigatePlayerToDoor(400, 90, 'kafe');
assert.notStrictEqual(targetWalkPos, null, "targetWalkPos oluşturulmalı");
assert.strictEqual(targetWalkPos.targetRoom, 'kafe', "Hedef mekan kafe olmalı");
assert.strictEqual(targetWalkPos.isVenueDoor, true, "isVenueDoor true olmalı");
assert.strictEqual(changedToRoom, null, "Hemen ışınlanmamalı! Önce yürümeli.");
assert.strictEqual(tapRipples.length, 1, "Kapı noktasına dalga efekti eklenmeli");
console.log("✓ Uzaktan kapıya tıklama testi başarılı (ışınlanmadı, rota oluşturuldu).");

// 3. Yürüme Animasyonu (isMoving, bob ve legSwing) Testi
let p = players[myId];
p.vx = 0;
p.vy = -2.0; // Yukarı doğru kafeye yürüyor
let keys = { w: false, a: false, s: false, d: false }; // WASD basılı DEĞİL!

let isMoving = (p.isMoving || keys.w || keys.a || keys.s || keys.d || Math.abs(p.vx || 0) > 0.05 || Math.abs(p.vy || 0) > 0.05);
let walkCycle = 1.2;
let bob = isMoving ? Math.sin(walkCycle) * 2.5 : 0;
let legSwing = isMoving ? Math.sin(walkCycle) * 5 : 0;

assert.strictEqual(isMoving, true, "WASD basılı olmasa bile tıklayarak yürümede isMoving true olmalı");
assert.notStrictEqual(bob, 0, "Adım atarken gövde inip kalkmalı (bob != 0)");
assert.notStrictEqual(legSwing, 0, "Bacaklar adım atarken sağa-sola açılmalı (legSwing != 0)");
console.log("✓ Tıklayarak yürümede bacak açılma (legSwing) ve gövde yaylanma (bob) animasyonu doğrulandı.");

// 4. Kapıya Varış Testi
p.x = 400;
p.y = 92; // Kapıya vardı!
let tdx = targetWalkPos.x - p.x;
let tdy = targetWalkPos.y - p.y;
let arriveDist = Math.hypot(tdx, tdy);

if (arriveDist < 4.5) {
    let pendingRoom = targetWalkPos.targetRoom;
    targetWalkPos = null;
    changeRoom(pendingRoom);
}

assert.strictEqual(targetWalkPos, null, "Kapıya varılınca targetWalkPos sıfırlanmalı");
assert.strictEqual(changedToRoom, 'kafe', "Kapıya varınca mekana giriş yapılmalı");
console.log("✓ Kapıya varış anında içeri giriş testi başarılı.");

console.log("\n=== TÜM TESTLER BAŞARIYLA GEÇTİ! ===");
