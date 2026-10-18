// scratch/test_void_hand.js - Automated test for Batak and 101 Okey "El Bozma" (Void Hand) feature
const assert = require('assert');
const gameCoordinator = require('../src/gameCoordinator');
const batak4Engine = require('../src/engines/batak4');
const okey101Engine = require('../src/engines/okey101');

console.log("=== STARTING VOID HAND (EL BOZMA) TESTS ===");

// Mock Socket.io & Players
class MockIo {
    constructor() {
        this.emittedEvents = [];
    }
    to(targetId) {
        return {
            emit: (event, data) => {
                this.emittedEvents.push({ targetId, event, data });
            }
        };
    }
    emit(event, data) {
        this.emittedEvents.push({ targetId: 'broadcast', event, data });
    }
}

const mockIo = new MockIo();
const mockPlayers = {
    'p1': { name: 'Ahmet', money: 5000, profile: { username: 'Ahmet' } },
    'p2': { name: 'Mehmet', money: 3200, profile: { username: 'Mehmet' } },
    'p3': { name: 'Ayse', money: 4500, profile: { username: 'Ayse' } },
    'p4': { name: 'Fatma', money: 6100, profile: { username: 'Fatma' } },
    'bot_1': { name: 'Robot 1', money: 10000, isBot: true },
    'bot_2': { name: 'Robot 2', money: 10000, isBot: true },
    'bot_3': { name: 'Robot 3', money: 10000, isBot: true }
};

// -------------------------------------------------------------
// TEST 1: BATAK 4-PLAYER TABLE WITH 1 HUMAN & 3 BOTS
// -------------------------------------------------------------
console.log("\n--- TEST 1: Batak (1 Human + 3 Bots) Void Hand ---");
{
    const initialMoneyP1 = mockPlayers['p1'].money;
    let initialGame = batak4Engine.startBatakGame(['p1', 'bot_1', 'bot_2', 'bot_3'], { p1: 10, bot_1: 0, bot_2: -5, bot_3: 0 }, 2);
    
    let game = {
        tableId: 'batak_4kisilik_test1',
        isBatak4: true,
        players: ['p1', 'bot_1', 'bot_2', 'bot_3'],
        playerProfiles: {
            'p1': { name: 'Ahmet' },
            'bot_1': { name: 'Robot 1', isBot: true },
            'bot_2': { name: 'Robot 2', isBot: true },
            'bot_3': { name: 'Robot 3', isBot: true }
        },
        scores: { p1: 10, bot_1: 0, bot_2: -5, bot_3: 0 },
        roundNumber: 2,
        bet: 100,
        pot: 400,
        ...initialGame
    };

    gameCoordinator.activeGames['batak_4kisilik_test1'] = game;

    // Ahmet initiates void hand
    let started = gameCoordinator.startVoidHandVote(game, 'p1', mockIo, mockPlayers);
    assert.strictEqual(started, true, "startVoidHandVote should return true");
    
    // In 1 human + 3 bots, bots vote YES immediately, and initiator votes YES, so consensus (4/4) is reached immediately!
    assert.strictEqual(game.voidHandVote, undefined, "voidHandVote should be cleaned up after successful execution");

    // Check that cards are redealt
    assert.strictEqual(game.players.length, 4, "Players should remain 4");
    assert.strictEqual(game.hands['p1'].length, 13, "Player 1 should receive 13 cards");
    assert.strictEqual(game.hands['bot_1'].length, 13, "Bot 1 should receive 13 cards");
    assert.strictEqual(game.phase, 'ihale', "Phase should be ihale");
    assert.strictEqual(game.roundNumber, 2, "Round number should stay preserved");
    assert.strictEqual(game.scores['p1'], 10, "Existing scores should be preserved");

    // Money check: NO MONEY DEDUCTED!
    assert.strictEqual(mockPlayers['p1'].money, initialMoneyP1, "Player money MUST NOT change!");
    assert.strictEqual(game.pot, 400, "Pot MUST NOT change!");

    // Check events emitted
    let voidSuccessEvents = mockIo.emittedEvents.filter(e => e.event === 'voidHandSuccess' && e.data.gameType === 'batak');
    assert.ok(voidSuccessEvents.length >= 4, "voidHandSuccess should be sent to all players");
    console.log("✅ Batak 1 human + 3 bots void hand redealt successfully without touching money!");
}

