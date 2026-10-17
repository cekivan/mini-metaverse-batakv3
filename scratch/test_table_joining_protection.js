// scratch/test_table_joining_protection.js
const assert = require('assert');
const tableManager = require('../src/tableManager');

console.log('--- Testing Table Lobby Joining & Conflict Prevention ---');
let t1 = tableManager.getTable('batak');
let t2 = tableManager.getTable('batak4');
assert(t1 && t2, "Tables batak and batak4 must exist");

// Clear any test players
t1.players = [];
t2.players = [];

const sid = 'test_socket_user_99';

// 1. User joins Table 1 (batak)
t1.players.push(sid);
assert(t1.players.includes(sid));

// 2. User joins Table 2 (batak4) -> removePlayerFromLobbies must clear from Table 1
let affected = tableManager.removePlayerFromLobbies(sid);
assert.strictEqual(t1.players.includes(sid), false, "User must no longer be in Table 1!");
assert(affected.some(t => t.id === 'batak'), "Table 1 must be in affected list");

// Now user is pushed to Table 2
t2.players.push(sid);
assert(t2.players.includes(sid));
assert.strictEqual(t1.players.includes(sid), false);

// Clean up
tableManager.removePlayerFromLobbies(sid);
assert.strictEqual(t1.players.includes(sid), false);
assert.strictEqual(t2.players.includes(sid), false);

console.log('✅ Table Conflict Protection Test Passed Successfully!');
