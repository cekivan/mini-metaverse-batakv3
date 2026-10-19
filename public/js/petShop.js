// public/js/petShop.js - Sevimli Patiler Pet Shop İstemci ve Evcil Hayvan Çizim Motoru

window.activeCompanionPets = window.activeCompanionPets || {};

// 1. PET SHOP MODAL KONTROLLERİ
function openPetShopModal() {
    if (window.playSound) window.playSound('uiClick');

    const modal = document.getElementById('petShopModal');
    if (!modal) return;

    // Bakiye göstergesini güncelle
    const moneyDisplay = document.getElementById('userMoneyDisplay');
    const petMoneyEl = document.getElementById('petShopUserMoney');
    if (petMoneyEl && moneyDisplay) {
        petMoneyEl.innerText = `${moneyDisplay.innerText} TL`;
    }

    // Sunucudan güncel durumu iste
    if (window.socket && window.socket.connected) {
        window.socket.emit('getPetShopStatus');
    }

    modal.style.display = 'flex';
}
window.openPetShopModal = openPetShopModal;

function closePetShopModal() {
    const modal = document.getElementById('petShopModal');
    if (modal) modal.style.display = 'none';
}
window.closePetShopModal = closePetShopModal;

function requestBuyPet(petType) {
    if (window.playSound) window.playSound('uiClick');

    if (window.socket && window.socket.connected) {
        window.socket.emit('requestBuyPet', { petType: petType });
    }
}
window.requestBuyPet = requestBuyPet;


// 2. SOKET DİNLEYİCİLERİ
(function initPetShopSockets() {
    const s = window.socket || (typeof io !== 'undefined' ? io() : null);
    if (!s) return;

    // Odadaki tüm aktif yoldaşlar listesi geldiğinde
    s.on('activeCompanionPets', (petsList) => {
        if (!Array.isArray(petsList)) return;
        let oldPets = Object.assign({}, window.activeCompanionPets);
        window.activeCompanionPets = {};
        petsList.forEach(pet => {
            if (pet) {
                let key = pet.ownerId || pet.id;
                let existing = oldPets[key];
                if (existing) {
                    pet.curX = existing.curX !== undefined ? existing.curX : pet.x;
                    pet.curY = existing.curY !== undefined ? existing.curY : pet.y;
                    pet.walkCycle = existing.walkCycle || 0;
                    pet.facing = existing.facing || pet.facing || 'down';
                } else {
                    pet.curX = pet.x;
                    pet.curY = pet.y;
                    pet.walkCycle = 0;
                }
                window.activeCompanionPets[key] = pet;
            }
        });
        if (typeof myId !== 'undefined' && oldPets[myId] && !window.activeCompanionPets[myId]) {
            window.activeCompanionPets[myId] = oldPets[myId];
        }
    });

    // Yeni bir yoldaş odaya girdiğinde / sahiplenildiğinde
    s.on('companionPetSpawned', (data) => {
        if (!data || !data.pet) return;
        const pet = data.pet;
        let key = pet.ownerId || pet.id;
        let existing = window.activeCompanionPets[key];
        if (existing) {
            pet.curX = existing.curX !== undefined ? existing.curX : pet.x;
            pet.curY = existing.curY !== undefined ? existing.curY : pet.y;
            pet.walkCycle = existing.walkCycle || 0;
        } else {
            pet.curX = pet.x;
            pet.curY = pet.y;
            pet.walkCycle = 0;
        }
        window.activeCompanionPets[key] = pet;

        // Kendi evcil hayvanımızsa sevimli bildirim göster
        if (typeof myId !== 'undefined' && pet.ownerId === myId) {
            closePetShopModal();
            if (window.playSound) window.playSound('win');
            if (typeof showSocialNotificationToast === 'function') {
                showSocialNotificationToast('🐾', 'Yeni Yoldaş!', `${pet.name} (${pet.emoji}) artık seninle geziyor!`);
            }
        }
    });

    // Yoldaş odadan ayrıldığında veya süresi bittiğinde
    s.on('companionPetDespawned', (data) => {
        if (!data) return;
        if (data.ownerId && window.activeCompanionPets[data.ownerId]) {
            delete window.activeCompanionPets[data.ownerId];
        }
        if (data.petId && window.activeCompanionPets[data.petId]) {
            delete window.activeCompanionPets[data.petId];
        }
    });

    // Yoldaş konuştuğunda
    s.on('companionPetSpeak', (data) => {
        if (!data) return;
        const pet = (data.ownerId && window.activeCompanionPets[data.ownerId]) || (data.petId && window.activeCompanionPets[data.petId]);
        if (pet) {
            pet.speech = data.speech;
            pet.speechUntil = Date.now() + 6000;
        }
    });

    // Pet süresi dolduğunda
    s.on('companionPetExpired', (data) => {
        if (typeof showSocialNotificationToast === 'function') {
            showSocialNotificationToast('⏳', 'Yoldaşının Süresi Doldu', data.message || 'Evcil hayvanın yuvasına döndü.');
        }
    });

    // Satın alma başarılı yanıtı
    s.on('buyPetSuccess', (data) => {
        closePetShopModal();
        if (window.playSound) window.playSound('win');
    });

    // Pet Shop durum bilgisi geldiğinde
    s.on('petShopStatus', (data) => {
        if (!data) return;
        const noticeEl = document.getElementById('petShopActivePetNotice');
        if (noticeEl) {
            if (data.activePet) {
                const mins = Math.ceil(data.activePet.remainingMs / 60000);
                noticeEl.style.display = 'block';
                noticeEl.innerHTML = `⏳ Şu anda aktif bir yoldaşın var: <b>${data.activePet.name} (${data.activePet.emoji})</b> (${mins} dk kaldı). Yeni bir pet alırsan eskisinin yerini alır.`;
            } else {
                noticeEl.style.display = 'none';
            }
        }
        const moneyEl = document.getElementById('petShopUserMoney');
        if (moneyEl && data.money !== undefined) {
            moneyEl.innerText = `${data.money.toLocaleString()} TL`;
        }
    });
})();


