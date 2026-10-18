const fs = require('fs');
const assert = require('assert');

console.log("=== TEST: Classic Avatar 100% Original Frontal Rendering (No 4-way/8-way turning) ===");

const code = fs.readFileSync('public/js/avatarRenderer.js', 'utf8');

// Verify drawClassicAvatar exists and enforces frontal rendering
assert(code.includes("drawAvatarHairAndHats(ctx, pX, pY, p.hat || 'none', 'down');"), "Hair & hats must always be drawn in front-facing 'down' mode for classic");
assert(code.includes("drawAvatarFaceAndEyes(ctx, pX, pY, p.face || 'none', eyeOffsetX, eyeOffsetY, 'down');"), "Face & eyes must always be drawn in front-facing 'down' mode for classic");
assert(code.includes("drawAvatarBodyAndClothes(ctx, pX, pY, p.outfit || p.shirt || p.color, skinColor, 'down', false);"), "Body & clothes must always be front-facing 'down' for classic");

// Verify that classic preview is also frontal
assert(code.includes("drawClassicAvatar(pCtx, 0, 0, activeAv, 'down', false, 0, false, true);"), "Wardrobe preview must always be front-facing for classic");

console.log("✔ Classic avatar strictly preserves authentic frontal chibi rendering with 0 turning!");
console.log("✔ All tests in test_classic_no_turning.js passed!");
