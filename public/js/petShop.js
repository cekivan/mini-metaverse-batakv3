<<<<<<< HEAD
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

=======
// public/js/petShop.js - Mini Metaverse Pet Shop & Sevimli Yoldaş (Kedi, Köpek, Fare) Motoru
// Evcil hayvanların haritada çizimini, sahibini takip etmesini ve mağaza arayüzünü yönetir.

window.activeCompanionPets = {};
window.activePetSpawnEffects = [];

// ============================================================================
// 1. PET SHOP MAĞAZA PENCERESİ (MODAL) YÖNETİMİ
// ============================================================================

function openPetShopModal() {
    const modal = document.getElementById('petShopModal');
    if (!modal) return;

    // Güncel parayı güncelle
    const moneyEl = document.getElementById('petShopUserMoney');
    if (moneyEl) {
        let currentMoney = (typeof myMoney !== 'undefined') ? myMoney : 0;
        let displayEl = document.getElementById('userMoneyDisplay');
        if (displayEl && displayEl.innerText) {
            currentMoney = parseInt(displayEl.innerText.replace(/[^0-9]/g, '')) || currentMoney;
        }
        moneyEl.innerText = `${currentMoney.toLocaleString('tr-TR')} TL`;
    }

    // Aktif bir peti varsa bilgi göster
    const activeInfo = document.getElementById('petShopActivePetNotice');
    if (activeInfo) {
        let myPet = (typeof myId !== 'undefined' && window.activeCompanionPets) ? window.activeCompanionPets[myId] : null;
        if (myPet && myPet.expiresAt > Date.now()) {
            activeInfo.style.display = 'block';
            activeInfo.innerHTML = `🐾 Şu anda aktif bir evcil hayvanın var. Yeni bir pet sahiplenirsen eskisi evine döner.`;
        } else {
            activeInfo.style.display = 'none';
        }
    }

    if (window.playSound) window.playSound('coin');
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
    modal.style.display = 'flex';
}
window.openPetShopModal = openPetShopModal;

function closePetShopModal() {
    const modal = document.getElementById('petShopModal');
    if (modal) modal.style.display = 'none';
}
window.closePetShopModal = closePetShopModal;

function requestBuyPet(petType) {
<<<<<<< HEAD
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
=======
    if (!window.socket) return;
    window.socket.emit('buyCompanionPet', { petType: petType });
}
window.requestBuyPet = requestBuyPet;

// ============================================================================
// 2. PARÇACIK / MUCİZEVİ İNİŞ EFEKTLERİ
// ============================================================================

function createPetSpawnParticles(x, y, emoji = '✨') {
    const particles = [];
    for (let i = 0; i < 22; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = 1.2 + Math.random() * 2.8;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.2,
            life: 1.0,
            size: 4 + Math.random() * 6,
            color: ['#facc15', '#fb923c', '#38bdf8', '#f472b6', '#4ade80'][Math.floor(Math.random() * 5)]
        });
    }
    window.activePetSpawnEffects.push({ particles, emoji, x, y, time: Date.now() });
}

function drawPetSpawnEffects(ctx, dt) {
    if (!window.activePetSpawnEffects || window.activePetSpawnEffects.length === 0) return;

    for (let eIdx = window.activePetSpawnEffects.length - 1; eIdx >= 0; eIdx--) {
        let eff = window.activePetSpawnEffects[eIdx];
        let allDead = true;

        ctx.save();
        for (let p of eff.particles) {
            if (p.life <= 0) continue;
            allDead = false;
            p.x += p.vx * 60 * dt;
            p.y += p.vy * 60 * dt;
            p.vy += 2.2 * dt; // yerçekimi
            p.life -= 1.4 * dt;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1, p.size * p.life), 0, Math.PI * 2);
            ctx.fill();
        }

        // Sevimli kalpler ve parıltılar
        let elapsed = (Date.now() - eff.time) / 1000;
        if (elapsed < 1.2) {
            ctx.globalAlpha = Math.max(0, 1 - elapsed / 1.2);
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(eff.emoji || '🐾', eff.x, eff.y - 15 - elapsed * 20);
        }
        ctx.restore();

        if (allDead && elapsed >= 1.2) {
            window.activePetSpawnEffects.splice(eIdx, 1);
        }
    }
}