// -------------------------------------------------------------
// TEST 2: BATAK 4-PLAYER TABLE (ALL HUMANS) - REJECTION THEN ACCEPTANCE
// -------------------------------------------------------------
console.log("\n--- TEST 2: Batak (4 Humans) Rejection then Unanimous Acceptance ---");
{
    mockIo.emittedEvents = [];
    let initialGame = batak4Engine.startBatakGame(['p1', 'p2', 'p3', 'p4'], null, 1);
    let game = {
        tableId: 'batak_4kisilik_test2',
        isBatak4: true,
        players: ['p1', 'p2', 'p3', 'p4'],
        playerProfiles: {
            'p1': { name: 'Ahmet' },
            'p2': { name: 'Mehmet' },
            'p3': { name: 'Ayse' },
            'p4': { name: 'Fatma' }
        },
        scores: { p1: 0, p2: 0, p3: 0, p4: 0 },
        roundNumber: 1,
        bet: 50,
        pot: 200,
        ...initialGame
    };

    gameCoordinator.activeGames['batak_4kisilik_test2'] = game;

    // p1 requests void hand
    gameCoordinator.startVoidHandVote(game, 'p1', mockIo, mockPlayers);
    assert.ok(game.voidHandVote, "Vote must be active");
    assert.strictEqual(game.voidHandVote.votes['p1'], true, "Initiator votes YES");
    assert.strictEqual(game.voidHandVote.votes['p2'], false, "p2 not voted yet");

    // p2 rejects
    gameCoordinator.handleVoidHandVoteResponse(game, 'p2', false, mockIo, mockPlayers);
    assert.strictEqual(game.voidHandVote, undefined, "Vote should be cancelled when someone rejects");
    let cancelEvents = mockIo.emittedEvents.filter(e => e.event === 'voidHandVoteCancelled');
    assert.ok(cancelEvents.length >= 4, "Cancellation event emitted to all players");
    assert.ok(cancelEvents[0].data.reason.includes('Mehmet eli bozmayı reddetti'), "Cancellation reason mentions rejector name");

    // p3 tries again
    gameCoordinator.startVoidHandVote(game, 'p3', mockIo, mockPlayers);
    assert.ok(game.voidHandVote, "Vote active again");
    // p1 accepts
    gameCoordinator.handleVoidHandVoteResponse(game, 'p1', true, mockIo, mockPlayers);
    // p2 accepts
    gameCoordinator.handleVoidHandVoteResponse(game, 'p2', true, mockIo, mockPlayers);
    // p4 accepts
    gameCoordinator.handleVoidHandVoteResponse(game, 'p4', true, mockIo, mockPlayers);

    // All accepted -> redealt
    assert.strictEqual(game.voidHandVote, undefined, "Vote completed");
    assert.strictEqual(game.hands['p1'].length, 13, "Hands redealt");
    assert.strictEqual(game.pot, 200, "Pot preserved");
    console.log("✅ Batak 4 humans rejection and unanimous acceptance passed!");
}

