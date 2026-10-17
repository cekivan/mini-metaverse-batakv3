// scratch/inspect_held_items.js
const fs = require('fs');

// Create mock 2D context that tracks bounding box and draw calls
function createMockCtx() {
    const draws = [];
    let curTransform = { x: 0, y: 0, rot: 0 };
    const transformStack = [];

    return {
        draws,
        save: () => transformStack.push({ ...curTransform }),
        restore: () => { if (transformStack.length) curTransform = transformStack.pop(); },
        translate: (x, y) => { curTransform.x += x; curTransform.y += y; },
        rotate: (r) => { curTransform.rot += r; },
        scale: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: (x, y) => draws.push({ type: 'move', x: x + curTransform.x, y: y + curTransform.y }),
        lineTo: (x, y) => draws.push({ type: 'line', x: x + curTransform.x, y: y + curTransform.y }),
        quadraticCurveTo: (cx, cy, x, y) => draws.push({ type: 'quad', x: x + curTransform.x, y: y + curTransform.y }),
        arc: (x, y, r) => draws.push({ type: 'arc', x: x + curTransform.x, y: y + curTransform.y, r }),
        ellipse: (x, y, rx, ry) => draws.push({ type: 'ellipse', x: x + curTransform.x, y: y + curTransform.y, rx, ry }),
        rect: (x, y, w, h) => draws.push({ type: 'rect', x: x + curTransform.x, y: y + curTransform.y, w, h }),
        fillRect: (x, y, w, h) => draws.push({ type: 'fillRect', x: x + curTransform.x, y: y + curTransform.y, w, h }),
        strokeRect: (x, y, w, h) => draws.push({ type: 'strokeRect', x: x + curTransform.x, y: y + curTransform.y, w, h }),
        roundRect: (x, y, w, h) => draws.push({ type: 'roundRect', x: x + curTransform.x, y: y + curTransform.y, w, h }),
        fill: () => {},
        stroke: () => {},
        fillText: (txt, x, y) => draws.push({ type: 'text', txt, x: x + curTransform.x, y: y + curTransform.y }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} })
    };
}

// Load avatarRenderer.js
const code = fs.readFileSync('public/js/avatarRenderer.js', 'utf8');

// Set up globals
const sandbox = {
    Math,
    Date,
    console,
    normalize8WayFacing: (f) => f || 'down',
    myId: '123',
    keys: {}
};

const fn = new Function('sandbox', `
    with (sandbox) {
        ${code}
        return { drawHeldItem };
    }
`);

const { drawHeldItem } = fn(sandbox);

const props = [
    'baglama', 'gitar', 'sirtcantasi', 'olta', 'tespih',
    'balon', 'cay', 'gazoz', 'kahve', 'kupa', 'asagold', 'nargile', 'limonata'
];
const angles = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];

console.log("Analyzing 2.5D Held Items coordinates across angles (pX=0, pY=0)...");
console.log("Expected Avatar 2.5D landmarks: Head: y ~ -19, Shoulders: y ~ -13.5, Chest: y ~ -7, Hands: y ~ -1, Waist: y ~ -2, Feet: y ~ +21\n");

props.forEach(prop => {
    console.log(`=== Prop: ${prop} ===`);
    angles.forEach(facing => {
        const ctx = createMockCtx();
        drawHeldItem(ctx, 0, 0, prop, false, facing, true);
        
        if (ctx.draws.length === 0) {
            console.log(`  [${facing}] ERROR: NOTHING DRAWN!`);
            return;
        }

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        ctx.draws.forEach(d => {
            const x = d.x !== undefined ? d.x : 0;
            const y = d.y !== undefined ? d.y : 0;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });

        console.log(`  [${facing}] count: ${ctx.draws.length}, X: [${minX.toFixed(1)}, ${maxX.toFixed(1)}], Y: [${minY.toFixed(1)}, ${maxY.toFixed(1)}]`);
    });
});
