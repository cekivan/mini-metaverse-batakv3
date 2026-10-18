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
    modal.style.display = 'flex';
}
window.openPetShopModal = openPetShopModal;

function closePetShopModal() {
    const modal = document.getElementById('petShopModal');
    if (modal) modal.style.display = 'none';
}
window.closePetShopModal = closePetShopModal;

function requestBuyPet(petType) {
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
    }
}
window.updateAndRenderCompanionPets = updateAndRenderCompanionPets;

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
}