// 3. ANİMASYON VE ÇİZİM DÖNGÜSÜ (GAME LOOP HOOK)
function updateAndRenderCompanionPets(ctx, dt) {
    if (!window.activeCompanionPets) return;
    const now = Date.now();

    for (const id in window.activeCompanionPets) {
        const pet = window.activeCompanionPets[id];
        if (!pet) continue;

        // Yalnızca şu anki odadaysa çiz
        if (pet.room !== window.currentRoom) continue;

        // Sahibinin konumunu bul ve takip et
        let owner = null;
        if (typeof players !== 'undefined') {
            owner = players[pet.ownerId];
        }

        if (pet.curX === undefined) pet.curX = pet.x || 400;
        if (pet.curY === undefined) pet.curY = pet.y || 400;

        let targetX = pet.x;
        let targetY = pet.y;

        if (owner) {
            // Sahibin yönüne göre yanında ve hafif arkasında yürü
            let offsetSide = (owner.facing === 'left') ? 22 : -22;
            let offsetY = 8;
            targetX = owner.x + offsetSide;
            targetY = owner.y + offsetY;
        }

        let dx = targetX - pet.curX;
        let dy = targetY - pet.curY;
        let dist = Math.hypot(dx, dy);

        // Yoldaş Yürüyüş Enterpolasyonu (Lerp)
        if (dist > 80) {
            pet.curX = targetX;
            pet.curY = targetY;
            pet.isMoving = false;
        } else if (dist > 3) {
            let speed = Math.min(1, 14 * dt);
            pet.curX += dx * speed;
            pet.curY += dy * speed;
            pet.isMoving = true;
            pet.walkCycle = (pet.walkCycle || 0) + (16 * dt);

            if (Math.abs(dx) > 0.3) {
                pet.facing = (dx > 0) ? 'right' : 'left';
            }
        } else {
            pet.curX = targetX;
            pet.curY = targetY;
            pet.isMoving = false;
            pet.walkCycle = 0;
        }

        drawSingleCompanionPet(ctx, pet, pet.curX, pet.curY, now);
    }
}
window.updateAndRenderCompanionPets = updateAndRenderCompanionPets;


