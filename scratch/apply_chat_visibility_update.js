const fs = require('fs');
const path = require('path');

// 1. UPDATE public/style.css
const cssPath = path.join(__dirname, '../public/style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace #sideChatContainer block in style.css
const oldCssBlockRegex = /\/\* 6\. SABİT VE SÜRÜKLENEBİLİR CHAT PANELİ \*\/[\s\S]*?#sideChatContainer button:hover \{[\s\S]*?\}/;

const newCssBlock = `/* 6. SABİT VE SÜRÜKLENEBİLİR CHAT PANELİ */
#sideChatContainer {
    position: fixed;
    top: 65px;
    right: 20px;
    width: 290px;
    height: 330px;
    max-width: calc(100vw - 30px);
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    z-index: 40000;
    display: flex;
    flex-direction: column;
    padding: 10px;
    box-shadow: 0 16px 36px rgba(0,0,0,0.7), 0 0 20px rgba(13, 148, 136, 0.2);
    backdrop-filter: blur(14px);
    transition: height 0.2s ease, box-shadow 0.2s ease;
}

#sideChatContainer.chat-minimized {
    height: auto !important;
    min-height: auto !important;
    padding-bottom: 8px !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.6);
}

#chatHeader {
    cursor: move;
    background: linear-gradient(135deg, #0d9488, #0f766e);
    color: white;
    padding: 6px 10px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 12px;
    margin-bottom: 6px;
    letter-spacing: 0.3px;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#sideChatContainer.chat-minimized #chatHeader {
    margin-bottom: 0 !important;
}

#sideChatContainer .chat-header-btn {
    padding: 2px 7px;
    background: rgba(255, 255, 255, 0.18);
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    line-height: 1.2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
}

#sideChatContainer .chat-header-btn:hover {
    background: rgba(255, 255, 255, 0.32);
    transform: scale(1.1);
}

#sideChatContainer .chat-header-btn.btn-close {
    background: rgba(239, 68, 68, 0.4);
    border: 1px solid rgba(239, 68, 68, 0.5);
}

#sideChatContainer .chat-header-btn.btn-close:hover {
    background: rgba(239, 68, 68, 0.85);
    border-color: #ef4444;
}

#chatBody {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
}

#sideChatContainer.chat-minimized #chatBody {
    display: none !important;
}

#chatHistory {
    flex: 1;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 8px;
    padding: 8px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
    color: #f1f5f9;
    font-size: 13px;
    word-break: break-word;
}

#chatHistory div {
    background: rgba(255, 255, 255, 0.08);
    padding: 5px 8px;
    border-radius: 6px;
    line-height: 1.3;
}

#sideChatContainer input {
    flex: 1;
    padding: 9px 12px;
    background: rgba(30, 41, 59, 0.8);
    color: white;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    outline: none;
    font-size: 13px;
}

#sideChatContainer button#sideChatSendBtn {
    padding: 9px 14px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 13px;
    transition: transform 0.1s;
}

#sideChatContainer button#sideChatSendBtn:hover {
    transform: scale(1.03);
}`;

if (oldCssBlockRegex.test(css)) {
    css = css.replace(oldCssBlockRegex, newCssBlock);
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log("1. public/style.css updated!");
} else {
    console.error("1. CSS block regex did not match!");
}

// 2. UPDATE public/index.html
const indexPath = path.join(__dirname, '../public/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace #sideChatContainer markup in index.html
const oldChatMarkupRegex = /<!-- 3\. SABİT VE SÜRÜKLENEBİLİR YAN CHAT PANELİ -->[\s\S]*?<\/div>[\r\n\s]*<!-- RECONNECT MODALI -->/;

const newChatMarkup = `<!-- 3. SABİT VE SÜRÜKLENEBİLİR YAN CHAT PANELİ (TÜM OYUNLARIN ÜZERİNDE GÖRÜNÜR) -->
    <div id="sideChatContainer" style="position: fixed; top: 60px; right: 20px; width: 290px; height: 350px; background: rgba(15, 23, 42, 0.94); border: 2px solid rgba(45, 212, 191, 0.4); border-radius: 14px; z-index: 40000; display: flex; flex-direction: column; padding: 10px; box-shadow: 0 16px 36px rgba(0,0,0,0.7), 0 0 25px rgba(13, 148, 136, 0.25); backdrop-filter: blur(14px);">
        <div id="chatHeader" style="cursor: move; background: linear-gradient(135deg, #0d9488, #0f766e); color: white; padding: 6px 10px; border-radius: 8px; font-weight: bold; margin-bottom: 6px; font-size: 12px; display: flex; justify-content: space-between; align-items: center; user-select: none;">
            <div style="display: flex; align-items: center; gap: 6px;">
                <span>💬 Sohbet</span>
                <span id="chatHeaderBadge" style="display: none; background: #ef4444; color: white; border-radius: 9999px; padding: 1px 6px; font-size: 10px; font-weight: 900; animation: pulse 1s infinite;">0</span>
                <span style="font-size: 10px; opacity: 0.8; font-weight: normal;">(Tut Sürükle)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
                <button type="button" id="chatMinimizeBtn" class="chat-header-btn" onclick="toggleChatMinimize(event)" title="Simge Durumuna Küçült / Büyüt" style="background: rgba(255,255,255,0.18); border: none; color: white; width: 22px; height: 22px; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; line-height: 1;">─</button>
                <button type="button" class="chat-header-btn btn-close" onclick="toggleChatPanel(event)" title="Sohbeti Gizle" style="background: rgba(239,68,68,0.4); border: 1px solid rgba(239,68,68,0.5); color: white; width: 22px; height: 22px; border-radius: 5px; cursor: pointer; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center; line-height: 1;">✕</button>
            </div>
        </div>

        <div id="chatBody" style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
            <div id="chatHistory" style="flex: 1; background: rgba(0, 0, 0, 0.35); border-radius: 8px; padding: 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; margin-bottom: 6px; color: white; font-size: 13px;"></div>

            <!-- HIZLI EMOJİ TEPKİ ŞERİDİ -->
            <div id="quickEmojiBar" style="display: flex; gap: 4px; justify-content: center; margin-bottom: 6px; padding: 2px 0;">
                <button type="button" onclick="sendQuickEmoji('😂')" class="emoji-quick-btn" title="Gülme">😂</button>
                <button type="button" onclick="sendQuickEmoji('😡')" class="emoji-quick-btn" title="Kızgın">😡</button>
                <button type="button" onclick="sendQuickEmoji('❤️')" class="emoji-quick-btn" title="Kalp">❤️</button>
                <button type="button" onclick="sendQuickEmoji('👋')" class="emoji-quick-btn" title="El Salla">👋</button>
                <button type="button" onclick="sendQuickEmoji('🎉')" class="emoji-quick-btn" title="Kutlama">🎉</button>
                <button type="button" onclick="sendQuickEmoji('😎')" class="emoji-quick-btn" title="Havalı">😎</button>
                <button type="button" onclick="sendQuickEmoji('☕')" class="emoji-quick-btn" title="Çay">☕</button>
                <button type="button" onclick="sendQuickEmoji('🔥')" class="emoji-quick-btn" title="Ateş">🔥</button>
            </div>

            <div style="display: flex; gap: 5px; position: relative;">
                <input type="text" id="sideChatInput" maxlength="50" placeholder="Mesaj yaz (maks 50)..." autocomplete="off" oninput="updateChatCharCounter(this)" style="flex: 1; padding: 8px 32px 8px 8px; border-radius: 6px; border: none; outline: none; font-size: 13px;">
                <span id="chatCharCounter" style="position: absolute; right: 74px; top: 9px; font-size: 10px; color: #94a3b8; pointer-events: none; font-weight: bold;">50</span>
                <button id="sideChatSendBtn" onclick="sendSideChat()" style="padding: 8px 12px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">Gönder</button>
            </div>
            <div id="chatSpamWarningBanner" style="display: none; font-size: 11px; color: #f87171; background: rgba(239,68,68,0.2); border: 1px solid #ef4444; border-radius: 6px; padding: 4px 6px; margin-top: 5px; text-align: center; font-weight: bold;"></div>
        </div>
    </div>

    <!-- YÜZEN HIZLI SOHBET AÇMA BUTONU (OYUNLARDA & DÜNYADA CHAT KAPALIYKEN GÖRÜNÜR) -->
    <button id="floatingChatToggleBtn" onclick="toggleChatPanel(event)" style="display: none; position: fixed; bottom: 85px; right: 20px; z-index: 40001; background: linear-gradient(135deg, #0d9488, #0f766e); color: white; border: 1.5px solid #2dd4bf; border-radius: 9999px; padding: 8px 16px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,0.6); align-items: center; gap: 7px; transition: transform 0.15s ease;">
        <span>💬 Sohbet</span>
        <span id="floatingChatBadge" style="display: none; background: #ef4444; color: white; border-radius: 9999px; padding: 2px 7px; font-size: 10px; font-weight: 900; animation: pulse 1s infinite;">0</span>
    </button>

    <!-- RECONNECT MODALI -->`;

if (oldChatMarkupRegex.test(html)) {
    html = html.replace(oldChatMarkupRegex, newChatMarkup);
    console.log("2. public/index.html sideChatContainer markup updated!");
} else {
    console.error("2. sideChatContainer markup regex did not match!");
}

// Add chat toggle button to gameModal header if not present
if (!html.includes('id="tableChatToggleBtn"')) {
    const tableVoiceBtnMarker = `<button type="button" id="tableVoiceBtn"`;
    const tableChatBtnHtml = `<button type="button" id="tableChatToggleBtn" onclick="toggleChatPanel(event)" style="padding: 4px 10px; font-size: 11px; font-weight: 800; background: linear-gradient(135deg, #0d9488, #0f766e); border: 1px solid rgba(45,212,191,0.5); color: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(13,148,136,0.3); transition: all 0.15s;" title="Sohbet Panelini Aç / Kapat"><span>💬</span><span id="tableChatText">Sohbet</span></button>\n                `;
    html = html.replace(tableVoiceBtnMarker, tableChatBtnHtml + tableVoiceBtnMarker);
    console.log("2. gameModal tableChatToggleBtn added!");
}

// Add chat toggle button to blackjack-top-bar
if (!html.includes('id="bjChatToggleBtn"')) {
    const bjVoiceBtnMarker = `<button type="button" id="bjVoiceToggleBtn"`;
    const bjChatBtnHtml = `<button type="button" id="bjChatToggleBtn" onclick="toggleChatPanel(event)" style="padding: 4px 10px; font-size: 12px; font-weight: 800; background: linear-gradient(135deg, #0d9488, #0f766e); border: 1px solid #2dd4bf; color: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s;" title="Sohbet Panelini Aç / Kapat"><span>💬</span><span>Sohbet</span></button>\n                    `;
    html = html.replace(bjVoiceBtnMarker, bjChatBtnHtml + bjVoiceBtnMarker);
    console.log("2. blackjackModal bjChatToggleBtn added!");
}

// Add chat toggle button to roulette-top-bar
if (!html.includes('id="rouletteChatToggleBtn"')) {
    const rouletteCloseMarker = `<div class="bj-badge bj-money-badge">💰 <b id="rouletteUserBalance">`;
    const rouletteChatBtnHtml = `<button type="button" id="rouletteChatToggleBtn" onclick="toggleChatPanel(event)" style="padding: 4px 10px; font-size: 12px; font-weight: 800; background: linear-gradient(135deg, #0d9488, #0f766e); border: 1px solid #2dd4bf; color: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s;" title="Sohbet Panelini Aç / Kapat"><span>💬</span><span>Sohbet</span></button>\n                    `;
    html = html.replace(rouletteCloseMarker, rouletteChatBtnHtml + rouletteCloseMarker);
    console.log("2. rouletteModal rouletteChatToggleBtn added!");
}

// Add chat toggle button to slot-top-bar
if (!html.includes('id="slotChatToggleBtn"')) {
    const slotBalanceMarker = `<div class="bj-badge bj-money-badge">💰 <b id="slotUserBalance">`;
    const slotChatBtnHtml = `<button type="button" id="slotChatToggleBtn" onclick="toggleChatPanel(event)" style="padding: 4px 10px; font-size: 12px; font-weight: 800; background: linear-gradient(135deg, #0d9488, #0f766e); border: 1px solid #2dd4bf; color: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s;" title="Sohbet Panelini Aç / Kapat"><span>💬</span><span>Sohbet</span></button>\n                    `;
    html = html.replace(slotBalanceMarker, slotChatBtnHtml + slotBalanceMarker);
    console.log("2. slotModal slotChatToggleBtn added!");
}

fs.writeFileSync(indexPath, html, 'utf8');

// 3. UPDATE public/js/chatBubbles.js
const chatBubblesPath = path.join(__dirname, '../public/js/chatBubbles.js');
const newChatBubblesJs = `// public/js/chatBubbles.js - Konuşma Baloncukları, Hızlı Emoji ve Yan Panel Sohbeti

let activeChatBubbles = {};
let chatMessagesLog = [];
const MAX_CHAT_LOG = 15;
let activePlayerEmojis = {};
let isChatMinimized = false;
let unreadChatCount = 0;

function appendChatMessageToHistory(name, msg) {
    const historyDiv = document.getElementById('chatHistory');
    if (!historyDiv) return;

    let line = document.createElement('div');
    line.style.wordBreak = 'break-word';
    line.style.margin = '2px 0';

    let b = document.createElement('b');
    b.textContent = name + ': ';
    line.appendChild(b);

    let span = document.createElement('span');
    span.textContent = msg;
    line.appendChild(span);

    historyDiv.appendChild(line);

    while (historyDiv.children.length > MAX_CHAT_LOG) {
        historyDiv.removeChild(historyDiv.firstChild);
    }
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

function renderChatHistory() {
    const historyDiv = document.getElementById('chatHistory');
    if (!historyDiv) return;
    historyDiv.innerHTML = "";
    chatMessagesLog.forEach(item => {
        appendChatMessageToHistory(item.name, item.msg);
    });
}

function sendSideChat() {
    const input = document.getElementById('sideChatInput');
    if (!input) return;
    let msg = input.value.trim();
    if (msg.length > 50) {
        msg = msg.substring(0, 50);
    }
    if (msg !== "" && window.socket) {
        window.socket.emit('chatMessage', msg);
        input.value = "";
        updateChatCharCounter();
    }
}

function updateChatCharCounter() {
    const input = document.getElementById('sideChatInput');
    const counter = document.getElementById('chatCharCounter');
    if (input && counter) {
        counter.textContent = \`\${input.value.length}/50\`;
    }
}

function sendQuickEmoji(emoji) {
    if (!window.socket || !emoji) return;
    window.socket.emit('playerEmoji', emoji);
    if (typeof myId !== 'undefined' && myId) {
        activePlayerEmojis[myId] = { emoji: emoji, start: Date.now() };
    }
}

// Ayarlar Penceresi (SFX, Müzik, Sesli Sohbet)
function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;
    modal.style.display = 'flex';
    if (typeof getAudioSettings === 'function') {
        const audioSettings = getAudioSettings();
        const sfxSlider = document.getElementById('sfxVolumeSlider');
        const sfxVal = document.getElementById('sfxVolumeVal');
        const musSlider = document.getElementById('musicVolumeSlider');
        const musVal = document.getElementById('musicVolumeVal');
        if (sfxSlider) {
            sfxSlider.value = Math.round(audioSettings.sfx * 100);
            if (sfxVal) sfxVal.innerText = \`\${sfxSlider.value}%\`;
        }
        if (musSlider) {
            musSlider.value = Math.round(audioSettings.music * 100);
            if (musVal) musVal.innerText = \`\${musSlider.value}%\`;
        }
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;
    modal.style.display = 'none';
}

function handleSfxVolumeChange(val) {
    const label = document.getElementById('sfxVolumeVal');
    if (label) label.innerText = \`\${val}%\`;
    if (typeof setSfxVolume === 'function') {
        setSfxVolume(val / 100);
    }
}

function handleMusicVolumeChange(val) {
    const label = document.getElementById('musicVolumeVal');
    if (label) label.innerText = \`\${val}%\`;
    if (typeof setMusicVolume === 'function') {
        setMusicVolume(val / 100);
    }
}

function handleVoiceVolumeChange(val) {
    const label = document.getElementById('voiceVolumeVal');
    if (label) label.innerText = \`\${val}%\`;
    if (window.voiceManager && typeof window.voiceManager.setVolume === 'function') {
        window.voiceManager.setVolume(val / 100);
    }
}

function updateChatUIBadges() {
    const floatBadge = document.getElementById('floatingChatBadge');
    const headerBadge = document.getElementById('chatHeaderBadge');

    if (unreadChatCount > 0) {
        if (floatBadge) {
            floatBadge.innerText = unreadChatCount;
            floatBadge.style.display = 'inline-block';
        }
        if (headerBadge) {
            headerBadge.innerText = unreadChatCount;
            headerBadge.style.display = 'inline-block';
        }
    } else {
        if (floatBadge) floatBadge.style.display = 'none';
        if (headerBadge) headerBadge.style.display = 'none';
    }
}

function toggleChatMinimize(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const panel = document.getElementById('sideChatContainer');
    const minBtn = document.getElementById('chatMinimizeBtn');
    if (!panel) return;

    isChatMinimized = !isChatMinimized;
    if (isChatMinimized) {
        panel.classList.add('chat-minimized');
        if (minBtn) {
            minBtn.innerText = '□';
            minBtn.title = 'Sohbeti Genişlet';
        }
    } else {
        panel.classList.remove('chat-minimized');
        unreadChatCount = 0;
        updateChatUIBadges();
        if (minBtn) {
            minBtn.innerText = '─';
            minBtn.title = 'Simge Durumuna Küçült';
        }
        const historyDiv = document.getElementById('chatHistory');
        if (historyDiv) historyDiv.scrollTop = historyDiv.scrollHeight;
    }
}

function toggleChatPanel(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const panel = document.getElementById('sideChatContainer');
    const floatBtn = document.getElementById('floatingChatToggleBtn');
    if (!panel) return;

    const isHidden = (panel.style.display === 'none' || getComputedStyle(panel).display === 'none');

    if (isHidden) {
        panel.style.display = 'flex';
        if (floatBtn) floatBtn.style.display = 'none';
        if (isChatMinimized) {
            panel.classList.add('chat-minimized');
        } else {
            panel.classList.remove('chat-minimized');
        }
        unreadChatCount = 0;
        updateChatUIBadges();
        updateAllChatButtons(true);
        const historyDiv = document.getElementById('chatHistory');
        if (historyDiv) historyDiv.scrollTop = historyDiv.scrollHeight;
    } else {
        panel.style.display = 'none';
        if (floatBtn) floatBtn.style.display = 'flex';
        updateAllChatButtons(false);
    }
}

function updateAllChatButtons(isOpen) {
    const btnIds = ['chatToggleBtn', 'tableChatToggleBtn', 'bjChatToggleBtn', 'rouletteChatToggleBtn', 'slotChatToggleBtn'];
    btnIds.forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        if (id === 'chatToggleBtn') {
            btn.innerText = isOpen ? '💬 Chat Kapat' : '💬 Chat Aç';
        } else if (id === 'tableChatToggleBtn') {
            const txt = document.getElementById('tableChatText');
            if (txt) txt.innerText = isOpen ? 'Sohbet Kapat' : 'Sohbet';
        } else {
            const spanText = btn.querySelector('span:last-child');
            if (spanText) spanText.innerText = isOpen ? 'Sohbet Kapat' : 'Sohbet';
        }
    });
}

// Global olarak erişilebilir yap
window.toggleChatPanel = toggleChatPanel;
window.toggleChatMinimize = toggleChatMinimize;
window.sendSideChat = sendSideChat;
window.updateChatCharCounter = updateChatCharCounter;
window.sendQuickEmoji = sendQuickEmoji;

// Socket Dinleyicileri
if (window.socket) {
    window.socket.on('chatUpdate', (data) => {
        if (data.msg && data.msg.trim() !== "") {
            if (window.playSound) window.playSound('chatPop');
            let senderName = (typeof players !== 'undefined' && players[data.id]) ? players[data.id].name : "Biri";

            chatMessagesLog.push({ name: senderName, msg: data.msg });
            if (chatMessagesLog.length > MAX_CHAT_LOG) chatMessagesLog.shift();
            appendChatMessageToHistory(senderName, data.msg);

            const panel = document.getElementById('sideChatContainer');
            const isHidden = (!panel || panel.style.display === 'none' || (panel && getComputedStyle(panel).display === 'none'));
            if (isHidden || isChatMinimized) {
                unreadChatCount++;
                updateChatUIBadges();
            }

            if (!activeChatBubbles[data.id]) activeChatBubbles[data.id] = [];
            if (activeChatBubbles[data.id].length >= 4) {
                let oldBubble = activeChatBubbles[data.id].shift();
                clearTimeout(oldBubble.timer);
            }

            let timer = setTimeout(() => {
                if (activeChatBubbles[data.id]) {
                    activeChatBubbles[data.id] = activeChatBubbles[data.id].filter(b => b.timer !== timer);
                }
            }, 5000);

            activeChatBubbles[data.id].push({ text: data.msg, name: senderName, timer: timer });
        }
    });
}
`;

fs.writeFileSync(chatBubblesPath, newChatBubblesJs, 'utf8');
console.log("3. public/js/chatBubbles.js updated!");

// 4. UPDATE public/js/main.js (Drag button click filter & keydown casino checks)
const mainPath = path.join(__dirname, '../public/js/main.js');
let mainJs = fs.readFileSync(mainPath, 'utf8');

// Filter button clicks in chat dragging
const oldChatMouseDown = `        chatHeader.addEventListener('mousedown', (e) => {
            isChatDragging = true;`;
const newChatMouseDown = `        chatHeader.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            isChatDragging = true;`;

if (mainJs.includes(oldChatMouseDown)) {
    mainJs = mainJs.replace(oldChatMouseDown, newChatMouseDown);
    console.log("4.1 main.js chatHeader mousedown button filter added!");
}

const oldChatTouchStart = `        chatHeader.addEventListener('touchstart', (e) => {
            isChatDragging = true;`;
const newChatTouchStart = `        chatHeader.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            isChatDragging = true;`;

if (mainJs.includes(oldChatTouchStart)) {
    mainJs = mainJs.replace(oldChatTouchStart, newChatTouchStart);
    console.log("4.2 main.js chatHeader touchstart button filter added!");
}

// Add casino modals to keydown walking check
const oldKeydownChecks = `    let ganyanModal = document.getElementById('ganyanKuponModal');
    if (ganyanModal && ganyanModal.style.display === 'flex') return;`;
const newKeydownChecks = `    let ganyanModal = document.getElementById('ganyanKuponModal');
    if (ganyanModal && ganyanModal.style.display === 'flex') return;
    let bjModal = document.getElementById('blackjackModal');
    if (bjModal && bjModal.style.display === 'flex') return;
    let rouletteModal = document.getElementById('rouletteModal');
    if (rouletteModal && rouletteModal.style.display === 'flex') return;
    let slotModal = document.getElementById('slotModal');
    if (slotModal && slotModal.style.display === 'flex') return;`;

if (mainJs.includes(oldKeydownChecks) && !mainJs.includes("id='blackjackModal'")) {
    mainJs = mainJs.replace(oldKeydownChecks, newKeydownChecks);
    console.log("4.3 main.js keydown casino modals checks added!");
}

fs.writeFileSync(mainPath, mainJs, 'utf8');
console.log("4. public/js/main.js updated!");
