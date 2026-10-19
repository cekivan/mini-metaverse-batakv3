// scratch/test_curly_hair_and_overalls.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const config = require('../src/config');

console.log("=== TESTING CURLY BROWN HAIR & BLUE WORKER OVERALLS ===");

// 1. Verify WARDROBE_ITEM_PRICES
assert.strictEqual(config.WARDROBE_ITEM_PRICES['hats_hair_curly_brown'], 290, "hats_hair_curly_brown price must be 290");
<<<<<<< HEAD
<<<<<<< HEAD
assert.strictEqual(config.WARDROBE_ITEM_PRICES['shirts_overalls_blue'], 560, "shirts_overalls_blue price must be 560");
console.log("✅ Config prices verified: hats_hair_curly_brown (290 TL), shirts_overalls_blue (560 TL)");
=======
assert.strictEqual(config.WARDROBE_ITEM_PRICES['shirts_overalls_blue'], 280, "shirts_overalls_blue price must be 280");
console.log("✅ Config prices verified: hats_hair_curly_brown (290 TL), shirts_overalls_blue (280 TL)");
>>>>>>> 1970266af90dc7109f9dabca9189fef5685ad2db
=======
assert.strictEqual(config.WARDROBE_ITEM_PRICES['shirts_overalls_blue'], 280, "shirts_overalls_blue price must be 280");
console.log("✅ Config prices verified: hats_hair_curly_brown (290 TL), shirts_overalls_blue (280 TL)");
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b

// 2. Verify wardrobe.js catalog
const wardrobeCode = fs.readFileSync(path.join(__dirname, '../public/js/wardrobe.js'), 'utf8');
assert.ok(wardrobeCode.includes("id: 'hair_curly_brown'"), "hair_curly_brown must be in wardrobe catalog");
assert.ok(wardrobeCode.includes("id: 'overalls_blue'"), "overalls_blue must be in wardrobe catalog");
assert.ok(wardrobeCode.includes("Kıvırcık Kahverengi Saç"), "Kıvırcık Kahverengi Saç title present");
assert.ok(wardrobeCode.includes("Mavi İşçi Tulumu"), "Mavi İşçi Tulumu title present");
console.log("✅ Wardrobe catalog contains hair_curly_brown and overalls_blue!");

// 3. Mock Canvas 2D Context for rendering test
class MockCanvasContext {
    constructor() {
        this.commands = [];
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.lineWidth = 1;
    }
    save() { this.commands.push('save'); }
    restore() { this.commands.push('restore'); }
    translate(x, y) { this.commands.push(`translate(${x},${y})`); }
    scale(x, y) { this.commands.push(`scale(${x},${y})`); }
    rotate(angle) { this.commands.push(`rotate(${angle})`); }
    beginPath() { this.commands.push('beginPath'); }
    closePath() { this.commands.push('closePath'); }
    moveTo(x, y) { this.commands.push(`moveTo(${x},${y})`); }
    lineTo(x, y) { this.commands.push(`lineTo(${x},${y})`); }
    quadraticCurveTo(cx, cy, x, y) { this.commands.push(`quadraticCurveTo(${cx},${cy},${x},${y})`); }
    arc(x, y, r, sa, ea) { this.commands.push(`arc(${x},${y},${r})`); }
    ellipse(x, y, rx, ry, rot, sa, ea) { this.commands.push(`ellipse(${x},${y},${rx},${ry})`); }
    fillRect(x, y, w, h) { this.commands.push(`fillRect(${x},${y},${w},${h})`); }
    strokeRect(x, y, w, h) { this.commands.push(`strokeRect(${x},${y},${w},${h})`); }
    roundRect(x, y, w, h, radii) { this.commands.push(`roundRect(${x},${y},${w},${h})`); }
    fill() { this.commands.push('fill'); }
    stroke() { this.commands.push('stroke'); }
}

// 4. Test rendering logic in avatarRenderer.js
const rendererCode = fs.readFileSync(path.join(__dirname, '../public/js/avatarRenderer.js'), 'utf8');

// Create a sandbox to run avatarRenderer functions
const vm = require('vm');
const sandbox = {
    window: { myGender: 'female', myId: 'test_user' },
    document: null,
    Math: Math,
    parseInt: parseInt,
    console: console
};
vm.createContext(sandbox);

// Run helper functions from avatarRenderer
vm.runInContext(rendererCode, sandbox);

assert.strictEqual(typeof sandbox.isFemaleAvatar, 'function', "isFemaleAvatar must be a function");

// Test isFemaleAvatar with curly hair
let isFem = sandbox.isFemaleAvatar({ hat: 'hair_curly_brown' }, null, 'hair_curly_brown');
assert.strictEqual(isFem, true, "Female character with hair_curly_brown must be recognized as female");

// Test 8-way rendering for both female and male avatars wearing curly brown hair & blue overalls
const directions = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];

for (const dir of directions) {
    const mockCtx = new MockCanvasContext();
    
    // Test drawAvatarHairAndHats for hair_curly_brown
    sandbox.drawAvatarHairAndHats(mockCtx, 100, 100, 'hair_curly_brown', dir);
    assert.ok(mockCtx.commands.length > 5, `hair_curly_brown rendering must generate drawing commands for facing ${dir}`);

    // Test drawAvatarBodyAndClothes for overalls_blue (female)
    const mockCtx2 = new MockCanvasContext();
    sandbox.drawAvatarBodyAndClothes(mockCtx2, 100, 100, 'overalls_blue', '#ffd1a4', dir, true);
    assert.ok(mockCtx2.commands.length > 5, `overalls_blue (female) must generate drawing commands for facing ${dir}`);

    // Test drawAvatarBodyAndClothes for overalls_blue (male)
    const mockCtx3 = new MockCanvasContext();
    sandbox.drawAvatarBodyAndClothes(mockCtx3, 100, 100, 'overalls_blue', '#ffd1a4', dir, false);
    assert.ok(mockCtx3.commands.length > 5, `overalls_blue (male) must generate drawing commands for facing ${dir}`);

    // Test drawAvatarLegsAndShoes with denim pants color
    const mockCtx4 = new MockCanvasContext();
    sandbox.drawAvatarLegsAndShoes(mockCtx4, 100, 100, 0, '#ffd1a4', 'boots', false, false, dir, true, '#1e40af');
    assert.ok(mockCtx4.commands.length > 5, `Legs and shoes with denim overalls pants must generate commands for facing ${dir}`);
}

console.log("✅ 8-way isometric rendering of hair_curly_brown and overalls_blue verified in all directions!");
console.log("\n🎉 ALL TESTS FOR CURLY BROWN HAIR & BLUE WORKER OVERALLS PASSED! 🎉\n");
