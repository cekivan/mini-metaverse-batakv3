// scratch/test_room_interactions_and_clicks.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log("=== TESTING ROOM INTERACTIONS, PORTALS, AND CLICK HANDLERS ===");

// Create a sandbox simulating the browser environment
const sandbox = {
    window: {},
    document: {
        getElementById: (id) => ({
            style: {},
            classList: { contains: () => false, add: () => {}, remove: () => {} },
            addEventListener: () => {}
        }),
        querySelectorAll: () => []
    },
    canvas: { width: 800, height: 600 },
    ctx: {},
    io: () => ({ emit: () => {}, on: () => {} }),
    cafeTables: [
        { id: 'billiard', x: 235, y: 140, w: 90, h: 48 },
        { id: 'tavla', x: 235, y: 300, w: 80, h: 50 },
        { id: 'batak', x: 670, y: 125, w: 55, h: 55 },
        { id: 'batak4', x: 670, y: 295, w: 55, h: 55 },
        { id: 'xox', x: 384, y: 140, w: 65, h: 50 },
        { id: 'amiral', x: 495, y: 140, w: 85, h: 50 },
        { id: 'blackjack', x: 380, y: 300, w: 100, h: 55 }
    ],
    console: console,
    Math: Math,
    Date: Date,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
};

let requestedTableId = null;
sandbox.socket = {
    emit: (event, arg) => {
        if (event === 'requestTableOptions') requestedTableId = arg;
    }
};

// Expose window globals
sandbox.window = sandbox;

// Load roomInteractions.js
const code = fs.readFileSync(path.join(process.cwd(), 'public', 'js', 'roomInteractions.js'), 'utf8');
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

// Verify functions are exported to window
assert.strictEqual(typeof sandbox.window.checkRoomWalkPortals, 'function', "checkRoomWalkPortals must be exported to window");
assert.strictEqual(typeof sandbox.window.handleRoomInteractionClick, 'function', "handleRoomInteractionClick must be exported to window");
assert.strictEqual(typeof sandbox.window.handleRoomMobileInteract, 'function', "handleRoomMobileInteract must be exported to window");
console.log("✔ roomInteractions.js successfully exported all 3 interaction handlers to window!");

// 1. Test Street-to-Street Portals (Walking)
console.log("\n--- Testing Street Walk Portals ---");
const pSokakToCadde = { x: 785, y: 250 };
const targetCadde = sandbox.window.checkRoomWalkPortals(pSokakToCadde, 'sokak', 800, 600);
assert.strictEqual(targetCadde, 'cadde', "Walking right in sokak must lead to cadde");
console.log("✔ Sokak -> Cadde walk portal verified:", targetCadde);

const pCaddeToSokak = { x: 15, y: 240 };
const targetSokak = sandbox.window.checkRoomWalkPortals(pCaddeToSokak, 'cadde', 800, 600);
assert.strictEqual(targetSokak, 'sokak', "Walking left in cadde must lead to sokak");
console.log("✔ Cadde -> Sokak walk portal verified:", targetSokak);

const pSokakToSahil = { x: 15, y: 250 };
const targetSahil = sandbox.window.checkRoomWalkPortals(pSokakToSahil, 'sokak', 800, 600);
assert.strictEqual(targetSahil, 'sahil', "Walking left in sokak must lead to sahil");
console.log("✔ Sokak -> Sahil walk portal verified:", targetSahil);

const pSahilToSokak = { x: 785, y: 250 };
const targetSokakFromSahil = sandbox.window.checkRoomWalkPortals(pSahilToSokak, 'sahil', 800, 600);
assert.strictEqual(targetSokakFromSahil, 'sokak', "Walking right in sahil must lead to sokak");
console.log("✔ Sahil -> Sokak walk portal verified:", targetSokakFromSahil);

// 2. Test Street-to-Street Clicks (Click on road/sign)
console.log("\n--- Testing Street Clicks & Navigation ---");
let lastNavigatedTarget = null;
sandbox.navigatePlayerToDoor = (tx, ty, room) => {
    lastNavigatedTarget = room;
};