// ============================================================================
// 3. EVCİL HAYVAN ÇİZİMLERİ (KEDİ, KÖPEK, FARE)
// Karakter boyuna göre tam uyumlu, sevimli ve minyatür boyutlardadır.
// ============================================================================

// A) 🐱 KEDİ ÇİZİMİ (~18x16 px)
function drawCatPet(ctx, pX, pY, facing, walkCycle, isMoving) {
    let legWiggle = isMoving ? Math.sin(walkCycle) * 3 : 0;
    let tailAngle = Math.sin(walkCycle * 0.8) * 0.45;
    let flip = (facing === 'left') ? -1 : 1;

    ctx.save();
    ctx.translate(pX, pY);
    ctx.scale(flip, 1);

    // Kedi Zemin Gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 8, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sallanan Zarif Kedi Kuyruğu
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7, 2);
    ctx.quadraticCurveTo(-14 + tailAngle * 6, -6, -11 + tailAngle * 8, -12);
    ctx.stroke();

    // Arka ve Ön Patiler
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-5 + legWiggle * 0.4, 7, 2.5, 1.8, 0, 0, Math.PI * 2);
    ctx.ellipse(4 - legWiggle * 0.4, 7, 2.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Turuncu Tekir Gövde
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.ellipse(0, 3, 7.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sırt Çizgileri
    ctx.strokeStyle = "#c2410c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -1); ctx.lineTo(-2, 3);
    ctx.moveTo(1, -1); ctx.lineTo(1, 3);
    ctx.stroke();

    // Beyaz Göğüs Tüyleri
    ctx.fillStyle = "#fff7ed";
    ctx.beginPath();
    ctx.ellipse(3, 4, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Kedi Kafası
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(4, -2, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Sivri Kulaklar
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.moveTo(1, -6); ctx.lineTo(3, -11); ctx.lineTo(6, -6); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5, -6); ctx.lineTo(8, -10); ctx.lineTo(9.5, -5); ctx.fill();

    // Kulak İçi Pembeliği
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.moveTo(2.2, -6); ctx.lineTo(3.2, -9.5); ctx.lineTo(5, -6); ctx.fill();

    // Gözler (Zümrüt Yeşili Çizgi Film Kedi Gözü)
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(4.5, -2.5, 1.3, 0, Math.PI * 2);
    ctx.arc(7.5, -2.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(4.5, -2.5, 0.7, 0, Math.PI * 2);
    ctx.arc(7.5, -2.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Minik Pembe Burun
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(6.5, -0.8, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Minik Bıyıklar
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(8, -1); ctx.lineTo(12, -2);
    ctx.moveTo(8, 0); ctx.lineTo(12, 1);
    ctx.stroke();

    ctx.restore();
}

// B) 🐶 KÖPEK ÇİZİMİ (~22x18 px)
function drawDogPet(ctx, pX, pY, facing, walkCycle, isMoving) {
    let legWiggle = isMoving ? Math.sin(walkCycle) * 3.5 : 0;
    let tailWag = isMoving ? Math.sin(walkCycle * 1.8) * 0.6 : Math.sin(Date.now() / 150) * 0.35;
    let flip = (facing === 'left') ? -1 : 1;

    ctx.save();
    ctx.translate(pX, pY);
    ctx.scale(flip, 1);

    // Köpek Zemin Gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 9, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hızlı Wagging Kuyruk
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.lineTo(-13 + tailWag * 5, -5 + tailWag * 3);
    ctx.stroke();

    // Bacaklar ve Patiler
    ctx.fillStyle = "#a16207";
    ctx.fillRect(-6 + legWiggle * 0.5, 6, 3, 4);
    ctx.fillRect(4 - legWiggle * 0.5, 6, 3, 4);
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.ellipse(-4.5 + legWiggle * 0.5, 9.5, 2.8, 1.8, 0, 0, Math.PI * 2);
    ctx.ellipse(5.5 - legWiggle * 0.5, 9.5, 2.8, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden / Bal Rengi Gövde
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.ellipse(0, 3.5, 9, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Açık Renk Karın
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.ellipse(2, 4.5, 4.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Kırmızı Sevimli Tasma
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(3, -1, 3.5, 6);
    // Altın Madalyon
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(5, 5.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Köpek Kafası
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(6, -2, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Sarkık Sevimli Kulak
    let earBounce = isMoving ? Math.abs(Math.sin(walkCycle)) * 2 : 0;
    ctx.fillStyle = "#a16207";
    ctx.beginPath();
    ctx.roundRect(1, -6 + earBounce, 4.5, 8.5, 2.5);
    ctx.fill();

    // Siyah Buton Göz
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(7.5, -3, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(7.2, -3.5, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Tombul Ağız/Burun Bölgesi (Muzzle)
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.ellipse(9.5, -0.5, 3.5, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Siyah Islak Burun
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(11.5, -1.8, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Gülümseyen Ağız & Minik Pembe Dil
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(10.5, 1.2, 1.2, 0, Math.PI);
    ctx.fill();

    ctx.restore();
}

// C) 🐭 TRANSFORMICE FARESİ ÇİZİMİ (~22x24 px)
function drawMousePet(ctx, pX, pY, facing, walkCycle, isMoving) {
    let legWaddle = isMoving ? Math.sin(walkCycle) * 3 : 0;
    let bodyBob = isMoving ? Math.abs(Math.sin(walkCycle)) * 1.5 : 0;
    let tailWag = isMoving ? Math.sin(walkCycle * 0.9) * 4 : Math.sin(Date.now() / 250) * 2;
    let flip = (facing === 'left') ? -1 : 1;

    ctx.save();
    ctx.translate(pX, pY);
    ctx.scale(flip, 1);

    // 1. Zemin Taban Gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 1, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Kıvrık Transformice Kuyruğu (Arka sırttan yukarı doğru S kıvrımı)
    ctx.strokeStyle = "#e8c4a2";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-5, -6 - bodyBob);
    ctx.bezierCurveTo(-14 + tailWag * 0.5, -14, -15 - tailWag, -22, -9 - tailWag * 0.8, -26);
    ctx.stroke();

    // 3. Arka Kulak (Kafanın Arkasından Uzanan Dik Kulak)
    ctx.fillStyle = "#3d2314";
    ctx.beginPath();
    ctx.moveTo(0, -18 - bodyBob);
    ctx.quadraticCurveTo(2, -26 - bodyBob, 4.5, -27 - bodyBob);
    ctx.quadraticCurveTo(5.5, -21 - bodyBob, 3.5, -17 - bodyBob);
    ctx.closePath();
    ctx.fill();

    // 4. Arka Bacak ve Açık Renk Pati (Yere basan ayak)
    ctx.fillStyle = "#e8c4a2";
    ctx.beginPath();
    ctx.roundRect(-2 + legWaddle * 0.4, -1, 7, 3, 1.5);
    ctx.fill();
    ctx.strokeStyle = "#2b180d";
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // 5. Tombul Çikolata Kahvesi Gövde (Armut biçimli sevimli gövde)
    ctx.fillStyle = "#593c24";
    ctx.beginPath();
    ctx.ellipse(-1, -8 - bodyBob, 7.5, 8.5, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b180d";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Açık Renk Karın Yumuşaklığı
    ctx.fillStyle = "#6d4a2d";
    ctx.beginPath();
    ctx.ellipse(1.5, -7 - bodyBob, 4.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Sevimli Minik Ön Patiler (Göğsün önünde duran eller)
    ctx.fillStyle = "#593c24";
    ctx.beginPath();
    ctx.roundRect(3, -11 - bodyBob, 4, 2.8, 1.4);
    ctx.fill();
    ctx.strokeStyle = "#2b180d";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Pati ucu açık renk
    ctx.fillStyle = "#e8c4a2";
    ctx.beginPath();
    ctx.arc(6.5, -9.6 - bodyBob, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 7. Kafa (Öne doğru sivrilen sevimli kemerli burun yapısı)
    ctx.fillStyle = "#593c24";
    ctx.beginPath();
    ctx.moveTo(1, -20 - bodyBob);
    ctx.quadraticCurveTo(8, -21 - bodyBob, 12, -14 - bodyBob); // Üst kafa kavisi
    ctx.quadraticCurveTo(12, -10 - bodyBob, 6, -11 - bodyBob); // Çene altı
    ctx.quadraticCurveTo(1, -12 - bodyBob, 0, -16 - bodyBob);  // Boyun
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2b180d";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Alın Saç Buklesi (Crown Hair Tuft)
    ctx.fillStyle = "#593c24";
    ctx.beginPath();
    ctx.moveTo(1, -20 - bodyBob);
    ctx.lineTo(2, -23 - bodyBob);
    ctx.lineTo(4, -20 - bodyBob);
    ctx.fill();

    // 8. Öndeki Devasa Transformice Kulağı (Geniş Açık Pembe/Krem İç Kısım)
    ctx.fillStyle = "#593c24";
    ctx.beginPath();
    ctx.ellipse(-2, -19 - bodyBob, 8, 8.5, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b180d";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // İç Açık Renk Kulak Derisi
    ctx.fillStyle = "#eed2ba";
    ctx.beginPath();
    ctx.ellipse(-1.5, -19 - bodyBob, 6.2, 6.8, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // KULAKTAKİ İKONİK PEYNİR DİLİMİ KÜPESİ (Transformice İmzası)
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(-5, -23 - bodyBob);
    ctx.lineTo(-2, -26 - bodyBob);
    ctx.lineTo(-1, -22 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Peynir Deliği
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(-2.8, -23.8 - bodyBob, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 9. Sevimli Açık Renk Burun Ucu
    ctx.fillStyle = "#e8c4a2";
    ctx.beginPath();
    ctx.ellipse(12, -13.5 - bodyBob, 1.8, 1.3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b180d";
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 10. İkonik Büyük Parlak Anime Gözü
    ctx.fillStyle = "#1a1008";
    ctx.beginPath();
    ctx.ellipse(6.5, -16 - bodyBob, 2.4, 3.2, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Göz Parlaması (Büyük Beyaz Nokta & Küçük Parıltı)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(7.2, -17.2 - bodyBob, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5.8, -14.6 - bodyBob, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 11. Karakteristik Siyah Bıyıklar
    ctx.strokeStyle = "#2b180d";
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(8, -12 - bodyBob); ctx.lineTo(15, -11 - bodyBob);
    ctx.moveTo(7.5, -10.5 - bodyBob); ctx.lineTo(14, -8 - bodyBob);
    ctx.stroke();

    ctx.restore();
}

// ============================================================================
// 4. TEK BİR PETİ HAREKET ETTİRME VE ÇİZME DÖNGÜSÜ
// ============================================================================

function drawSingleCompanionPet(ctx, pet, dt) {
    if (!pet) return;

    // Kendi petimiz ise odayı senkron tut
    if (typeof myId !== 'undefined' && pet.ownerId === myId) {
        pet.room = (typeof currentRoom !== 'undefined') ? currentRoom : pet.room;
    } else if (typeof currentRoom !== 'undefined' && pet.room !== currentRoom) {
        return;
    }

    // Sahibini bul
    let owner = (typeof players !== 'undefined') ? players[pet.ownerId] : null;

    if (owner) {
        let targetOffsetX = (owner.facing === 'left') ? 24 : -24;
        let targetOffsetY = 6;
        let targetX = (owner.x || 400) + targetOffsetX;
        let targetY = (owner.y || 300) + targetOffsetY;

        let dx = targetX - (pet.x || targetX);
        let dy = targetY - (pet.y || targetY);
        let dist = Math.hypot(dx, dy);

        if (dist > 300) {
            pet.x = targetX;
            pet.y = targetY;
            pet.isMoving = false;
        } else if (dist > 18) {
            let moveSpeed = 8.5 * dt;
            pet.x += dx * Math.min(moveSpeed, 0.25);
            pet.y += dy * Math.min(moveSpeed, 0.25);
            pet.isMoving = true;
            pet.walkCycle = (pet.walkCycle || 0) + (14 * dt);

            if (Math.abs(dx) > Math.abs(dy)) {
                pet.facing = dx > 0 ? 'right' : 'left';
            } else {
                pet.facing = dy > 0 ? 'down' : 'up';
            }
        } else {
            pet.isMoving = false;
        }
    }

    let pX = pet.x || 400;
    let pY = pet.y || 300;
    let facing = pet.facing || 'down';
    let walkCycle = pet.walkCycle || 0;
    let isMoving = !!pet.isMoving;

    // Türe göre minik gövdeyi çiz
    if (pet.petType === 'cat') {
        drawCatPet(ctx, pX, pY, facing, walkCycle, isMoving);
    } else if (pet.petType === 'dog') {
        drawDogPet(ctx, pX, pY, facing, walkCycle, isMoving);
    } else if (pet.petType === 'mouse') {
        drawMousePet(ctx, pX, pY, facing, walkCycle, isMoving);
    }

    // Konuşma Balonu (Örn: "Peynirim nerede? 🧀", "Miyavvv! 🐾", "Hav hav! 🐶")
    if (pet.speech && Date.now() < (pet.speechUntil || 0)) {
        let speechText = pet.speech;
        ctx.font = "bold 10px sans-serif";
        let speechW = ctx.measureText(speechText).width;
        let bubbleH = 19;
        let bubbleY = pY - 34;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(pX - speechW / 2 - 8, bubbleY, speechW + 16, bubbleH, 6);
        ctx.fill();
        ctx.strokeStyle = "#fb923c";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Balon okcuğu
        ctx.beginPath();
        ctx.moveTo(pX - 4, bubbleY + bubbleH);
        ctx.lineTo(pX, bubbleY + bubbleH + 4);
        ctx.lineTo(pX + 4, bubbleY + bubbleH);
        ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.fillText(speechText, pX, bubbleY + 13);
    }
}

// ============================================================================
// 5. TÜM EVCİL HAYVANLARI GÜNCELLEYİP ÇİZEN ANA METOD
// ============================================================================

function updateAndRenderCompanionPets(ctx, dt) {
    // 1. İniş parçacık efektlerini çiz
    drawPetSpawnEffects(ctx, dt);

    // 2. Haritadaki aktif evcil hayvanları çiz
    for (let id in window.activeCompanionPets) {
        drawSingleCompanionPet(ctx, window.activeCompanionPets[id], dt);
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
    }
}
window.updateAndRenderCompanionPets = updateAndRenderCompanionPets;

<<<<<<< HEAD

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
=======
// ============================================================================
// 6. SOKET DİNLEYİCİLERİ
// ============================================================================

if (window.socket) {
    // Mekandaki aktif evcil hayvanlar listesi
    window.socket.on('activeCompanionPets', (pets) => {
        let oldPets = window.activeCompanionPets || {};
        window.activeCompanionPets = {};
        if (Array.isArray(pets)) {
            pets.forEach(p => {
                if (p && p.ownerId) {
                    let existing = oldPets[p.ownerId];
                    if (existing && existing.petType === p.petType) {
                        existing.room = p.room;
                        existing.expiresAt = p.expiresAt;
                        existing.speech = p.speech;
                        existing.speechUntil = p.speechUntil;
                        window.activeCompanionPets[p.ownerId] = existing;
                    } else {
                        window.activeCompanionPets[p.ownerId] = p;
                    }
                }
            });
        }
        if (typeof myId !== 'undefined' && oldPets[myId] && !window.activeCompanionPets[myId]) {
            if (oldPets[myId].expiresAt > Date.now()) {
                window.activeCompanionPets[myId] = oldPets[myId];
            }
        }
    });

    // Yeni pet belirdiğinde
    window.socket.on('companionPetSpawned', (data) => {
        if (data && data.pet && data.pet.ownerId) {
            let p = data.pet;
            window.activeCompanionPets[p.ownerId] = p;
            createPetSpawnParticles(p.x, p.y, p.petType === 'cat' ? '🐱' : (p.petType === 'dog' ? '🐶' : '🐭'));
            if (window.playSound) window.playSound('coin');
        }
    });

    // Pet konuşması
    window.socket.on('companionPetSpeak', (data) => {
        if (data && data.ownerId && window.activeCompanionPets[data.ownerId]) {
            let pet = window.activeCompanionPets[data.ownerId];
            pet.speech = data.speech;
            pet.speechUntil = Date.now() + 7000;
        }
    });

    // Pet süresi dolunca veya ayrılınca
    window.socket.on('companionPetDespawned', (data) => {
        if (data && data.ownerId && window.activeCompanionPets[data.ownerId]) {
            let pet = window.activeCompanionPets[data.ownerId];
            createPetSpawnParticles(pet.x, pet.y, '💨');
            delete window.activeCompanionPets[data.ownerId];
        }
    });

    // Başarılı satın alma bildirimi
    window.socket.on('petPurchaseSuccess', (data) => {
        closePetShopModal();
        if (window.playSound) window.playSound('win');
        const toast = document.getElementById('reactionToast');
        if (toast) {
            toast.innerText = `🎉 Tebrikler! ${data.name} satın aldın. 15 dakika boyunca seninle!`;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 4000);
        }
    });
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
}
