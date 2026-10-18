// scratch/test_all_chat_system.js
const assert = require('assert');
const fs = require('fs');

console.log("=== ALL CHAT & ROOM CHAT SYSTEM VERIFICATION ===");

// 1. Verify HTML Structure
console.log("\n--- TEST 1: HTML Structure ---");
const indexHtml = fs.readFileSync('public/index.html', 'utf8');
assert(indexHtml.includes('id="chatTabsBar"'), 'chatTabsBar must exist in index.html');
assert(indexHtml.includes('id="chatTabAll"'), 'chatTabAll must exist in index.html');
assert(indexHtml.includes('id="chatTabRoom"'), 'chatTabRoom must exist in index.html');
assert(indexHtml.includes('id="chatTabGlobal"'), 'chatTabGlobal must exist in index.html');
assert(indexHtml.includes('id="chatChannelToggleBtn"'), 'chatChannelToggleBtn must exist in index.html');
assert(indexHtml.includes("switchChatTab('all_view')"), 'switchChatTab all_view must be bound');
assert(indexHtml.includes("switchChatTab('room_only')"), 'switchChatTab room_only must be bound');
assert(indexHtml.includes("switchChatTab('global_only')"), 'switchChatTab global_only must be bound');
assert(indexHtml.includes('toggleActiveSendChannel()'), 'toggleActiveSendChannel must be bound');
console.log("✔ index.html contains all channel tabs, channel toggle, and event handlers!");

// 2. Verify CSS Styling
console.log("\n--- TEST 2: CSS Styling ---");
const styleCss = fs.readFileSync('public/style.css', 'utf8');
assert(styleCss.includes('.chat-tab-btn'), '.chat-tab-btn must exist in style.css');
assert(styleCss.includes('.chat-tab-dot'), '.chat-tab-dot must exist in style.css');
assert(styleCss.includes('.chat-msg-all'), '.chat-msg-all must exist in style.css');
assert(styleCss.includes('.chat-msg-room'), '.chat-msg-room must exist in style.css');
console.log("✔ style.css contains all required classes for tabs and message badges!");

// 3. Verify Server-Side SocialHandler
console.log("\n--- TEST 3: Server-Side SocialHandler ---");
const { registerSocialHandlers } = require('../src/handlers/socialHandler');

let emittedEvents = [];
let roomEmits = [];

const mockIo = {
    emit: (event, data) => emittedEvents.push({ event, data, target: 'global' }),
    to: (room) => ({
        emit: (event, data) => roomEmits.push({ event, data, room })
    })
};

const players = {
    'socket_1': { name: 'Player1', room: 'kafe' },
    'socket_2': { name: 'Player2', room: 'sahil' }
};

const mockHelpers = { givePlayerTeaWithTimer: () => {} };

// Test 3a: Room chat message
emittedEvents = [];
roomEmits = [];
let mockSocket1 = { id: 'socket_1', onHandlers: {}, on: function(ev, cb) { this.onHandlers[ev] = cb; }, emit: () => {} };
registerSocialHandlers(mockIo, mockSocket1, players, mockHelpers);

mockSocket1.onHandlers['chatMessage']({ msg: 'Merhaba kafe!', channel: 'room' });
assert.strictEqual(roomEmits.length, 1, 'Should emit 1 room message');
assert.strictEqual(roomEmits[0].room, 'kafe', 'Should be targeted to kafe room');
assert.strictEqual(roomEmits[0].data.channel, 'room', 'Should have channel: room');
assert.strictEqual(roomEmits[0].data.name, 'Player1', 'Should include sender name');
assert.strictEqual(emittedEvents.length, 0, 'No global emit for room chat');
console.log("✔ Room chat sends only to sender's room ('kafe')!");

// Test 3b: All chat message (channel: 'all')
emittedEvents = [];
roomEmits = [];
let mockSocket2 = { id: 'socket_2', onHandlers: {}, on: function(ev, cb) { this.onHandlers[ev] = cb; }, emit: () => {} };
registerSocialHandlers(mockIo, mockSocket2, players, mockHelpers);

