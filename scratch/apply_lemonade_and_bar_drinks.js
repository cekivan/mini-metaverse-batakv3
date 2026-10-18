const fs = require('fs');
const path = require('path');

// 1. UPDATE src/handlers/economyHandler.js
const economyPath = path.join(__dirname, '../src/handlers/economyHandler.js');
let economyJs = fs.readFileSync(economyPath, 'utf8');

const oldBuyCocktailRegex = /socket\.on\('buyCocktail'[\s\S]*?io\.to\(room\)\.emit\('chatMessage'[\s\S]*?\}\);\s*\}\);/;

const newBuyCocktail = `socket.on('buyCocktail', (data) => {
        if (!players[socket.id] || !data) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const COCKTAILS = {
            'coconut': { name: 'Tropik Hindistan Cevizi Kokteyli', price: 25, icon: '🥥', chatText: 'Buz gibi Tropik Hindistan Cevizi Kokteyli yudumluyorum! 🌴' },
            'pineapple': { name: 'Buzlu Ananaslı Frappé', price: 30, icon: '🍍', chatText: 'Taze Buzlu Ananaslı Frappé harika! 🍍' },
            'mojito': { name: 'Çilekli Sahil Mojito', price: 35, icon: '🍓', chatText: 'Çilekli Sahil Mojito ile serinliyorum! 🍓' },
            'sunset': { name: 'Sunset Horizon (Güneş Batımı)', price: 45, icon: '🍹', chatText: 'Lüks Sunset Horizon kokteyli yudumluyorum! 🌅' },
            'lemonade': { name: 'Buzlu Nane & Limonata', price: 20, icon: '🍋', chatText: 'Buz gibi nane limonatamı yudumluyorum! 🍋' }
        };

        let item = COCKTAILS[data.id];
        if (!item) return;

        if ((userData.money || 0) < item.price) {
            socket.emit('gameError', \`Yetersiz bakiye! Bu içecek \${item.price} TL. Bakiyeniz: \${userData.money || 0} TL.\`);
            return;
        }

        userData.money = Math.max(0, (userData.money || 0) - item.price);
        players[socket.id].money = userData.money;

        // Oyuncunun eline içeceği ver
        userData.avatar = userData.avatar || {};
        userData.avatar.heldItem = 'cocktail_' + data.id;
        players[socket.id].heldItem = 'cocktail_' + data.id;

        dataManager.savePersistentData();

        socket.emit('moneyUpdate', userData.money);
        socket.emit('cocktailPurchasedSuccess', item);
        socket.emit('systemMessage', \`\${item.icon} [\${item.name}] satın aldınız ve afiyetle içtiniz! (-\${item.price} TL)\`);

        let room = players[socket.id].room;
        io.to(room).emit('playerAvatarChange', { id: socket.id, avatar: userData.avatar, heldItem: players[socket.id].heldItem });

        // Karakterin odada chat mesajı ve balonu çıkarmasını sağla
        let chatMsg = \`\${item.icon} \${item.chatText}\`;
        io.to(room).emit('chatUpdate', {
            id: socket.id,
            msg: chatMsg
        });
    });`;

if (oldBuyCocktailRegex.test(economyJs)) {
    economyJs = economyJs.replace(oldBuyCocktailRegex, newBuyCocktail);
    fs.writeFileSync(economyPath, economyJs, 'utf8');
    console.log("1. src/handlers/economyHandler.js updated!");
} else {
    console.error("1. oldBuyCocktailRegex did not match in economyHandler.js!");
}

// 2. UPDATE src/handlers/housingHandler.js
const housingHandlerPath = path.join(__dirname, '../src/handlers/housingHandler.js');
let housingHandlerJs = fs.readFileSync(housingHandlerPath, 'utf8');