// -------------------------------------------------------------
// TEST 3: 101 OKEY VOID HAND (REDEAL TILES & PRESERVE YAZBOZ & NO MONEY TAKEN)
// -------------------------------------------------------------
console.log("\n--- TEST 3: 101 Okey Void Hand ---");
{
    mockIo.emittedEvents = [];
    const initialMoneyP1 = mockPlayers['p1'].money;
    let initialGame = okey101Engine.startOkey101Game(['p1', 'p2', 'bot_1', 'bot_2'], null, 3, 'esli');
    
    // Add some score in yazboz to verify it's preserved
    initialGame.yazboz.team1.totalScore = 101;
    initialGame.yazboz.team2.totalScore = 202;

    let game = {
        tableId: 'okey101_test1',
        mode: 'esli',
        players: ['p1', 'p2', 'bot_1', 'bot_2'],
        playerProfiles: {
            'p1': { name: 'Ahmet' },
            'p2': { name: 'Mehmet' },
            'bot_1': { name: 'Robot 1', isBot: true },
            'bot_2': { name: 'Robot 2', isBot: true }
        },
        scores: { p1: 101, p2: 202, bot_1: 101, bot_2: 202 },
        roundNumber: 3,
        bet: 250,
        pot: 1000,
        ...initialGame
    };

    gameCoordinator.activeGames['okey101_test1'] = game;

    // Ahmet starts vote
    gameCoordinator.startVoidHandVote(game, 'p1', mockIo, mockPlayers);
    assert.ok(game.voidHandVote, "Vote in progress waiting for p2 (bots auto-voted YES)");
    assert.strictEqual(game.voidHandVote.votes['p1'], true);
    assert.strictEqual(game.voidHandVote.votes['bot_1'], true);
    assert.strictEqual(game.voidHandVote.votes['bot_2'], true);
    assert.strictEqual(game.voidHandVote.votes['p2'], false);

    // Mehmet votes YES
    gameCoordinator.handleVoidHandVoteResponse(game, 'p2', true, mockIo, mockPlayers);

    // Vote resolved & executed
    assert.strictEqual(game.voidHandVote, undefined, "Vote cleaned up");
    assert.strictEqual(game.roundNumber, 3, "Round number preserved");
    assert.strictEqual(game.yazboz.team1.totalScore, 101, "Yazboz score team 1 preserved");
    assert.strictEqual(game.yazboz.team2.totalScore, 202, "Yazboz score team 2 preserved");
    
    // Check tiles
    assert.ok(game.hands['p1'].length === 21 || game.hands['p1'].length === 22, "P1 has fresh tiles");
    assert.ok(game.hands['p2'].length === 21 || game.hands['p2'].length === 22, "P2 has fresh tiles");
    assert.strictEqual(game.tableOpenedPers.length, 0, "Opened pers reset");
    
    // Check money
    assert.strictEqual(mockPlayers['p1'].money, initialMoneyP1, "101 Okey: No money taken from player");
    assert.strictEqual(game.pot, 1000, "101 Okey: Pot preserved 1000 TL");

    let voidSuccessEvents = mockIo.emittedEvents.filter(e => e.event === 'voidHandSuccess' && e.data.gameType === 'okey101');
    assert.ok(voidSuccessEvents.length >= 4, "voidHandSuccess sent to all 4 seats");
    console.log("✅ 101 Okey void hand redealt successfully without touching money!");
}

// -------------------------------------------------------------
// TEST 4: TIMEOUT CANCELLATION
// -------------------------------------------------------------
console.log("\n--- TEST 4: Timeout Cancellation ---");
{
    mockIo.emittedEvents = [];
    let initialGame = batak4Engine.startBatakGame(['p1', 'p2', 'p3', 'p4'], null, 1);
    let game = {
        tableId: 'batak_timeout_test',
        isBatak4: true,
        players: ['p1', 'p2', 'p3', 'p4'],
        playerProfiles: {
            'p1': { name: 'Ahmet' },
            'p2': { name: 'Mehmet' },
            'p3': { name: 'Ayse' },
            'p4': { name: 'Fatma' }
        },
        scores: {},
        roundNumber: 1,
        ...initialGame
    };

    gameCoordinator.startVoidHandVote(game, 'p1', mockIo, mockPlayers);
    assert.ok(game.voidHandVote);
    
    // Cancel directly or simulate timer expiry
    gameCoordinator.cancelVoidHandVote(game, "⏱️ 20 saniyelik süre dolduğu için el bozma oylaması iptal edildi.", mockIo, mockPlayers);
    assert.strictEqual(game.voidHandVote, undefined, "Vote cancelled on timeout");
    let cancelEv = mockIo.emittedEvents.find(e => e.event === 'voidHandVoteCancelled');
    assert.ok(cancelEv.data.reason.includes('süre dolduğu için'));
    console.log("✅ Vote timeout cancellation passed!");
}

console.log("\n🎉 ALL VOID HAND TESTS PASSED PERFECTLY! 🎉\n");
