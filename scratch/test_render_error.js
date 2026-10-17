// scratch/test_render_error.js
const fs = require('fs');

// Create mock 2D context
const ctxMock = new Proxy({}, {
    get(target, prop) {
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
            return () => ({ addColorStop: () => {} });
        }
        return (...args) => {};
    },
    set(target, prop, value) {
        target[prop] = value;
        return true;
    }
});

global.window = global;
global.isNightMode = false;
global.canvasMouseX = 0;
global.canvasMouseY = 0;
global.canvas = { width: 800, height: 600 };
global.ctx = ctxMock;

// Load worldRenderer.js
const code = fs.readFileSync('public/js/worldRenderer.js', 'utf8');

try {
    eval(code);
    console.log("worldRenderer.js evaluated successfully.");
    
    // Now call renderStaticStreetTo
    console.log("Calling renderStaticStreetTo...");
    renderStaticStreetTo(ctxMock, 800, 600);
    console.log("renderStaticStreetTo succeeded with isNightMode=false!");

    global.isNightMode = true;
    console.log("Calling renderStaticStreetTo with isNightMode=true...");
    renderStaticStreetTo(ctxMock, 800, 600);
    console.log("renderStaticStreetTo succeeded with isNightMode=true!");

} catch (err) {
    console.error("ERROR CAUGHT:", err);
}
