const assert = require('assert');
const path = require('path');
const config = require('../src/config');

console.log("=== TEST: Wardrobe and Classic 2 Integration ===");

// 1. Check price entries in config.WARDROBE_ITEM_PRICES
const requiredPriceKeys = [
    'watches_none',
    'watches_watch_gold_rolex',
    'watches_watch_leather_classic',
    'watches_watch_cyber_sport',
    'pants_pants_classic_jeans',
    'pants_pants_classic_black',
    'pants_pants_classic_beige',
    'pants_pants_classic_cargo_olive',
    'pants_pants_classic_white_skirt',
    'outfits_outfit_c2_gentleman',
    'outfits_outfit_c2_street_cool',
    'outfits_outfit_c2_casual_polo',
    'outfits_outfit_c2_femme_chic'
];

requiredPriceKeys.forEach(key => {
    assert(config.WARDROBE_ITEM_PRICES[key] !== undefined, `Missing price for ${key}`);
});
console.log("✔ All required prices exist in config.WARDROBE_ITEM_PRICES");

// 2. Load wardrobe.js in a mocked browser context to verify catalog & filter logic
const fs = require('fs');
const wardrobeCode = fs.readFileSync(path.resolve(__dirname, '../public/js/wardrobe.js'), 'utf8');

// Mock browser objects
const mockWindow = {
    addEventListener: () => {},
    myGender: 'male',
    selectedGender: 'male'
};
const mockDoc = {
    querySelectorAll: () => [],
    getElementById: () => ({ addEventListener: () => {}, classList: { add: () => {}, remove: () => {} }, style: {} })
};
const mockSocket = {
    on: () => {},
    emit: () => {}
};

const context = {
    window: mockWindow,
    document: mockDoc,
    socket: mockSocket,
    players: {},
    myId: 'socket_123',
    requestAnimationFrame: () => {},
    console: console
};

const vm = require('vm');
vm.createContext(context);
vm.runInContext(wardrobeCode, context);

const catalog = vm.runInContext('WARDROBE_CATALOG', context);
assert(catalog, "WARDROBE_CATALOG not defined");

// 3. Verify the 5 bugged tshirts are ONLY for sanalika_v2
const buggedTshirts = [
    'tshirt_divalar',
    'tshirt_black_fitted',
    'tshirt_hoodie_purple',
    'tshirt_polo_striped',
    'tshirt_leather_jacket'
];

buggedTshirts.forEach(id => {
    const item = catalog.tshirts.find(t => t.id === id);
    assert(item, `Tshirt ${id} not found in catalog`);
    assert.strictEqual(item.model, 'sanalika_v2', `${id} should be model 'sanalika_v2' but is ${item.model}`);
});
console.log("✔ The 5 bugged tshirts are strictly isolated to sanalika_v2");

// 4. Verify 2.5D pants vs classic pants separation
const isoPants = [
    'pants_camo_cargo',
    'pants_jeans_street',
    'pants_chino_beige',
    'pants_jogger_black',
    'pants_skirt_crop',
    'pants_skirt_denim'
];

isoPants.forEach(id => {
    const item = catalog.pants.find(p => p.id === id);
    assert(item, `Pants ${id} not found in catalog`);
    assert.strictEqual(item.model, 'sanalika_v2', `${id} should be model 'sanalika_v2' but is ${item.model}`);
});
console.log("✔ 2.5D pants are separated and isolated to sanalika_v2");

const classicPants = [
    'pants_classic_jeans',
    'pants_classic_black',
    'pants_classic_beige',
    'pants_classic_cargo_olive',
    'pants_classic_white_skirt'
];

classicPants.forEach(id => {
    const item = catalog.pants.find(p => p.id === id);
    assert(item, `Classic pants ${id} not found in catalog`);
    assert(Array.isArray(item.model) && item.model.includes('classic') && item.model.includes('classic_2'),
        `${id} should support classic and classic_2`);
});
console.log("✔ Classic pants are available for classic and classic_2");

// 5. Verify watches category in catalog
assert(catalog.watches && catalog.watches.length >= 4, "Watches category missing or incomplete");
const watchIds = catalog.watches.map(w => w.id);
assert(watchIds.includes('none'));
assert(watchIds.includes('watch_gold_rolex'));
assert(watchIds.includes('watch_leather_classic'));
assert(watchIds.includes('watch_cyber_sport'));
console.log("✔ Watches category is present with gold rolex, leather classic, and cyber sport");

// 6. Verify Classic 2 exclusive outfits
const c2Outfits = [
    'outfit_c2_gentleman',
    'outfit_c2_street_cool',
    'outfit_c2_casual_polo',
    'outfit_c2_femme_chic'
];
c2Outfits.forEach(id => {
    const item = catalog.outfits.find(o => o.id === id);
    assert(item, `Classic 2 outfit ${id} not found in catalog`);
    assert.strictEqual(item.model, 'classic_2', `${id} should be model 'classic_2'`);
});
console.log("✔ Classic 2 outfits present and mapped to classic_2");

// 7. Verify model filtering function itemMatchesModel
const itemMatchesModel = vm.runInContext('itemMatchesModel', context);
assert(itemMatchesModel('all', 'classic') === true);
assert(itemMatchesModel('all', 'classic_2') === true);
assert(itemMatchesModel('sanalika_v2', 'classic') === false);
assert(itemMatchesModel('sanalika_v2', 'classic_2') === false);
assert(itemMatchesModel('sanalika_v2', 'sanalika_v2') === true);
assert(itemMatchesModel(['classic', 'classic_2'], 'classic') === true);
assert(itemMatchesModel(['classic', 'classic_2'], 'classic_2') === true);
assert(itemMatchesModel(['classic', 'classic_2'], 'sanalika_v2') === false);
assert(itemMatchesModel('classic_2', 'classic_2') === true);
assert(itemMatchesModel('classic_2', 'classic') === false);
console.log("✔ itemMatchesModel filters all models accurately");

console.log("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
