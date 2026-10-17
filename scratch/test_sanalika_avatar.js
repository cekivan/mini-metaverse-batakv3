// scratch/test_sanalika_avatar.js
const assert = require('assert');
const fs = require('fs');

console.log("=== TEST 1: Terminology Check (No 'Sanalika' in user-facing texts) ===");
const wardrobeSrc = fs.readFileSync('public/js/wardrobe.js', 'utf8');
const indexHtmlSrc = fs.readFileSync('public/index.html', 'utf8');
const avatarRendererSrc = fs.readFileSync('public/js/avatarRenderer.js', 'utf8');

// Assert HTML doesn't show Sanalika in any visible text
const visibleTextMatch = indexHtmlSrc.match(/>[^<]*sanalika[^<]*</i);
assert(!visibleTextMatch, `Visible Sanalika text found in HTML: ${visibleTextMatch}`);
console.log("✔ public/index.html has zero visible 'Sanalika' text!");

// Parse catalog from wardrobe.js
let renderedGridHtml = "";
const mockGrid = {
    set innerHTML(val) { renderedGridHtml = val; },
    get innerHTML() { return renderedGridHtml; }
};
const mockElem = {
    classList: { add: () => {}, remove: () => {} },
    style: {},
    addEventListener: () => {}
};
const mockGlobal = {
    document: {
        getElementById: (id) => {
            if (id === 'wardrobeActiveGrid') return mockGrid;
            return mockElem;
        },
        querySelectorAll: () => []
    },
    window: {
        addEventListener: () => {}
    },
    socket: { on: () => {}, emit: () => {} },
    players: { myId: {} },
    myId: 'myId'
};

const vm = require('vm');
const context = vm.createContext(mockGlobal);
vm.runInContext(wardrobeSrc, context);

const catalog = vm.runInContext('WARDROBE_CATALOG', context);
assert(catalog, "WARDROBE_CATALOG must exist");
assert(catalog.outfits, "WARDROBE_CATALOG.outfits must exist");
assert(catalog.tshirts, "WARDROBE_CATALOG.tshirts must exist");
assert(catalog.pants, "WARDROBE_CATALOG.pants must exist");
console.log(`✔ Found 3 clothing categories: ${catalog.outfits.length} outfits, ${catalog.tshirts.length} tshirts, ${catalog.pants.length} pants.`);

// Check no item name contains 'sanalika'
for (let cat in catalog) {
    catalog[cat].forEach(item => {
        if (item.name && /sanalika/i.test(item.name)) {
            assert.fail(`Item name in category ${cat} contains 'Sanalika': ${item.name}`);
        }
    });
}
console.log("✔ No item name in WARDROBE_CATALOG contains the word 'Sanalika'!");

// Check 'Divalar Yemek Yapmaz' t-shirt exists
const divalarTee = catalog.tshirts.find(t => t.id === 'tshirt_divalar');
assert(divalarTee, "tshirt_divalar must exist in tshirts catalog");
assert(divalarTee.name.includes("Divalar Yemek Yapmaz"), "tshirt_divalar name must include 'Divalar Yemek Yapmaz'");
console.log("✔ Found 'Divalar Yemek Yapmaz' t-shirt:", divalarTee.name);

console.log("\n=== TEST 2: Model-Based Filtering in Wardrobe ===");
// When 2.5D İzometrik model is active:
vm.runInContext("selectAvatarBodyModel('sanalika_v2')", context);
vm.runInContext("switchWardrobeTab('hats')", context);
let gridHtml = renderedGridHtml;
assert(gridHtml.includes("Kızıl Rasta &amp; Bandana") || gridHtml.includes("Kızıl Rasta & Bandana"), "2.5D rasta must appear when sanalika_v2 is active");
assert(!gridHtml.includes("Kırmızı Bere"), "Classic bere must NOT appear when sanalika_v2 is active");
assert(!gridHtml.includes("Kıraathane Kasketi"), "Classic kasket must NOT appear when sanalika_v2 is active");
assert(!gridHtml.includes("Osmanlı Fesi"), "Classic fes must NOT appear when sanalika_v2 is active");
console.log("✔ When 2.5D active: only 2.5D and 'all' hats appear, classic hats are hidden!");

// When Klasik model is active:
vm.runInContext("selectAvatarBodyModel('classic')", context);
vm.runInContext("switchWardrobeTab('hats')", context);
gridHtml = renderedGridHtml;
assert(gridHtml.includes("Kırmızı Bere"), "Classic bere must appear when classic is active");
assert(gridHtml.includes("Kıraathane Kasketi"), "Classic kasket must appear when classic is active");
assert(!gridHtml.includes("Kızıl Rasta"), "2.5D dreadlocks must NOT appear when classic is active");
console.log("✔ When Klasik active: only classic and 'all' hats appear, 2.5D hats are hidden!");