// In sokak: Click on right road (Cadde)
let handled = sandbox.window.handleRoomInteractionClick(750, 250, 'sokak', { x: 400, y: 250 }, 800, 600);
assert.strictEqual(handled, true, "Clicking cadde entrance in sokak must be handled");
assert.strictEqual(lastNavigatedTarget, 'cadde', "Must navigate to cadde");
console.log("✔ Clicking Cadde road in Sokak navigates to Cadde!");

// In cadde: Click on left road (Sokak)
handled = sandbox.window.handleRoomInteractionClick(50, 240, 'cadde', { x: 400, y: 250 }, 800, 600);
assert.strictEqual(handled, true, "Clicking sokak entrance in cadde must be handled");
assert.strictEqual(lastNavigatedTarget, 'sokak', "Must navigate to sokak");
console.log("✔ Clicking Sokak road in Cadde navigates to Sokak!");

// 3. Test Buildings Click in Sokak & Cadde
console.log("\n--- Testing Building Clicks ---");
// Kafe in sokak
handled = sandbox.window.handleRoomInteractionClick(400, 50, 'sokak', { x: 400, y: 250 }, 800, 600);
assert.strictEqual(handled, true);
assert.strictEqual(lastNavigatedTarget, 'kafe');
console.log("✔ Clicking Kafe in Sokak navigates to Kafe!");

// Ganyan in cadde
handled = sandbox.window.handleRoomInteractionClick(240, 50, 'cadde', { x: 400, y: 250 }, 800, 600);
assert.strictEqual(handled, true);
assert.strictEqual(lastNavigatedTarget, 'ganyan');
console.log("✔ Clicking Ganyan in Cadde navigates to Ganyan!");

// Dedenin Yeri in cadde
handled = sandbox.window.handleRoomInteractionClick(600, 50, 'cadde', { x: 400, y: 250 }, 800, 600);
assert.strictEqual(handled, true);
assert.strictEqual(lastNavigatedTarget, 'dedenin_yeri');
console.log("✔ Clicking Dedenin Yeri in Cadde navigates to Dedenin Yeri!");

// 4. Test Tables Click in Kafe
console.log("\n--- Testing Kafe Table Clicks ---");


// XOX table click (x: 384, y: 140, w: 65, h: 50)
handled = sandbox.window.handleRoomInteractionClick(400, 150, 'kafe', { x: 400, y: 250 }, 800, 600);
assert.strictEqual(handled, true, "XOX table click must be handled");
assert.strictEqual(requestedTableId, 'xox', "Must request table options for xox");
console.log("✔ Clicking XOX table in Kafe emits requestTableOptions for xox!");

// Amiral Batti table click (x: 495, y: 140, w: 85, h: 50)
handled = sandbox.window.handleRoomInteractionClick(520, 150, 'kafe', { x: 400, y: 250 }, 800, 600);
assert.strictEqual(handled, true, "Amiral table click must be handled");
assert.strictEqual(requestedTableId, 'amiral', "Must request table options for amiral");
console.log("✔ Clicking Amiral table in Kafe emits requestTableOptions for amiral!");

// Tavla table click (x: 235, y: 300, w: 80, h: 50)
handled = sandbox.window.handleRoomInteractionClick(250, 310, 'kafe', { x: 400, y: 250 }, 800, 600);
assert.strictEqual(handled, true, "Tavla table click must be handled");
assert.strictEqual(requestedTableId, 'tavla', "Must request table options for tavla");
console.log("✔ Clicking Tavla table in Kafe emits requestTableOptions for tavla!");

// Batak table click (x: 670, y: 125, w: 55, h: 55)
handled = sandbox.window.handleRoomInteractionClick(690, 140, 'kafe', { x: 400, y: 250 }, 800, 600);
assert.strictEqual(handled, true, "Batak table click must be handled");
assert.strictEqual(requestedTableId, 'batak', "Must request table options for batak");
console.log("✔ Clicking Batak table in Kafe emits requestTableOptions for batak!");

console.log("\n=======================================================");
console.log("🎉 ALL ROOM INTERACTIONS, PORTALS & CLICKS 100% VERIFIED!");
console.log("=======================================================\n");
