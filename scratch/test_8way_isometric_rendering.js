// scratch/test_8way_isometric_rendering.js
const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log("=== 8 AÇILI İZOMETRİK MODELLEME VE ÇİZİM DOĞRULAMA TESTİ ===");

function createMockCtx() {
    let callLog = [];
    return {
        save: () => callLog.push('save'),
        restore: () => callLog.push('restore'),
        translate: (x, y) => callLog.push(`translate(${x},${y})`),
        rotate: (r) => callLog.push(`rotate(${r})`),
        scale: (x, y) => callLog.push(`scale(${x},${y})`),
        beginPath: () => callLog.push('beginPath'),
        closePath: () => callLog.push('closePath'),
        moveTo: (x, y) => callLog.push(`moveTo(${x},${y})`),
        lineTo: (x, y) => callLog.push(`lineTo(${x},${y})`),
        arc: (...args) => callLog.push('arc'),
        ellipse: (...args) => callLog.push('ellipse'),
        roundRect: (...args) => callLog.push('roundRect'),
        fillRect: (...args) => callLog.push('fillRect'),
        strokeRect: (...args) => callLog.push('strokeRect'),
        fill: () => callLog.push('fill'),
        stroke: () => callLog.push('stroke'),
        quadraticCurveTo: (...args) => callLog.push('quadraticCurveTo'),
        bezierCurveTo: (...args) => callLog.push('bezierCurveTo'),
        measureText: (txt) => ({ width: (txt || '').length * 6 }),
        fillText: (...args) => callLog.push('fillText'),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        getLog: () => callLog,
        clearLog: () => { callLog = []; }
    };
}

const rendererCode = fs.readFileSync('public/js/avatarRenderer.js', 'utf8');

const sandbox = {
    console,
    Math,
    Date,
    parseInt,
    document: {
        getElementById: () => ({
            getContext: () => createMockCtx(),
            width: 300,
            height: 300
        })
    },
    window: {},
    myId: 'user_e2e',
    myFacing: 'down',
    walkCycle: 0,
    keys: { w: false, a: false, s: false, d: false },
    currentRoom: 'sokak',
    activeChatBubbles: {},
    activePlayerEmojis: {},
    findNearestSittableSeat: () => null,
    isWardrobeOpen: false,
    previewAvatar: null,
    myAvatar: { hat: 'fes', color: 'polo', skinColor: '#ffd1a4', shoes: 'classic', heldItem: 'sirtcantasi' }
};

vm.createContext(sandbox);
vm.runInContext(rendererCode, sandbox);

const mockCtx = createMockCtx();
const directions = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];

console.log("\n1. Test: normalize8WayFacing()");
const testMappings = {
    'down': 'down',
    's': 'down',
    'south': 'down',
    'on': 'down',
    'down-right': 'down-right',
    'se': 'down-right',
    'sag-ileri': 'down-right',
    'right': 'right',
    'e': 'right',
    'sag': 'right',
    'up-right': 'up-right',
    'ne': 'up-right',
    'sag-geri': 'up-right',
    'up': 'up',
    'n': 'up',
    'arka': 'up',
    'up-left': 'up-left',
    'nw': 'up-left',
    'sol-geri': 'up-left',
    'left': 'left',
    'w': 'left',
    'sol': 'left',
    'down-left': 'down-left',
    'sw': 'down-left',
    'sol-ileri': 'down-left'
};

for (const [input, expected] of Object.entries(testMappings)) {
    const res = sandbox.normalize8WayFacing(input);
    assert.strictEqual(res, expected, `normalize8WayFacing failed for input: ${input}`);
}
console.log("✔ normalize8WayFacing tüm 8 açı ve takma adlar için doğru çalışıyor.");

console.log("\n2. Test: Ayakkabılar (drawSingleShoe) 8 Yönde Çizim");
const shoes = ['classic', 'boots', 'heels', 'flats', 'heels_gold', 'boots_thigh_high', 'sandals_gladiator', 'none', 'sneakers'];
shoes.forEach(shoe => {
    directions.forEach(dir => {
        sandbox.drawSingleShoe(mockCtx, 100, 100, shoe, '#ffd1a4', 0, false, dir);
    });
});
console.log(`✔ ${shoes.length} ayakkabı türü 8 açının tamamında hatasız çizildi.`);

console.log("\n3. Test: Bacaklar & Yürüyüş/Oturma (drawAvatarLegsAndShoes) 8 Yönde Çizim");
directions.forEach(dir => {
    // Ayakta durma
    sandbox.drawAvatarLegsAndShoes(mockCtx, 100, 100, 0, '#ffd1a4', 'classic', false, false, dir);
    // Yürüme (legSwing ile)
    sandbox.drawAvatarLegsAndShoes(mockCtx, 100, 100, 4.2, '#ffd1a4', 'boots', false, false, dir);
    // Oturma
    sandbox.drawAvatarLegsAndShoes(mockCtx, 100, 100, 0, '#ffd1a4', 'sneakers', false, true, dir);
    // Etek ile oturma
    sandbox.drawAvatarLegsAndShoes(mockCtx, 100, 100, 0, '#ffd1a4', 'heels', true, true, dir);
});
console.log("✔ Bacaklar ve oturma pozları 8 açının tamamında hatasız çizildi.");