// 4. EVSEL HAYVAN VE YOLDAŞ ÇİZİMİ (KEDİ, KÖPEK, FARE)
function drawSingleCompanionPet(ctx, pet, x, y, now) {
    ctx.save();

    let isMoving = pet.isMoving;
    let bob = isMoving ? Math.sin(pet.walkCycle * 2) * 2.5 : Math.sin(now / 500) * 1.2;
    let isFlipped = (pet.facing === 'left');

    // 1. Zemin Gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Pet Türüne Göre Karakter Çizimi
    ctx.translate(x, y + bob);
    if (isFlipped) {
        ctx.scale(-1, 1);
    }

    if (pet.petType === 'dog') {
        drawCartoonDog(ctx, isMoving, now);
    } else if (pet.petType === 'mouse') {
        drawCartoonMouse(ctx, isMoving, now);
    } else {
        drawCartoonCat(ctx, isMoving, now);
    }

    ctx.restore(); // Ölçekleme ve transformasyonu sıfırla

    // 3. İsimlik ve Konuşma Balonları (Düz Dünya Koordinatlarında)
    drawPetNameAndSpeech(ctx, pet, x, y - 22, now);
}

// 🐱 Sevimli Sarman / Tekir Kedi
function drawCartoonCat(ctx, isMoving, now) {
    // Kuyruk
    let tailWag = Math.sin(now / 200) * 0.3;
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.quadraticCurveTo(-16 + tailWag * 10, -18, -12, -22 + tailWag * 6);
    ctx.stroke();

    // Gövde (Turuncu Kürk)
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.roundRect(-10, -12, 18, 12, 6);
    ctx.fill();

    // Beyaz Göğüs
    ctx.fillStyle = "#fff7ed";
    ctx.beginPath();
    ctx.ellipse(2, -6, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Patiler
    ctx.fillStyle = "#ea580c";
    let legOffset = isMoving ? Math.sin(now / 80) * 2 : 0;
    ctx.fillRect(-7 + legOffset, -2, 4, 4);
    ctx.fillRect(4 - legOffset, -2, 4, 4);

    // Kafa
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.arc(4, -14, 8, 0, Math.PI * 2);
    ctx.fill();

    // Kulaklar (Sivri Pembe İçi)
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.moveTo(0, -20); ctx.lineTo(3, -26); ctx.lineTo(7, -21); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -21); ctx.lineTo(9, -26); ctx.lineTo(12, -20); ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#fbcfe8"; // Pembe iç kulak
    ctx.beginPath();
    ctx.moveTo(1, -21); ctx.lineTo(3, -24); ctx.lineTo(6, -21); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -21); ctx.lineTo(9, -24); ctx.lineTo(11, -21); ctx.closePath(); ctx.fill();

    // Gözler (Zümrüt Yeşili)
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.ellipse(3, -15, 1.8, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(7, -15, 1.8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(3.5, -15, 1.1, 0, Math.PI * 2);
    ctx.arc(7.5, -15, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Pembe Burun ve Bıyıklar
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.arc(5.5, -11.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#fed7aa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, -12); ctx.lineTo(14, -13);
    ctx.moveTo(8, -11); ctx.lineTo(14, -10);
    ctx.stroke();
}

// 🐶 Sevimli Altın Sarısı Köpek (Golden / Shiba)
function drawCartoonDog(ctx, isMoving, now) {
    // Kuyruk (Neşeyle Fırıl Fırıl Sallanan)
    let tailWag = Math.sin(now / 120) * 0.45;
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.quadraticCurveTo(-18 + tailWag * 12, -16, -15, -20);
    ctx.stroke();

    // Gövde (Bal Sarısı)
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.roundRect(-11, -13, 20, 13, 6);
    ctx.fill();

    // Patiler
    ctx.fillStyle = "#ca8a04";
    let legOffset = isMoving ? Math.sin(now / 80) * 2.5 : 0;
    ctx.fillRect(-8 + legOffset, -2, 4.5, 4);
    ctx.fillRect(5 - legOffset, -2, 4.5, 4);

    // Kırmızı Tasma & Altın Zil
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(0, -13, 3.5, 8);
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(1.5, -6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Kafa
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(5, -14, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Düşük Sevimli Kulaklar
    ctx.fillStyle = "#ca8a04";
    ctx.beginPath();
    ctx.ellipse(0, -16, 3, 6, 0.4, 0, Math.PI * 2);
    ctx.ellipse(10, -16, 3, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Gözler (Büyük Sevimli Siyah)
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(4, -15, 1.8, 0, Math.PI * 2);
    ctx.arc(8, -15, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Göz ışıltısı
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(3.5, -15.5, 0.7, 0, Math.PI * 2);
    ctx.arc(7.5, -15.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Siyah Burun ve Ağız
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.ellipse(6.5, -11.5, 2, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dil (Açıksa)
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(6.5, -8.5, 1.5, 0, Math.PI);
    ctx.fill();
}

// 🐭 Minik ve Hızlı Gri Fare
function drawCartoonMouse(ctx, isMoving, now) {
    // Uzun İnce Kıvrık Kuyruk
    let tailWave = Math.sin(now / 150) * 0.35;
    ctx.strokeStyle = "#f472b6";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-9, -3);
    ctx.quadraticCurveTo(-18 + tailWave * 8, -10, -22, -14 + tailWave * 6);
    ctx.stroke();

    // Gövde (Açık Gri / Gümüşi)
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.ellipse(-2, -6, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Minik Pembe Patiler
    ctx.fillStyle = "#f472b6";
    let legOffset = isMoving ? Math.sin(now / 60) * 2 : 0;
    ctx.fillRect(-6 + legOffset, -2, 2.5, 3);
    ctx.fillRect(2 - legOffset, -2, 2.5, 3);

    // Kafa (Sivri Burunlu)
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(3, -11);
    ctx.lineTo(12, -5.5);
    ctx.lineTo(3, -1);
    ctx.closePath();
    ctx.fill();

    // Yuvarlak Pembe Kulaklar
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(1, -12, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fbcfe8";
    ctx.beginPath();
    ctx.arc(1, -12, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Parlak Minik Siyah Göz
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(6, -7.5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Pembe Burun Ucu
    ctx.fillStyle = "#ec4899";
    ctx.beginPath();
    ctx.arc(12, -5.5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Minik Bıyıklar
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(11, -5.5); ctx.lineTo(16, -7);
    ctx.moveTo(11, -5.5); ctx.lineTo(16, -4);
    ctx.stroke();
}

// 💬 İsimlik ve Konuşma Balonları Çizimi
function drawPetNameAndSpeech(ctx, pet, x, y, now) {
    // 1. Minik Sevimli İsimlik
    ctx.save();
    let nameText = `${pet.emoji} ${pet.name}`;
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    let tw = ctx.measureText(nameText).width;

    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.beginPath();
    ctx.roundRect(x - tw / 2 - 5, y - 9, tw + 10, 14, 7);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#fed7aa";
    ctx.fillText(nameText, x, y + 2);
    ctx.restore();

    // 2. Konuşma Balonu (Eğer konuşuyorsa)
    if (pet.speech && pet.speechUntil && now < pet.speechUntil) {
        ctx.save();
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        let speechTw = ctx.measureText(pet.speech).width;
        let bubbleW = Math.max(50, speechTw + 16);
        let bubbleH = 22;
        let bubbleX = x - bubbleW / 2;
        let bubbleY = y - 36;

        // Balon gövdesi
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 10);
        ctx.fill();
        ctx.strokeStyle = "#fb923c";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Balon kuyruğu
        ctx.fillStyle = "#fb923c";
        ctx.beginPath();
        ctx.moveTo(x - 4, bubbleY + bubbleH);
        ctx.lineTo(x, bubbleY + bubbleH + 6);
        ctx.lineTo(x + 4, bubbleY + bubbleH);
        ctx.closePath();
        ctx.fill();

        // Balon yazısı
        ctx.fillStyle = "#fef08a";
        ctx.fillText(pet.speech, x, bubbleY + 15);
        ctx.restore();
    }
}