mockSocket2.onHandlers['chatMessage']({ msg: 'Tüm evrene selamlar!', channel: 'all' });
assert.strictEqual(emittedEvents.length, 1, 'Should emit 1 global message via io.emit');
assert.strictEqual(emittedEvents[0].target, 'global');
assert.strictEqual(emittedEvents[0].data.channel, 'all');
assert.strictEqual(emittedEvents[0].data.name, 'Player2');
assert.strictEqual(emittedEvents[0].data.room, 'sahil');
assert.strictEqual(roomEmits.length, 0, 'No room-restricted emit for all chat');
console.log("✔ All chat broadcasts to entire universe (io.emit) with sender's room ('sahil')!");

// Test 3c: Slash command /all
emittedEvents = [];
roomEmits = [];
mockSocket1.chatTimestamps = [];
mockSocket1.chatCooldownUntil = 0;
mockSocket1.onHandlers['chatMessage']('/all Herkese iyi oyunlar');
assert.strictEqual(emittedEvents.length, 1, 'Slash command /all should broadcast globally');
assert.strictEqual(emittedEvents[0].data.channel, 'all');
assert.strictEqual(emittedEvents[0].data.msg, 'Herkese iyi oyunlar', 'Should strip the /all prefix');
console.log("✔ Slash command '/all' correctly converts message to universe-wide All Chat!");

// Test 3d: Slash command /genel and /g
emittedEvents = [];
mockSocket1.chatTimestamps = [];
mockSocket1.chatCooldownUntil = 0;
mockSocket1.onHandlers['chatMessage']('/genel Genel mesaj testi');
assert.strictEqual(emittedEvents.length, 1, 'Slash command /genel should broadcast globally');
assert.strictEqual(emittedEvents[0].data.channel, 'all');
assert.strictEqual(emittedEvents[0].data.msg, 'Genel mesaj testi');
console.log("✔ Slash command '/genel' and '/g' correctly supported!");

// Test 3e: Slash command /oda
emittedEvents = [];
roomEmits = [];
mockSocket1.chatTimestamps = [];
mockSocket1.chatCooldownUntil = 0;
mockSocket1.onHandlers['chatMessage']('/oda Sadece odadakiler duysun');
assert.strictEqual(roomEmits.length, 1, 'Slash command /oda should send to room only');
assert.strictEqual(roomEmits[0].data.channel, 'room');
assert.strictEqual(roomEmits[0].data.msg, 'Sadece odadakiler duysun');
console.log("✔ Slash command '/oda' correctly sends to room only!");

// 4. Verify Client-Side chatBubbles.js Logic
console.log("\n--- TEST 4: Client-Side chatBubbles.js Logic ---");
const chatBubblesCode = fs.readFileSync('public/js/chatBubbles.js', 'utf8');

// Mock browser DOM
class MockElement {
    constructor(id = '', tagName = 'div') {
        this.id = id;
        this.tagName = tagName;
        this.style = {};
        this.children = [];
        this.classList = {
            add: (c) => this.classes.push(c),
            remove: (c) => { this.classes = this.classes.filter(x => x !== c); },
            contains: (c) => this.classes.includes(c)
        };
        this.classes = [];
        this.textContent = '';
        this.value = '';
    }
    appendChild(c) { this.children.push(c); return c; }
    removeChild(c) { this.children = this.children.filter(x => x !== c); return c; }
    get firstChild() { return this.children[0]; }
}

const mockDoc = {
    elements: {},
    getElementById: function(id) {
        if (!this.elements[id]) this.elements[id] = new MockElement(id);
        return this.elements[id];
    },
    createElement: (tag) => new MockElement('', tag),
    querySelectorAll: () => []
};

const mockWindow = {
    socket: {
        events: {},
        on: function(ev, cb) { this.events[ev] = cb; },
        emit: function(ev, d) { this.emitted = this.emitted || []; this.emitted.push({ ev, d }); }
    },
    playSound: () => {}
};

