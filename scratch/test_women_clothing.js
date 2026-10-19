const config = require('../src/config');
const fs = require('fs');

console.log("Checking women clothing items in config and wardrobe:");

// Load wardrobe code
const wardrobeCode = fs.readFileSync('public/js/wardrobe.js', 'utf8');

// Extract catalog IDs
const newShirts = [
    'dress_emerald', 'dress_lavender', 'dress_bridal', 'outfit_goth',
    'outfit_business', 'outfit_boho', 'outfit_sporty', 'dress_vintage_polka',
    'dress_ocean_blue', 'outfit_turtleneck_skirt'
];

const newHats = [
    'hair_blonde_curls', 'hair_bun_chopsticks', 'hair_redhead_wavy', 'hair_pigtails_ribbon'
];

const newShoes = [
    'heels_gold', 'boots_thigh_high', 'sandals_gladiator'
];

// 1. Verify shirts
newShirts.forEach(id => {
    let priceKey = `shirts_${id}`;
    if (config.WARDROBE_ITEM_PRICES[priceKey] === undefined) {
        throw new Error(`Missing price for ${priceKey} in config.js`);
    }
    if (!wardrobeCode.includes(`id: '${id}'`)) {
        throw new Error(`Missing item ${id} in wardrobe.js`);
    }
    console.log(`✓ Shirt/Dress verified: ${id} -> ${config.WARDROBE_ITEM_PRICES[priceKey]} TL`);
});

// 2. Verify hats
newHats.forEach(id => {
    let priceKey = `hats_${id}`;
    if (config.WARDROBE_ITEM_PRICES[priceKey] === undefined) {
        throw new Error(`Missing price for ${priceKey} in config.js`);
    }
    if (!wardrobeCode.includes(`id: '${id}'`)) {
        throw new Error(`Missing hat ${id} in wardrobe.js`);
    }
    console.log(`✓ Hairstyle verified: ${id} -> ${config.WARDROBE_ITEM_PRICES[priceKey]} TL`);
});

// 3. Verify shoes
newShoes.forEach(id => {
    let priceKey = `shoes_${id}`;
    if (config.WARDROBE_ITEM_PRICES[priceKey] === undefined) {
        throw new Error(`Missing price for ${priceKey} in config.js`);
    }
    if (!wardrobeCode.includes(`id: '${id}'`)) {
        throw new Error(`Missing shoe ${id} in wardrobe.js`);
    }
    console.log(`✓ Shoe verified: ${id} -> ${config.WARDROBE_ITEM_PRICES[priceKey]} TL`);
});

console.log("\nALL 17 NEW WOMEN'S WARDROBE ITEMS ARE FULLY VERIFIED & INTEGRATED!");
