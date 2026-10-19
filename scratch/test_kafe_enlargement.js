// scratch/test_kafe_enlargement.js
const fs = require('fs');
const assert = require('assert');

console.log("=== Testing Cafe Enlargement & Spacious Layout ===");

// 1. Verify cafeTables in main.js
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
const cafeTablesMatch = mainJs.match(/const cafeTables = (\[[\s\S]*?\]);/);
assert(cafeTablesMatch, "cafeTables must exist in main.js");
const cafeTables = eval(cafeTablesMatch[1]);

console.log(`Found ${cafeTables.length} cafe tables.`);
const expectedTableIds = ['billiard', 'tavla', 'xox', 'amiral', 'batak', 'batak4'];
assert.strictEqual(cafeTables.length, expectedTableIds.length, "Must have exactly 6 cafe tables");

expectedTableIds.forEach(id => {
    const table = cafeTables.find(t => t.id === id);
    assert(table, `Table ${id} must exist in cafeTables`);
    assert(table.x >= 20 && table.x + table.w <= 780, `Table ${id} x bounds [${table.x}, ${table.x + table.w}] within 800`);
    assert(table.y >= 75 && table.y + table.h <= 435, `Table ${id} y bounds [${table.y}, ${table.y + table.h}] within 500`);
});

// Check generous distance between Billiards and Tavla
const billiard = cafeTables.find(t => t.id === 'billiard');
const tavla = cafeTables.find(t => t.id === 'tavla');
const xox = cafeTables.find(t => t.id === 'xox');
const amiral = cafeTables.find(t => t.id === 'amiral');
const batak = cafeTables.find(t => t.id === 'batak');
const batak4 = cafeTables.find(t => t.id === 'batak4');

const billToTavlaGap = tavla.y - (billiard.y + billiard.h);
console.log(`Vertical gap between Billiards and Tavla: ${billToTavlaGap}px (Must be >= 75px)`);
assert(billToTavlaGap >= 75, `Walking gap between Billiards and Tavla must be >= 75px, got ${billToTavlaGap}`);

const billToXoxGap = xox.x - (billiard.x + billiard.w);
console.log(`Horizontal gap between Billiards and XOX: ${billToXoxGap}px (Must be >= 50px)`);
assert(billToXoxGap >= 50, `Horizontal walking gap between Billiards and XOX must be >= 50px, got ${billToXoxGap}`);

const batakGap = batak4.y - (batak.y + batak.h);
console.log(`Vertical gap between Batak 3 and Batak 4: ${batakGap}px (Must be >= 80px)`);
assert(batakGap >= 80, `Walking gap between Batak tables must be >= 80px, got ${batakGap}`);

// 2. Assert central corridor is 100% unobstructed
cafeTables.forEach(t => {
    const left = t.x;
    const right = t.x + t.w;
    const top = t.y;
    const bottom = t.y + t.h;
    
    // Central lower corridor [335, 465] x [200, 440]
    const xOverlap = !(right <= 335 || left >= 465);
    const yOverlap = !(bottom <= 200 || top >= 440);
    assert(!(xOverlap && yOverlap), `Table ${t.id} must not obstruct central corridor! Pos: [${left}..${right}, ${top}..${bottom}]`);
});
console.log("✓ Central corridor (130px+ wide from door to TV) is completely unobstructed!");

// 3. Verify seatRegistry.js
const seatJs = fs.readFileSync('public/js/seatRegistry.js', 'utf8');
const kafeSeatsMatch = seatJs.match(/kafe:\s*(\[[\s\S]*?\n\s*\]),/);
assert(kafeSeatsMatch, "STATIC_ROOM_SEATS.kafe must exist in seatRegistry.js");
const kafeSeats = eval(kafeSeatsMatch[1]);

console.log(`Found ${kafeSeats.length} seats in STATIC_ROOM_SEATS.kafe`);
assert(kafeSeats.length >= 16, `Expected at least 16 seats in kafe, got ${kafeSeats.length}`);

// Bar stools
const barStools = kafeSeats.filter(s => s.label === 'Bar Taburesi');
assert.strictEqual(barStools.length, 3, "Expected 3 bar stools");
assert.deepStrictEqual(barStools.map(s => s.x), [50, 110, 170], "Bar stools should be at x: 50, 110, 170");
assert(barStools.every(s => s.y === 64), "Bar stools should be at y: 64");

// Table seats
const groupedSeats = {};
kafeSeats.filter(s => s.tableId).forEach(s => {
    groupedSeats[s.tableId] = groupedSeats[s.tableId] || [];
    groupedSeats[s.tableId].push(s);
});

assert.strictEqual(groupedSeats['tavla'].length, 2, "Tavla should have 2 seats");
assert.strictEqual(groupedSeats['tavla'][0].x, 115);
assert.strictEqual(groupedSeats['xox'].length, 2, "XOX should have 2 seats");
assert.strictEqual(groupedSeats['xox'][0].x, 282);
assert.strictEqual(groupedSeats['amiral'].length, 2, "Amiral should have 2 seats");
assert.strictEqual(groupedSeats['amiral'][0].x, 522);
assert.strictEqual(groupedSeats['batak'].length, 3, "Batak 3p should have 3 seats");
assert.strictEqual(groupedSeats['batak'][0].x, 697);
assert.strictEqual(groupedSeats['batak4'].length, 4, "Batak 4p should have 4 seats");
assert.strictEqual(groupedSeats['batak4'][0].x, 697);

console.log("✓ All Kafe seats perfectly aligned with new table coordinates and bar layout!");

// 4. Verify worldRenderer.js static rendering & features
const worldJs = fs.readFileSync('public/js/worldRenderer.js', 'utf8');
assert(worldJs.includes("bctx.roundRect(615, 88, 165, 360, 14)"), "Batak rug must be at 615, 88, 165, 360");
assert(worldJs.includes("drawVenueTV(ctx, 340, 10, 120, 65)"), "TV must be centered at 340, 10, 120, 65");
assert(worldJs.includes("[[215, 435], [585, 435]]"), "Potted plants should be rendered at (215, 435) and (585, 435)");
assert(worldJs.includes("Büyük Panoramik Kemerli Pencereler"), "Must include panoramic arched windows");
assert(worldJs.includes("drawExitDoor(bctx, width / 2 - 35, height - 65, \"🚪 MEYDAN\", 70, 60)"), "Exit door must be rendered");
assert(worldJs.includes("Dinlenme & Okuma Köşesi"), "Must include reading / lounge corner detail");

// 5. Run existing test_xox_amiral.js test
require('./test_xox_amiral.js');

console.log("\n🎉 ALL CAFE ENLARGEMENT & SPATIAL TESTS PASSED WITH 100% SUCCESS!");