// Outfits tab filter test
vm.runInContext("selectAvatarBodyModel('sanalika_v2')", context);
vm.runInContext("switchWardrobeTab('outfits')", context);
gridHtml = renderedGridHtml;
assert(gridHtml.includes("Siyah Tişört &amp; Kargo Seti") || gridHtml.includes("Siyah Tişört & Kargo Seti"), "outfit_camo_set must be visible in 2.5D");
assert(!gridHtml.includes("Zarif Siyah Gece Elbisesi"), "Classic evening dress must NOT be visible in 2.5D");
assert(!gridHtml.includes("Masalsı Beyaz Gelinlik"), "Classic bridal dress must NOT be visible in 2.5D");
console.log("✔ When 2.5D active: only universal outfits appear, classic dresses are hidden!");

// Sanitization test
let testAv = { hat: 'bere', shoes: 'heels', outfit: 'dress_black', model: 'sanalika_v2' };
vm.runInContext(`sanitizeAvatarForModel(${JSON.stringify(testAv)}, 'sanalika_v2')`, context);
const sanitized = vm.runInContext(`let tmp = ${JSON.stringify(testAv)}; sanitizeAvatarForModel(tmp, 'sanalika_v2'); tmp`, context);
assert.strictEqual(sanitized.hat, 'hair_sanalika_dreadlocks', "Incompatible hat should auto-sanitize to 2.5D dreadlocks");
assert.strictEqual(sanitized.shoes, 'sanalika_white_sneakers', "Incompatible shoe should auto-sanitize to 2.5D sneakers");
assert.strictEqual(sanitized.outfit, null, "Incompatible dress outfit should be cleared");
assert.strictEqual(sanitized.shirt, 'tshirt_divalar', "Incompatible outfit reset should equip tshirt_divalar");
assert.strictEqual(sanitized.pants, 'pants_camo_cargo', "Incompatible outfit reset should equip pants_camo_cargo");
console.log("✔ Auto-sanitization successfully adapts incompatible clothes on model switch!");

console.log("\n=== TEST 3: Avatar 2.5D Renderer (8 Angles & Features) ===");
// Mock canvas 2D context
function createMockCtx() {
    return {
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        quadraticCurveTo: () => {},
        arc: () => {},
        ellipse: () => {},
        roundRect: () => {},
        strokeRect: () => {},
        fillRect: () => {},
        stroke: () => {},
        fill: () => {},
        fillText: () => {},
        measureText: () => ({ width: 10 }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} })
    };
}

const mockCtx = createMockCtx();
const rendererSandbox = {
    window: {},
    document: mockGlobal.document,
    drawRealistic25dAvatar: null,
    drawHeldItem: null,
    getRealisticSkinPalette: null
};
vm.createContext(rendererSandbox);
vm.runInContext(avatarRendererSrc, rendererSandbox);

const drawAvatar = vm.runInContext('drawRealistic25dAvatar', rendererSandbox);
const drawHeld = vm.runInContext('drawHeldItem', rendererSandbox);
assert(typeof drawAvatar === 'function', "drawRealistic25dAvatar must be defined");
assert(typeof drawHeld === 'function', "drawHeldItem must be defined");

const angles = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
const testPlayer = {
    skinColor: '#ffd1a4',
    hat: 'hair_sanalika_dreadlocks',
    face: 'none',
    shirt: 'tshirt_divalar',
    pants: 'pants_jeans_street',
    outfit: null,
    shoes: 'sanalika_white_sneakers',
    heldItem: 'none'
};

angles.forEach(ang => {
    drawAvatar(mockCtx, 100, 100, testPlayer, ang, false, 0, false);
    console.log(`✔ Angle '${ang}' rendered smoothly without errors!`);
});

console.log("\n=== TEST 4: Hand Items (Props) in 2.5D Mode ===");
const propsToTest = ['baglama', 'gitar', 'sirtcantasi', 'tespih', 'balon', 'cay', 'nargile', 'olta', 'kupa', 'asagold', 'gazoz', 'kahve'];
propsToTest.forEach(prop => {
    angles.forEach(ang => {
        drawHeld(mockCtx, 100, 100, prop, false, ang, true);
    });
    console.log(`✔ Prop '${prop}' rendered across all 8 angles in 2.5D mode!`);
});

console.log("\nALL TESTS PASSED SUCCESSFULLY! 🎉");
