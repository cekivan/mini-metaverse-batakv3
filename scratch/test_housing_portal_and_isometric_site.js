// scratch/test_housing_portal_and_isometric_site.js
const fs = require('fs');
const assert = require('assert');

console.log("=== Testing Housing Portal and Isometric Site Entrance ===");

// 1. Verify src/handlers/housingHandler.js
const handlerContent = fs.readFileSync('src/handlers/housingHandler.js', 'utf8');
assert(handlerContent.includes("socket.on('getAvailableHouses'"), "housingHandler must have getAvailableHouses socket handler");
assert(handlerContent.includes("socket.emit('availableHousesList'"), "housingHandler must emit availableHousesList");
assert(handlerContent.includes("hasSelfHouse: hasSelfHouse"), "housingHandler must include hasSelfHouse");
console.log("✓ Backend getAvailableHouses handler validated!");

// 2. Mock test for getAvailableHouses logic
const dataManager = require('../src/dataManager');
let registeredHandlers = {};
let mockSocket = {
    id: 'test_socket_123',
    on: (evt, cb) => { registeredHandlers[evt] = cb; },
    emit: (evt, payload) => { mockSocket.lastEmitted = { evt, payload }; }
};
let mockPlayers = {
    test_socket_123: { name: 'yasin' }
};

const { registerHousingHandlers } = require('../src/handlers/housingHandler');
registerHousingHandlers(null, mockSocket, mockPlayers);

assert(typeof registeredHandlers['getAvailableHouses'] === 'function', "getAvailableHouses handler must be registered");
registeredHandlers['getAvailableHouses']();

assert(mockSocket.lastEmitted, "socket.emit must be called");
assert.strictEqual(mockSocket.lastEmitted.evt, 'availableHousesList', "Event must be availableHousesList");
assert(Array.isArray(mockSocket.lastEmitted.payload.houses), "houses must be an array");
assert(typeof mockSocket.lastEmitted.payload.hasSelfHouse === 'boolean', "hasSelfHouse must be boolean");
console.log("✓ Backend getAvailableHouses execution verified: returns", mockSocket.lastEmitted.payload.houses.length, "houses, hasSelfHouse:", mockSocket.lastEmitted.payload.hasSelfHouse);

// 3. Verify public/js/housing.js
const housingJs = fs.readFileSync('public/js/housing.js', 'utf8');
assert(housingJs.includes("function openHousingPortalModal()"), "openHousingPortalModal must be defined");
assert(housingJs.includes("activeSocket.emit('getAvailableHouses')"), "openHousingPortalModal must emit getAvailableHouses");
assert(housingJs.includes("window._housingPortalFallbackTimer"), "Fallback timer must be present to prevent infinite spinner");
assert(housingJs.includes("socket.on('availableHousesList'"), "housing.js must listen for availableHousesList");
console.log("✓ Frontend housing.js portal modal and fallback verified!");

// 4. Verify public/index.html
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
assert(indexHtml.includes('id="housingPortalModal"'), "housingPortalModal must exist in index.html");
assert(indexHtml.includes('id="availableHousesList"'), "availableHousesList must exist in index.html");
assert(indexHtml.includes('closeHousingPortalModal()'), "closeHousingPortalModal must be hooked up");
console.log("✓ HTML modal elements verified!");

// 5. Verify worldRenderer.js isometric complex
const worldJs = fs.readFileSync('public/js/worldRenderer.js', 'utf8');
assert(worldJs.includes("function drawIsometricResidentialComplex("), "drawIsometricResidentialComplex must be defined");
assert(worldJs.includes("drawIsometricResidentialComplex(bctx, aptX, aptY, aptW, aptH, isNightMode)"), "drawIsometricResidentialComplex must be invoked in renderStaticStreetTo");
assert(worldJs.includes("isAtAptDoor = (x >= 180 && x <= 235 && y <= 405)"), "Door collision must allow entering through original door x:180..235, y<=405");
assert(worldJs.includes("🏢 Konutlar & Evler (Tıkla)"), "Hover tooltip must be present");
console.log("✓ Original residential complex and collision in worldRenderer.js verified!");

// 6. Verify roomInteractions.js
const roomIntJs = fs.readFileSync('public/js/roomInteractions.js', 'utf8');
assert(roomIntJs.includes("navigatePlayerToDoor(205, 385, null, () => {"), "Clicking site must navigate to door at (205, 385)");
console.log("✓ roomInteractions.js door navigation verified!");

console.log("ALL TESTS PASSED! 100% SUCCESS!");
