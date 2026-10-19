const { startTavlaGame, createInitialBoard, getValidMovesForPoint, makeMove, canBearOff } = require('../src/engines/tavla');

console.log("=== TAVLA KLASİK DİZİLİM VE PERSPEKTİF TESTİ ===");

let game = startTavlaGame('player_white', 'player_black');
let board = game.board;

function getSlotForWhite(serverPoint) {
    return serverPoint; // White view: slot = serverPoint
}

function getSlotForBlack(serverPoint) {
    return 25 - serverPoint; // Black view: slot = 25 - serverPoint
}

function getServerPointForSlot(slot, color) {
    return (color === 'black') ? (25 - slot) : slot;
}

console.log("\n--- BEYAZ GÖZÜNDEN TAHTA (WHITE VIEW) ---");
[24, 13, 8, 6].forEach(slot => {
    let pt = getServerPointForSlot(slot, 'white');
    let cell = board[pt];
    console.log(`Slot ${slot} (Server Point ${pt}):`, cell.player, `x${cell.count}`);
});

console.log("\n--- SİYAH GÖZÜNDEN TAHTA (BLACK VIEW) ---");
[24, 13, 8, 6].forEach(slot => {
    let pt = getServerPointForSlot(slot, 'black');
    let cell = board[pt];
    console.log(`Slot ${slot} (Server Point ${pt}):`, cell.player, `x${cell.count}`);
});

// Doğrulama:
// Beyaz ve Siyah için Slot 24'te 2 taş, Slot 13'te 5 taş, Slot 8'de 3 taş, Slot 6'da 5 taş olmalı!
let whitePass = (
    board[getServerPointForSlot(24, 'white')].player === 'white' && board[getServerPointForSlot(24, 'white')].count === 2 &&
    board[getServerPointForSlot(13, 'white')].player === 'white' && board[getServerPointForSlot(13, 'white')].count === 5 &&
    board[getServerPointForSlot(8, 'white')].player === 'white' && board[getServerPointForSlot(8, 'white')].count === 3 &&
    board[getServerPointForSlot(6, 'white')].player === 'white' && board[getServerPointForSlot(6, 'white')].count === 5
);

let blackPass = (
    board[getServerPointForSlot(24, 'black')].player === 'black' && board[getServerPointForSlot(24, 'black')].count === 2 &&
    board[getServerPointForSlot(13, 'black')].player === 'black' && board[getServerPointForSlot(13, 'black')].count === 5 &&
    board[getServerPointForSlot(8, 'black')].player === 'black' && board[getServerPointForSlot(8, 'black')].count === 3 &&
    board[getServerPointForSlot(6, 'black')].player === 'black' && board[getServerPointForSlot(6, 'black')].count === 5
);

console.log("\nWhite layout check:", whitePass ? "PASS ✅" : "FAIL ❌");
console.log("Black layout check:", blackPass ? "PASS ✅" : "FAIL ❌");

// Hareket yönü testi:
// Beyaz için: Sol Üst (24) -> Sağ Üst (13) -> Sağ Alt (12) -> Sol Alt (1) -> Toplama
// Siyah için: Sol Üst (24 -> server pt 1) -> Sağ Üst (13 -> server pt 12) -> Sağ Alt (12 -> server pt 13) -> Sol Alt (1 -> server pt 24) -> Toplama
console.log("\nHareket Rotası ve Toplama Yeri Testi:");
console.log("Beyaz Ev Bölgesi Slotları (Sol Alt):", [1, 2, 3, 4, 5, 6].map(s => getServerPointForSlot(s, 'white')));
console.log("Siyah Ev Bölgesi Slotları (Sol Alt):", [1, 2, 3, 4, 5, 6].map(s => getServerPointForSlot(s, 'black')));

if (whitePass && blackPass) {
    console.log("\n🎉 HER İKİ OYUNCU DA KLASİK TÜRK TAVLASI STANDARTLARINDA:");
    console.log("- Sol Üstten başlar (2 pul)");
    console.log("- Sağ Üste doğru gider (5 pul)");
    console.log("- Sağ Alta döner (3 pul)");
    console.log("- Sol Alta girer (5 pul, Ev / Toplama Alanı)");
    console.log("- Sol taraftaki tepsisinde toplar!");
}
