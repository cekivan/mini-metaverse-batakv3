// scratch/test_batak_rules.js
const assert = require('assert');
const batakEngine = require('../src/engines/batak.js');
const batak4Engine = require('../src/engines/batak4.js');

console.log("=== BATAK 4 & BATAK 3 TESTLERİ BAŞLIYOR ===");

// 1. ROTASYON TESTİ (4 KİŞİLİK VE 3 KİŞİLİK)
console.log("\n1. İhale Sırası Rotasyon Testi:");

// 4 Kişilik Batak
let p4 = ['p0', 'p1', 'p2', 'p3'];
for (let r = 1; r <= 8; r++) {
    let game = batak4Engine.startBatakGame(p4, null, r);
    let expectedTurn = (r - 1) % 4;
    assert.strictEqual(game.turnIndex, expectedTurn, `Batak4 El ${r} turnIndex ${game.turnIndex} olmalıydı, beklenen: ${expectedTurn}`);
    assert.strictEqual(game.forcedPlayerIndex, expectedTurn, `Batak4 El ${r} forcedPlayerIndex ${game.forcedPlayerIndex} olmalıydı, beklenen: ${expectedTurn}`);
    assert.strictEqual(game.starterIndex, expectedTurn, `Batak4 El ${r} starterIndex ${game.starterIndex} olmalıydı, beklenen: ${expectedTurn}`);
}
console.log("  [✓] 4 Kişilik Batak el rotasyonu (1..8) kusursuz çalıştı.");

// 3 Kişilik Batak
let p3 = ['p0', 'p1', 'p2'];
for (let r = 1; r <= 6; r++) {
    let game = batakEngine.startBatakGame(p3, null, r);
    let expectedTurn = (r - 1) % 3;
    assert.strictEqual(game.turnIndex, expectedTurn, `Batak3 El ${r} turnIndex ${game.turnIndex} olmalıydı, beklenen: ${expectedTurn}`);
    assert.strictEqual(game.forcedPlayerIndex, expectedTurn, `Batak3 El ${r} forcedPlayerIndex ${game.forcedPlayerIndex} olmalıydı, beklenen: ${expectedTurn}`);
    assert.strictEqual(game.starterIndex, expectedTurn, `Batak3 El ${r} starterIndex ${game.starterIndex} olmalıydı, beklenen: ${expectedTurn}`);
}
console.log("  [✓] 3 Kişilik Batak el rotasyonu (1..6) kusursuz çalıştı.");

// 2. HERKES PAS DERSE MECBUR KALAN OYUNCU TESTİ
console.log("\n2. Herkes Pas Geçince İhalenin Sıradaki Mecbur Oyuncuya Kalması Testi:");
// 4 Kişilik El 2: p1 başlamalı, herkes pas derse p1'e kalmalı
let g4_r2 = batak4Engine.startBatakGame(p4, null, 2);
assert.strictEqual(g4_r2.players[g4_r2.turnIndex], 'p1');
batak4Engine.handleBid(g4_r2, 'p1', 'pas');
batak4Engine.handleBid(g4_r2, 'p2', 'pas');
batak4Engine.handleBid(g4_r2, 'p3', 'pas');
batak4Engine.handleBid(g4_r2, 'p0', 'pas');
assert.strictEqual(g4_r2.phase, 'koz_secimi');
assert.strictEqual(g4_r2.bid.highestBidder, 'p1', "Batak4 El 2'de herkes pas deyince ihale p1'e kalmalı");
assert.strictEqual(g4_r2.bid.current, 4);
console.log("  [✓] Batak4 2. elde herkes pas deyince ihale p1'e 4'ten kaldı.");

// 3 Kişilik El 3: p2 başlamalı, herkes pas derse p2'ye kalmalı
let g3_r3 = batakEngine.startBatakGame(p3, null, 3);
assert.strictEqual(g3_r3.players[g3_r3.turnIndex], 'p2');
batakEngine.handleBid(g3_r3, 'p2', 'pas');
batakEngine.handleBid(g3_r3, 'p0', 'pas');
batakEngine.handleBid(g3_r3, 'p1', 'pas');
assert.strictEqual(g3_r3.phase, 'koz_secimi');
assert.strictEqual(g3_r3.bid.highestBidder, 'p2', "Batak3 El 3'te herkes pas deyince ihale p2'ye kalmalı");
assert.strictEqual(g3_r3.bid.current, 7);
console.log("  [✓] Batak3 3. elde herkes pas deyince ihale p2'ye 7'den kaldı.");

