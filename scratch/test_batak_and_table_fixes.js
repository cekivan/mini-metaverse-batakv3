// scratch/test_batak_and_table_fixes.js
const assert = require('assert');
const batakEngine = require('../src/engines/batak');
const batak4Engine = require('../src/engines/batak4');

console.log('--- 1. Testing 4-Player Batak Bidding (Nobody Skipped) ---');
const players4 = ['p1', 'p2', 'p3', 'p4'];
let g4 = batak4Engine.startBatakGame(players4, null, 1);

assert.strictEqual(g4.phase, 'ihale');
assert.strictEqual(g4.turnIndex, 0); // starts with p1

// P1 passes
let r1 = batak4Engine.handleBid(g4, 'p1', 'pas');
assert.strictEqual(r1, true);
assert.strictEqual(g4.phase, 'ihale', "Phase must remain 'ihale' after P1 passes");
assert.strictEqual(g4.turnIndex, 1, "Turn must move to P2");

// P2 passes
let r2 = batak4Engine.handleBid(g4, 'p2', 'pas');
assert.strictEqual(r2, true);
assert.strictEqual(g4.phase, 'ihale', "Phase must remain 'ihale' after P2 passes");
assert.strictEqual(g4.turnIndex, 2, "Turn must move to P3");

// P3 passes
let r3 = batak4Engine.handleBid(g4, 'p3', 'pas');
assert.strictEqual(r3, true);
assert.strictEqual(g4.phase, 'ihale', "CRITICAL: Phase must STILL be 'ihale'! P4 MUST BE ASKED!");
assert.strictEqual(g4.turnIndex, 3, "CRITICAL: Turn must be P4! P4 must NOT be skipped!");

// P4 makes a bid of 5
let r4 = batak4Engine.handleBid(g4, 'p4', 5);
assert.strictEqual(r4, true);
assert.strictEqual(g4.phase, 'koz_secimi', "Now that P4 bid 5 and P1,P2,P3 passed, P4 wins!");
assert.strictEqual(g4.bid.highestBidder, 'p4');
assert.strictEqual(g4.bid.current, 5);
console.log('✅ 4-Player Batak: P4 was asked correctly and won bid 5!');

console.log('--- 2. Testing 4-Player Batak: All 4 Pass (Dealer Forced) ---');
let g4_allPass = batak4Engine.startBatakGame(players4, null, 1);
batak4Engine.handleBid(g4_allPass, 'p1', 'pas');
batak4Engine.handleBid(g4_allPass, 'p2', 'pas');
batak4Engine.handleBid(g4_allPass, 'p3', 'pas');
assert.strictEqual(g4_allPass.turnIndex, 3);
// P4 also passes
batak4Engine.handleBid(g4_allPass, 'p4', 'pas');
assert.strictEqual(g4_allPass.phase, 'koz_secimi');
assert.strictEqual(g4_allPass.bid.current, 4, "All passed, dealer forced to 4");
assert.strictEqual(g4_allPass.bid.highestBidder, 'p1', "P1 was forced player");
console.log('✅ 4-Player Batak: All passed -> Dealer forced to 4 correctly!');

console.log('--- 3. Testing 3-Player Batak Bidding (Nobody Skipped) ---');
const players3 = ['p1', 'p2', 'p3'];
let g3 = batakEngine.startBatakGame(players3, null, 1);
assert.strictEqual(g3.phase, 'ihale');
assert.strictEqual(g3.turnIndex, 0);

batakEngine.handleBid(g3, 'p1', 'pas');
assert.strictEqual(g3.phase, 'ihale');
assert.strictEqual(g3.turnIndex, 1);

batakEngine.handleBid(g3, 'p2', 'pas');
assert.strictEqual(g3.phase, 'ihale', "Phase must remain 'ihale' after P2 passes, P3 must be asked!");
assert.strictEqual(g3.turnIndex, 2, "Turn must be P3!");

// P3 bids 8
batakEngine.handleBid(g3, 'p3', 8);
assert.strictEqual(g3.phase, 'koz_secimi');
assert.strictEqual(g3.bid.highestBidder, 'p3');
assert.strictEqual(g3.bid.current, 8);
console.log('✅ 3-Player Batak: P3 was asked correctly and won bid 8!');

console.log('🎉 ALL UNIT TESTS PASSED!');