const oldBuyLemonadeRegex = /socket\.on\('buyLemonadeFromStand'[\s\S]*?socket\.emit\('systemMessage',\s*`🍋 Buz gibi taze limonatayı afiyetle içtiniz![\s\S]*?\}\);\s*\}\);/;

const newBuyLemonade = `socket.on('buyLemonadeFromStand', (data) => {
        if (!players[socket.id] || !data) return;
        let buyerName = players[socket.id].name;
        let buyerKey = (dataManager.findUserKey ? dataManager.findUserKey(buyerName) : null) || buyerName;
        let buyerData = dataManager.persistentData.users[buyerKey];
        if (!buyerData) return;

        const LEMONADE_PRICE = 15;
        if ((buyerData.money || 0) < LEMONADE_PRICE) {
            socket.emit('gameError', "Limonata satın almak için yeterli paranız yok! (15 TL gerekli)");
            return;
        }

        let ownerName = data.owner;
        let ownerKey = (dataManager.findUserKey ? dataManager.findUserKey(ownerName) : null) || ownerName;
        let ownerData = dataManager.persistentData.users[ownerKey];

        // Alıcıdan 15 TL düş
        buyerData.money = Math.max(0, (buyerData.money || 0) - LEMONADE_PRICE);
        players[socket.id].money = buyerData.money;
        socket.emit('moneyUpdate', buyerData.money);

        // Ev sahibine 15 TL ekle (kullanıcı kuralı: "limonata satın aldıkça ev sahibine gitsin o para ve bir limonata sattınız bildirimiyle belirtsin bunu.")
        if (ownerData) {
            ownerData.money = (ownerData.money || 0) + LEMONADE_PRICE;

            // Eğer ev sahibi o an oyundaysa canlı bildirim ve bakiye güncellemesi gönder
            for (let sid in players) {
                if (players[sid] && players[sid].name && players[sid].name.toLowerCase() === ownerName.toLowerCase()) {
                    players[sid].money = ownerData.money;
                    io.to(sid).emit('moneyUpdate', ownerData.money);
                    io.to(sid).emit('lemonadeSaleNotification', {
                        buyer: buyerName,
                        amount: LEMONADE_PRICE
                    });
                    io.to(sid).emit('systemMessage', \`🍋 [\${buyerName}] sizden 1 bardak taze limonata satın aldı! Hesabınıza +15 TL eklendi.\`);
                    break;
                }
            }
        }

        // Alıcının eline taze limonata bardağı ver!
        buyerData.avatar = buyerData.avatar || {};
        buyerData.avatar.heldItem = 'limonata';
        players[socket.id].heldItem = 'limonata';

        dataManager.savePersistentData();

        let room = players[socket.id].room;
        io.to(room).emit('playerAvatarChange', { id: socket.id, avatar: buyerData.avatar, heldItem: 'limonata' });
        io.to(room).emit('chatUpdate', { id: socket.id, msg: '🍋 Buz gibi taze limonatamı yudumluyorum!' });

        // Alıcıya başarı mesajı
        socket.emit('lemonadePurchasedSuccess', { amount: LEMONADE_PRICE });
        socket.emit('systemMessage', \`🍋 Buz gibi taze limonatayı afiyetle içtiniz! (-15 TL ev sahibine ödendi)\`);
    });`;

if (oldBuyLemonadeRegex.test(housingHandlerJs)) {
    housingHandlerJs = housingHandlerJs.replace(oldBuyLemonadeRegex, newBuyLemonade);
    fs.writeFileSync(housingHandlerPath, housingHandlerJs, 'utf8');
    console.log("2. src/handlers/housingHandler.js updated!");
} else {
    console.error("2. oldBuyLemonadeRegex did not match in housingHandler.js!");
}

// 3. UPDATE public/index.html (Add #lemonadeStandModal)
const indexPath = path.join(__dirname, '../public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const houseModalMarker = `<!-- 6. MOBİLYA VE EV MARKETİ MODALI -->`;
const lemonadeModalHtml = `<!-- 5.3 OYUN İÇİ TAZE LİMONATA STANDI MODALI -->
    <div id="lemonadeStandModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.85); z-index: 45000; justify-content: center; align-items: center; color: white; backdrop-filter: blur(8px);">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 26px 24px; border-radius: 20px; width: 92%; max-width: 420px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.85), 0 0 25px rgba(250,204,21,0.25); border: 2px solid #facc15; position: relative;">
            <button onclick="closeLemonadeStandModal()" style="position: absolute; top: 14px; right: 16px; background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
            <div style="font-size: 52px; margin-bottom: 6px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">🍋</div>
            <h2 style="color: #fef08a; margin: 0 0 4px 0; font-size: 20px; font-weight: 800;">Taze Sıkılmış Limonata Standı</h2>
            <div style="color: #38bdf8; font-size: 14px; font-weight: 800; margin-bottom: 6px;"><span id="lemonadeOwnerName">Ev Sahibi</span>'nin Standı</div>
            <div style="color: #4ade80; font-size: 22px; font-weight: 900; margin-bottom: 12px;">15 TL</div>
            
            <p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.5; margin: 0 0 16px 0;">
                Buz gibi soğutulmuş, taze nane yapraklarıyla hazırlanmış organik ev limonatası! Satın aldığınızda ücret stand sahibine iletilir ve elinize buz gibi bir limonata bardağı verilir.
            </p>

            <div id="lemonadePlayerBalance" style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px; margin-bottom: 20px; font-size: 12.5px; color: #cbd5e1;">
                Mevcut Bakiyeniz: <b>- TL</b>
            </div>

            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="closeLemonadeStandModal()" style="flex: 1; padding: 12px 14px; background: rgba(239, 68, 68, 0.15); border: 1.5px solid #ef4444; color: #fca5a5; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer;">
                    Vazgeç
                </button>
                <button onclick="confirmBuyLemonade()" style="flex: 1.3; padding: 12px 16px; background: linear-gradient(135deg, #eab308, #ca8a04); color: #0f172a; border: none; border-radius: 12px; font-weight: 900; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 15px rgba(234,179,8,0.4); display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <span>🍋</span> 1 Bardak Satın Al (15 TL)
                </button>
            </div>
        </div>
    </div>

    `;

if (indexHtml.includes(houseModalMarker) && !indexHtml.includes('id="lemonadeStandModal"')) {
    indexHtml = indexHtml.replace(houseModalMarker, lemonadeModalHtml + houseModalMarker);
    fs.writeFileSync(indexPath, indexHtml, 'utf8');
    console.log("3. public/index.html updated with lemonadeStandModal!");
} else {
    console.log("3. lemonadeStandModal already exists or marker not found in index.html");
}

// 4. UPDATE public/js/housing.js
const housingJsPath = path.join(__dirname, '../public/js/housing.js');
let housingJs = fs.readFileSync(housingJsPath, 'utf8');

// Replace openLemonadeStandModal function to populate balance
const oldOpenLemonadeRegex = /function openLemonadeStandModal\(house\) \{[\s\S]*?window\.confirmBuyLemonade = confirmBuyLemonade;/;

const newOpenLemonade = `function openLemonadeStandModal(house) {
    if (!house) house = getCurrentViewingHouse();
    if (!house) return;
    const modal = document.getElementById('lemonadeStandModal');
    if (!modal) return;
    const ownerSpan = document.getElementById('lemonadeOwnerName');
    if (ownerSpan) ownerSpan.innerText = house.owner || "Ev Sahibi";

    const balanceDiv = document.getElementById('lemonadePlayerBalance');
    if (balanceDiv) {
        let userMoney = (window.myMoney !== undefined) ? window.myMoney : ((typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) ? players[myId].money : 0);
        let isEnough = userMoney >= 15;
        balanceDiv.innerHTML = \`Mevcut Bakiyeniz: <b>\${userMoney.toLocaleString('tr-TR')} TL</b> \` +
            (isEnough 
                ? \`<span style="color:#4ade80;">(Kalan: \${(userMoney - 15).toLocaleString('tr-TR')} TL)</span>\`
                : \`<br><span style="color:#f87171; font-weight:bold;">⚠️ Yetersiz Bakiye! (15 TL gerekli)</span>\`);
    }

    modal.style.display = 'flex';
    if (window.playSound) window.playSound('click');
}
window.openLemonadeStandModal = openLemonadeStandModal;

function closeLemonadeStandModal() {
    const modal = document.getElementById('lemonadeStandModal');
    if (modal) modal.style.display = 'none';
}
window.closeLemonadeStandModal = closeLemonadeStandModal;

function confirmBuyLemonade() {
    let house = getCurrentViewingHouse();
    if (!house) return;
    if (window.socket) {
        socket.emit('buyLemonadeFromStand', {
            owner: house.owner,
            houseType: house.type
        });
    }
    closeLemonadeStandModal();
}
window.confirmBuyLemonade = confirmBuyLemonade;`;

if (oldOpenLemonadeRegex.test(housingJs)) {
    housingJs = housingJs.replace(oldOpenLemonadeRegex, newOpenLemonade);
}

// Make sure owner clicking meyve_arabasi doesn't get "Locked" toast
const oldLockCheck = `if (isOwner && !window.isHouseEditMode && item.id !== 'gramofon') {`;
const newLockCheck = `if (isOwner && !window.isHouseEditMode && item.id !== 'gramofon' && item.id !== 'meyve_arabasi') {`;
if (housingJs.includes(oldLockCheck)) {
    housingJs = housingJs.replace(oldLockCheck, newLockCheck);
}

fs.writeFileSync(housingJsPath, housingJs, 'utf8');
console.log("4. public/js/housing.js updated!");

// 5. UPDATE public/js/cocktailBar.js (Z-Index, Toast, Sounds)
const cocktailPath = path.join(__dirname, '../public/js/cocktailBar.js');
let cocktailJs = fs.readFileSync(cocktailPath, 'utf8');

cocktailJs = cocktailJs.replace(/z-index:\s*36000;/, 'z-index: 45000;');

const oldSuccessHandler = `if (typeof socket !== 'undefined' && socket) {
    socket.on('cocktailPurchasedSuccess', (item) => {
        if (window.playSound) window.playSound('coins');
        closeCocktailBarModal();
    });
}`;

const newSuccessHandler = `if (typeof socket !== 'undefined' && socket) {
    socket.on('cocktailPurchasedSuccess', (item) => {
        if (window.playSound) {
            window.playSound('coin');
            window.playSound('tea_sip');
        }
        if (typeof showSocialNotificationToast === 'function') {
            showSocialNotificationToast(item.icon, 'Afiyet Olsun!', \`\${item.name} satın aldınız! (-\${item.price} TL)\`);
        }
        closeCocktailBarModal();
    });
}`;

if (cocktailJs.includes(oldSuccessHandler)) {
    cocktailJs = cocktailJs.replace(oldSuccessHandler, newSuccessHandler);
}

fs.writeFileSync(cocktailPath, cocktailJs, 'utf8');
console.log("5. public/js/cocktailBar.js updated!");

// 6. UPDATE public/js/avatarRenderer.js (Draw Lemonade & Cocktail glasses in drawHeldItem)
const avatarPath = path.join(__dirname, '../public/js/avatarRenderer.js');
let avatarJs = fs.readFileSync(avatarPath, 'utf8');

const drawHeldItemTarget = `    else if (heldItem === 'sirtcantasi') {`;

const cocktailHeldCode = `    else if (heldItem === 'limonata' || heldItem === 'lemonade' || heldItem.startsWith('cocktail_')) {
        // Taze Limonata & Tropik Sahil Kokteyli Bardağı
        let dX = handX, dY = handY;
        let cType = (heldItem === 'limonata' || heldItem === 'lemonade') ? 'lemonade' : heldItem.replace('cocktail_', '');

        if (cType === 'coconut') {
            // Tropik Hindistan cevizi kabuğu
            targetCtx.fillStyle = "#5c3317";
            targetCtx.beginPath();
            targetCtx.arc(dX, dY + 2, isPreview ? 6.5 : 5.5, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.strokeStyle = "#38200f";
            targetCtx.lineWidth = 1;
            targetCtx.stroke();

            // Beyaz iç kısım
            targetCtx.fillStyle = "#f8fafc";
            targetCtx.beginPath();
            targetCtx.ellipse(dX, dY - 1, isPreview ? 4.5 : 3.8, isPreview ? 2.2 : 1.8, 0, 0, Math.PI * 2);
            targetCtx.fill();

            // Kırmızı pipet
            targetCtx.strokeStyle = "#ef4444";
            targetCtx.lineWidth = 1.5;
            targetCtx.beginPath();
            targetCtx.moveTo(dX, dY - 1);
            targetCtx.lineTo(dX + (isPreview ? 4 : 3.5), dY - (isPreview ? 8 : 7));
            targetCtx.stroke();

            // Küçük kokteyl şemsiyesi
            targetCtx.fillStyle = "#ec4899";
            targetCtx.beginPath();
            targetCtx.arc(dX - 2, dY - 3, 3, Math.PI, 0);
            targetCtx.fill();
        } else {
            // Şeffaf cam kokteyl / limonata bardağı
            let liquidColor = "#facc15"; // Limonata sarısı
            let strawColor = "#10b981";  // Yeşil pipet
            let fruitColor = "#eab308";  // Limon dilimi

            if (cType === 'pineapple') {
                liquidColor = "#f59e0b"; // Ananas amber
                strawColor = "#3b82f6";
                fruitColor = "#facc15";
            } else if (cType === 'mojito') {
                liquidColor = "#f43f5e"; // Çilek kırmızı
                strawColor = "#22c55e";
                fruitColor = "#84cc16"; // Nane yeşili
            } else if (cType === 'sunset') {
                liquidColor = "#f97316"; // Portakal gün batımı
                strawColor = "#a855f7";
                fruitColor = "#dc2626"; // Nar kırmızısı
            }

            // Şeffaf cam bardak dış hatları
            let gW = isPreview ? 4.5 : 3.8;
            let gH = isPreview ? 9 : 7.5;
            targetCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
            targetCtx.beginPath();
            targetCtx.moveTo(dX - gW, dY - gH + 2);
            targetCtx.lineTo(dX + gW, dY - gH + 2);
            targetCtx.lineTo(dX + gW * 0.7, dY + 4);
            targetCtx.lineTo(dX - gW * 0.7, dY + 4);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.strokeStyle = "rgba(255, 255, 255, 0.85)";
            targetCtx.lineWidth = 1;
            targetCtx.stroke();

            // Renkli taze içecek sıvısı
            targetCtx.fillStyle = liquidColor;
            targetCtx.beginPath();
            targetCtx.moveTo(dX - gW * 0.9, dY - gH + 4);
            targetCtx.lineTo(dX + gW * 0.9, dY - gH + 4);
            targetCtx.lineTo(dX + gW * 0.65, dY + 3);
            targetCtx.lineTo(dX - gW * 0.65, dY + 3);
            targetCtx.closePath();
            targetCtx.fill();

            // Buz küpleri
            targetCtx.fillStyle = "rgba(255, 255, 255, 0.75)";
            targetCtx.fillRect(dX - 2, dY - 2, 2, 2);
            targetCtx.fillRect(dX + 0.5, dY, 2, 2);

            // Pipet
            targetCtx.strokeStyle = strawColor;
            targetCtx.lineWidth = 1.3;
            targetCtx.beginPath();
            targetCtx.moveTo(dX + 0.5, dY + 2);
            targetCtx.lineTo(dX + (isPreview ? 3.5 : 3), dY - gH - (isPreview ? 3 : 2.5));
            targetCtx.stroke();

            // Bardak kenarındaki meyve dilimi
            targetCtx.fillStyle = fruitColor;
            targetCtx.beginPath();
            targetCtx.arc(dX - gW + 0.5, dY - gH + 2.5, isPreview ? 2.5 : 2.2, 0, Math.PI);
            targetCtx.fill();
            targetCtx.strokeStyle = "#ffffff";
            targetCtx.lineWidth = 0.6;
            targetCtx.stroke();
        }
    }
`;

if (avatarJs.includes(drawHeldItemTarget) && !avatarJs.includes("heldItem === 'limonata'")) {
    avatarJs = avatarJs.replace(drawHeldItemTarget, cocktailHeldCode + "\n" + drawHeldItemTarget);
    fs.writeFileSync(avatarPath, avatarJs, 'utf8');
    console.log("6. public/js/avatarRenderer.js updated with drink rendering!");
} else {
    console.log("6. avatarRenderer.js drink code already exists or target not found.");
}

// 7. UPDATE public/js/main.js (Lemonade Stand click and triggerMobileInteract)
const mainJsPath = path.join(__dirname, '../public/js/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// In triggerMobileInteract(): add house lemonade check
const oldHouseInteract = `    } else if (currentRoom.startsWith("house_")) {
        if (p.x <= 90 && p.y >= canvas.height - 90) {`;

const newHouseInteract = `    } else if (currentRoom.startsWith("house_")) {
        // Limonata Standı yakınındaysa satın alma penceresini aç
        if (typeof getCurrentViewingHouse === 'function') {
            let house = getCurrentViewingHouse();
            if (house && house.furniture) {
                let stand = house.furniture.find(f => f.id === 'meyve_arabasi');
                if (stand && Math.hypot(p.x - stand.x, p.y - stand.y) < 110) {
                    if (typeof openLemonadeStandModal === 'function') {
                        openLemonadeStandModal(house);
                        return;
                    }
                }
            }
        }
        if (p.x <= 90 && p.y >= canvas.height - 90) {`;

if (mainJs.includes(oldHouseInteract) && !mainJs.includes("stand.id === 'meyve_arabasi'")) {
    mainJs = mainJs.replace(oldHouseInteract, newHouseInteract);
    console.log("7.1 main.js triggerMobileInteract updated for lemonade stand!");
}

// In canvas click: add house lemonade stand direct click check
const oldHouseCanvasClick = `    } else if (currentRoom.startsWith("house_")) {
        // Ev Çıkış Kapısı (Sol Altta)`;

const newHouseCanvasClick = `    } else if (currentRoom.startsWith("house_")) {
        // Limonata Standına Tıklama
        if (typeof getCurrentViewingHouse === 'function') {
            let house = getCurrentViewingHouse();
            if (house && house.furniture) {
                let stand = house.furniture.find(f => f.id === 'meyve_arabasi');
                if (stand && !window.isHouseEditMode) {
                    let cat = (typeof FURNITURE_CATALOG !== 'undefined') ? FURNITURE_CATALOG['meyve_arabasi'] : { w: 78, h: 68 };
                    let hw = (cat.w || 78) / 2 + 12;
                    let hh = (cat.h || 68) / 2 + 12;
                    if (clickX >= stand.x - hw && clickX <= stand.x + hw && clickY >= stand.y - hh && clickY <= stand.y + hh) {
                        if (typeof openLemonadeStandModal === 'function') {
                            openLemonadeStandModal(house);
                            return;
                        }
                    }
                }
            }
        }
        // Ev Çıkış Kapısı (Sol Altta)`;

if (mainJs.includes(oldHouseCanvasClick) && !mainJs.includes("// Limonata Standına Tıklama")) {
    mainJs = mainJs.replace(oldHouseCanvasClick, newHouseCanvasClick);
    console.log("7.2 main.js canvas click updated for lemonade stand!");
}

fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log("7. public/js/main.js updated!");
