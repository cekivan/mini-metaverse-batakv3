const fs = require('fs');
const path = require('path');

// 1. UPDATE public/index.html
let indexPath = path.join(__dirname, '../public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const modalMarker = `<!-- 6. MOBİLYA VE EV MARKETİ MODALI -->`;
const houseConfirmModalHtml = `<!-- 5.2 OYUN İÇİ EV SATIN ALMA ONAY MODALI (EVET / HAYIR) -->
    <div id="houseBuyConfirmModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 55000; justify-content: center; align-items: center; color: white; backdrop-filter: blur(8px);">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; border-radius: 20px; width: 92%; max-width: 440px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.85), 0 0 25px rgba(56,189,248,0.25); border: 2px solid #38bdf8; position: relative;">
            <button onclick="closeHouseConfirmModal()" style="position: absolute; top: 14px; right: 16px; background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
            <div id="houseConfirmEmoji" style="font-size: 56px; margin-bottom: 6px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">🏡</div>
            <h2 style="color: #f8fafc; margin: 0 0 6px 0; font-size: 20px; font-weight: 800;">Ev Satın Alma Onayı</h2>
            <div id="houseConfirmName" style="color: #38bdf8; font-size: 16px; font-weight: 800; margin-bottom: 4px;">Bahçeli & Havuzlu Villa</div>
            <div id="houseConfirmPrice" style="color: #facc15; font-size: 22px; font-weight: 900; margin-bottom: 12px;">3.750 TL</div>
            
            <p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.5; margin: 0 0 16px 0;">
                Bu evi satın almak istediğinize emin misiniz? Satın aldığınızda mülk tapusu kalıcı olarak adınıza tescillenecektir.
            </p>

            <div id="houseConfirmBalance" style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px; margin-bottom: 20px; font-size: 12.5px; color: #cbd5e1;">
                Mevcut Bakiyeniz: <b>- TL</b>
            </div>

            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="closeHouseConfirmModal()" style="flex: 1; padding: 12px 16px; background: rgba(239, 68, 68, 0.15); border: 1.5px solid #ef4444; color: #fca5a5; border-radius: 12px; font-weight: 800; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                    <span>❌</span> Hayır, Vazgeç
                </button>
                <button id="houseConfirmYesBtn" onclick="executeHouseBuy()" style="flex: 1.2; padding: 12px 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-weight: 800; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 15px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                    <span>✅</span> Evet, Satın Al
                </button>
            </div>
        </div>
    </div>

    `;

if (indexHtml.includes(modalMarker) && !indexHtml.includes('id="houseBuyConfirmModal"')) {
    indexHtml = indexHtml.replace(modalMarker, houseConfirmModalHtml + modalMarker);
    fs.writeFileSync(indexPath, indexHtml, 'utf8');
    console.log("1. public/index.html updated with houseBuyConfirmModal!");
} else {
    console.log("1. houseBuyConfirmModal already in index.html or marker not found.");
}

// 2. UPDATE public/js/housing.js
let housingPath = path.join(__dirname, '../public/js/housing.js');
let housingJs = fs.readFileSync(housingPath, 'utf8');

const targetFunctionRegex = /function confirmBuyHouse\(type\) \{[\s\S]*?window\.confirmBuyHouse = confirmBuyHouse;/;

const replacementHousingCode = `let pendingHouseBuyType = null;

function confirmBuyHouse(type) {
    let h = HOUSE_INFO[type];
    if (!h) return;

    pendingHouseBuyType = type;

    let modal = document.getElementById('houseBuyConfirmModal');
    let userMoney = (window.myMoney !== undefined) ? window.myMoney : ((typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) ? players[myId].money : 0);

    const emojiEl = document.getElementById('houseConfirmEmoji');
    const nameEl = document.getElementById('houseConfirmName');
    const priceEl = document.getElementById('houseConfirmPrice');
    const balanceEl = document.getElementById('houseConfirmBalance');
    const yesBtn = document.getElementById('houseConfirmYesBtn');

    if (emojiEl) {
        emojiEl.innerText = (type === 'pool' ? '🏰' : (type === 'garden' ? '🏡' : '🏢'));
    }
    if (nameEl) nameEl.innerText = h.name;
    if (priceEl) priceEl.innerText = h.price.toLocaleString('tr-TR') + ' TL';

    if (balanceEl) {
        let isEnough = userMoney >= h.price;
        balanceEl.innerHTML = \`Mevcut Bakiyeniz: <b>\${userMoney.toLocaleString('tr-TR')} TL</b> \` + 
            (isEnough 
                ? \`<span style="color:#4ade80;">(Kalan: \${(userMoney - h.price).toLocaleString('tr-TR')} TL)</span>\`
                : \`<br><span style="color:#f87171; font-weight:bold;">⚠️ Yetersiz Bakiye! (\${(h.price - userMoney).toLocaleString('tr-TR')} TL eksik)</span>\`);
    }

    if (yesBtn) {
        if (userMoney < h.price) {
            yesBtn.disabled = true;
            yesBtn.style.opacity = '0.5';
            yesBtn.style.cursor = 'not-allowed';
            yesBtn.innerHTML = \`<span>⚠️</span> Yetersiz Bakiye (\${h.price.toLocaleString('tr-TR')} TL)\`;
        } else {
            yesBtn.disabled = false;
            yesBtn.style.opacity = '1';
            yesBtn.style.cursor = 'pointer';
            yesBtn.innerHTML = \`<span>✅</span> Evet, Satın Al (\${h.price.toLocaleString('tr-TR')} TL)\`;
        }
    }

    if (modal) modal.style.display = 'flex';
    if (window.playSound) window.playSound('click');
}
window.confirmBuyHouse = confirmBuyHouse;

function executeHouseBuy() {
    if (!pendingHouseBuyType) return;
    const type = pendingHouseBuyType;
    closeHouseConfirmModal();
    if (window.socket) {
        socket.emit('buyHouse', type);
    }
    if (window.playSound) window.playSound('coin');
}
window.executeHouseBuy = executeHouseBuy;

function closeHouseConfirmModal() {
    pendingHouseBuyType = null;
    const modal = document.getElementById('houseBuyConfirmModal');
    if (modal) modal.style.display = 'none';
}
window.closeHouseConfirmModal = closeHouseConfirmModal;`;

if (targetFunctionRegex.test(housingJs)) {
    housingJs = housingJs.replace(targetFunctionRegex, replacementHousingCode);
    fs.writeFileSync(housingPath, housingJs, 'utf8');
    console.log("2. public/js/housing.js updated with in-game confirm modal logic!");
} else {
    console.error("2. confirmBuyHouse regex not matched in housing.js!");
}