console.log("\n4. Test: Kıyafetler (drawAvatarBodyAndClothes) 8 Yönde Çizim");
const clothes = [
    'dress_emerald', 'dress_lavender', 'dress_bridal', 'outfit_goth',
    'outfit_business', 'outfit_boho', 'outfit_sporty', 'dress_vintage_polka',
    'dress_ocean_blue', 'outfit_turtleneck_skirt', 'dress_pink', 'dress_black',
    'dress_red', 'skirt_crop', 'skirt_denim', 'polo', 'hoodie', 'leather',
    '#3b82f6', '#10b981', '#f59e0b'
];

clothes.forEach(clothe => {
    directions.forEach(dir => {
        sandbox.drawAvatarBodyAndClothes(mockCtx, 100, 100, clothe, '#ffd1a4', dir);
    });
});
console.log(`✔ ${clothes.length} farklı kıyafet & elbise 8 açının tamamında hatasız çizildi.`);

console.log("\n5. Test: Şapkalar & Saçlar (drawAvatarHairAndHats) 8 Yönde Çizim");
const hats = [
    'bere', 'fes', 'kasket', 'cowboy', 'hair_long', 'hair_wavy',
    'hair_ponytail', 'hair_braids', 'hair_bob', 'hair_hijab',
    'beret_pink', 'crown', 'hair_blonde_curls', 'hair_bun_chopsticks',
    'hair_redhead_wavy', 'hair_pigtails_ribbon', 'korsan', 'sihirbaz',
    'kulaklik', 'none'
];

hats.forEach(hat => {
    directions.forEach(dir => {
        sandbox.drawAvatarHairAndHats(mockCtx, 100, 100, hat, dir);
    });
});
console.log(`✔ ${hats.length} farklı saç ve şapka modeli 8 açının tamamında hatasız çizildi.`);

console.log("\n6. Test: Yüz & Gözler (drawAvatarFaceAndEyes) 8 Yönde Çizim & Arkada Gizleme");
const faces = ['none', 'mustache', 'sunglasses', 'beard'];

faces.forEach(face => {
    directions.forEach(dir => {
        let testCtx = createMockCtx();
        sandbox.drawAvatarFaceAndEyes(testCtx, 100, 100, face, 0, 0, dir);
        let logs = testCtx.getLog();
        if (dir === 'up' || dir === 'up-right' || dir === 'up-left') {
            assert.strictEqual(logs.length, 0, `HATA: Arkaya bakarken (${dir}) yüz çizilmemeli!`);
        } else {
            assert.ok(logs.length > 0, `Öne/yana bakarken (${dir}) yüz özellikleri çizilmeli!`);
        }
    });
});
console.log("✔ Yüz ve aksesuarlar arkaya dönüldüğünde otomatik gizleniyor, öne ve yanlara dönüldüğünde izometrik olarak çiziliyor.");

console.log("\n7. Test: El Eşyaları (drawHeldItem) 8 Yönde Çizim");
const items = [
    'tespih', 'balon', 'cay', 'olta', 'gazoz', 'nargile', 'baglama',
    'asagold', 'kahve', 'kupa', 'gitar', 'limonata', 'lemonade',
    'cocktail_coconut', 'cocktail_pineapple', 'cocktail_mojito', 'cocktail_sunset',
    'sirtcantasi'
];

items.forEach(item => {
    directions.forEach(dir => {
        sandbox.drawHeldItem(mockCtx, 100, 100, item, false, dir);
        sandbox.drawHeldItem(mockCtx, 100, 100, item, true, dir); // preview mode
    });
});
console.log(`✔ ${items.length} farklı el eşyası ve sırt çantası 8 açının tamamında hatasız çizildi.`);

console.log("\n8. Test: Komple Oyuncu Çizim Motoru (drawAnimatedPlayer) 8 Yönde");
sandbox.ctx = mockCtx;

directions.forEach(dir => {
    // Normal ayakta duran oyuncu
    let pStand = { x: 100, y: 100, name: 'Ali', facing: dir, color: 'hoodie', hat: 'kasket', heldItem: 'gitar' };
    sandbox.drawAnimatedPlayer(pStand, 'p1');

    // Oturan oyuncu
    let pSit = { x: 100, y: 100, name: 'Veli', action: 'sitting', facing: dir, color: 'dress_pink', hat: 'beret_pink', heldItem: 'kahve' };
    sandbox.drawAnimatedPlayer(pSit, 'p2');

    // Balık tutan oyuncu
    let pFish = { x: 100, y: 100, name: 'Ahmet', isFishing: true, facing: dir, color: 'polo', hat: 'bere' };
    sandbox.drawAnimatedPlayer(pFish, 'p3');

    // At binen oyuncu
    let pHorse = { x: 100, y: 100, name: 'Süvari', hasHorse: true, isMoving: true, facing: dir, color: 'leather', hat: 'cowboy' };
    sandbox.drawAnimatedPlayer(pHorse, 'p4');
});
console.log("✔ drawAnimatedPlayer tüm 8 açıda ayakta, otururken, balık tutarken ve ata binerken mükemmel çizildi.");

console.log("\n=======================================================");
console.log(" TÜM 8 AÇILI İZOMETRİK MODELLEME TESTLERİ BAŞARIYLA GEÇTİ!");
console.log("=======================================================\n");