// 3. KURAL TESTİ: KOZ DÜŞTÜKTEN SONRA DÖNEN RENGİ BÜYÜTME ZORUNLULUĞUNUN KALKMASI
console.log("\n3. Kullanıcının Belirttiği Hata Senaryosu:");
console.log("   (Koz Maça. Biri Sinek 7 attı, sonra biri koz (Maça) düştü. Oyuncunun elinde Sinek 6 ve Sinek 8 var. Sinek 6 atabilmeli!)");

let testGame4 = {
    trump: '♠',
    trumpBroken: true,
    tableCards: [
        { playerId: 'p0', card: { suit: '♣', value: '7' } }, // Sinek 7
        { playerId: 'p1', card: { suit: '♠', value: '2' } }  // Koz çakıldı (Maça 2)
    ]
};

let userHand = [
    { suit: '♣', value: '6' },
    { suit: '♣', value: '8' },
    { suit: '♥', value: 'K' }
];

// batak4Engine'de playCard / isValidMove testi
let move6 = batak4Engine.playCard ? null : null;
// Direkt isValidMove mantığını test etmek için:
// playCard gameData üzerinden isValidMove çağırır
let gameDataForPlay = {
    phase: 'oyun',
    players: ['p0', 'p1', 'p2', 'p3'],
    turnIndex: 2,
    hands: {
        'p2': [...userHand]
    },
    tableCards: [...testGame4.tableCards],
    trump: '♠',
    trumpBroken: true,
    tricksTaken: { p0: 0, p1: 0, p2: 0, p3: 0 }
};

// Sinek 6 oynamayı dene
let play6Res = batak4Engine.playCard(gameDataForPlay, 'p2', 0, '#fff'); // index 0: Sinek 6
assert.strictEqual(play6Res.success, true, `Sinek 6 atılabilmeliydi ama hata verdi: ${play6Res.msg}`);
console.log("  [✓] Batak4: Yere koz düştükten sonra Sinek 8 yerine Sinek 6 başarıyla atılabildi!");

// Sinek 8 de atılabilmeli
gameDataForPlay.hands['p2'] = [...userHand];
gameDataForPlay.tableCards = [...testGame4.tableCards];
gameDataForPlay.turnIndex = 2;
let play8Res = batak4Engine.playCard(gameDataForPlay, 'p2', 1, '#fff'); // index 1: Sinek 8
assert.strictEqual(play8Res.success, true, `Sinek 8 de atılabilmeliydi: ${play8Res.msg}`);
console.log("  [✓] Batak4: İstendiğinde Sinek 8 de başarıyla atılabiliyor.");

// Ancak elinde sinek varken Kupa K atamamalı (renk uymak zorunlu)
gameDataForPlay.hands['p2'] = [...userHand];
gameDataForPlay.tableCards = [...testGame4.tableCards];
gameDataForPlay.turnIndex = 2;
let playKupaRes = batak4Engine.playCard(gameDataForPlay, 'p2', 2, '#fff'); // index 2: Kupa K
assert.strictEqual(playKupaRes.success, false, "Elinde sinek varken Kupa K atamamalıydı!");
console.log("  [✓] Batak4: Elinde dönen renk (♣) varken başka renk (♥) atılması engellendi: " + playKupaRes.msg);

// 4. EĞER YERE KOZ DÜŞMEMİŞSE BÜYÜTME ZORUNLULUĞU DEVAM ETMELİ
console.log("\n4. Yere Koz Düşmediğinde Büyütme Zorunluluğu Testi:");
let testGameNoTrump = {
    phase: 'oyun',
    players: ['p0', 'p1', 'p2', 'p3'],
    turnIndex: 2,
    hands: {
        'p2': [...userHand] // ♣6, ♣8, ♥K
    },
    tableCards: [
        { playerId: 'p0', card: { suit: '♣', value: '7' } }, // Sinek 7
        { playerId: 'p1', card: { suit: '♣', value: '5' } }  // Sinek 5
    ],
    trump: '♠',
    trumpBroken: false,
    tricksTaken: { p0: 0, p1: 0, p2: 0, p3: 0 }
};

