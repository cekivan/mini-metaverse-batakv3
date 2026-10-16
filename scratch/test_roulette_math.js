// scratch/test_roulette_math.js - Roulette angle and landing verification
const assert = require('assert');

const ROULETTE_WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const sliceAngle = (Math.PI * 2) / 37;

console.log("=== RULET GEOMETRİ VE AÇI TESTİ ===");

for (let targetIndex = 0; targetIndex < 37; targetIndex++) {
    let winningNumber = ROULETTE_WHEEL_ORDER[targetIndex];

    // Rastgele bir başlangıç açısı
    let initialWheelAngle = Math.random() * Math.PI * 2;
    let initialBallAngle = Math.random() * Math.PI * 2;

    let totalWheelRotations = (Math.PI * 2) * 5;
    let finalWheelAngle = initialWheelAngle + totalWheelRotations;

    // Hedef cebin çark üzerindeki açısı
    let targetSlotFinalAngle = finalWheelAngle + (targetIndex * sliceAngle) - (Math.PI / 2);

    // Topun dönüşü
    let diff = (targetSlotFinalAngle - initialBallAngle) % (Math.PI * 2);
    if (diff > 0) {
        diff -= (Math.PI * 2);
    }
    let totalBallDelta = diff - ((Math.PI * 2) * 7);
    let finalBallAngle = initialBallAngle + totalBallDelta;

    // Açı farkını doğrula (Mod 2pi)
    let ballAngleNorm = ((finalBallAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    let targetSlotNorm = ((targetSlotFinalAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);

    let angleDiff = Math.abs(ballAngleNorm - targetSlotNorm);
    if (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

    assert(angleDiff < 1e-9, `Açı uyuşmazlığı! targetIndex: ${targetIndex}, num: ${winningNumber}, diff: ${angleDiff}`);

    // Koordinat doğrulaması
    let pocketRadius = 88;
    let ballX = Math.cos(finalBallAngle) * pocketRadius;
    let ballY = Math.sin(finalBallAngle) * pocketRadius;

    let slotX = Math.cos(targetSlotFinalAngle) * pocketRadius;
    let slotY = Math.sin(targetSlotFinalAngle) * pocketRadius;

    let posDist = Math.hypot(ballX - slotX, ballY - slotY);
    assert(posDist < 1e-6, `Mesafe sapması var! dist: ${posDist}`);
}

console.log("✓ 37 dilimin tamamında (0 - 36) top ile kazanan sayı cebi 100.000% milimetrik örtüştü!");
