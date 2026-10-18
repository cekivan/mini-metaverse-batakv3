// scratch/test_tavla_engine.js - Test for symmetrical Tavla engine
const assert = require('assert');

// 1. Board setup
function createInitialBoard() {
    let points = Array(25).fill(null).map(() => ({ player: null, count: 0 }));

    // Beyaz: Alt oyuncu (Home: 1-6). 24'ten 1'e doğru ilerler.
    points[6] = { player: 'white', count: 5 };
    points[8] = { player: 'white', count: 3 };
    points[13] = { player: 'white', count: 5 };
    points[24] = { player: 'white', count: 2 };

    // Siyah: Üst oyuncu (Home: 19-24). 1'den 24'e doğru ilerler.
    points[1] = { player: 'black', count: 2 };
    points[12] = { player: 'black', count: 5 };
    points[17] = { player: 'black', count: 3 };
    points[19] = { player: 'black', count: 5 };

    return points;
}

let board = createInitialBoard();

// Taş sayılarını doğrula
let whiteTotal = 0;
let blackTotal = 0;
for (let i = 1; i <= 24; i++) {
    if (board[i].player === 'white') whiteTotal += board[i].count;
    if (board[i].player === 'black') blackTotal += board[i].count;
}

assert.strictEqual(whiteTotal, 15, "Beyaz taşlar toplamı 15 olmalı");
assert.strictEqual(blackTotal, 15, "Siyah taşlar toplamı 15 olmalı");

// Simetri doğrulaması
// 13 (White 5) <-> 12 (Black 5)
assert.strictEqual(board[13].count, 5);
assert.strictEqual(board[13].player, 'white');
assert.strictEqual(board[12].count, 5);
assert.strictEqual(board[12].player, 'black');

// 17 (Black 3) <-> 8 (White 3)
assert.strictEqual(board[17].count, 3);
assert.strictEqual(board[17].player, 'black');
assert.strictEqual(board[8].count, 3);
assert.strictEqual(board[8].player, 'white');

// 19 (Black 5) <-> 6 (White 5)
assert.strictEqual(board[19].count, 5);
assert.strictEqual(board[19].player, 'black');
assert.strictEqual(board[6].count, 5);
assert.strictEqual(board[6].player, 'white');

// 24 (White 2) <-> 1 (Black 2)
assert.strictEqual(board[24].count, 2);
assert.strictEqual(board[24].player, 'white');
assert.strictEqual(board[1].count, 2);
assert.strictEqual(board[1].player, 'black');

console.log("✓ Tavla taş yerleşimi Y ekseninde (üst-alt ayna) %100 kusursuz simetrik!");