// Sinek 6 oynamaya çalışırsa -> Sinek 8 varken Sinek 7'yi geçmeli, hata almalı
let play6FailRes = batak4Engine.playCard(testGameNoTrump, 'p2', 0, '#fff');
assert.strictEqual(play6FailRes.success, false, "Koz düşmemişken elinde Sinek 8 varken Sinek 6 atamamalıydı!");
console.log("  [✓] Batak4: Koz düşmediğinde Sinek 8 varken 6 atılması engellendi: " + play6FailRes.msg);

// Sinek 8 oynarsa -> Başarılı olmalı
let play8SuccessRes = batak4Engine.playCard(testGameNoTrump, 'p2', 1, '#fff');
assert.strictEqual(play8SuccessRes.success, true, "Sinek 8 ile eli büyütebilmeliydi!");
console.log("  [✓] Batak4: Sinek 8 atıldığında hamle onaylandı.");

// 5. YERDEKİ KOZU GEÇEMEYENİN ÇÖP ATABİLMESİ TESTİ
console.log("\n5. Yerdeki Kozu Geçemeyen Oyuncunun Yan Renk (Çöp) Atabilmesi Testi:");
let testGameTrumpHigher = {
    phase: 'oyun',
    players: ['p0', 'p1', 'p2', 'p3'],
    turnIndex: 2,
    hands: {
        'p2': [
            { suit: '♠', value: '3' }, // Maça 3 (yerdeki Maça K'dan küçük)
            { suit: '♦', value: '9' }  // Karo 9 (yan renk)
        ]
    },
    tableCards: [
        { playerId: 'p0', card: { suit: '♥', value: '7' } }, // Kupa 7
        { playerId: 'p1', card: { suit: '♠', value: 'K' } }  // Koz Maça Papaz çakıldı
    ],
    trump: '♠',
    trumpBroken: true,
    tricksTaken: { p0: 0, p1: 0, p2: 0, p3: 0 }
};

// Oyuncunun elinde Kupa yok. Yerdeki koz Maça K. Oyuncunun elinde Maça 3 var (K'yı geçemez).
// İsterse Karo 9 (çöp) atabilmeli
let playDiscardRes = batak4Engine.playCard(testGameTrumpHigher, 'p2', 1, '#fff'); // Karo 9
assert.strictEqual(playDiscardRes.success, true, `Yerdeki kozu geçemeyen çöp atabilmeliydi: ${playDiscardRes.msg}`);
console.log("  [✓] Batak4: Yerdeki Maça K'yı geçemeyen oyuncu başarıyla Karo 9 (çöp) atabildi.");

// İsterse küçük kozunu da verebilmeli
testGameTrumpHigher.hands['p2'] = [
    { suit: '♠', value: '3' },
    { suit: '♦', value: '9' }
];
testGameTrumpHigher.turnIndex = 2;
testGameTrumpHigher.tableCards = [
    { playerId: 'p0', card: { suit: '♥', value: '7' } },
    { playerId: 'p1', card: { suit: '♠', value: 'K' } }
];
let playSmallTrumpRes = batak4Engine.playCard(testGameTrumpHigher, 'p2', 0, '#fff'); // Maça 3
assert.strictEqual(playSmallTrumpRes.success, true, `Küçük kozunu da verebilmeliydi: ${playSmallTrumpRes.msg}`);
console.log("  [✓] Batak4: Yerdeki kozu geçemeyen oyuncu isterse küçük kozunu da atabildi.");

// Ama eğer elinde Maça As olsaydı, Karo 9 atamayacaktı (kozu büyütmek zorunlu)
testGameTrumpHigher.hands['p2'] = [
    { suit: '♠', value: 'A' }, // Maça As (K'dan büyük)
    { suit: '♦', value: '9' }
];
testGameTrumpHigher.turnIndex = 2;
testGameTrumpHigher.tableCards = [
    { playerId: 'p0', card: { suit: '♥', value: '7' } },
    { playerId: 'p1', card: { suit: '♠', value: 'K' } }
];
let playFailRes = batak4Engine.playCard(testGameTrumpHigher, 'p2', 1, '#fff'); // Karo 9 atmayı deniyor
assert.strictEqual(playFailRes.success, false, "Elinde Maça As varken yerdeki Maça K'ya karşı Karo 9 atamamalı!");
console.log("  [✓] Batak4: Elinde büyük koz (♠A) varken yerdeki koza karşı çöp atması engellendi: " + playFailRes.msg);

console.log("\n=== TÜM TESTLER BAŞARIYLA GEÇTİ! ===");
