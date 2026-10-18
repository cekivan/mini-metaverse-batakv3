const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=== TEST: Avatar Renderer Syntax and Classic 2 Functions ===");
const code = fs.readFileSync(path.resolve(__dirname, '../public/js/avatarRenderer.js'), 'utf8');

const mockCtx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    roundRect: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    setLineDash: () => {},
    measureText: () => ({ width: 10 }),
    fillText: () => {}
};

const context = {
    window: { previewFacing: 'down' },
    document: {
        getElementById: () => ({
            getContext: () => mockCtx,
            width: 160,
            height: 190
        })
    },
    isWardrobeOpen: true,
    previewAvatar: {
        model: 'classic_2',
        color: '#3b82f6',
        shirt: '#3b82f6',
        pants: 'pants_classic_jeans',
        watch: 'watch_gold_rolex',
        hat: 'bere',
        face: 'none',
        shoes: 'sneakers'
    },
    myAvatar: {
        model: 'classic_2',
        watch: 'watch_gold_rolex'
    },
    myId: 'socket_1',
    myFacing: 'down',
    keys: {},
    Date: Date,
    Math: Math,
    console: console,
    requestAnimationFrame: () => {}
};

vm.createContext(context);
vm.runInContext(code, context);

const drawClassic2Avatar = vm.runInContext('drawClassic2Avatar', context);
if (typeof drawClassic2Avatar !== 'function') {
    throw new Error("drawClassic2Avatar is not a function!");
}

// Test rendering across all 8 directions
const directions = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
const testOutfits = ['outfit_c2_gentleman', 'outfit_c2_street_cool', 'outfit_c2_casual_polo', 'outfit_c2_femme_chic', null];
const testWatches = ['watch_gold_rolex', 'watch_leather_classic', 'watch_cyber_sport', 'none'];

for (let dir of directions) {
    for (let outfit of testOutfits) {
        for (let watch of testWatches) {
            let p = {
                model: 'classic_2',
                x: 100,
                y: 100,
                color: outfit || '#3b82f6',
                shirt: '#3b82f6',
                pants: 'pants_classic_jeans',
                outfit: outfit,
                watch: watch,
                hat: 'bere',
                face: 'none',
                shoes: 'sneakers',
                skinColor: '#ffd1a4'
            };
            // Test standing
            drawClassic2Avatar(mockCtx, 100, 100, p, dir, false, 0, 0, false, false);
            // Test walking
            drawClassic2Avatar(mockCtx, 100, 100, p, dir, false, 3.5, 1.2, true, false);
            // Test sitting
            drawClassic2Avatar(mockCtx, 100, 100, p, dir, true, 0, 0, false, false);
        }
    }
}

console.log("✔ drawClassic2Avatar executed successfully across all 8 directions, outfits, watches, and states!");

// Test drawAvatarPreview
const drawAvatarPreview = vm.runInContext('drawAvatarPreview', context);
drawAvatarPreview();
console.log("✔ drawAvatarPreview executed successfully with classic_2!");

console.log("\nALL RENDERER TESTS PASSED!");
