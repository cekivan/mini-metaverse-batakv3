const fs = require('fs');
const assert = require('assert');
const config = require('../src/config');
const dataManager = require('../src/dataManager');
const { registerSlotHandlers, evaluateSlotSpin, ALLOWED_BETS } = require('../src/handlers/slotHandler');

console.log('Testing Slot Machine Market and House Integration...');

// 1. Config Test
<<<<<<< HEAD
assert.strictEqual(config.FURNITURE_PRICES['slot_machine'], 5250, 'Slot machine price should be 5250 TL in config');
assert.strictEqual(config.FURNITURE_PRICES['roulette_table'], 5950, 'VIP roulette table price should be 5950 TL in config');
console.log('✔ config.FURNITURE_PRICES slot_machine and roulette_table prices verified.');
=======
assert.strictEqual(config.FURNITURE_PRICES['slot_machine'], 750, 'Slot machine price should be 750 TL in config');
console.log('✔ config.FURNITURE_PRICES slot_machine is 750 TL.');
>>>>>>> 1970266af90dc7109f9dabca9189fef5685ad2db

// 2. Client-side Housing Catalog & Drawers Test
const housingJs = fs.readFileSync('public/js/housing.js', 'utf8');
assert(housingJs.includes("'slot_machine':"), "FURNITURE_CATALOG must contain 'slot_machine'");
assert(housingJs.includes("window.currentSlotHouseOwner = house ? house.owner : null;"), "Clicking slot in house must set currentSlotHouseOwner");

const drawersJs = fs.readFileSync('public/js/furnitureDrawers.js', 'utf8');
assert(drawersJs.includes("'slot_machine': function"), "FURNITURE_DRAWERS must contain 'slot_machine'");
console.log('✔ housing.js catalog and furnitureDrawers.js drawer verified.');

// 3. Test Drawer Function Execution in Mock Canvas
const mockCtx = {
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    roundRect: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    arc: () => {},
    ellipse: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fillText: () => {}
};

// Evaluate drawer
const vm = require('vm');
const drawerContext = { window: {}, Date: Date, Math: Math, console: console };
vm.runInNewContext(drawersJs, drawerContext);
const drawerFn = drawerContext.window.FURNITURE_DRAWERS['slot_machine'];
assert(typeof drawerFn === 'function', 'Drawer function must be a function');

// Run through all 4 rotations (0, 1, 2, 3)
[0, 1, 2, 3].forEach(rot => {
    drawerFn(mockCtx, 100, 100, rot, Date.now());
});
console.log('✔ furnitureDrawers.js 4-way rotation rendered without error.');

// 4. Test Slot 1% House Commission Logic
const mockUsers = {
    'EvSahibi': { money: 1000, name: 'EvSahibi' },
    'Oyuncu': { money: 2000, name: 'Oyuncu' }
};
dataManager.persistentData.users = mockUsers;

const mockPlayers = {
    'sock_player': { name: 'Oyuncu', room: 'house_EvSahibi_standart', money: 2000 },
    'sock_owner': { name: 'EvSahibi', room: 'kafe', money: 1000 }
};

let emittedEvents = [];
const mockSocket = {
    id: 'sock_player',
    on: function(ev, cb) { this.handlers[ev] = cb; },
    emit: function(ev, data) { emittedEvents.push({ to: 'player', ev, data }); },
    handlers: {}
};

let ioEmits = [];
const mockIo = {
    to: function(target) {
        return {
            emit: function(ev, data) {
                ioEmits.push({ target, ev, data });
            }
        };
    }
};

registerSlotHandlers(mockIo, mockSocket, mockPlayers);

// Test Spin with 100 TL bet
mockSocket.handlers['slot_spin']({ betAmount: 100 });

assert(emittedEvents.some(e => e.ev === 'slot_result'), 'Must emit slot_result');
const spinRes = emittedEvents.find(e => e.ev === 'slot_result').data;
<<<<<<< HEAD
assert.strictEqual(spinRes.commissionPaid, 5, '100 TL bet should pay 5 TL commission (5%)');
assert.strictEqual(spinRes.houseOwner, 'EvSahibi', 'Commission must be credited to EvSahibi');
assert.strictEqual(mockUsers['EvSahibi'].money, 1005, 'EvSahibi money should increase by 5 TL to 1005 TL');
=======
assert.strictEqual(spinRes.commissionPaid, 1, '100 TL bet should pay 1 TL commission (1%)');
assert.strictEqual(spinRes.houseOwner, 'EvSahibi', 'Commission must be credited to EvSahibi');
assert.strictEqual(mockUsers['EvSahibi'].money, 1001, 'EvSahibi money should increase by 1 TL to 1001 TL');
>>>>>>> 1970266af90dc7109f9dabca9189fef5685ad2db

// Verify owner received online notifications
assert(ioEmits.some(e => e.ev === 'moneyUpdate' && e.target === 'sock_owner'), 'Owner must receive moneyUpdate');
assert(ioEmits.some(e => e.ev === 'systemMessage' && e.target === 'sock_owner'), 'Owner must receive systemMessage notification');
<<<<<<< HEAD
console.log('✔ Slot 5% house commission calculated, credited, and notified successfully.');
=======
console.log('✔ Slot 1% house commission calculated, credited, and notified successfully.');
>>>>>>> 1970266af90dc7109f9dabca9189fef5685ad2db

// Test Spin with 500 TL bet
emittedEvents = [];
ioEmits = [];
<<<<<<< HEAD
mockSocket._rateLimits = {};
mockSocket.handlers['slot_spin']({ betAmount: 500 });
const spinRes500 = emittedEvents.find(e => e.ev === 'slot_result').data;
assert.strictEqual(spinRes500.commissionPaid, 25, '500 TL bet should pay 25 TL commission (5%)');
assert.strictEqual(mockUsers['EvSahibi'].money, 1030, 'EvSahibi money should increase by 25 TL to 1030 TL');
console.log('✔ 500 TL bet awarded 25 TL commission.');
=======
mockSocket.handlers['slot_spin']({ betAmount: 500 });
const spinRes500 = emittedEvents.find(e => e.ev === 'slot_result').data;
assert.strictEqual(spinRes500.commissionPaid, 5, '500 TL bet should pay 5 TL commission (1%)');
assert.strictEqual(mockUsers['EvSahibi'].money, 1006, 'EvSahibi money should increase by 5 TL to 1006 TL');
console.log('✔ 500 TL bet awarded 5 TL commission.');
>>>>>>> 1970266af90dc7109f9dabca9189fef5685ad2db

console.log('All Slot Machine Market & House tests passed successfully! 🎉');