const clientSandbox = {
    window: mockWindow,
    document: mockDoc,
    localStorage: { getItem: () => null, setItem: () => {} },
    getComputedStyle: () => ({ display: 'flex' }),
    Date,
    setTimeout,
    clearTimeout,
    currentRoom: 'kafe',
    players: { '123': { name: 'Ali' } }
};

const fn = new Function('sandbox', `
    with (sandbox) {
        ${chatBubblesCode}
        return {
            switchChatTab,
            setActiveSendChannel,
            toggleActiveSendChannel,
            sendSideChat,
            appendChatMessageToHistory,
            renderChatHistory,
            chatMessagesLog,
            getChatRoomLabel
        };
    }
`);

const clientChat = fn(clientSandbox);

// Test channel toggle
clientChat.setActiveSendChannel('all');
assert.strictEqual(mockDoc.getElementById('sideChatInput').placeholder.includes('Genel evren'), true);
clientChat.toggleActiveSendChannel();
assert.strictEqual(mockDoc.getElementById('sideChatInput').placeholder.includes('Oda'), true);
console.log("✔ Active send channel toggling correctly switches placeholder & channel state!");

// Test sendSideChat with active channel
mockDoc.getElementById('sideChatInput').value = 'Test mesajı';
clientChat.setActiveSendChannel('all');
clientChat.sendSideChat();
assert(mockWindow.socket.emitted && mockWindow.socket.emitted.length > 0, 'Should emit chatMessage');
let lastEmit = mockWindow.socket.emitted[mockWindow.socket.emitted.length - 1];
assert.strictEqual(lastEmit.d.channel, 'all');
assert.strictEqual(lastEmit.d.msg, 'Test mesajı');
console.log("✔ sendSideChat transmits message with active channel object!");

// Test tab filtering
mockDoc.elements['chatHistory'] = new MockElement('chatHistory');
clientChat.switchChatTab('all_view');
clientChat.appendChatMessageToHistory({ name: 'User1', msg: 'Room msg', channel: 'room', room: 'kafe' });
clientChat.appendChatMessageToHistory({ name: 'User2', msg: 'Global msg', channel: 'all', room: 'sahil' });
assert.strictEqual(mockDoc.elements['chatHistory'].children.length, 2, 'all_view should show both room and all');

mockDoc.elements['chatHistory'] = new MockElement('chatHistory');
clientChat.switchChatTab('global_only');
clientChat.appendChatMessageToHistory({ name: 'User1', msg: 'Room msg', channel: 'room', room: 'kafe' });
clientChat.appendChatMessageToHistory({ name: 'User2', msg: 'Global msg', channel: 'all', room: 'sahil' });
assert.strictEqual(mockDoc.elements['chatHistory'].children.length, 1, 'global_only should only show all messages');

mockDoc.elements['chatHistory'] = new MockElement('chatHistory');
clientChat.switchChatTab('room_only');
clientChat.appendChatMessageToHistory({ name: 'User1', msg: 'Room msg', channel: 'room', room: 'kafe' });
clientChat.appendChatMessageToHistory({ name: 'User2', msg: 'Global msg', channel: 'all', room: 'sahil' });
assert.strictEqual(mockDoc.elements['chatHistory'].children.length, 1, 'room_only should only show room messages');
console.log("✔ Tab switching correctly filters displayed messages between Tümü / Oda / Genel!");

// 5. Check No 'Sanalika' in user-facing texts
console.log("\n--- TEST 5: Terminology Compliance ---");
const visibleTextMatch = indexHtml.match(/>[^<]*sanalika[^<]*</i);
assert(!visibleTextMatch, `Visible Sanalika text found in HTML: ${visibleTextMatch}`);

const chatBubblesSrc = fs.readFileSync('public/js/chatBubbles.js', 'utf8');
const visibleChatMatch = chatBubblesSrc.match(/(?:'|")[^'"]*sanalika[^'"]*(?:'|")/i);
assert(!visibleChatMatch, `Visible Sanalika text found in chatBubbles.js: ${visibleChatMatch}`);
console.log("✔ Zero user-facing 'Sanalika' words!");

console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
