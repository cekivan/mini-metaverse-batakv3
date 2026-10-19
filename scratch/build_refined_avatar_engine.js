// scratch/build_refined_avatar_engine.js
const fs = require('fs');
const path = require('path');

console.log("Generating refined realistic avatarRenderer.js with slender female waist, natural clothing drape & fabric depth...");

const code = `// public/js/avatarRenderer.js - Karakter, Kıyafet, Saç, Oturma Pozu ve Aksesuar Çizim Motoru (8 Açılı İzometrik & Gerçekçi Anatomi)

// --- 8 AÇILI İZOMETRİK YÖN YARDIMCISI VE NORMALİZASYON ---
function normalize8WayFacing(facing) {
    if (!facing) return 'down';
    let f = String(facing).toLowerCase().replace('_', '-').trim();
    if (f === 's' || f === 'south' || f === 'down' || f === 'front' || f === 'on') return 'down';
    if (f === 'n' || f === 'north' || f === 'up' || f === 'back' || f === 'arka') return 'up';
    if (f === 'e' || f === 'east' || f === 'right' || f === 'sag') return 'right';
    if (f === 'w' || f === 'west' || f === 'left' || f === 'sol') return 'left';
    if (f === 'se' || f === 'southeast' || f === 'down-right' || f === 'right-down' || f === 'sag-ileri') return 'down-right';
    if (f === 'sw' || f === 'southwest' || f === 'down-left' || f === 'left-down' || f === 'sol-ileri') return 'down-left';
    if (f === 'ne' || f === 'northeast' || f === 'up-right' || f === 'right-up' || f === 'sag-geri') return 'up-right';
    if (f === 'nw' || f === 'northwest' || f === 'up-left' || f === 'left-up' || f === 'sol-geri') return 'up-left';
    return f;
}
if (typeof window !== 'undefined') {
    window.normalize8WayFacing = normalize8WayFacing;
}

// Kadın Anatomisi Tespiti (Bel inceltme, zarif bacaklar ve göğüs hatları için)
function isFemaleAvatar(p, shirtColor, hatType, shoeType) {
    if (p && (p.gender === 'female' || p.isFemale)) return true;
    if (typeof window !== 'undefined' && (window.myGender === 'female' || window.selectedGender === 'female')) {
        if (!p || p.id === window.myId) return true;
    }
    let col = shirtColor || (p && p.color) || '';
    if (col.startsWith('dress_') || col.startsWith('skirt_') || col.startsWith('outfit_')) return true;
    let hat = hatType || (p && p.hat) || '';
    if (['hair_long', 'hair_wavy', 'hair_ponytail', 'hair_braids', 'hair_bob', 'hair_hijab', 'beret_pink', 'crown', 'hair_blonde_curls', 'hair_bun_chopsticks', 'hair_redhead_wavy', 'hair_pigtails_ribbon'].includes(hat)) return true;
    let shoe = shoeType || (p && p.shoes) || '';
    if (['heels', 'flats', 'heels_gold', 'boots_thigh_high', 'sandals_gladiator'].includes(shoe)) return true;
    return false;
}
if (typeof window !== 'undefined') {
    window.isFemaleAvatar = isFemaleAvatar;
}

// Renk tonlama yardımcısı (Kumaş ışık ve gölge derinliği için)
function adjustColorBrightness(col, percent) {
    if (!col || !col.startsWith('#')) return col;
    let num = parseInt(col.slice(1), 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// --- 1. AYAKKABI ÇİZİMİ (8 AÇILI İZOMETRİK TABAN & TOPUK) ---
function drawSingleShoe(targetCtx, x, y, shoeType, skinColor, angle = 0, isCrossed = false, facing = 'down', isFemale = false) {
    targetCtx.save();
    targetCtx.translate(x + 3.5, y + 2.5);
    if (angle !== 0) targetCtx.rotate(angle);
    targetCtx.translate(-(x + 3.5), -(y + 2.5));

    let f = normalize8WayFacing(facing);
    let isBack = (f === 'up' || f === 'up-right' || f === 'up-left');

    if (shoeType === 'classic') {
        // Cilalı Kösele Klasik Ayakkabı (Dikişli taban ve ışık parıltısı)
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y, 8, 4.5, [2, 3, 1, 1]);
        targetCtx.fill();
        targetCtx.fillStyle = isBack ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.45)";
        targetCtx.fillRect(x + 2, y + 1, 3, 1);
        targetCtx.fillStyle = "#78350f";
        targetCtx.fillRect(x, y + 3.8, 8, 1);
    } else if (shoeType === 'boots') {
        // Kışlık Deri Bot (Tırtıklı taban & dikişli burun)
        targetCtx.fillStyle = "#78350f";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y - 1, 8, 5.5, 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#1c1917";
        targetCtx.fillRect(x, y + 3.5, 8.5, 2);
        if (isBack) {
            targetCtx.fillStyle = "#451a03";
            targetCtx.fillRect(x + 3, y - 2, 2, 2);
        } else {
            targetCtx.strokeStyle = "rgba(255,255,255,0.2)";
            targetCtx.lineWidth = 0.8;
            targetCtx.strokeRect(x + 1, y, 6, 3);
        }
    } else if (shoeType === 'heels') {
        // Şık Topuklu Stiletto (Zarif kavisli burun ve ince topuk)
        targetCtx.fillStyle = "#e11d48";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 4, y + 2, 4, 2.3, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#9f1239";
        targetCtx.fillRect(x, y + 1.8, 1.4, 4.8);
        targetCtx.fillStyle = "rgba(255,255,255,0.3)";
        targetCtx.fillRect(x + 2.5, y + 1, 2, 0.8);
    } else if (shoeType === 'flats') {
        // Zarif Babet
        targetCtx.fillStyle = "#ec4899";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 3.5, y + 2, 3.8, 1.9, 0, 0, Math.PI * 2);
        targetCtx.fill();
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(x + 4, y + 1.5, 1.1, 0, Math.PI * 2); targetCtx.fill();
        }
    } else if (shoeType === 'heels_gold') {
        // Altın Simli Abiye Stiletto
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 4, y + 2, 4, 2.3, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#d97706";
        targetCtx.fillRect(x, y + 1.8, 1.4, 4.8);
        targetCtx.fillStyle = "#ef4444";
        targetCtx.fillRect(x + 1.5, y + 4.5, 4, 0.8);
    } else if (shoeType === 'boots_thigh_high') {
        // Diz Üstü Süet Çizme (Zarif bacak saran hat)
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        targetCtx.roundRect(x - 0.5, y - 5, 8, 10, [3, 3, 1, 1]);
        targetCtx.fill();
        targetCtx.fillStyle = "#475569";
        targetCtx.fillRect(x + 3.2, y - 5, 0.9, 9);
    } else if (shoeType === 'sandals_gladiator') {
        // İncili Gladyatör Sandalet
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        targetCtx.fillRect(x, y, 7.5, 4);
        targetCtx.fillStyle = "#d97706";
        targetCtx.fillRect(x, y + 3.5, 7.5, 1);
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(x + 2, y + 1.5, 1, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(x + 5, y + 1.5, 1, 0, Math.PI * 2); targetCtx.fill();
        }
    } else if (shoeType === 'none') {
        // Çıplak Ayak
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 3.5, y + 2, 3.5, 2, 0, 0, Math.PI * 2);
        targetCtx.fill();
    } else {
        // Varsayılan: Beyaz Tabanlı Sneaker
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y + 2, 8, 2.8, 1);
        targetCtx.fill();
        targetCtx.fillStyle = "#0284c7";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y, 7.5, 2.8, [2, 2, 0, 0]);
        targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(x + 2, y + 1, 3.5, 1);
    }

    targetCtx.restore();
}

// --- 2. BACAKLAR VE AYAKKABILAR (8 AÇILI İZOMETRİK & KADIN/ERKEK ANATOMİSİ) ---
function drawAvatarLegsAndShoes(targetCtx, pX, pY, legSwing = 0, skinColor = "#ffd1a4", shoeType = "sneakers", isSkirt = false, isSitting = false, facing = "down", isFemale = false) {
    let f = normalize8WayFacing(facing);
    let legColor = isSkirt ? (skinColor || "#ffd1a4") : "#1e293b";
    let shadowColor = "rgba(0, 0, 0, 0.28)";
    let legW = isFemale ? 4.2 : 5; // Kadın karakterlerde daha zarif ve ince bacak kalınlığı

    if (isSitting) {
        targetCtx.save();

        if (f === 'right') {
            // SAĞA DÖNÜK PROFİL OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 4, pY + 8, legW, 12);
            drawSingleShoe(targetCtx, pX - 5, pY + 19, shoeType, skinColor, 0, false, f, isFemale);

            targetCtx.fillStyle = legColor;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 5, pY + 6, 12, 6, [3, 4, 2, 2]);
            targetCtx.fill();
            targetCtx.fillRect(pX + 4, pY + 10, legW, 7);
            drawSingleShoe(targetCtx, pX + 4, pY + 16, shoeType, skinColor, 0.22, true, f, isFemale);

        } else if (f === 'left') {
            // SOLA DÖNÜK PROFİL OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 1, pY + 8, legW, 12);
            drawSingleShoe(targetCtx, pX - 2, pY + 19, shoeType, skinColor, 0, false, f, isFemale);

            targetCtx.fillStyle = legColor;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 7, pY + 6, 12, 6, [4, 3, 2, 2]);
            targetCtx.fill();
            targetCtx.fillRect(pX - 9, pY + 10, legW, 7);
            drawSingleShoe(targetCtx, pX - 11, pY + 16, shoeType, skinColor, -0.22, true, f, isFemale);

        } else if (f === 'up') {
            // TAM ARKAYA DÖNÜK OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 7, pY + 8, legW, 8);
            targetCtx.fillRect(pX + 2, pY + 8, legW, 8);
            targetCtx.fillStyle = "#1e1e1e";
            targetCtx.fillRect(pX - 7, pY + 16, legW, 4);
            targetCtx.fillRect(pX + 2, pY + 16, legW, 4);

        } else if (f === 'down-right') {
            // 3/4 SAĞ İLERİ OTURMA
            targetCtx.fillStyle = shadowColor;
            targetCtx.beginPath(); targetCtx.ellipse(pX + 2, pY + 10, 13, 5, 0.3, 0, Math.PI * 2); targetCtx.fill();

            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 4, pY + 8, legW, 11);
            drawSingleShoe(targetCtx, pX - 4, pY + 18, shoeType, skinColor, 0.15, false, f, isFemale);

            targetCtx.beginPath();
            targetCtx.roundRect(pX - 2, pY + 6, 13, 7, [3, 4, 2, 2]);
            targetCtx.fill();
            drawSingleShoe(targetCtx, pX + 5, pY + 15, shoeType, skinColor, 0.35, true, f, isFemale);

        } else if (f === 'down-left') {
            // 3/4 SOL İLERİ OTURMA
            targetCtx.fillStyle = shadowColor;
            targetCtx.beginPath(); targetCtx.ellipse(pX - 2, pY + 10, 13, 5, -0.3, 0, Math.PI * 2); targetCtx.fill();

            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 1, pY + 8, legW, 11);
            drawSingleShoe(targetCtx, pX - 2, pY + 18, shoeType, skinColor, -0.15, false, f, isFemale);

            targetCtx.beginPath();
            targetCtx.roundRect(pX - 11, pY + 6, 13, 7, [4, 3, 2, 2]);
            targetCtx.fill();
            drawSingleShoe(targetCtx, pX - 12, pY + 15, shoeType, skinColor, -0.35, true, f, isFemale);

        } else if (f === 'up-right') {
            // 3/4 SAĞ GERİ OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 6, pY + 8, legW, 8);
            targetCtx.fillRect(pX + 1, pY + 7, legW + 1, 9);
            drawSingleShoe(targetCtx, pX + 2, pY + 15, shoeType, skinColor, 0.6, false, f, isFemale);

        } else if (f === 'up-left') {
            // 3/4 SOL GERİ OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX + 1, pY + 8, legW, 8);
            targetCtx.fillRect(pX - 7, pY + 7, legW + 1, 9);
            drawSingleShoe(targetCtx, pX - 8, pY + 15, shoeType, skinColor, -0.6, false, f, isFemale);

        } else {
            // TAM ÖNE DÖNÜK OTURMA - ZARİF AYAK AYAK ÜSTÜNE ATMA
            targetCtx.fillStyle = shadowColor;
            targetCtx.beginPath();
            targetCtx.ellipse(pX - 1, pY + 9, 12, 4, 0, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = legColor;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 9, pY + 7, legW + 1, 8, [2, 2, 0, 0]);
            targetCtx.fill();
            targetCtx.fillRect(pX - 9, pY + 14, legW, 7);
            drawSingleShoe(targetCtx, pX - 10, pY + 20, shoeType, skinColor, 0, false, f, isFemale);

            targetCtx.fillStyle = legColor;
            targetCtx.beginPath();
            targetCtx.moveTo(pX + 4, pY + 7);
            targetCtx.lineTo(pX - 7, pY + 9);
            targetCtx.quadraticCurveTo(pX - 10, pY + 11, pX - 7, pY + 14);
            targetCtx.lineTo(pX + 1, pY + 12);
            targetCtx.closePath();
            targetCtx.fill();

            targetCtx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            targetCtx.lineWidth = 1;
            targetCtx.beginPath();
            targetCtx.arc(pX - 5, pY + 11, 3.5, Math.PI * 0.6, Math.PI * 1.6);
            targetCtx.stroke();

            targetCtx.fillStyle = legColor;
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 6, pY + 12);
            targetCtx.lineTo(pX + 3, pY + 15);
            targetCtx.lineTo(pX + 2, pY + 19);
            targetCtx.lineTo(pX - 5, pY + 16);
            targetCtx.closePath();
            targetCtx.fill();

            targetCtx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            targetCtx.lineWidth = 1;
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 4, pY + 13);
            targetCtx.lineTo(pX + 2, pY + 16);
            targetCtx.stroke();

            drawSingleShoe(targetCtx, pX + 2, pY + 16, shoeType, skinColor, 0.24, true, f, isFemale);

            if (isSkirt) {
                targetCtx.fillStyle = legColor;
                targetCtx.beginPath();
                targetCtx.roundRect(pX - 11, pY + 6, 22, 6, [3, 3, 5, 5]);
                targetCtx.fill();
                targetCtx.strokeStyle = "rgba(0,0,0,0.15)";
                targetCtx.lineWidth = 0.8;
                targetCtx.stroke();
            }
        }

        targetCtx.restore();
        return;
    }

    // AYAKTA YÜRÜME / DURMA (8 AÇILI İZOMETRİK & ANATOMİK BACAK VE AYAKKABI)
    targetCtx.save();
    targetCtx.fillStyle = legColor;

    if (f === 'down') {
        // Tam Öne (Güney)
        targetCtx.fillRect(pX - 8, pY + 12 - legSwing, legW, 8 + legSwing);
        targetCtx.fillRect(pX + 3, pY + 12 + legSwing, legW, 8 - legSwing);
        drawSingleShoe(targetCtx, pX - 9, pY + 18 - legSwing, shoeType, skinColor, 0, false, f, isFemale);
        drawSingleShoe(targetCtx, pX + 2, pY + 18 + legSwing, shoeType, skinColor, 0, false, f, isFemale);

    } else if (f === 'up') {
        // Tam Arkaya (Kuzey)
        targetCtx.fillRect(pX - 7, pY + 12 + legSwing, legW, 8 - legSwing);
        targetCtx.fillRect(pX + 2, pY + 12 - legSwing, legW, 8 + legSwing);
        drawSingleShoe(targetCtx, pX - 8, pY + 18 + legSwing, shoeType, skinColor, Math.PI, false, f, isFemale);
        drawSingleShoe(targetCtx, pX + 1, pY + 18 - legSwing, shoeType, skinColor, Math.PI, false, f, isFemale);

    } else if (f === 'right') {
        // Sağa Profil (Doğu)
        let farX = pX - 5 - legSwing * 1.2;
        let nearX = pX - 1 + legSwing * 1.2;
        targetCtx.fillStyle = "rgba(0,0,0,0.2)";
        targetCtx.fillRect(farX, pY + 12, legW, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18, shoeType, skinColor, Math.PI * 0.5, false, f, isFemale);

        targetCtx.fillStyle = legColor;
        targetCtx.fillRect(nearX, pY + 12, legW, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18, shoeType, skinColor, Math.PI * 0.5, false, f, isFemale);

    } else if (f === 'left') {
        // Sola Profil (Batı)
        let farX = pX + 0 + legSwing * 1.2;
        let nearX = pX - 4 - legSwing * 1.2;
        targetCtx.fillStyle = "rgba(0,0,0,0.2)";
        targetCtx.fillRect(farX, pY + 12, legW, 8);
        drawSingleShoe(targetCtx, farX - 2, pY + 18, shoeType, skinColor, -Math.PI * 0.5, false, f, isFemale);

        targetCtx.fillStyle = legColor;
        targetCtx.fillRect(nearX, pY + 12, legW, 8);
        drawSingleShoe(targetCtx, nearX - 2, pY + 18, shoeType, skinColor, -Math.PI * 0.5, false, f, isFemale);

    } else if (f === 'down-right') {
        // Sağ İleri (Güneydoğu - 3/4 İzometrik)
        let farX = pX - 8 - legSwing * 0.8;
        let nearX = pX + 1 + legSwing * 0.8;
        targetCtx.fillStyle = "rgba(0,0,0,0.18)";
        targetCtx.fillRect(farX, pY + 12 - legSwing * 0.4, legW, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, Math.PI * 0.25, false, f, isFemale);

        targetCtx.fillStyle = legColor;
        targetCtx.fillRect(nearX, pY + 12 + legSwing * 0.4, legW, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, Math.PI * 0.25, false, f, isFemale);

    } else if (f === 'down-left') {
        // Sol İleri (Güneybatı - 3/4 İzometrik)
        let farX = pX + 3 + legSwing * 0.8;
        let nearX = pX - 6 - legSwing * 0.8;
        targetCtx.fillStyle = "rgba(0,0,0,0.18)";
        targetCtx.fillRect(farX, pY + 12 - legSwing * 0.4, legW, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.25, false, f, isFemale);

        targetCtx.fillStyle = legColor;
        targetCtx.fillRect(nearX, pY + 12 + legSwing * 0.4, legW, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.25, false, f, isFemale);

    } else if (f === 'up-right') {
        // Sağ Geri (Kuzeydoğu - 3/4 İzometrik)
        let farX = pX - 7 - legSwing * 0.8;
        let nearX = pX + 1 + legSwing * 0.8;
        targetCtx.fillRect(farX, pY + 12 + legSwing * 0.4, legW, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, Math.PI * 0.75, false, f, isFemale);

        targetCtx.fillRect(nearX, pY + 12 - legSwing * 0.4, legW, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, Math.PI * 0.75, false, f, isFemale);

    } else if (f === 'up-left') {
        // Sol Geri (Kuzeybatı - 3/4 İzometrik)
        let farX = pX + 2 + legSwing * 0.8;
        let nearX = pX - 6 - legSwing * 0.8;
        targetCtx.fillRect(farX, pY + 12 + legSwing * 0.4, legW, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.75, false, f, isFemale);

        targetCtx.fillRect(nearX, pY + 12 - legSwing * 0.4, legW, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.75, false, f, isFemale);
    }

    targetCtx.restore();
}

// --- 3. GÖVDE VE KIYAFETLER (8 AÇILI İZOMETRİK & İNCELTİLMİŞ KADIN BELİ VE GERÇEKÇİ KUMAŞ) ---
function drawAvatarBodyAndClothes(targetCtx, pX, pY, shirtColor = "#3b82f6", skinColor = "#ffd1a4", facing = "down", isFemale = undefined) {
    let f = normalize8WayFacing(facing);
    let isBack = (f === 'up' || f === 'up-right' || f === 'up-left');
    let isDiagonal = (f === 'down-right' || f === 'down-left' || f === 'up-right' || f === 'up-left');
    let isLeft = (f === 'left' || f === 'down-left' || f === 'up-left');

    if (isFemale === undefined || isFemale === null) {
        isFemale = isFemaleAvatar(null, shirtColor);
    }

    targetCtx.save();
    // Simetri kuralı: Sol açılar sağ açıların pX ekseninde aynalanmışıdır
    if (isLeft) {
        targetCtx.translate(pX, 0);
        targetCtx.scale(-1, 1);
        targetCtx.translate(-pX, 0);
    }

    let effFacing = f;
    if (f === 'left') effFacing = 'right';
    else if (f === 'down-left') effFacing = 'down-right';
    else if (f === 'up-left') effFacing = 'up-right';

    // 0. Gerçekçi Anatomik Boyun (Kafayı ve Gövdeyi Doğal Bağlayan Kavisli Boyun)
    targetCtx.fillStyle = skinColor || "#ffd1a4";
    let neckW = isFemale ? 5.5 : 7.5;
    targetCtx.fillRect(pX - neckW / 2, pY - 13, neckW, 5.5);
    // Boyun altı hafif çene gölgesi
    targetCtx.fillStyle = "rgba(0, 0, 0, 0.14)";
    targetCtx.fillRect(pX - neckW / 2, pY - 13, neckW, 1.8);

    // --- KADIN VEYA ERKEK İÇİN İNCELTİLMİŞ VE KAVİSLİ GÖVDE ÇİZİM YARDIMCISI ---
    function drawShapedTorso(fillCol, strokeCol = null, isCrop = false) {
        targetCtx.fillStyle = fillCol;
        targetCtx.beginPath();

        if (effFacing === 'right') {
            // Profil Görünüm: Göğüs kıvrımı, inceltilmiş zarif bel oyuntusu ve kalça kavisleri
            if (isFemale) {
                targetCtx.moveTo(pX - 4, pY - 10);
                targetCtx.lineTo(pX + 5.5, pY - 7); // Göğüs üstü
                targetCtx.quadraticCurveTo(pX + 7, pY - 3, pX + 4.5, pY); // Göğüs kavisinden ince bele geçiş
                targetCtx.lineTo(pX + 2.5, pY + 2); // İnce bel (Profilde de inceltilmiş)
                targetCtx.quadraticCurveTo(pX + 3.5, pY + 7, pX + 5, isCrop ? pY + 1 : pY + 11); // Kalçaya iniş
                targetCtx.lineTo(pX - 5, isCrop ? pY + 1 : pY + 11);
                targetCtx.quadraticCurveTo(pX - 6, pY + 2, pX - 4, pY - 10); // Sırt kavisi
            } else {
                targetCtx.roundRect(pX - 5, pY - 10, 11, isCrop ? 11 : 21, [3, 3, 2, 2]);
            }
        } else {
            // Ön, 3/4 ve Arka Görünümler: Belin zarif şekilde inceldiği kum saati / atletik silüet
            if (isFemale) {
                // KADIN KARAKTER: İncelen bel (pY civarında genişlik 12px'e iner), omuzlar 16px, kalça 17.5px
                let shoulderL = pX - 8.2;
                let shoulderR = pX + 8.2;
                let waistL = pX - 5.8; // İNCELTİLMİŞ KADIN BELİ SOL
                let waistR = pX + 5.8; // İNCELTİLMİŞ KADIN BELİ SAĞ
                let hipL = pX - 8.8;
                let hipR = pX + 8.8;
                let bottomY = isCrop ? (pY + 1) : (pY + 11);

                if (effFacing === 'down-right' || effFacing === 'up-right') {
                    // 3/4 İzometrik Açı: Sağ taraf dönükken bel oyuntusunun derinleşmesi
                    shoulderL = pX - 7.5; shoulderR = pX + 8.8;
                    waistL = pX - 5.2; waistR = pX + 6.2;
                    hipL = pX - 8.2; hipR = pX + 9.2;
                }

                targetCtx.moveTo(shoulderL, pY - 10);
                targetCtx.quadraticCurveTo(pX - 8.8, pY - 4, waistL, pY + 1); // Sol bel incelmesi
                targetCtx.quadraticCurveTo(pX - 6.2, pY + 6, hipL, bottomY); // Kalçaya kavisli açılma
                targetCtx.lineTo(hipR, bottomY);
                targetCtx.quadraticCurveTo(pX + 6.2, pY + 6, waistR, pY + 1); // Sağ bel kavisli incelmesi
                targetCtx.quadraticCurveTo(pX + 8.8, pY - 4, shoulderR, pY - 10); // Sağ omuza çıkış
            } else {
                // ERKEK KARAKTER: Güçlü omuzlar (20px), hafif V-taper (17px bel)
                targetCtx.roundRect(pX - 10, pY - 10, 20, isCrop ? 11 : 21, [4, 4, 3, 3]);
            }
        }

        targetCtx.closePath();
        targetCtx.fill();

        // Kumaş Işık & Gölgelendirmesi (Ambient Isometric Lighting)
        targetCtx.fillStyle = "rgba(255, 255, 255, 0.12)";
        targetCtx.fillRect(pX - 7, pY - 9, 4, isCrop ? 8 : 16); // Sol omuzdan gelen ışık çizgisi
        targetCtx.fillStyle = "rgba(0, 0, 0, 0.12)";
        targetCtx.fillRect(pX + 3.5, pY - 9, 4, isCrop ? 8 : 16); // Sağ gölge derinliği

        if (strokeCol) {
            targetCtx.strokeStyle = strokeCol;
            targetCtx.lineWidth = 1;
            targetCtx.stroke();
        }
    }

    // --- ÖZEL KIYAFETLER VE ELBİSELER (GERÇEKÇİ KUMAŞ, BEL VE DETAYLAR) ---
    if (shirtColor === 'dress_pink') {
        // Pembe Çiçekli Elbise (İnceltilmiş bel, saten kuşak ve fırfırlı etek)
        drawShapedTorso("#f472b6", "rgba(0,0,0,0.1)");

        // Saten Bel Kuşağı (İnce beli vurgulayan kurdele)
        targetCtx.fillStyle = "#db2777";
        let sashW = isFemale ? 13 : 16;
        targetCtx.roundRect(pX - sashW / 2, pY - 1, sashW, 3, 1);
        targetCtx.fill();

        // Flared A-Line Etek
        targetCtx.fillStyle = "#ec4899";
        targetCtx.beginPath();
        let skirtTopL = pX - (isFemale ? 6.5 : 8.5);
        let skirtTopR = pX + (isFemale ? 6.5 : 8.5);
        targetCtx.moveTo(skirtTopL, pY + 2);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + (isBack ? 15 : 16.5), pX + 14, pY + 14);
        targetCtx.lineTo(skirtTopR, pY + 2);
        targetCtx.closePath();
        targetCtx.fill();

        // Beyaz Dantel Fırfır Hem
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 13, pY + 13, 26, 1.6);
        // Etek Pile Gölgeleri
        targetCtx.strokeStyle = "rgba(0,0,0,0.14)";
        targetCtx.lineWidth = 0.8;
        [-6, 0, 6].forEach(sx => {
            targetCtx.beginPath(); targetCtx.moveTo(pX + sx * 0.6, pY + 3); targetCtx.lineTo(pX + sx * 1.5, pY + 14); targetCtx.stroke();
        });

        if (isBack) {
            targetCtx.strokeStyle = "#be185d"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX, pY - 8); targetCtx.lineTo(pX, pY + 1); targetCtx.stroke();
        }

    } else if (shirtColor === 'dress_black') {
        // Zarif Gece Elbisesi (İnce bel, parıldayan altın toka ve sırt dekoltesi)
        drawShapedTorso("#18181b", "rgba(255,255,255,0.08)");

        // Etek Kısmı (Dökümlü zarif abiye)
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        let skirtTopL = pX - (isFemale ? 6.5 : 8.5);
        let skirtTopR = pX + (isFemale ? 6.5 : 8.5);
        targetCtx.moveTo(skirtTopL, pY + 2);
        targetCtx.lineTo(pX - 13, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 13, pY + 14);
        targetCtx.lineTo(skirtTopR, pY + 2);
        targetCtx.closePath();
        targetCtx.fill();

        // Altın Metal Kemer & Şık Toka
        let beltW = isFemale ? 13 : 17;
        targetCtx.fillStyle = "#facc15";
        targetCtx.fillRect(pX - beltW / 2, pY, beltW, 2.2);
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(pX - 2, pY - 0.5, 4, 3.2); // Parlak toka
            targetCtx.fillStyle = "#d97706";
            targetCtx.fillRect(pX - 1, pY + 0.5, 2, 1.2);
        } else {
            // Sırtta zarif V-dekolte penceresi
            targetCtx.fillStyle = skinColor || "#ffd1a4";
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 5, 3.8, 0, Math.PI * 2); targetCtx.fill();
        }

    } else if (shirtColor === 'dress_red') {
        // Kırmızı Kokteyl Elbisesi (Sweetheart yaka ve inceltilmiş bel)
        drawShapedTorso("#e11d48", "rgba(0,0,0,0.15)");

        if (!isBack) {
            // Sweetheart Yaka Dekolte Hattı
            targetCtx.fillStyle = skinColor || "#ffd1a4";
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 5, pY - 10);
            targetCtx.quadraticCurveTo(pX - 2.5, pY - 7, pX, pY - 8.5);
            targetCtx.quadraticCurveTo(pX + 2.5, pY - 7, pX + 5, pY - 10);
            targetCtx.closePath();
            targetCtx.fill();
        }

        // Dökümlü Kokteyl Etek
        targetCtx.fillStyle = "#be123c";
        targetCtx.beginPath();
        let skirtTopL = pX - (isFemale ? 6.5 : 8.5);
        let skirtTopR = pX + (isFemale ? 6.5 : 8.5);
        targetCtx.moveTo(skirtTopL, pY + 2);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 14, pY + 14);
        targetCtx.lineTo(skirtTopR, pY + 2);
        targetCtx.closePath();
        targetCtx.fill();

    } else if (shirtColor === 'skirt_crop') {
        // Beyaz Crop Top + Pileli Pembe Mini Etek & Göbek Teni
        drawShapedTorso("#f8fafc", "rgba(0,0,0,0.1)", true);

        // İnce bel ve açık göbek teni
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        let midriffW = isFemale ? 12 : 16;
        targetCtx.fillRect(pX - midriffW / 2, pY + 1, midriffW, 3.2);
        if (!isBack) {
            // Şirin göbek deliği detayı
            targetCtx.fillStyle = "rgba(180, 83, 9, 0.4)";
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 2.5, 0.8, 0, Math.PI * 2); targetCtx.fill();
        }

        // Yüksek Bel Pileli Etek (Tenis eteği)
        targetCtx.fillStyle = "#f43f5e";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 4);
        targetCtx.lineTo(pX - 13, pY + 13);
        targetCtx.lineTo(pX + 13, pY + 13);
        targetCtx.lineTo(pX + sTop, pY + 4);
        targetCtx.closePath();
        targetCtx.fill();

        // Keskin pile gölgeleri
        targetCtx.strokeStyle = "rgba(0,0,0,0.2)"; targetCtx.lineWidth = 0.8;
        [-8, -4, 0, 4, 8].forEach(pxOffset => {
            targetCtx.beginPath(); targetCtx.moveTo(pX + pxOffset * 0.7, pY + 4); targetCtx.lineTo(pX + pxOffset * 1.3, pY + 13); targetCtx.stroke();
        });

    } else if (shirtColor === 'skirt_denim') {
        // Kot Etek & Üst (Fit beyaz bluz ve yüksek bel denim etek)
        drawShapedTorso("#f1f5f9", "rgba(0,0,0,0.08)", true);

        // Denim Etek
        targetCtx.fillStyle = "#2563eb";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 12, pY + 13);
        targetCtx.lineTo(pX + 12, pY + 13);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath();
        targetCtx.fill();

        // Denim Kemer Köprüleri & Bronz Düğme
        targetCtx.fillStyle = "#1d4ed8";
        targetCtx.fillRect(pX - sTop, pY + 1, sTop * 2, 2.2);
        if (!isBack) {
            targetCtx.fillStyle = "#facc15";
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 2.2, 1, 0, Math.PI * 2); targetCtx.fill();
        } else {
            // Arka cepler ve sarı dikişler
            targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 0.7;
            targetCtx.strokeRect(pX - 6.5, pY + 4, 3.8, 4);
            targetCtx.strokeRect(pX + 2.7, pY + 4, 3.8, 4);
        }

    } else if (shirtColor === 'dress_emerald') {
        // Zümrüt Yeşil İpek Gece Elbisesi & Altın Kolye
        drawShapedTorso("#059669", "rgba(0,0,0,0.15)");
        if (!isBack) {
            targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 1;
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 6, pY - 10); targetCtx.lineTo(pX, pY - 6.5); targetCtx.lineTo(pX + 6, pY - 10);
            targetCtx.stroke();
            targetCtx.fillStyle = "#10b981";
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 5.5, 1.2, 0, Math.PI * 2); targetCtx.fill();
        }
        targetCtx.fillStyle = "#047857";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 15);
        targetCtx.quadraticCurveTo(pX, pY + 17, pX + 14, pY + 15);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#facc15";
        targetCtx.fillRect(pX - sTop, pY, sTop * 2, 2);

    } else if (shirtColor === 'dress_lavender') {
        // Lavanta Çiçeği Bahar Elbisesi & İnce Askılar
        drawShapedTorso("#c084fc", "rgba(0,0,0,0.1)");
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.fillRect(pX - 6, pY - 10, 1.5, 6);
        targetCtx.fillRect(pX + 4.5, pY - 10, 1.5, 6);
        targetCtx.fillStyle = "#a855f7";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 13, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 13, pY + 14);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 12, pY + 13, 24, 1.5);

    } else if (shirtColor === 'dress_bridal') {
        // Masalsı Beyaz Gelinlik & Balo Elbisesi
        drawShapedTorso("#ffffff", "#e2e8f0");
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 16, pY + 15);
        targetCtx.quadraticCurveTo(pX, pY + 18, pX + 16, pY + 15);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "#e2e8f0"; targetCtx.lineWidth = 1; targetCtx.stroke();
        if (!isBack) {
            targetCtx.fillStyle = "#38bdf8"; targetCtx.fillRect(pX - 1.5, pY, 3, 2.5);
        } else {
            targetCtx.fillStyle = "#cbd5e1";
            for (let b = -8; b <= 6; b += 3) {
                targetCtx.beginPath(); targetCtx.arc(pX, pY + b, 1, 0, Math.PI * 2); targetCtx.fill();
            }
        }

    } else if (shirtColor === 'outfit_goth') {
        // Korseli Gotik Lolita Elbisesi (Bel inceltici korsaj ve mor saten bağcıklar)
        drawShapedTorso("#18181b", "rgba(192, 132, 252, 0.4)");
        targetCtx.strokeStyle = "#c084fc"; targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 3.5, pY - 8); targetCtx.lineTo(pX + 3.5, pY - 4);
        targetCtx.moveTo(pX + 3.5, pY - 8); targetCtx.lineTo(pX - 3.5, pY - 4);
        targetCtx.moveTo(pX - 3.5, pY - 4); targetCtx.lineTo(pX + 3.5, pY);
        targetCtx.moveTo(pX + 3.5, pY - 4); targetCtx.lineTo(pX - 3.5, pY);
        targetCtx.stroke();
        targetCtx.fillStyle = "#09090b";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 14, pY + 14);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        if (!isBack) {
            targetCtx.fillStyle = "#ef4444";
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 1, 2, 0, Math.PI * 2); targetCtx.fill();
        }
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 13, pY + 13, 26, 1.2);

    } else if (shirtColor === 'outfit_business') {
        // Pudra Şık Kadın Takım Elbisesi (Belden oturan blazer & kalem etek)
        drawShapedTorso("#fb7185", "rgba(0,0,0,0.1)");
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(pX - 3, pY - 10, 6, 8); // İç gömlek
            targetCtx.fillStyle = "#facc15";
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 1, 1.5, 0, Math.PI * 2); targetCtx.fill(); // Altın düğme
        }
        targetCtx.fillStyle = "#fda4af";
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.fillRect(pX - sTop, pY + 3, sTop * 2, 9); // Kalem etek

    } else if (shirtColor === 'outfit_boho') {
        // Bohem Şifon Elbise & Yelek
        drawShapedTorso("#ea580c", "rgba(0,0,0,0.15)");
        targetCtx.fillStyle = "#78350f";
        targetCtx.fillRect(pX - 8, pY - 10, 3.5, 12);
        targetCtx.fillRect(pX + 4.5, pY - 10, 3.5, 12);
        if (isBack) targetCtx.fillRect(pX - 8, pY - 10, 16, 12);
        targetCtx.fillStyle = "#c2410c";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 15);
        targetCtx.quadraticCurveTo(pX, pY + 17, pX + 14, pY + 15);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#fde047";
        targetCtx.fillRect(pX - 12, pY + 11, 24, 2);

    } else if (shirtColor === 'outfit_sporty') {
        // Pastel Fitness Takımı & Crop Top
        drawShapedTorso("#38bdf8", "rgba(0,0,0,0.1)", true);
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        let midriffW = isFemale ? 12 : 16;
        targetCtx.fillRect(pX - midriffW / 2, pY + 1, midriffW, 3);
        targetCtx.fillStyle = "#818cf8";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 8.5, pY + 4, 17, 8, [2, 2, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 8.5, pY + 4, 1.5, 8);
        targetCtx.fillRect(pX + 7, pY + 4, 1.5, 8);

    } else if (shirtColor === 'dress_vintage_polka') {
        // Vintage Puantiyeli Kırmızı Elbise
        drawShapedTorso("#dc2626", "rgba(0,0,0,0.15)");
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath();
        if (!isBack) {
            targetCtx.moveTo(pX - 5, pY - 10); targetCtx.lineTo(pX, pY - 6.5); targetCtx.lineTo(pX + 5, pY - 10);
            targetCtx.lineTo(pX + 7, pY - 10); targetCtx.lineTo(pX - 7, pY - 10);
        } else {
            targetCtx.roundRect(pX - 6, pY - 10, 12, 3, [0, 0, 2, 2]);
        }
        targetCtx.closePath(); targetCtx.fill();

        targetCtx.fillStyle = "#b91c1c";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 15, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 15, pY + 14);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();

        targetCtx.fillStyle = "#ffffff";
        [[-8, 6], [-2, 8], [4, 5], [9, 9], [-11, 11], [-5, 12], [2, 12], [9, 13]].forEach(([dx, dy]) => {
            targetCtx.beginPath(); targetCtx.arc(pX + dx, pY + dy, 1.1, 0, Math.PI * 2); targetCtx.fill();
        });
        targetCtx.fillStyle = "#18181b"; targetCtx.fillRect(pX - sTop, pY, sTop * 2, 2.2);
        if (!isBack) {
            targetCtx.fillStyle = "#e2e8f0"; targetCtx.fillRect(pX - 2, pY - 0.5, 4, 3);
        }

    } else if (shirtColor === 'dress_ocean_blue') {
        // Okyanus Mavisi Yazlık Askılı Elbise
        drawShapedTorso("#06b6d4", "rgba(0,0,0,0.12)");
        targetCtx.fillStyle = "#0891b2";
        targetCtx.fillRect(pX - 6, pY - 10, 1.5, 6);
        targetCtx.fillRect(pX + 4.5, pY - 10, 1.5, 6);
        targetCtx.fillStyle = "#0284c7";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 14, pY + 14);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.fillRect(pX - 13, pY + 13, 26, 1.2);

    } else if (shirtColor === 'outfit_turtleneck_skirt') {
        // Krem Balıkçı Yaka Kazak & Ekose Tartan Etek
        drawShapedTorso("#fef3c7", "rgba(217, 119, 6, 0.2)");
        targetCtx.fillStyle = "#fde68a";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 5.5, pY - 12, 11, 4, 2); targetCtx.fill();
        targetCtx.fillStyle = "#991b1b";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 2);
        targetCtx.lineTo(pX - 13, pY + 13);
        targetCtx.lineTo(pX + 13, pY + 13);
        targetCtx.lineTo(pX + sTop, pY + 2);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "rgba(250, 204, 21, 0.4)"; targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 5, pY + 2); targetCtx.lineTo(pX - 7, pY + 13);
        targetCtx.moveTo(pX + 5, pY + 2); targetCtx.lineTo(pX + 7, pY + 13);
        targetCtx.moveTo(pX - 11, pY + 7); targetCtx.lineTo(pX + 11, pY + 7);
        targetCtx.stroke();

    } else if (shirtColor === 'polo') {
        // Polo Yaka (Pike kumaş, 3D yaka kanatları ve düğmeler)
        drawShapedTorso("#f8fafc", "rgba(0,0,0,0.1)");
        if (!isBack) {
            targetCtx.fillStyle = "#3b82f6";
            targetCtx.beginPath();
            let shift = (effFacing === 'right') ? 2.5 : (effFacing === 'down-right') ? 1.5 : 0;
            targetCtx.moveTo(pX - 4.5 + shift, pY - 10);
            targetCtx.lineTo(pX + shift, pY - 3.5);
            targetCtx.lineTo(pX + 4.5 + shift, pY - 10);
            targetCtx.stroke();
            // Düğmeler
            targetCtx.fillStyle = "#94a3b8";
            targetCtx.beginPath(); targetCtx.arc(pX + shift, pY - 7, 0.9, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(pX + shift, pY - 4.5, 0.9, 0, Math.PI * 2); targetCtx.fill();
        } else {
            targetCtx.fillStyle = "#e2e8f0";
            targetCtx.beginPath(); targetCtx.roundRect(pX - 5.5, pY - 11, 11, 3, 1.5); targetCtx.fill();
        }

    } else if (shirtColor === 'hoodie') {
        // Kapüşonlu Sweat (Kalın polar doku, 3D kanguru cep, sarkan ipler ve ribana)
        drawShapedTorso("#6366f1", "rgba(0,0,0,0.15)");
        if (!isBack) {
            targetCtx.fillStyle = "#4f46e5";
            let pShift = (effFacing === 'right') ? 2.5 : (effFacing === 'down-right') ? 1.5 : 0;
            targetCtx.beginPath(); targetCtx.roundRect(pX - 5.5 + pShift, pY + 3, 11, 6, 2); targetCtx.fill();
            // İpler ve uçlarında parıldayan agletler
            targetCtx.strokeStyle = "#ffffff"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 2.5 + pShift, pY - 8); targetCtx.lineTo(pX - 2.5 + pShift, pY - 1.5); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2.5 + pShift, pY - 8); targetCtx.lineTo(pX + 2.5 + pShift, pY - 1.5); targetCtx.stroke();
            targetCtx.fillStyle = "#e2e8f0";
            targetCtx.fillRect(pX - 3 + pShift, pY - 1.5, 1.2, 1.8);
            targetCtx.fillRect(pX + 2 + pShift, pY - 1.5, 1.2, 1.8);
        } else {
            targetCtx.fillStyle = "#4f46e5";
            targetCtx.beginPath(); targetCtx.roundRect(pX - 6.5, pY - 9, 13, 9.5, [3, 3, 5, 5]); targetCtx.fill();
            targetCtx.strokeStyle = "#4338ca"; targetCtx.lineWidth = 1; targetCtx.stroke();
        }

    } else if (shirtColor === 'leather') {
        // Deri Ceket (Asimetrik gümüş fermuar, motorcu yakaları ve deri parlaklığı)
        drawShapedTorso("#18181b", "rgba(255,255,255,0.1)");
        if (!isBack) {
            targetCtx.strokeStyle = "#cbd5e1"; targetCtx.lineWidth = 1.3;
            let zShift = (effFacing === 'right') ? 2 : (effFacing === 'down-right') ? 1 : 0;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 2 + zShift, pY - 9); targetCtx.lineTo(pX + 3 + zShift, pY + 11); targetCtx.stroke();
            // Metalik çıtçıtlar
            targetCtx.fillStyle = "#f8fafc";
            targetCtx.beginPath(); targetCtx.arc(pX - 4 + zShift, pY - 5, 0.9, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(pX + 4 + zShift, pY - 5, 0.9, 0, Math.PI * 2); targetCtx.fill();
        } else {
            targetCtx.strokeStyle = "#334155"; targetCtx.lineWidth = 1;
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 4.5, pY - 9); targetCtx.lineTo(pX - 4.5, pY + 11);
            targetCtx.moveTo(pX + 4.5, pY - 9); targetCtx.lineTo(pX + 4.5, pY + 11);
            targetCtx.stroke();
        }

    } else {
        // Klasik Tişört (Gerçekçi omuz manşetleri, yaka ribanası ve bel kıvrımı)
        let mainCol = shirtColor || "#3b82f6";
        drawShapedTorso(mainCol, "rgba(255,255,255,0.4)");

        if (!isBack) {
            // Yaka Ribanası ve Boyun Açıklığı
            targetCtx.strokeStyle = "rgba(0,0,0,0.2)"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 9, 4, 0, Math.PI); targetCtx.stroke();
            // Kumaş Dikiş ve Katlanma İpuçları
            targetCtx.strokeStyle = "rgba(0,0,0,0.12)"; targetCtx.lineWidth = 0.8;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 5, pY + 3); targetCtx.quadraticCurveTo(pX, pY + 5, pX + 5, pY + 2); targetCtx.stroke();
        } else {
            // Arka ense dikişi
            targetCtx.strokeStyle = "rgba(0,0,0,0.18)"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 9, 4.5, 0, Math.PI); targetCtx.stroke();
        }
    }

    targetCtx.restore();
}

// --- 4. ŞAPKALAR VE SAÇ MODELLERİ (8 AÇILI İZOMETRİK TÜM SAÇLAR VE ŞAPKALAR) ---
function drawAvatarHairAndHats(targetCtx, pX, pY, hatType = "none", facing = "down") {
    let f = normalize8WayFacing(facing);
    let isBack = (f === 'up' || f === 'up-right' || f === 'up-left');
    let isLeft = (f === 'left' || f === 'down-left' || f === 'up-left');

    targetCtx.save();
    if (isLeft) {
        targetCtx.translate(pX, 0);
        targetCtx.scale(-1, 1);
        targetCtx.translate(-pX, 0);
    }

    let effFacing = f;
    if (f === 'left') effFacing = 'right';
    else if (f === 'down-left') effFacing = 'down-right';
    else if (f === 'up-left') effFacing = 'up-right';

    if (hatType === 'bere') {
        // Kırmızı Bere & Ponpon
        targetCtx.fillStyle = "#e11d48";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 24, 8, Math.PI, 0); targetCtx.fill();
        let pomX = (effFacing === 'right') ? pX - 4 : (effFacing === 'down-right') ? pX + 2 : pX;
        let pomY = (effFacing === 'right') ? pY - 26 : pY - 26;
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(pomX, pomY, 3, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'fes') {
        // Osmanlı Fesi
        targetCtx.fillStyle = "#991b1b";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 7, pY - 20); targetCtx.lineTo(-5 + pX, pY - 30);
        targetCtx.lineTo(5 + pX, pY - 30); targetCtx.lineTo(7 + pX, pY - 20);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "#0f172a"; targetCtx.lineWidth = 1.5;
        let tEnd = (effFacing === 'right') ? -4 : (effFacing === 'up') ? 0 : 8;
        targetCtx.beginPath(); targetCtx.moveTo(pX, pY - 30); targetCtx.quadraticCurveTo(pX + tEnd * 0.8, pY - 28, pX + tEnd, pY - 21); targetCtx.stroke();
        targetCtx.fillStyle = "#0f172a"; targetCtx.beginPath(); targetCtx.arc(pX + tEnd, pY - 21, 2, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'kasket') {
        // Kasket (8 Açılı Siperlik)
        targetCtx.fillStyle = "#334155";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 23, 9, Math.PI, 0); targetCtx.fill();
        let vDir = (effFacing === 'right') ? 6 : (effFacing === 'down-right') ? 4 : (effFacing === 'up') ? 0 : 0;
        let vWidth = (effFacing === 'up') ? 6 : 9;
        targetCtx.fillStyle = "#1e293b";
        targetCtx.beginPath(); targetCtx.ellipse(pX + vDir, pY - 23, vWidth, 3, 0, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#64748b";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 26, 2, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'cowboy') {
        // Kovboy Şapkası
        targetCtx.fillStyle = "#78350f";
        let brimTilt = (effFacing === 'right') ? 0.2 : (effFacing === 'down-right') ? 0.1 : 0;
        targetCtx.beginPath(); targetCtx.ellipse(pX, pY - 22, 14, 4, brimTilt, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.roundRect(pX - 6, pY - 31, 12, 10, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#f59e0b"; targetCtx.fillRect(pX - 6, pY - 23, 12, 2);

    } else if (hatType === 'hair_long') {
        // Uzun Düz Saç
        targetCtx.fillStyle = "#451a03";
        if (isBack) {
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 10, pY - 22, 20, 30, [8, 8, 4, 4]);
            targetCtx.fill();
        } else {
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 9, pY - 20); targetCtx.quadraticCurveTo(pX - 13, pY - 2, pX - 10, pY + 8);
            targetCtx.lineTo(pX - 6, pY + 8); targetCtx.quadraticCurveTo(pX - 7, pY - 2, pX - 5, pY - 14);
            targetCtx.closePath(); targetCtx.fill();

            targetCtx.beginPath();
            targetCtx.moveTo(pX + 9, pY - 20); targetCtx.quadraticCurveTo(pX + 13, pY - 2, pX + 10, pY + 8);
            targetCtx.lineTo(pX + 6, pY + 8); targetCtx.quadraticCurveTo(pX + 7, pY - 2, pX + 5, pY - 14);
            targetCtx.closePath(); targetCtx.fill();

            targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 9, pY - 21); targetCtx.quadraticCurveTo(pX - 2, pY - 17, pX, pY - 22);
            targetCtx.quadraticCurveTo(pX + 3, pY - 17, pX + 9, pY - 21);
            targetCtx.lineTo(pX + 8, pY - 24); targetCtx.lineTo(pX - 8, pY - 24);
            targetCtx.closePath(); targetCtx.fill();
        }

    } else if (hatType === 'hair_wavy') {
        // Dalgalı Saç
        targetCtx.fillStyle = "#78350f";
        if (isBack) {
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 11, pY - 22, 22, 28, [8, 8, 5, 5]);
            targetCtx.fill();
        } else {
            targetCtx.beginPath();
            targetCtx.arc(pX - 10, pY - 12, 4, 0, Math.PI * 2);
            targetCtx.arc(pX - 11, pY - 5, 4.5, 0, Math.PI * 2);
            targetCtx.arc(pX - 9, pY + 3, 4, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.beginPath();
            targetCtx.arc(pX + 10, pY - 12, 4, 0, Math.PI * 2);
            targetCtx.arc(pX + 11, pY - 5, 4.5, 0, Math.PI * 2);
            targetCtx.arc(pX + 9, pY + 3, 4, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        }

    } else if (hatType === 'hair_ponytail') {
        // At Kuyruğu Saç
        targetCtx.fillStyle = "#292524";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        let ptX = (effFacing === 'right') ? pX - 7 : (effFacing === 'up') ? pX : pX + 8;
        let ptY = pY - 25;
        targetCtx.fillStyle = "#ec4899";
        targetCtx.beginPath(); targetCtx.arc(ptX, ptY, 3, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#292524";
        targetCtx.beginPath();
        targetCtx.moveTo(ptX, ptY);
        targetCtx.quadraticCurveTo(ptX + ((effFacing === 'right') ? -10 : 8), ptY + 6, ptX + ((effFacing === 'right') ? -5 : 5), ptY + 16);
        targetCtx.quadraticCurveTo(ptX + 2, ptY + 8, ptX, ptY + 2);
        targetCtx.closePath(); targetCtx.fill();

    } else if (hatType === 'hair_braids') {
        // İki Yandan Örgülü Saç
        targetCtx.fillStyle = "#b45309";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        [-1, 1].forEach(side => {
            let bx = pX + side * 10;
            targetCtx.fillStyle = "#b45309";
            targetCtx.beginPath(); targetCtx.arc(bx, pY - 12, 3, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(bx, pY - 7, 2.7, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(bx, pY - 2, 2.4, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillStyle = "#38bdf8";
            targetCtx.beginPath(); targetCtx.arc(bx, pY + 1, 2, 0, Math.PI * 2); targetCtx.fill();
        });

    } else if (hatType === 'hair_bob') {
        // Küt Kesim Bob Saç
        targetCtx.fillStyle = "#1e1b4b";
        targetCtx.beginPath();
        targetCtx.arc(pX, pY - 19, 11, Math.PI * 0.85, Math.PI * 2.15);
        targetCtx.lineTo(pX + 10, pY - 10);
        targetCtx.lineTo(pX - 10, pY - 10);
        targetCtx.closePath(); targetCtx.fill();

    } else if (hatType === 'hair_hijab') {
        // Şık Başörtüsü
        targetCtx.fillStyle = "#0284c7";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 11.5, Math.PI * 0.85, Math.PI * 2.15); targetCtx.fill();
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 11, pY - 14);
        targetCtx.quadraticCurveTo(pX - 13, pY - 2, pX - 9, pY + 5);
        targetCtx.lineTo(pX + 9, pY + 5);
        targetCtx.quadraticCurveTo(pX + 13, pY - 2, pX + 11, pY - 14);
        targetCtx.closePath(); targetCtx.fill();

    } else if (hatType === 'beret_pink') {
        // Pembe Fransız Bere
        targetCtx.fillStyle = "#f472b6";
        targetCtx.beginPath(); targetCtx.ellipse(pX - 1, pY - 24, 11, 5, -0.2, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath(); targetCtx.arc(pX + 1, pY - 27, 2, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'crown') {
        // Prenses Altın Tacı
        targetCtx.fillStyle = "#f59e0b";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 7, pY - 23);
        targetCtx.lineTo(pX - 7, pY - 29);
        targetCtx.lineTo(pX - 3, pY - 25);
        targetCtx.lineTo(pX, pY - 31);
        targetCtx.lineTo(pX + 3, pY - 25);
        targetCtx.lineTo(pX + 7, pY - 29);
        targetCtx.lineTo(pX + 7, pY - 23);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#ef4444"; targetCtx.fillRect(pX - 1, pY - 29, 2, 2);
        targetCtx.fillStyle = "#38bdf8"; targetCtx.fillRect(pX - 6, pY - 27, 1.5, 1.5);
        targetCtx.fillRect(pX + 4.5, pY - 27, 1.5, 1.5);

    } else if (hatType === 'hair_blonde_curls') {
        // Altın Bukleli Uzun Saç
        targetCtx.fillStyle = "#eab308";
        [-1, 1].forEach(side => {
            let cx = pX + side * 10;
            targetCtx.beginPath();
            targetCtx.arc(cx, pY - 14, 4, 0, Math.PI * 2);
            targetCtx.arc(cx + side * 1, pY - 7, 4.5, 0, Math.PI * 2);
            targetCtx.arc(cx, pY, 4, 0, Math.PI * 2);
            targetCtx.arc(cx - side * 1, pY + 7, 3.5, 0, Math.PI * 2);
            targetCtx.fill();
        });
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 11, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        if (isBack) {
            targetCtx.fillRect(pX - 10, pY - 19, 20, 24);
        }

    } else if (hatType === 'hair_bun_chopsticks') {
        // Zarif Topuz & Çiçekli Toka
        targetCtx.fillStyle = "#1c1917";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 26, 6.5, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 1.5;
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY - 23); targetCtx.lineTo(pX + 9, pY - 29);
        targetCtx.stroke();
        targetCtx.fillStyle = "#f472b6";
        targetCtx.beginPath(); targetCtx.arc(pX + 6, pY - 27, 3, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'hair_redhead_wavy') {
        // Kızıl Dalgalı Romantik Saç
        targetCtx.fillStyle = "#c2410c";
        if (isBack) {
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 11, pY - 22, 22, 28, 6);
            targetCtx.fill();
        } else {
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 9, pY - 20); targetCtx.quadraticCurveTo(pX - 14, pY - 4, pX - 11, pY + 7);
            targetCtx.lineTo(pX - 6, pY + 7); targetCtx.quadraticCurveTo(pX - 8, pY - 4, pX - 5, pY - 14);
            targetCtx.closePath(); targetCtx.fill();
            targetCtx.beginPath();
            targetCtx.moveTo(pX + 9, pY - 20); targetCtx.quadraticCurveTo(pX + 15, pY - 2, pX + 12, pY + 9);
            targetCtx.lineTo(pX + 6, pY + 9); targetCtx.quadraticCurveTo(pX + 8, pY - 2, pX + 5, pY - 14);
            targetCtx.closePath(); targetCtx.fill();
            targetCtx.fillStyle = "#ea580c";
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 11, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        }

    } else if (hatType === 'hair_pigtails_ribbon') {
        // Kurdeleli İkili Yan Saç
        targetCtx.fillStyle = "#78350f";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        [-1, 1].forEach(side => {
            let px = pX + side * 9;
            targetCtx.fillStyle = "#ec4899";
            targetCtx.beginPath(); targetCtx.arc(px, pY - 21, 2.5, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillStyle = "#78350f";
            targetCtx.beginPath();
            targetCtx.moveTo(px, pY - 21);
            targetCtx.quadraticCurveTo(px + side * 6, pY - 14, px + side * 4, pY - 4);
            targetCtx.quadraticCurveTo(px + side * 2, pY - 14, px, pY - 21);
            targetCtx.closePath(); targetCtx.fill();
        });

    } else if (hatType === 'korsan') {
        // Korsan Kaptanı Şapkası
        targetCtx.fillStyle = "#0f172a";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 15, pY - 21);
        targetCtx.quadraticCurveTo(pX - 8, pY - 33, pX, pY - 35);
        targetCtx.quadraticCurveTo(pX + 8, pY - 33, pX + 15, pY - 21);
        targetCtx.quadraticCurveTo(pX, pY - 24, pX - 15, pY - 21);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "#f59e0b"; targetCtx.lineWidth = 1.5; targetCtx.stroke();
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 28, 2.5, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillRect(pX - 3.5, pY - 25.5, 7, 1.2);
        }

    } else if (hatType === 'sihirbaz') {
        // Sihirbaz Silindiri
        targetCtx.fillStyle = "#09090b";
        targetCtx.beginPath(); targetCtx.ellipse(pX, pY - 22, 13, 3.8, 0, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 7, pY - 37, 14, 16, [2, 2, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#9333ea";
        targetCtx.fillRect(pX - 7, pY - 25, 14, 3);
        if (!isBack) {
            targetCtx.fillStyle = "#facc15"; targetCtx.fillRect(pX - 2, pY - 25.5, 4, 4);
        }

    } else if (hatType === 'kulaklik') {
        // DJ Kulaklığı
        targetCtx.strokeStyle = "#334155"; targetCtx.lineWidth = 3;
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 18, 11, Math.PI * 1.05, Math.PI * 1.95); targetCtx.stroke();
        [-1, 1].forEach(side => {
            let cx = pX + side * 11;
            let cy = pY - 18;
            targetCtx.fillStyle = "#06b6d4";
            targetCtx.beginPath(); targetCtx.ellipse(cx, cy, 3, 5, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#0891b2"; targetCtx.lineWidth = 1; targetCtx.stroke();
        });

    } else {
        // Sade Kısa Saç
        targetCtx.strokeStyle = "#451a03"; targetCtx.lineWidth = 2.5;
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 23, 8, Math.PI * 1.15, Math.PI * 1.85); targetCtx.stroke();
        if (isBack) {
            targetCtx.fillStyle = "#451a03";
            targetCtx.fillRect(pX - 7, pY - 22, 14, 6);
        }
    }

    targetCtx.restore();
}

// --- 5. GÖZLER VE YÜZ AKSESUARLARI (8 AÇILI İZOMETRİK GÖZ, SUNGASSES, SAKAL, BIYIK) ---
function drawAvatarFaceAndEyes(targetCtx, pX, pY, faceType = "none", eyeOffsetX = 0, eyeOffsetY = 0, facing = "down") {
    let f = normalize8WayFacing(facing);
    if (f === 'up' || f === 'up-right' || f === 'up-left') {
        return;
    }

    targetCtx.save();
    if (f === 'right') {
        targetCtx.fillStyle = "#0f172a";
        targetCtx.fillRect(pX + 4, pY - 20, 2.5, 3);
        if (faceType === 'sunglasses') {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX + 2, pY - 21, 6, 4.5);
            targetCtx.strokeStyle = "#0f172a"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2, pY - 19); targetCtx.lineTo(pX - 5, pY - 18); targetCtx.stroke();
        } else if (faceType === 'mustache') {
            targetCtx.fillStyle = "#1e1e1e";
            targetCtx.beginPath(); targetCtx.ellipse(pX + 4, pY - 14, 4, 1.5, 0.2, 0, Math.PI * 2); targetCtx.fill();
        } else if (faceType === 'beard') {
            targetCtx.fillStyle = "rgba(30, 20, 10, 0.45)";
            targetCtx.beginPath(); targetCtx.arc(pX + 2, pY - 16, 7.5, 0, Math.PI * 0.5); targetCtx.fill();
        }

    } else if (f === 'left') {
        targetCtx.fillStyle = "#0f172a";
        targetCtx.fillRect(pX - 6.5, pY - 20, 2.5, 3);
        if (faceType === 'sunglasses') {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX - 8, pY - 21, 6, 4.5);
            targetCtx.strokeStyle = "#0f172a"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 2, pY - 19); targetCtx.lineTo(pX + 5, pY - 18); targetCtx.stroke();
        } else if (faceType === 'mustache') {
            targetCtx.fillStyle = "#1e1e1e";
            targetCtx.beginPath(); targetCtx.ellipse(pX - 4, pY - 14, 4, 1.5, -0.2, 0, Math.PI * 2); targetCtx.fill();
        } else if (faceType === 'beard') {
            targetCtx.fillStyle = "rgba(30, 20, 10, 0.45)";
            targetCtx.beginPath(); targetCtx.arc(pX - 2, pY - 16, 7.5, Math.PI * 0.5, Math.PI); targetCtx.fill();
        }

    } else if (f === 'down-right') {
        targetCtx.fillStyle = "#0f172a";
        targetCtx.fillRect(pX - 1, pY - 20, 2.5, 3);
        targetCtx.fillRect(pX + 5, pY - 20, 2.5, 3);
        if (faceType === 'sunglasses') {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX - 3, pY - 21, 5, 4.5);
            targetCtx.fillRect(pX + 3.5, pY - 21, 5, 4.5);
            targetCtx.strokeStyle = "#0f172a"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2, pY - 19); targetCtx.lineTo(pX + 3.5, pY - 19); targetCtx.stroke();
        } else if (faceType === 'mustache') {
            targetCtx.fillStyle = "#1e1e1e";
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 3, pY - 14); targetCtx.quadraticCurveTo(pX + 2, pY - 12, pX + 8, pY - 14);
            targetCtx.quadraticCurveTo(pX + 2, pY - 16, pX - 3, pY - 14); targetCtx.fill();
        } else if (faceType === 'beard') {
            targetCtx.fillStyle = "rgba(30, 20, 10, 0.45)";
            targetCtx.beginPath(); targetCtx.arc(pX + 1, pY - 16, 7.5, 0, Math.PI); targetCtx.fill();
        }

    } else if (f === 'down-left') {
        targetCtx.fillStyle = "#0f172a";
        targetCtx.fillRect(pX - 7.5, pY - 20, 2.5, 3);
        targetCtx.fillRect(pX - 1.5, pY - 20, 2.5, 3);
        if (faceType === 'sunglasses') {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX - 8.5, pY - 21, 5, 4.5);
            targetCtx.fillRect(pX - 2, pY - 21, 5, 4.5);
            targetCtx.strokeStyle = "#0f172a"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 3.5, pY - 19); targetCtx.lineTo(pX - 2, pY - 19); targetCtx.stroke();
        } else if (faceType === 'mustache') {
            targetCtx.fillStyle = "#1e1e1e";
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 8, pY - 14); targetCtx.quadraticCurveTo(pX - 2, pY - 12, pX + 3, pY - 14);
            targetCtx.quadraticCurveTo(pX - 2, pY - 16, pX - 8, pY - 14); targetCtx.fill();
        } else if (faceType === 'beard') {
            targetCtx.fillStyle = "rgba(30, 20, 10, 0.45)";
            targetCtx.beginPath(); targetCtx.arc(pX - 1, pY - 16, 7.5, 0, Math.PI); targetCtx.fill();
        }

    } else {
        // Tam Öne Dönük
        targetCtx.fillStyle = "#0f172a";
        targetCtx.fillRect(pX - 4 + eyeOffsetX, pY - 20 + eyeOffsetY, 2.5, 3);
        targetCtx.fillRect(pX + 2 + eyeOffsetX, pY - 20 + eyeOffsetY, 2.5, 3);

        if (faceType === 'mustache') {
            targetCtx.fillStyle = "#1e1e1e";
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 6, pY - 14);
            targetCtx.quadraticCurveTo(pX, pY - 12, pX + 6, pY - 14);
            targetCtx.quadraticCurveTo(pX, pY - 16, pX - 6, pY - 14);
            targetCtx.fill();
        } else if (faceType === 'sunglasses') {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX - 6 + eyeOffsetX, pY - 21 + eyeOffsetY, 5, 4.5);
            targetCtx.fillRect(pX + 1 + eyeOffsetX, pY - 21 + eyeOffsetY, 5, 4.5);
            targetCtx.strokeStyle = "#0f172a";
            targetCtx.lineWidth = 1;
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 1 + eyeOffsetX, pY - 19 + eyeOffsetY);
            targetCtx.lineTo(pX + 1 + eyeOffsetX, pY - 19 + eyeOffsetY);
            targetCtx.stroke();
            targetCtx.fillStyle = "rgba(255,255,255,0.7)";
            targetCtx.fillRect(pX - 5 + eyeOffsetX, pY - 20 + eyeOffsetY, 1.5, 1.5);
            targetCtx.fillRect(pX + 2 + eyeOffsetX, pY - 20 + eyeOffsetY, 1.5, 1.5);
        } else if (faceType === 'beard') {
            targetCtx.fillStyle = "rgba(30, 20, 10, 0.45)";
            targetCtx.beginPath();
            targetCtx.arc(pX, pY - 16, 7.5, 0, Math.PI);
            targetCtx.fill();
        }
    }

    targetCtx.restore();
}

// --- 6. EL EŞYALARI (8 AÇILI İZOMETRİK TÜM EL EŞYALARI VE SIRTKAPLAMA) ---
function drawHeldItem(targetCtx, pX, pY, heldItem, isPreview = false, facing = 'down') {
    if (!heldItem || heldItem === 'none') return;

    let f = normalize8WayFacing(facing);
    let isBack = (f === 'up' || f === 'up-right' || f === 'up-left');
    let isLeft = (f === 'left' || f === 'down-left' || f === 'up-left');

    targetCtx.save();

    // Dinamik El Pozisyonu Çapaları
    let handX = pX + 11;
    let handY = pY + 2;

    if (f === 'down') {
        handX = pX + (isPreview ? 12 : 11);
        handY = pY + 2;
    } else if (f === 'down-right') {
        handX = pX + 13;
        handY = pY + 4;
    } else if (f === 'right') {
        handX = pX + 12;
        handY = pY + 1;
    } else if (f === 'up-right') {
        handX = pX + 8;
        handY = pY - 3;
    } else if (f === 'up') {
        handX = pX + 8;
        handY = pY - 2;
    } else if (f === 'up-left') {
        handX = pX - 8;
        handY = pY - 3;
    } else if (f === 'left') {
        handX = pX - 12;
        handY = pY + 1;
    } else if (f === 'down-left') {
        handX = pX - 13;
        handY = pY + 4;
    }

    // 1. GEZGİN SIRT ÇANTASI
    if (heldItem === 'sirtcantasi') {
        let scale = isPreview ? 1.1 : 0.95;
        if (f === 'up') {
            let bpX = pX;
            let bpY = pY - 2;
            targetCtx.fillStyle = "#854d0e";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 7 * scale, bpY - 8 * scale, 14 * scale, 18 * scale, 4); targetCtx.fill();
            targetCtx.strokeStyle = "#532e08"; targetCtx.lineWidth = 1.2; targetCtx.stroke();
            targetCtx.fillStyle = "#a16207";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 7.5 * scale, bpY - 9 * scale, 15 * scale, 8 * scale, [4, 4, 1, 1]); targetCtx.fill();
            [-3 * scale, 3 * scale].forEach(sx => {
                targetCtx.fillStyle = "#451a03"; targetCtx.fillRect(bpX + sx - 1, bpY - 9 * scale, 2, 14 * scale);
                targetCtx.fillStyle = "#facc15"; targetCtx.fillRect(bpX + sx - 1.5, bpY - 2 * scale, 3, 2.5);
            });
            targetCtx.fillStyle = "#713f12";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 5 * scale, bpY + 2 * scale, 10 * scale, 7 * scale, 2); targetCtx.fill();
            targetCtx.strokeStyle = "#451a03"; targetCtx.lineWidth = 1.5;
            targetCtx.beginPath(); targetCtx.arc(bpX, bpY - 9 * scale, 3 * scale, Math.PI, 0); targetCtx.stroke();

        } else if (f === 'up-right' || f === 'up-left') {
            let bpX = (f === 'up-right') ? (pX - 3) : (pX + 3);
            let bpY = pY - 3;
            targetCtx.fillStyle = "#854d0e";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 6 * scale, bpY - 8 * scale, 12 * scale, 17 * scale, 4); targetCtx.fill();
            targetCtx.strokeStyle = "#532e08"; targetCtx.lineWidth = 1.2; targetCtx.stroke();
            targetCtx.fillStyle = "#a16207";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 6.5 * scale, bpY - 9 * scale, 13 * scale, 7 * scale, 3); targetCtx.fill();
            targetCtx.fillStyle = "#451a03"; targetCtx.fillRect(bpX - 1, bpY - 9 * scale, 2, 14 * scale);
            targetCtx.fillStyle = "#facc15"; targetCtx.fillRect(bpX - 1.5, bpY - 2 * scale, 3, 2.5);

        } else if (f === 'right' || f === 'left') {
            let bpX = (f === 'right') ? (pX - 9) : (pX + 9);
            let bpY = pY - 2;
            targetCtx.fillStyle = "#854d0e";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 4 * scale, bpY - 7 * scale, 8 * scale, 16 * scale, 3); targetCtx.fill();
            targetCtx.strokeStyle = "#532e08"; targetCtx.lineWidth = 1.2; targetCtx.stroke();
            targetCtx.fillStyle = "#a16207"; targetCtx.fillRect(bpX - 2 * scale, bpY - 3 * scale, 5 * scale, 6 * scale);
            targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(bpX - 4 * scale, bpY); targetCtx.lineTo(bpX + 4 * scale, bpY); targetCtx.stroke();

        } else {
            targetCtx.fillStyle = "#854d0e";
            targetCtx.fillRect(pX - 7, pY - 9, 2.8, 14);
            targetCtx.fillRect(pX + 4.2, pY - 9, 2.8, 14);
            targetCtx.fillStyle = "#451a03"; targetCtx.fillRect(pX - 7, pY - 2, 14, 2);
            targetCtx.fillStyle = "#facc15"; targetCtx.fillRect(pX - 1.5, pY - 2.5, 3, 3);
        }

        targetCtx.restore();
        return;
    }

    // 2. NOSTALJİK AKUSTİK GİTAR
    if (heldItem === 'gitar') {
        targetCtx.save();
        let scale = isPreview ? 1.15 : 1.0;

        if (isBack) {
            targetCtx.translate(pX, pY);
            let gAngle = (f === 'up-right') ? 0.6 : (f === 'up-left') ? -0.6 : 0.45;
            targetCtx.rotate(gAngle);

            targetCtx.strokeStyle = "#451a03"; targetCtx.lineWidth = 2.2;
            targetCtx.beginPath(); targetCtx.moveTo(-12 * scale, -14 * scale); targetCtx.lineTo(12 * scale, 14 * scale); targetCtx.stroke();

            targetCtx.fillStyle = "#9a3412";
            targetCtx.beginPath(); targetCtx.ellipse(0, 4 * scale, 8 * scale, 11 * scale, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 1.2; targetCtx.stroke();
            targetCtx.fillStyle = "#78350f";
            targetCtx.fillRect(-2 * scale, -22 * scale, 4 * scale, 16 * scale);

        } else {
            targetCtx.translate(handX, handY);
            let gRot = (isLeft) ? -0.45 : 0.45;
            targetCtx.rotate(gRot);

            targetCtx.fillStyle = "#b45309";
            targetCtx.beginPath(); targetCtx.ellipse(0, 8 * scale, 9 * scale, 11 * scale, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.ellipse(0, 0, 7 * scale, 7 * scale, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 1.2; targetCtx.stroke();

            targetCtx.fillStyle = "#1e1b4b";
            targetCtx.beginPath(); targetCtx.arc(0, 3 * scale, 3 * scale, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#fde047"; targetCtx.lineWidth = 0.8; targetCtx.stroke();

            targetCtx.fillStyle = "#78350f"; targetCtx.fillRect(-2 * scale, -22 * scale, 4 * scale, 22 * scale);
            targetCtx.fillStyle = "#b45309"; targetCtx.fillRect(-3 * scale, -27 * scale, 6 * scale, 6 * scale);
            targetCtx.strokeStyle = "rgba(255, 255, 255, 0.8)"; targetCtx.lineWidth = 0.7;
            targetCtx.beginPath();
            targetCtx.moveTo(-1, 10 * scale); targetCtx.lineTo(-1, -24 * scale);
            targetCtx.moveTo(1, 10 * scale); targetCtx.lineTo(1, -24 * scale);
            targetCtx.stroke();
        }

        targetCtx.restore();
        return;
    }

    // 3. ANADOLU BAĞLAMASI / SAZ
    if (heldItem === 'baglama') {
        targetCtx.save();
        let bodyW = isPreview ? 10 : 8.5;
        let bodyH = isPreview ? 14 : 12;
        let neckH = isPreview ? 30 : 25;

        if (isBack) {
            targetCtx.translate(pX, pY);
            let sAngle = (f === 'up-right') ? 0.5 : (f === 'up-left') ? -0.5 : 0.4;
            targetCtx.rotate(sAngle);

            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 2;
            targetCtx.beginPath(); targetCtx.moveTo(-10, -12); targetCtx.lineTo(10, 12); targetCtx.stroke();

            targetCtx.fillStyle = "#b45309";
            targetCtx.beginPath(); targetCtx.ellipse(0, 4, bodyW, bodyH, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 1; targetCtx.stroke();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 3;
            targetCtx.beginPath(); targetCtx.moveTo(0, -bodyH + 6); targetCtx.lineTo(0, -neckH); targetCtx.stroke();

        } else {
            targetCtx.translate(handX, handY);
            let rot = isLeft ? -0.35 : 0.35;
            targetCtx.rotate(rot);

            targetCtx.fillStyle = "#b45309";
            targetCtx.beginPath(); targetCtx.ellipse(0, 4, bodyW, bodyH, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 1; targetCtx.stroke();

            targetCtx.fillStyle = "#451a03";
            targetCtx.beginPath(); targetCtx.arc(0, 4, isPreview ? 3 : 2.5, 0, Math.PI * 2); targetCtx.fill();

            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = isPreview ? 3.5 : 2.8;
            targetCtx.beginPath(); targetCtx.moveTo(0, -bodyH + 6); targetCtx.lineTo(0, -neckH); targetCtx.stroke();
            targetCtx.fillStyle = "#f8fafc"; targetCtx.fillRect(-3, -neckH - 4, 6, 4);

            targetCtx.strokeStyle = "rgba(255,255,255,0.75)"; targetCtx.lineWidth = 0.8;
            targetCtx.beginPath();
            targetCtx.moveTo(-1, 8); targetCtx.lineTo(-1, -neckH);
            targetCtx.moveTo(1, 8); targetCtx.lineTo(1, -neckH);
            targetCtx.stroke();
        }

        targetCtx.restore();
        return;
    }

    // 4. BALIKÇI OLTASI
    if (heldItem === 'olta') {
        targetCtx.save();
        targetCtx.translate(handX, handY);

        let rodAngle = -0.55;
        if (f === 'right') rodAngle = 0.45;
        else if (f === 'left') rodAngle = -0.45;
        else if (f === 'up' || f === 'up-right' || f === 'up-left') rodAngle = -1.2;
        else if (f === 'down-right') rodAngle = 0.25;
        else if (f === 'down-left') rodAngle = -0.25;

        targetCtx.rotate(rodAngle);
        targetCtx.fillStyle = "#d97706"; targetCtx.fillRect(-2, -2, 4, 10);
        targetCtx.fillStyle = "#64748b"; targetCtx.fillRect(-3, 3, 6, 4);
        targetCtx.strokeStyle = "#1e293b"; targetCtx.lineWidth = 2;
        targetCtx.beginPath(); targetCtx.moveTo(0, -2); targetCtx.lineTo(0, isPreview ? -36 : -30); targetCtx.stroke();
        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.7)"; targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.moveTo(0, isPreview ? -36 : -30);
        targetCtx.lineTo(isPreview ? 6 : 5, isPreview ? -10 : -8);
        targetCtx.stroke();

        targetCtx.restore();
        return;
    }

    // 5. KEHRİBAR TESPİH
    if (heldItem === 'tespih') {
        let swing = Math.sin(Date.now() / 170) * 0.45;
        targetCtx.translate(handX, handY);
        targetCtx.rotate(swing);

        targetCtx.strokeStyle = "#b45309"; targetCtx.lineWidth = 1; targetCtx.fillStyle = "#f59e0b";
        let beadRadius = isPreview ? 2.2 : 1.8;
        let ringR = isPreview ? 6.5 : 5.5;
        for (let i = 0; i < 9; i++) {
            let angle = (i * 2 * Math.PI) / 9;
            let bx = Math.cos(angle) * ringR;
            let by = Math.sin(angle) * ringR + (isPreview ? 7 : 6);
            targetCtx.beginPath(); targetCtx.arc(bx, by, beadRadius, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
        }
        targetCtx.strokeStyle = "#94a3b8"; targetCtx.lineWidth = 1.5;
        targetCtx.beginPath();
        targetCtx.moveTo(0, ringR + (isPreview ? 7 : 6) + beadRadius);
        targetCtx.lineTo(0, ringR + (isPreview ? 15 : 13));
        targetCtx.stroke();
        targetCtx.fillStyle = "#cbd5e1";
        targetCtx.beginPath(); targetCtx.arc(0, ringR + (isPreview ? 16 : 14), 1.8, 0, Math.PI * 2); targetCtx.fill();

        targetCtx.restore();
        return;
    }

    // 6. UÇAN KIRMIZI BALON
    if (heldItem === 'balon') {
        let balloonSway = Math.sin(Date.now() / 320) * 4;
        let stringEndX = handX + balloonSway;
        let stringEndY = handY - (isPreview ? 36 : 30);

        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.85)"; targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.moveTo(handX, handY);
        targetCtx.quadraticCurveTo(handX + balloonSway * 0.5, handY - 15, stringEndX, stringEndY);
        targetCtx.stroke();

        let bW = isPreview ? 9 : 8;
        let bH = isPreview ? 12 : 10;
        targetCtx.fillStyle = "#ef4444";
        targetCtx.beginPath(); targetCtx.ellipse(stringEndX, stringEndY - bH, bW, bH, 0, 0, Math.PI * 2); targetCtx.fill();

        targetCtx.fillStyle = "#b91c1c";
        targetCtx.beginPath();
        targetCtx.moveTo(stringEndX - 2, stringEndY);
        targetCtx.lineTo(stringEndX + 2, stringEndY);
        targetCtx.lineTo(stringEndX, stringEndY - 2);
        targetCtx.closePath(); targetCtx.fill();

        targetCtx.fillStyle = "rgba(255, 255, 255, 0.65)";
        targetCtx.beginPath();
        targetCtx.ellipse(stringEndX - bW * 0.35, stringEndY - bH * 1.35, bW * 0.3, bH * 0.35, -0.2, 0, Math.PI * 2);
        targetCtx.fill();

        targetCtx.restore();
        return;
    }

    // 7. İNCE BELLİ ÇAY BARDAĞI
    if (heldItem === 'cay') {
        let teaX = handX, teaY = handY;
        targetCtx.fillStyle = "#f59e0b";
        targetCtx.fillRect(teaX - 4, teaY + 7, 8, 2);
        targetCtx.fillStyle = "rgba(255,255,255,0.7)";
        targetCtx.fillRect(teaX - 3, teaY - 3, 6, 9);
        targetCtx.fillStyle = "#b91c1c";
        targetCtx.fillRect(teaX - 2, teaY, 4, 6);
        let steamY = teaY - 6 - ((Date.now() / 40) % 8);
        targetCtx.strokeStyle = "rgba(255,255,255,0.6)"; targetCtx.lineWidth = 1;
        targetCtx.beginPath(); targetCtx.moveTo(teaX - 1, steamY + 4); targetCtx.quadraticCurveTo(teaX + 2, steamY + 2, teaX, steamY); targetCtx.stroke();

        targetCtx.restore();
        return;
    }

    // 8. NOSTALJİK YEŞİL CAM GAZOZ
    if (heldItem === 'gazoz') {
        let gX = handX, gY = handY;
        targetCtx.fillStyle = "#16a34a";
        targetCtx.beginPath(); targetCtx.roundRect(gX - 2.5, gY - 1, 5, 10, 2); targetCtx.fill();
        targetCtx.fillStyle = "#15803d"; targetCtx.fillRect(gX - 1.5, gY - 6, 3, 5);
        targetCtx.fillStyle = "#facc15"; targetCtx.fillRect(gX - 2, gY - 7.5, 4, 1.5);
        targetCtx.fillStyle = "#ffffff"; targetCtx.fillRect(gX - 2, gY + 2, 4, 4);

        targetCtx.restore();
        return;
    }

    // 9. KÖZDE TÜRK KAHVESİ
    if (heldItem === 'kahve') {
        let kX = handX, kY = handY;
        targetCtx.fillStyle = "#ca8a04";
        targetCtx.beginPath(); targetCtx.ellipse(kX, kY + 6, isPreview ? 7.5 : 6.5, 2, 0, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.roundRect(kX - (isPreview ? 4.5 : 3.5), kY - 2, isPreview ? 9 : 7, isPreview ? 7.5 : 6, 2); targetCtx.fill();
        targetCtx.strokeStyle = "#d97706"; targetCtx.lineWidth = 1; targetCtx.stroke();
        targetCtx.fillStyle = "#451a03"; targetCtx.fillRect(kX - (isPreview ? 3.5 : 2.8), kY - 1, isPreview ? 7 : 5.6, 2);
        targetCtx.strokeStyle = "#ca8a04"; targetCtx.lineWidth = 1.2;
        targetCtx.beginPath(); targetCtx.arc(kX + (isPreview ? 5 : 4), kY + 1.5, 2.2, -Math.PI * 0.5, Math.PI * 0.5); targetCtx.stroke();
        let steamY = kY - 4 - ((Date.now() / 40) % 8);
        targetCtx.strokeStyle = "rgba(255,255,255,0.6)"; targetCtx.lineWidth = 1;
        targetCtx.beginPath(); targetCtx.moveTo(kX - 1, steamY + 4); targetCtx.quadraticCurveTo(kX + 2, steamY + 2, kX, steamY); targetCtx.stroke();

        targetCtx.restore();
        return;
    }

    // 10. ŞAMPİYONLUK ALTIN KUPASI
    if (heldItem === 'kupa') {
        let tX = handX, tY = handY;
        targetCtx.fillStyle = "#1e293b"; targetCtx.fillRect(tX - (isPreview ? 5 : 4), tY + 6, isPreview ? 10 : 8, isPreview ? 3 : 2.5);
        targetCtx.fillStyle = "#eab308"; targetCtx.fillRect(tX - 1.5, tY + 2, 3, 4);
        let cupW = isPreview ? 7 : 6;
        let cupH = isPreview ? 9 : 7.5;
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath();
        targetCtx.moveTo(tX - cupW, tY - cupH); targetCtx.lineTo(tX + cupW, tY - cupH);
        targetCtx.lineTo(tX + cupW * 0.5, tY + 2); targetCtx.lineTo(tX - cupW * 0.5, tY + 2);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "#b45309"; targetCtx.lineWidth = 1; targetCtx.stroke();
        targetCtx.strokeStyle = "#ca8a04"; targetCtx.lineWidth = 1.5;
        targetCtx.beginPath(); targetCtx.arc(tX - cupW - 1.5, tY - cupH * 0.5, 3, Math.PI * 0.5, Math.PI * 1.5); targetCtx.stroke();
        targetCtx.beginPath(); targetCtx.arc(tX + cupW + 1.5, tY - cupH * 0.5, 3, -Math.PI * 0.5, Math.PI * 0.5); targetCtx.stroke();
        targetCtx.fillStyle = "rgba(255, 255, 255, 0.75)";
        targetCtx.beginPath(); targetCtx.arc(tX - 2, tY - cupH * 0.6, 1.5, 0, Math.PI * 2); targetCtx.fill();

        targetCtx.restore();
        return;
    }

    // 11. YILDIZLI BÜYÜ ASASI (ASAGOLD)
    if (heldItem === 'asagold') {
        let now = Date.now();
        targetCtx.translate(handX, handY);
        let aRot = (isLeft) ? 0.25 : -0.25;
        targetCtx.rotate(aRot);

        let staffH = isPreview ? 32 : 27;
        targetCtx.strokeStyle = "#d97706"; targetCtx.lineWidth = isPreview ? 3.5 : 2.8;
        targetCtx.beginPath(); targetCtx.moveTo(0, 6); targetCtx.lineTo(0, -staffH); targetCtx.stroke();

        let starGlow = Math.sin(now / 140) * 0.2 + 0.8;
        targetCtx.fillStyle = \`rgba(56, 189, 248, \${starGlow})\`;
        targetCtx.beginPath(); targetCtx.arc(0, -staffH, isPreview ? 6.5 : 5.5, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(0, -staffH, isPreview ? 3 : 2.5, 0, Math.PI * 2); targetCtx.fill();

        for (let s = 0; s < 3; s++) {
            let sAngle = (now / 200) + (s * (Math.PI * 2 / 3));
            let sDist = isPreview ? 9 : 7.5;
            let spX = Math.cos(sAngle) * sDist;
            let spY = -staffH + Math.sin(sAngle) * sDist;
            targetCtx.fillStyle = "#facc15";
            targetCtx.beginPath(); targetCtx.arc(spX, spY, 1.4, 0, Math.PI * 2); targetCtx.fill();
        }

        targetCtx.restore();
        return;
    }

    // 12. GELENEKSEL DUMANLI NARGİLE
    if (heldItem === 'nargile') {
        let now = Date.now();
        let nX = handX + (isLeft ? -8 : 8);
        let nY = handY + (isPreview ? 12 : 10);
        let vaseR = isPreview ? 8.5 : 7;

        targetCtx.fillStyle = "rgba(14, 165, 233, 0.45)";
        targetCtx.beginPath(); targetCtx.arc(nX, nY, vaseR, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.6)"; targetCtx.lineWidth = 1.2; targetCtx.stroke();

        let stemTopY = nY - (isPreview ? 24 : 20);
        targetCtx.strokeStyle = "#eab308"; targetCtx.lineWidth = isPreview ? 3 : 2.5;
        targetCtx.beginPath(); targetCtx.moveTo(nX, nY - vaseR); targetCtx.lineTo(nX, stemTopY); targetCtx.stroke();

        targetCtx.fillStyle = "#ca8a04";
        targetCtx.beginPath(); targetCtx.ellipse(nX, stemTopY, isPreview ? 8.5 : 7, isPreview ? 2.8 : 2.2, 0, 0, Math.PI * 2); targetCtx.fill();

        let headH = isPreview ? 6.5 : 5.5;
        targetCtx.fillStyle = "#9a3412";
        targetCtx.fillRect(nX - (isPreview ? 4 : 3.5), stemTopY - headH, isPreview ? 8 : 7, headH);

        let coalGlow = Math.sin(now / 150) * 0.25 + 0.75;
        targetCtx.fillStyle = \`rgba(239, 68, 68, \${coalGlow})\`;
        targetCtx.beginPath(); targetCtx.arc(nX - 2, stemTopY - headH - 1, 2, 0, Math.PI * 2); targetCtx.fill();

        targetCtx.strokeStyle = "#991b1b"; targetCtx.lineWidth = isPreview ? 2.2 : 1.8;
        targetCtx.beginPath();
        targetCtx.moveTo(nX - (isLeft ? -vaseR * 0.6 : vaseR * 0.6), nY - 2);
        targetCtx.quadraticCurveTo(nX + (isLeft ? 9 : -9), nY + 4, handX, handY);
        targetCtx.stroke();

        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath(); targetCtx.arc(handX, handY, isPreview ? 3 : 2.5, 0, Math.PI * 2); targetCtx.fill();

        for (let i = 0; i < 4; i++) {
            let cycle = ((now / (650 + i * 160)) + (i * 0.25)) % 1;
            let smX = nX + Math.sin((now / 260) + i * 1.5) * (3 + cycle * 6);
            let smY = (stemTopY - headH - 3) - (cycle * (isPreview ? 28 : 22));
            let smR = (isPreview ? 2.5 : 2) + cycle * (isPreview ? 7 : 5.5);
            let smA = Math.sin(cycle * Math.PI) * 0.42;
            targetCtx.fillStyle = \`rgba(241, 245, 249, \${smA})\`;
            targetCtx.beginPath(); targetCtx.arc(smX, smY, smR, 0, Math.PI * 2); targetCtx.fill();
        }

        targetCtx.restore();
        return;
    }

    // 13. LİMONATA & SAHİL KOKTEYLLERİ
    if (heldItem === 'limonata' || heldItem === 'lemonade' || heldItem.startsWith('cocktail_')) {
        let dX = handX, dY = handY;
        let cType = (heldItem === 'limonata' || heldItem === 'lemonade') ? 'lemonade' : heldItem.replace('cocktail_', '');

        if (cType === 'coconut') {
            targetCtx.fillStyle = "#5c3317";
            targetCtx.beginPath(); targetCtx.arc(dX, dY + 2, isPreview ? 6.5 : 5.5, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#38200f"; targetCtx.lineWidth = 1; targetCtx.stroke();
            targetCtx.fillStyle = "#f8fafc";
            targetCtx.beginPath(); targetCtx.ellipse(dX, dY - 1, isPreview ? 4.5 : 3.8, isPreview ? 2.2 : 1.8, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#ef4444"; targetCtx.lineWidth = 1.5;
            targetCtx.beginPath(); targetCtx.moveTo(dX, dY - 1); targetCtx.lineTo(dX + (isPreview ? 4 : 3.5), dY - (isPreview ? 8 : 7)); targetCtx.stroke();
            targetCtx.fillStyle = "#ec4899";
            targetCtx.beginPath(); targetCtx.arc(dX - 2, dY - 3, 3, Math.PI, 0); targetCtx.fill();
        } else {
            let liquidColor = "#facc15";
            let strawColor = "#10b981";
            let fruitColor = "#eab308";

            if (cType === 'pineapple') {
                liquidColor = "#f59e0b"; strawColor = "#3b82f6"; fruitColor = "#facc15";
            } else if (cType === 'mojito') {
                liquidColor = "#f43f5e"; strawColor = "#22c55e"; fruitColor = "#84cc16";
            } else if (cType === 'sunset') {
                liquidColor = "#f97316"; strawColor = "#a855f7"; fruitColor = "#dc2626";
            }

            let gW = isPreview ? 4.5 : 3.8;
            let gH = isPreview ? 9 : 7.5;
            targetCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
            targetCtx.beginPath();
            targetCtx.moveTo(dX - gW, dY - gH + 2);
            targetCtx.lineTo(dX + gW, dY - gH + 2);
            targetCtx.lineTo(dX + gW * 0.7, dY + 4);
            targetCtx.lineTo(dX - gW * 0.7, dY + 4);
            targetCtx.closePath(); targetCtx.fill();
            targetCtx.strokeStyle = "rgba(255, 255, 255, 0.85)"; targetCtx.lineWidth = 1; targetCtx.stroke();

            targetCtx.fillStyle = liquidColor;
            targetCtx.beginPath();
            targetCtx.moveTo(dX - gW * 0.9, dY - gH + 4);
            targetCtx.lineTo(dX + gW * 0.9, dY - gH + 4);
            targetCtx.lineTo(dX + gW * 0.65, dY + 3);
            targetCtx.lineTo(dX - gW * 0.65, dY + 3);
            targetCtx.closePath(); targetCtx.fill();

            targetCtx.fillStyle = "rgba(255, 255, 255, 0.75)";
            targetCtx.fillRect(dX - 2, dY - 2, 2, 2);
            targetCtx.fillRect(dX + 0.5, dY, 2, 2);

            targetCtx.strokeStyle = strawColor; targetCtx.lineWidth = 1.3;
            targetCtx.beginPath();
            targetCtx.moveTo(dX + 0.5, dY + 2);
            targetCtx.lineTo(dX + (isPreview ? 3.5 : 3), dY - gH - (isPreview ? 3 : 2.5));
            targetCtx.stroke();

            targetCtx.fillStyle = fruitColor;
            targetCtx.beginPath(); targetCtx.arc(dX - gW + 0.5, dY - gH + 2.5, isPreview ? 2.5 : 2.2, 0, Math.PI); targetCtx.fill();
        }

        targetCtx.restore();
        return;
    }

    targetCtx.restore();
}

// --- 7. GARDIROP ÖNİZLEME DÖNGÜSÜ ---
function avatarPreviewLoop() {
    if (!isWardrobeOpen) return;
    drawAvatarPreview();
    requestAnimationFrame(avatarPreviewLoop);
}

function drawAvatarPreview() {
    const previewCanvas = document.getElementById('avatarPreviewCanvas');
    if (!previewCanvas) return;
    const pCtx = previewCanvas.getContext('2d');
    pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    let cX = previewCanvas.width / 2;
    let cY = 138;

    pCtx.fillStyle = "rgba(56, 189, 248, 0.12)";
    pCtx.beginPath();
    pCtx.ellipse(cX, cY + 20, 52, 16, 0, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    pCtx.lineWidth = 1.5;
    pCtx.stroke();

    pCtx.fillStyle = "rgba(56, 189, 248, 0.25)";
    pCtx.beginPath();
    pCtx.ellipse(cX, cY + 20, 34, 10, 0, 0, Math.PI * 2);
    pCtx.fill();

    let idleBob = Math.sin(Date.now() / 260) * 2.5;

    pCtx.save();
    pCtx.translate(cX, cY + idleBob);
    pCtx.scale(1.9, 1.9);

    pCtx.fillStyle = "rgba(0, 0, 0, 0.35)";
    pCtx.beginPath();
    pCtx.ellipse(0, 22, 12, 5, 0, 0, Math.PI * 2);
    pCtx.fill();

    let activeAv = (isWardrobeOpen && previewAvatar) ? previewAvatar : myAvatar;
    let isDressOrSkirt = (activeAv.color && (activeAv.color.startsWith('dress_') || activeAv.color.startsWith('skirt_') || activeAv.color.startsWith('outfit_')));
    let isFemale = isFemaleAvatar(activeAv, activeAv.color, activeAv.hat, activeAv.shoes);
    let facing = (typeof window !== 'undefined' && window.previewFacing) ? window.previewFacing : 'down';

    // Bacaklar & Ayakkabılar
    drawAvatarLegsAndShoes(pCtx, 0, 0, 0, activeAv.skinColor, activeAv.shoes, isDressOrSkirt, false, facing, isFemale);

    // Gövde & Kıyafet (İncelen Bel ve Gerçekçi Kumaş)
    drawAvatarBodyAndClothes(pCtx, 0, 0, activeAv.color, activeAv.skinColor, facing, isFemale);

    // Kafa (Ten Rengi)
    pCtx.fillStyle = activeAv.skinColor || "#ffd1a4";
    pCtx.beginPath();
    pCtx.arc(0, -18, 10, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.strokeStyle = "rgba(0,0,0,0.2)";
    pCtx.lineWidth = 1.2;
    pCtx.stroke();

    // Şapkalar / Saç Modelleri
    drawAvatarHairAndHats(pCtx, 0, 0, activeAv.hat || 'none', facing);

    // Gözler ve Yüz Aksesuarları
    drawAvatarFaceAndEyes(pCtx, 0, 0, activeAv.face || 'none', 0, 0, facing);

    // Elde Taşınan Eşya
    drawHeldItem(pCtx, 0, 0, activeAv.heldItem, true, facing);

    pCtx.restore();
}

// --- 8. ANİMASYONLU VE ÇOK OYUNCULU OYUNCU ÇİZİM MOTORU ---
function drawAnimatedPlayer(p, id) {
    let isSitting = (p.action === 'sitting');
    let playerWalkCycle = (id === myId) ? walkCycle : (p.walkCycle || 0);
    let isMoving = (id === myId) ? (keys.w || keys.a || keys.s || keys.d) : !!p.isMoving;
    if (isSitting) isMoving = false;
    let bob = (isMoving && !isSitting) ? Math.sin(playerWalkCycle) * 2.5 : 0;
    let legSwing = (isMoving && !isSitting) ? Math.sin(playerWalkCycle) * 5 : 0;

    let pX = p.x;
    let pY = p.y + (isSitting ? 7 : bob);

    let isDancing = (p.action === 'dance');
    let danceTilt = isDancing ? Math.sin(Date.now() / 140) * 0.15 : 0;

    ctx.save();
    if (isDancing) {
        ctx.translate(pX, pY);
        ctx.rotate(danceTilt);
        ctx.translate(-pX, -pY);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(pX, p.y + (isSitting ? 16 : 22), isSitting ? 14 : 12, isSitting ? 5.5 : 5, 0, 0, Math.PI * 2);
    ctx.fill();

    let isDressOrSkirt = (p.color && (p.color.startsWith('dress_') || p.color.startsWith('skirt_') || p.color.startsWith('outfit_')));
    let facing = normalize8WayFacing((id === myId) ? myFacing : (p.facing || 'down'));
    let isFemale = isFemaleAvatar(p, p.color, p.hat, p.shoes);

    // 2. Bacaklar & Ayakkabılar (Kadın/Erkek Anatomisiyle)
    drawAvatarLegsAndShoes(ctx, pX, pY, legSwing, p.skinColor, p.shoes, isDressOrSkirt, isSitting, facing, isFemale);

    // 3. Gövde & Kıyafet (İncelen Bel ve Gerçekçi Kumaş)
    drawAvatarBodyAndClothes(ctx, pX, pY, p.color, p.skinColor, facing, isFemale);

    // 3.1 Oturmaya Özel Kollar ve Eller
    let skin = p.skinColor || "#ffd1a4";
    if (isSitting) {
        ctx.save();
        let sleeveColor = p.color && p.color.startsWith('#') ? p.color : "#3b82f6";
        if (p.color && (p.color.startsWith('dress_') || p.color.startsWith('skirt_') || p.color === 'polo' || p.color === 'hoodie' || p.color === 'leather')) {
            if (p.color === 'dress_pink') sleeveColor = "#f472b6";
            else if (p.color === 'dress_black') sleeveColor = "#18181b";
            else if (p.color === 'dress_red') sleeveColor = "#e11d48";
            else if (p.color === 'dress_emerald') sleeveColor = "#059669";
            else if (p.color === 'dress_lavender') sleeveColor = "#c084fc";
            else if (p.color === 'dress_bridal') sleeveColor = "#ffffff";
            else if (p.color === 'outfit_goth') sleeveColor = "#18181b";
            else if (p.color === 'outfit_business') sleeveColor = "#fb7185";
            else if (p.color === 'outfit_boho') sleeveColor = "#78350f";
            else if (p.color === 'outfit_sporty') sleeveColor = skin;
            else if (p.color === 'dress_vintage_polka') sleeveColor = "#dc2626";
            else if (p.color === 'dress_ocean_blue') sleeveColor = "#06b6d4";
            else if (p.color === 'outfit_turtleneck_skirt') sleeveColor = "#fef3c7";
            else if (p.color === 'skirt_crop') sleeveColor = skin;
            else if (p.color === 'skirt_denim') sleeveColor = "#f1f5f9";
            else if (p.color === 'polo') sleeveColor = "#f8fafc";
            else if (p.color === 'hoodie') sleeveColor = "#6366f1";
            else if (p.color === 'leather') sleeveColor = "#18181b";
        }

        if (facing === 'right') {
            ctx.fillStyle = sleeveColor;
            ctx.beginPath(); ctx.roundRect(pX - 2, pY - 2, 11, 5, 2.5); ctx.fill();
            ctx.fillStyle = skin;
            ctx.beginPath(); ctx.arc(pX + 9, pY, 2.5, 0, Math.PI * 2); ctx.fill();
        } else if (facing === 'left') {
            ctx.fillStyle = sleeveColor;
            ctx.beginPath(); ctx.roundRect(pX - 9, pY - 2, 11, 5, 2.5); ctx.fill();
            ctx.fillStyle = skin;
            ctx.beginPath(); ctx.arc(pX - 9, pY, 2.5, 0, Math.PI * 2); ctx.fill();
        } else if (facing === 'up' || facing === 'up-right' || facing === 'up-left') {
            ctx.fillStyle = sleeveColor;
            ctx.fillRect(pX - 11, pY - 2, 4, 8);
            ctx.fillRect(pX + 7, pY - 2, 4, 8);
            ctx.fillStyle = skin;
            ctx.beginPath(); ctx.arc(pX - 9, pY + 7, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(pX + 9, pY + 7, 2, 0, Math.PI * 2); ctx.fill();
        } else if (facing === 'down-right') {
            ctx.fillStyle = sleeveColor;
            ctx.beginPath(); ctx.roundRect(pX - 5, pY - 2, 12, 5, 2.5); ctx.fill();
            ctx.fillStyle = skin;
            ctx.beginPath(); ctx.arc(pX + 7, pY + 2, 2.5, 0, Math.PI * 2); ctx.fill();
        } else if (facing === 'down-left') {
            ctx.fillStyle = sleeveColor;
            ctx.beginPath(); ctx.roundRect(pX - 7, pY - 2, 12, 5, 2.5); ctx.fill();
            ctx.fillStyle = skin;
            ctx.beginPath(); ctx.arc(pX - 7, pY + 2, 2.5, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = sleeveColor;
            ctx.beginPath();
            ctx.moveTo(pX - 10, pY - 4);
            ctx.lineTo(pX - 4, pY + 6);
            ctx.lineTo(pX - 7, pY + 9);
            ctx.lineTo(pX - 12, pY - 2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 0.8; ctx.stroke();

            ctx.fillStyle = skin;
            ctx.beginPath(); ctx.arc(pX - 5, pY + 8, 2.5, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = sleeveColor;
            ctx.beginPath();
            ctx.moveTo(pX + 10, pY - 4);
            ctx.lineTo(pX + 6, pY + 6);
            ctx.lineTo(pX + 3, pY + 5);
            ctx.lineTo(pX + 8, pY - 3);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 0.8; ctx.stroke();

            ctx.fillStyle = skin;
            ctx.beginPath(); ctx.arc(pX + 5, pY + 7, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    // 4. Kafa
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(pX, pY - 18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 5. Şapkalar & Saç Modelleri
    drawAvatarHairAndHats(ctx, pX, pY, p.hat || 'none', facing);

    // 6. Gözler ve Yüz Aksesuarları
    let eyeOffsetX = 0, eyeOffsetY = 0;
    if (facing === 'left') eyeOffsetX = -3;
    else if (facing === 'right') eyeOffsetX = 3;
    else if (facing === 'up') eyeOffsetY = -2;
    else eyeOffsetY = 1;
    drawAvatarFaceAndEyes(ctx, pX, pY, p.face || 'none', eyeOffsetX, eyeOffsetY, facing);

    // 7. Elde Taşınan Eşyalar & Balık Tutma
    if (p.isFishing) {
        ctx.save();
        let rodDirX = (facing === 'left' || facing === 'down-left' || facing === 'up-left') ? -1 : 1;
        let fishHandX = pX + rodDirX * 10;
        let fishHandY = pY + 2;
        let rodBend = Math.sin(Date.now() / 240) * 2;
        let tipX = fishHandX + rodDirX * 26;
        let tipY = fishHandY - 18 + rodBend;

        ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fishHandX, fishHandY);
        ctx.quadraticCurveTo(fishHandX + rodDirX * 13, fishHandY - 14, tipX, tipY);
        ctx.stroke();

        ctx.fillStyle = "#f59e0b";
        ctx.beginPath(); ctx.arc(fishHandX + rodDirX * 4, fishHandY, 3, 0, Math.PI * 2); ctx.fill();

        let floatTargetX = tipX + rodDirX * 16;
        let floatTargetY = tipY + 40;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(floatTargetX, floatTargetY); ctx.stroke();

        let bobberAnim = Math.sin(Date.now() / 180) * 2;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath(); ctx.arc(floatTargetX, floatTargetY + bobberAnim, 3.5, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(floatTargetX, floatTargetY + bobberAnim, 3.5, 0, Math.PI); ctx.fill();

        let rippleR = ((Date.now() / 35) % 14) + 2;
        let rippleAlpha = 1 - (rippleR / 16);
        ctx.strokeStyle = \`rgba(255, 255, 255, \${rippleAlpha * 0.7})\`; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(floatTargetX, floatTargetY + 3, rippleR, rippleR * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    } else {
        let activeHeld = p.heldItem || (p.hasTea ? 'cay' : 'none');
        drawHeldItem(ctx, pX, pY, activeHeld, false, facing);
    }

    // 8. El Sallama Animasyonu
    if (p.action === 'wave') {
        let waveArmAngle = Math.sin(Date.now() / 90) * 0.4 - 0.7;
        ctx.save();
        ctx.translate(pX + 10, pY - 5);
        ctx.rotate(waveArmAngle);
        ctx.fillStyle = p.color;
        ctx.fillRect(0, -12, 4, 12);
        ctx.fillStyle = "#facc15";
        ctx.beginPath(); ctx.arc(2, -14, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // 9. Alkış Animasyonu
    if (p.action === 'clap') {
        let clapOffset = Math.abs(Math.sin(Date.now() / 80)) * 4;
        ctx.fillStyle = "#facc15";
        ctx.beginPath(); ctx.arc(pX - 4 + clapOffset, pY + 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(pX + 4 - clapOffset, pY + 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#facc15";
        ctx.font = "10px sans-serif";
        ctx.fillText("✨", pX + 8, pY);
    }

    // 10. Dans Eden Nota Simgeleri
    if (isDancing) {
        let noteY = pY - 38 - ((Date.now() / 50) % 12);
        ctx.fillStyle = "#ec4899";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("♪ ♫", pX + 10, noteY);
    }

    ctx.restore();

    // 10.0 BİNEK ATI
    if (p.hasHorse) {
        ctx.save();
        let isMoving = p.isMoving;
        let walkCycle = p.walkCycle || 0;
        let gallopBob = isMoving ? Math.sin(walkCycle * 2) * 3 : 0;
        let dir = facing;
        let flip = (dir === 'left' || dir === 'down-left' || dir === 'up-left') ? -1 : 1;

        ctx.translate(pX, pY + 12 + gallopBob);
        ctx.scale(flip, 1);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath(); ctx.ellipse(0, 15, 24, 10, 0, 0, Math.PI * 2); ctx.fill();

        if (isMoving) {
            ctx.fillStyle = 'rgba(217, 119, 6, 0.45)';
            ctx.beginPath();
            ctx.arc(-18 + Math.sin(walkCycle) * 3, 13, 4, 0, Math.PI * 2);
            ctx.arc(-24 - Math.cos(walkCycle) * 3, 15, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        let legSwingFront = isMoving ? Math.sin(walkCycle * 1.5) * 8 : 0;
        let legSwingBack = isMoving ? -Math.sin(walkCycle * 1.5) * 8 : 0;

        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-10, 4); ctx.lineTo(-12 + legSwingBack, 15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, 4); ctx.lineTo(12 + legSwingFront, 15); ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-14 + legSwingBack, 13, 4, 3);
        ctx.fillRect(10 + legSwingFront, 13, 4, 3);

        ctx.fillStyle = '#92400e';
        ctx.beginPath(); ctx.ellipse(0, 2, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5; ctx.stroke();

        let tailWag = isMoving ? Math.sin(walkCycle * 2) * 6 : Math.sin(Date.now() / 300) * 2;
        ctx.strokeStyle = '#451a03'; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-28, 4 + tailWag, -25, 14 + tailWag); ctx.stroke();

        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.moveTo(12, -2); ctx.lineTo(19, -17); ctx.lineTo(27, -15); ctx.lineTo(24, 2);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.beginPath(); ctx.ellipse(27, -15, 6, 4.5, 0.2, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#92400e';
        ctx.beginPath(); ctx.moveTo(18, -17); ctx.lineTo(20, -24); ctx.lineTo(23, -17); ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#451a03';
        ctx.beginPath(); ctx.moveTo(14, -4); ctx.lineTo(19, -18); ctx.lineTo(16, -17); ctx.lineTo(11, -3); ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(23, -16, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(24, -16, 1.2, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#d97706';
        ctx.beginPath(); ctx.roundRect(-8, -4, 16, 8, 3); ctx.fill();
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1; ctx.stroke();

        ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(26, -13); ctx.lineTo(0, -2); ctx.stroke();

        ctx.restore();
    }

    // 10.1 KUĞU DENİZ BİSİKLETİ
    if (typeof currentRoom !== 'undefined' && currentRoom === 'sahil' && p.hasSwanBoat) {
        ctx.save();
        let swanFlip = (facing === 'left' || facing === 'down-left' || facing === 'up-left') ? -1 : 1;
        ctx.translate(pX, pY + 16);
        ctx.scale(swanFlip, 1);

        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1.5; ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(14, 0); ctx.quadraticCurveTo(24, -18, 18, -24);
        ctx.lineTo(13, -24); ctx.quadraticCurveTo(16, -12, 10, 0);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = "#f97316";
        ctx.beginPath(); ctx.moveTo(18, -24); ctx.lineTo(24, -21); ctx.lineTo(18, -19); ctx.closePath(); ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.beginPath(); ctx.arc(16, -22, 1.5, 0, Math.PI * 2); ctx.fill();

        let ripple = Math.sin(Date.now() / 200) * 2;
        ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 4, 26 + ripple, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }

    // 10.2 NARGİLE DUMAN EFEKTİ
    if (p.heldItem === 'nargile' || (typeof currentRoom !== 'undefined' && currentRoom === 'nargile_cafe')) {
        let smokeTime = Date.now();
        for (let i = 0; i < 3; i++) {
            let offsetTime = (smokeTime / 450 + i * 2) % 6;
            let smokeAlpha = Math.max(0, 1 - (offsetTime / 6));
            let smokeY = pY - 28 - (offsetTime * 8);
            let smokeX = pX + Math.sin(offsetTime * 1.5 + i) * 6;
            let smokeR = 3 + offsetTime * 2.2;

            ctx.fillStyle = \`rgba(240, 240, 255, \${smokeAlpha * 0.45})\`;
            ctx.beginPath(); ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2); ctx.fill();
        }
    }

    // 11. OYUNCU İSMİ ROZETİ
    ctx.font = "bold 11px sans-serif";
    if (p._cachedNameWidth === undefined || p._cachedName !== p.name) {
        p._cachedName = p.name || '';
        p._cachedNameWidth = ctx.measureText(p._cachedName).width;
    }
    let nameWidth = p._cachedNameWidth;

    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.beginPath();
    ctx.roundRect(pX - nameWidth / 2 - 6, pY - 42, nameWidth + 12, 16, 6);
    ctx.fill();
    ctx.fillStyle = id === myId ? "#38bdf8" : "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(p.name, pX, pY - 30);

    // 11.1 Oturma & Kalkma İpucu
    if (id === myId) {
        if (isSitting) {
            let hintText = "[E] / Yön: Kalk";
            ctx.save();
            ctx.font = "bold 9px sans-serif";
            let hintW = ctx.measureText(hintText).width + 12;
            let hintY = pY + 28;
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
            ctx.beginPath();
            ctx.roundRect(pX - hintW / 2, hintY, hintW, 15, 6);
            ctx.fill();
            ctx.strokeStyle = "rgba(56, 189, 248, 0.7)"; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = "#38bdf8"; ctx.textAlign = "center";
            ctx.fillText(hintText, pX, hintY + 11);
            ctx.restore();
        } else {
            let nearbySeat = (typeof findNearestSittableSeat === 'function') ? findNearestSittableSeat() : null;
            if (nearbySeat) {
                let pulse = Math.sin(Date.now() / 180) * 2;
                let promptText = \`🛋️ [E] Otur\`;
                ctx.save();
                ctx.font = "bold 10px sans-serif";
                let promptW = ctx.measureText(promptText).width + 14;
                let promptY = pY - 60 + pulse;
                ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
                ctx.beginPath();
                ctx.roundRect(pX - promptW / 2, promptY, promptW, 17, 7);
                ctx.fill();
                ctx.strokeStyle = "#facc15"; ctx.lineWidth = 1.2; ctx.stroke();
                ctx.fillStyle = "#facc15"; ctx.textAlign = "center";
                ctx.fillText(promptText, pX, promptY + 12);
                ctx.restore();
            }
        }
    }

    // 11.2 Canlı Sesli Konuşma Göstergesi
    if (p.isSpeaking) {
        ctx.save();
        ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2.5;
        ctx.beginPath();
        let pulseRadius = 24 + Math.sin(Date.now() / 150) * 3;
        ctx.arc(pX, pY - 14, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "12px sans-serif";
        ctx.fillText("🎙️", pX + nameWidth / 2 + 12, pY - 30);
        ctx.restore();
    }

    // 12. Konuşma Baloncukları
    if (typeof activeChatBubbles !== 'undefined' && activeChatBubbles[id] && activeChatBubbles[id].length > 0) {
        let bubbles = activeChatBubbles[id];
        let bubbleY = pY - 54;

        for (let i = bubbles.length - 1; i >= 0; i--) {
            let bObj = bubbles[i];
            let text = bObj.text;

            if (bObj._textWidth === undefined) {
                ctx.font = "12px sans-serif";
                bObj._textWidth = ctx.measureText(text).width;
            }
            let textWidth = bObj._textWidth;
            let boxWidth = Math.max(textWidth + 18, 44);
            let boxHeight = 26;

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.roundRect(pX - boxWidth / 2, bubbleY - boxHeight, boxWidth, boxHeight, 8);
            ctx.fill();
            ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5; ctx.stroke();

            if (i === bubbles.length - 1) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(pX - 4, bubbleY);
                ctx.lineTo(pX, bubbleY + 5);
                ctx.lineTo(pX + 4, bubbleY);
                ctx.fill();
            }

            ctx.fillStyle = "#0f172a";
            ctx.textAlign = "center";
            ctx.fillText(text, pX, bubbleY - 8);

            bubbleY -= (boxHeight + 6);
        }
    }

    // 13. Hızlı Emoji Tepkileri
    if (typeof activePlayerEmojis !== 'undefined' && activePlayerEmojis[id]) {
        let emojiData = activePlayerEmojis[id];
        let elapsed = Date.now() - emojiData.start;
        if (elapsed < 3000) {
            let progress = elapsed / 3000;
            let alpha = progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1;
            let floatY = pY - 56 - (progress * 28);
            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.beginPath();
            ctx.arc(pX, floatY, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.font = "18px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(emojiData.emoji, pX, floatY + 1);
            ctx.restore();
        } else {
            delete activePlayerEmojis[id];
        }
    }
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'js', 'avatarRenderer.js'), code, 'utf8');
console.log("✓ Successfully applied refined realistic avatarRenderer.js!");
