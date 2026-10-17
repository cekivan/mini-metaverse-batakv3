// scratch/apply_8way_isometric_avatars.js
const fs = require('fs');
const path = require('path');

console.log("Building comprehensive 8-directional isometric avatarRenderer.js...");

const script = `// public/js/avatarRenderer.js - Karakter, Kıyafet, Saç, Oturma Pozu ve Aksesuar Çizim Motoru (8 Açılı İzometrik Sistem)

// --- 8 AÇILI İZOMETRİK YÖN NORMALİZASYONU ---
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
window.normalize8WayFacing = normalize8WayFacing;

// --- 1. AYAKKABI ÇİZİMİ (8 AÇILI İZOMETRİK TABAN & TOPUK) ---
function drawSingleShoe(targetCtx, x, y, shoeType, skinColor, angle = 0, isCrossed = false) {
    targetCtx.save();
    targetCtx.translate(x + 3.5, y + 2.5);
    if (angle !== 0) targetCtx.rotate(angle);
    targetCtx.translate(-(x + 3.5), -(y + 2.5));

    if (shoeType === 'classic') {
        // Cilalı Kösele Klasik Ayakkabı
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y, 8, 4.5, [2, 3, 1, 1]);
        targetCtx.fill();
        targetCtx.fillStyle = "rgba(255, 255, 255, 0.45)";
        targetCtx.fillRect(x + 2, y + 1, 3, 1);
        targetCtx.fillStyle = "#78350f";
        targetCtx.fillRect(x, y + 3.8, 8, 1);
    } else if (shoeType === 'boots') {
        // Kışlık Deri Bot (Tırtıklı tabanlı)
        targetCtx.fillStyle = "#78350f";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y - 1, 8, 5.5, 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#1c1917";
        targetCtx.fillRect(x, y + 3.5, 8.5, 2);
    } else if (shoeType === 'heels') {
        // Şık Topuklu Stiletto
        targetCtx.fillStyle = "#e11d48";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 4, y + 2, 4, 2.5, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#9f1239";
        targetCtx.fillRect(x, y + 2, 1.5, 4.5);
    } else if (shoeType === 'flats') {
        // Zarif Babet
        targetCtx.fillStyle = "#ec4899";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 3.5, y + 2, 3.8, 2, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(x + 4, y + 1.5, 1.2, 0, Math.PI * 2); targetCtx.fill();
    } else if (shoeType === 'heels_gold') {
        // Altın Simli Abiye Stiletto
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 4, y + 2, 4, 2.5, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#d97706";
        targetCtx.fillRect(x, y + 2, 1.5, 4.5);
        targetCtx.fillStyle = "#ef4444";
        targetCtx.fillRect(x + 1.5, y + 4.5, 4, 0.8);
    } else if (shoeType === 'boots_thigh_high') {
        // Diz Üstü Süet Çizme
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        targetCtx.roundRect(x - 0.5, y - 5, 8.5, 10, [3, 3, 1, 1]);
        targetCtx.fill();
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.fillRect(x + 3.5, y - 5, 1, 9);
    } else if (shoeType === 'sandals_gladiator') {
        // İncili Gladyatör Sandalet
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        targetCtx.fillRect(x, y, 7.5, 4);
        targetCtx.fillStyle = "#d97706";
        targetCtx.fillRect(x, y + 3.5, 7.5, 1);
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(x + 2, y + 1.5, 1, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.arc(x + 5, y + 1.5, 1, 0, Math.PI * 2); targetCtx.fill();
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

// --- 2. BACAKLAR VE AYAKKABILAR (8 AÇILI İZOMETRİK YÜRÜYÜŞ VE OTURMA) ---
function drawAvatarLegsAndShoes(targetCtx, pX, pY, legSwing = 0, skinColor = "#ffd1a4", shoeType = "sneakers", isSkirt = false, isSitting = false, facing = "down") {
    let f = normalize8WayFacing(facing);
    let legColor = isSkirt ? (skinColor || "#ffd1a4") : "#1e293b";
    let shadowColor = "rgba(0, 0, 0, 0.28)";

    if (isSitting) {
        targetCtx.save();

        if (f === 'right') {
            // SAĞA DÖNÜK PROFİL OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 4, pY + 8, 5, 12);
            drawSingleShoe(targetCtx, pX - 5, pY + 19, shoeType, skinColor, 0, false);

            targetCtx.fillStyle = legColor;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 5, pY + 6, 12, 6, [3, 4, 2, 2]);
            targetCtx.fill();
            targetCtx.fillRect(pX + 4, pY + 10, 5, 7);
            drawSingleShoe(targetCtx, pX + 4, pY + 16, shoeType, skinColor, 0.22, true);

        } else if (f === 'left') {
            // SOLA DÖNÜK PROFİL OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 1, pY + 8, 5, 12);
            drawSingleShoe(targetCtx, pX - 2, pY + 19, shoeType, skinColor, 0, false);

            targetCtx.fillStyle = legColor;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 7, pY + 6, 12, 6, [4, 3, 2, 2]);
            targetCtx.fill();
            targetCtx.fillRect(pX - 9, pY + 10, 5, 7);
            drawSingleShoe(targetCtx, pX - 11, pY + 16, shoeType, skinColor, -0.22, true);

        } else if (f === 'up') {
            // TAM ARKAYA DÖNÜK OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 7, pY + 8, 5, 8);
            targetCtx.fillRect(pX + 2, pY + 8, 5, 8);
            targetCtx.fillStyle = "#1e1e1e";
            targetCtx.fillRect(pX - 7, pY + 16, 5, 4);
            targetCtx.fillRect(pX + 2, pY + 16, 5, 4);

        } else if (f === 'down-right') {
            // 3/4 SAĞ İLERİ OTURMA
            targetCtx.fillStyle = shadowColor;
            targetCtx.beginPath(); targetCtx.ellipse(pX + 2, pY + 10, 13, 5, 0.3, 0, Math.PI * 2); targetCtx.fill();

            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 4, pY + 8, 5, 11);
            drawSingleShoe(targetCtx, pX - 4, pY + 18, shoeType, skinColor, 0.15, false);

            targetCtx.beginPath();
            targetCtx.roundRect(pX - 2, pY + 6, 13, 7, [3, 4, 2, 2]);
            targetCtx.fill();
            drawSingleShoe(targetCtx, pX + 5, pY + 15, shoeType, skinColor, 0.35, true);

        } else if (f === 'down-left') {
            // 3/4 SOL İLERİ OTURMA
            targetCtx.fillStyle = shadowColor;
            targetCtx.beginPath(); targetCtx.ellipse(pX - 2, pY + 10, 13, 5, -0.3, 0, Math.PI * 2); targetCtx.fill();

            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 1, pY + 8, 5, 11);
            drawSingleShoe(targetCtx, pX - 2, pY + 18, shoeType, skinColor, -0.15, false);

            targetCtx.beginPath();
            targetCtx.roundRect(pX - 11, pY + 6, 13, 7, [4, 3, 2, 2]);
            targetCtx.fill();
            drawSingleShoe(targetCtx, pX - 12, pY + 15, shoeType, skinColor, -0.35, true);

        } else if (f === 'up-right') {
            // 3/4 SAĞ GERİ OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX - 6, pY + 8, 5, 8);
            targetCtx.fillRect(pX + 1, pY + 7, 6, 9);
            drawSingleShoe(targetCtx, pX + 2, pY + 15, shoeType, skinColor, 0.6, false);

        } else if (f === 'up-left') {
            // 3/4 SOL GERİ OTURMA
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(pX + 1, pY + 8, 5, 8);
            targetCtx.fillRect(pX - 7, pY + 7, 6, 9);
            drawSingleShoe(targetCtx, pX - 8, pY + 15, shoeType, skinColor, -0.6, false);

        } else {
            // TAM ÖNE DÖNÜK OTURMA (facing === 'down') - ÖZGÜN SANALİKA AYAK AYAK ÜSTÜNE ATMA
            targetCtx.fillStyle = shadowColor;
            targetCtx.beginPath();
            targetCtx.ellipse(pX - 1, pY + 9, 12, 4, 0, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = legColor;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 9, pY + 7, 6, 8, [2, 2, 0, 0]);
            targetCtx.fill();
            targetCtx.fillRect(pX - 9, pY + 14, 5, 7);
            drawSingleShoe(targetCtx, pX - 10, pY + 20, shoeType, skinColor, 0, false);

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

            drawSingleShoe(targetCtx, pX + 2, pY + 16, shoeType, skinColor, 0.24, true);

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

    // AYAKTA YÜRÜME / DURMA (8 AÇILI İZOMETRİK BACAK VE AYAKKABI)
    targetCtx.save();
    targetCtx.fillStyle = legColor;

    if (f === 'down') {
        // Tam Öne (Güney)
        targetCtx.fillRect(pX - 8, pY + 12 - legSwing, 5, 8 + legSwing);
        targetCtx.fillRect(pX + 3, pY + 12 + legSwing, 5, 8 - legSwing);
        drawSingleShoe(targetCtx, pX - 9, pY + 18 - legSwing, shoeType, skinColor, 0, false);
        drawSingleShoe(targetCtx, pX + 2, pY + 18 + legSwing, shoeType, skinColor, 0, false);

    } else if (f === 'up') {
        // Tam Arkaya (Kuzey)
        targetCtx.fillRect(pX - 7, pY + 12 + legSwing, 5, 8 - legSwing);
        targetCtx.fillRect(pX + 2, pY + 12 - legSwing, 5, 8 + legSwing);
        drawSingleShoe(targetCtx, pX - 8, pY + 18 + legSwing, shoeType, skinColor, Math.PI, false);
        drawSingleShoe(targetCtx, pX + 1, pY + 18 - legSwing, shoeType, skinColor, Math.PI, false);

    } else if (f === 'right') {
        // Sağa Profil (Doğu)
        let farX = pX - 5 - legSwing * 1.2;
        let nearX = pX - 1 + legSwing * 1.2;
        targetCtx.fillStyle = "rgba(0,0,0,0.2)";
        targetCtx.fillRect(farX, pY + 12, 5, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18, shoeType, skinColor, Math.PI * 0.5, false);

        targetCtx.fillStyle = legColor;
        targetCtx.fillRect(nearX, pY + 12, 5, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18, shoeType, skinColor, Math.PI * 0.5, false);

    } else if (f === 'left') {
        // Sola Profil (Batı)
        let farX = pX + 0 + legSwing * 1.2;
        let nearX = pX - 4 - legSwing * 1.2;
        targetCtx.fillStyle = "rgba(0,0,0,0.2)";
        targetCtx.fillRect(farX, pY + 12, 5, 8);
        drawSingleShoe(targetCtx, farX - 2, pY + 18, shoeType, skinColor, -Math.PI * 0.5, false);

        targetCtx.fillStyle = legColor;
        targetCtx.fillRect(nearX, pY + 12, 5, 8);
        drawSingleShoe(targetCtx, nearX - 2, pY + 18, shoeType, skinColor, -Math.PI * 0.5, false);

    } else if (f === 'down-right') {
        // Sağ İleri (Güneydoğu - 3/4 İzometrik)
        let farX = pX - 8 - legSwing * 0.8;
        let nearX = pX + 1 + legSwing * 0.8;
        targetCtx.fillStyle = "rgba(0,0,0,0.18)";
        targetCtx.fillRect(farX, pY + 12 - legSwing * 0.4, 5, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, Math.PI * 0.25, false);

        targetCtx.fillStyle = legColor;
        targetCtx.fillRect(nearX, pY + 12 + legSwing * 0.4, 5, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, Math.PI * 0.25, false);

    } else if (f === 'down-left') {
        // Sol İleri (Güneybatı - 3/4 İzometrik)
        let farX = pX + 3 + legSwing * 0.8;
        let nearX = pX - 6 - legSwing * 0.8;
        targetCtx.fillStyle = "rgba(0,0,0,0.18)";
        targetCtx.fillRect(farX, pY + 12 - legSwing * 0.4, 5, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.25, false);

        targetCtx.fillStyle = legColor;
        targetCtx.fillRect(nearX, pY + 12 + legSwing * 0.4, 5, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.25, false);

    } else if (f === 'up-right') {
        // Sağ Geri (Kuzeydoğu - 3/4 İzometrik)
        let farX = pX - 7 - legSwing * 0.8;
        let nearX = pX + 1 + legSwing * 0.8;
        targetCtx.fillRect(farX, pY + 12 + legSwing * 0.4, 5, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, Math.PI * 0.75, false);

        targetCtx.fillRect(nearX, pY + 12 - legSwing * 0.4, 5, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, Math.PI * 0.75, false);

    } else if (f === 'up-left') {
        // Sol Geri (Kuzeybatı - 3/4 İzometrik)
        let farX = pX + 2 + legSwing * 0.8;
        let nearX = pX - 6 - legSwing * 0.8;
        targetCtx.fillRect(farX, pY + 12 + legSwing * 0.4, 5, 8);
        drawSingleShoe(targetCtx, farX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.75, false);

        targetCtx.fillRect(nearX, pY + 12 - legSwing * 0.4, 5, 8);
        drawSingleShoe(targetCtx, nearX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.75, false);
    }

    targetCtx.restore();
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'js', 'avatarRenderer_part1.js'), script, 'utf8');
console.log("✓ Part 1 (Shoe & Legs 8-Way) created!");
`;

fs.writeFileSync(path.join(__dirname, 'apply_8way_isometric_avatars.js'), script, 'utf8');
