const fs = require('fs');

// Mock 2D Context
function createMockCtx() {
    return {
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        ellipse: () => {},
        roundRect: () => {},
        fillRect: () => {},
        strokeRect: () => {},
        fill: () => {},
        stroke: () => {},
        quadraticCurveTo: () => {},
        bezierCurveTo: () => {},
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1
    };
}

// Load avatarRenderer script into vm
const vm = require('vm');
const rendererCode = fs.readFileSync('public/js/avatarRenderer.js', 'utf8');

const sandbox = {
    console,
    Math,
    myId: 'test_user',
    players: { test_user: { name: 'Ayşe' } },
    myFacing: 'down',
    isWardrobeOpen: false,
    previewAvatar: null,
    myAvatar: { hat: 'none', color: '#3b82f6', skinColor: '#ffd1a4', shoes: 'flats' }
};

vm.createContext(sandbox);
vm.runInContext(rendererCode, sandbox);

const mockCtx = createMockCtx();

const dresses = [
    'dress_emerald', 'dress_lavender', 'dress_bridal', 'outfit_goth',
    'outfit_business', 'outfit_boho', 'outfit_sporty', 'dress_vintage_polka',
    'dress_ocean_blue', 'outfit_turtleneck_skirt'
];

console.log("Testing Avatar Canvas Render for Dresses:");
dresses.forEach(d => {
    sandbox.drawAvatarBodyAndClothes(mockCtx, 100, 100, d, '#ffd1a4');
    console.log(`✓ Render OK: ${d}`);
});

const hairs = [
    'hair_blonde_curls', 'hair_bun_chopsticks', 'hair_redhead_wavy', 'hair_pigtails_ribbon'
];

console.log("\nTesting Avatar Canvas Render for Hairstyles:");
hairs.forEach(h => {
    sandbox.drawAvatarHairAndHats(mockCtx, 100, 100, h, 'down');
    console.log(`✓ Render OK: ${h}`);
});

const shoes = [
    'heels_gold', 'boots_thigh_high', 'sandals_gladiator'
];

console.log("\nTesting Avatar Canvas Render for Shoes:");
shoes.forEach(s => {
    sandbox.drawSingleShoe(mockCtx, 100, 100, s, '#ffd1a4', 0, false);
    console.log(`✓ Render OK: ${s}`);
});

console.log("\nAll Canvas Graphics Rendered Successfully Without Errors!");
