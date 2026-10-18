const fs = require('fs');
const path = require('path');

// 1. UPDATE public/js/wardrobe.js
const wardrobePath = path.join(__dirname, '../public/js/wardrobe.js');
let wardrobeContent = fs.readFileSync(wardrobePath, 'utf8');

// Check if hair_curly_brown already exists
if (!wardrobeContent.includes('hair_curly_brown')) {
    wardrobeContent = wardrobeContent.replace(
        "{ id: 'hair_pigtails_ribbon', name: 'Kurdeleli İkili Yan Saç', cost: 280, icon: '🎀', gender: 'female' }",
        "{ id: 'hair_pigtails_ribbon', name: 'Kurdeleli İkili Yan Saç', cost: 280, icon: '🎀', gender: 'female' },\r\n        { id: 'hair_curly_brown', name: 'Kıvırcık Kahverengi Saç', cost: 290, icon: '👩‍🦱', gender: 'female' }"
    );
    if (!wardrobeContent.includes('hair_curly_brown')) {
        // Fallback with \n
        wardrobeContent = wardrobeContent.replace(
            "{ id: 'hair_pigtails_ribbon', name: 'Kurdeleli İkili Yan Saç', cost: 280, icon: '🎀', gender: 'female' }",
            "{ id: 'hair_pigtails_ribbon', name: 'Kurdeleli İkili Yan Saç', cost: 280, icon: '🎀', gender: 'female' },\n        { id: 'hair_curly_brown', name: 'Kıvırcık Kahverengi Saç', cost: 290, icon: '👩‍🦱', gender: 'female' }"
        );
    }
}

// Check if overalls_blue already exists
if (!wardrobeContent.includes('overalls_blue')) {
    wardrobeContent = wardrobeContent.replace(
        "{ id: 'leather', name: 'Deri Ceket', cost: 350, color: '#18181b', icon: '🥼' },",
        "{ id: 'leather', name: 'Deri Ceket', cost: 350, color: '#18181b', icon: '🥼' },\r\n        { id: 'overalls_blue', name: 'Mavi İşçi Tulumu', cost: 280, color: '#2563eb', icon: '🧑‍🔧' },"
    );
    if (!wardrobeContent.includes('overalls_blue')) {
        wardrobeContent = wardrobeContent.replace(
            "{ id: 'leather', name: 'Deri Ceket', cost: 350, color: '#18181b', icon: '🥼' },",
            "{ id: 'leather', name: 'Deri Ceket', cost: 350, color: '#18181b', icon: '🥼' },\n        { id: 'overalls_blue', name: 'Mavi İşçi Tulumu', cost: 280, color: '#2563eb', icon: '🧑‍🔧' },"
        );
    }
}

fs.writeFileSync(wardrobePath, wardrobeContent, 'utf8');
console.log('✅ wardrobe.js updated successfully!');

// 2. UPDATE public/js/avatarRenderer.js
const rendererPath = path.join(__dirname, '../public/js/avatarRenderer.js');
let rendererContent = fs.readFileSync(rendererPath, 'utf8');

// a) Update isFemaleAvatar to include 'hair_curly_brown'
if (!rendererContent.includes("'hair_curly_brown'")) {
    rendererContent = rendererContent.replace(
        "'hair_pigtails_ribbon'].includes(hat)",
        "'hair_pigtails_ribbon', 'hair_curly_brown'].includes(hat)"
    );
}

// b) Update drawAvatarLegsAndShoes definition to accept pantsColor
if (!rendererContent.includes("pantsColor = null")) {
    rendererContent = rendererContent.replace(
        "function drawAvatarLegsAndShoes(targetCtx, pX, pY, legSwing = 0, skinColor = \"#ffd1a4\", shoeType = \"sneakers\", isSkirt = false, isSitting = false, facing = \"down\", isFemale = false) {",
        "function drawAvatarLegsAndShoes(targetCtx, pX, pY, legSwing = 0, skinColor = \"#ffd1a4\", shoeType = \"sneakers\", isSkirt = false, isSitting = false, facing = \"down\", isFemale = false, pantsColor = null) {"
    );
    rendererContent = rendererContent.replace(
        "let legColor = isSkirt ? (skinColor || \"#ffd1a4\") : \"#1e293b\";",
        "let legColor = pantsColor || (isSkirt ? (skinColor || \"#ffd1a4\") : \"#1e293b\");"
    );
}

// c) Update overalls_blue rendering in drawAvatarBodyAndClothes
const overallsDrawCode = `    } else if (shirtColor === 'overalls_blue') {
        // Mavi İşçi Tulumu (Klasik Denim / Kot Kumaş, Göğüs Önlüğü, Metal Tokalı Askılar ve Cepler)
        let denimBlue = "#2563eb";
        let darkDenim = "#1d4ed8";
        let lightDenim = "#3b82f6";
        let innerShirt = "#f8fafc"; // Tulumun altındaki beyaz pamuklu tişört
        let brassColor = "#facc15"; // Metal ayar tokaları ve çıtçıtlar

        // 1. Tulumun altındaki beyaz tişört tabanı (Kollara ve yakaya uzanan ferah içlik)
        drawShapedTorso(innerShirt, "rgba(0,0,0,0.1)");

        // 2. İşçi Tulumu Ön / Arka Gövdesi (Kot önlük)
        targetCtx.fillStyle = denimBlue;
        let bibW = isFemale ? 11 : 13;
        let waistW = isFemale ? 12 : 15;

        targetCtx.beginPath();
        targetCtx.moveTo(pX - bibW / 2, pY - 7);
        targetCtx.lineTo(pX + bibW / 2, pY - 7);
        targetCtx.lineTo(pX + waistW / 2, pY + 2);
        targetCtx.lineTo(pX + (isFemale ? 7 : 8.5), pY + 9);
        targetCtx.lineTo(pX - (isFemale ? 7 : 8.5), pY + 9);
        targetCtx.lineTo(pX - waistW / 2, pY + 2);
        targetCtx.closePath();
        targetCtx.fill();

        // Yan bel derinlik dikişleri / kumaş gölgesi
        targetCtx.fillStyle = darkDenim;
        targetCtx.fillRect(pX - waistW / 2, pY + 2, 2.5, 7);
        targetCtx.fillRect(pX + waistW / 2 - 2.5, pY + 2, 2.5, 7);

        // 3. Omuz Askıları (Metal tokalarla önlüğe bağlanan denim askılar)
        targetCtx.fillStyle = darkDenim;
        let strapL = pX - (isFemale ? 5 : 6);
        let strapR = pX + (isFemale ? 3 : 4);
        targetCtx.fillRect(strapL, pY - 11, 2.4, 5);
        targetCtx.fillRect(strapR, pY - 11, 2.4, 5);

        // Metal ayar tokaları (Brass buckles)
        targetCtx.fillStyle = brassColor;
        targetCtx.fillRect(strapL - 0.5, pY - 7.5, 3.4, 2);
        targetCtx.fillRect(strapR - 0.5, pY - 7.5, 3.4, 2);

        if (!isBack) {
            // 4. Göğüs Cebi (İşçi Tulumunun İkonik Ön Cebi)
            targetCtx.fillStyle = darkDenim;
            let pocketW = isFemale ? 6 : 7.5;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - pocketW / 2, pY - 4.5, pocketW, 5, [1, 1, 2, 2]);
            targetCtx.fill();

            // Cep Dikişi & Sarı Kalem / Tornavida Vurgusu
            targetCtx.strokeStyle = "rgba(250, 204, 21, 0.4)";
            targetCtx.lineWidth = 0.6;
            targetCtx.stroke();
            // Cepte sarı iş kalemi detayı
            targetCtx.fillStyle = "#eab308";
            targetCtx.fillRect(pX + pocketW / 2 - 2, pY - 6.5, 1.2, 3);

            // Bel Metal Perçinleri (Yan düğmeler)
            targetCtx.fillStyle = "#cbd5e1";
            targetCtx.beginPath();
            targetCtx.arc(pX - waistW / 2 + 1.2, pY + 3, 1, 0, Math.PI * 2);
            targetCtx.arc(pX + waistW / 2 - 1.2, pY + 3, 1, 0, Math.PI * 2);
            targetCtx.fill();
        } else {
            // Arkadan görünüm: Çapraz askılar (Cross-Back suspenders)
            targetCtx.strokeStyle = darkDenim;
            targetCtx.lineWidth = 2.4;
            targetCtx.beginPath();
            targetCtx.moveTo(strapL + 1, pY - 11);
            targetCtx.lineTo(pX, pY - 3);
            targetCtx.lineTo(strapR + 1, pY - 11);
            targetCtx.stroke();
            // Arka deri etiket
            targetCtx.fillStyle = "#b45309";
            targetCtx.fillRect(pX - 2.5, pY - 4, 5, 2.5);
        }
`;

if (!rendererContent.includes("shirtColor === 'overalls_blue'")) {
    rendererContent = rendererContent.replace(
        "    } else {\n        // Klasik Tişört",
        overallsDrawCode + "\n    } else {\n        // Klasik Tişört"
    );
}

// d) Update hair_curly_brown rendering in drawAvatarHairAndHats
const curlyHairDrawCode = `    } else if (hatType === 'hair_curly_brown') {
        // Kıvırcık Kahverengi Saç (Zengin Çikolata Tonları, Hacimli Bukleler & Doğal Kıvrımlar)
        let baseBrown = "#451a03"; // Koyu çikolata taban
        let midBrown = "#78350f";  // Sıcak kahve hacim
        let lightBrown = "#92400e"; // Güneş ışığı ışıltısı

        if (isBack) {
            // Arkadan görünüm: Başı saran ve omuzlara dökülen hacimli dalgalı kıvırcık saçlar
            targetCtx.fillStyle = baseBrown;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 12, pY - 24, 24, 28, 8);
            targetCtx.fill();

            // Kıvırcık bukle dokuları (arka)
            targetCtx.fillStyle = midBrown;
            [
                [-8, -18, 4.5], [0, -20, 5], [8, -18, 4.5],
                [-9, -10, 4], [-3, -11, 4.5], [4, -10, 4], [9, -9, 3.8],
                [-7, -2, 4.2], [0, -3, 4.8], [7, -2, 4.2],
                [-5, 3, 3.5], [2, 4, 3.8]
            ].forEach(([cx, cy, r]) => {
                targetCtx.beginPath();
                targetCtx.arc(pX + cx, pY + cy, r, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Parlama vurguları
            targetCtx.fillStyle = lightBrown;
            [-5, 2, 6].forEach(sx => {
                targetCtx.beginPath();
                targetCtx.arc(pX + sx, pY - 14, 2.5, 0, Math.PI * 2);
                targetCtx.fill();
            });
        } else {
            // Önden ve yandan görünüm: Yüzü çevreleyen hacimli kıvırcık bukleler
            targetCtx.fillStyle = baseBrown;
            // Sol ve sağ omuzlara dökülen bukle kuleleri
            [-1, 1].forEach(side => {
                let bx = pX + side * 10;
                targetCtx.fillStyle = baseBrown;
                [
                    [0, -18, 5],
                    [side * 1.5, -12, 5],
                    [side * 0.5, -6, 4.8],
                    [-side * 0.5, 0, 4.5],
                    [side * 0.5, 5, 4],
                    [-side * 0.5, 9, 3.2]
                ].forEach(([ox, oy, r]) => {
                    targetCtx.beginPath();
                    targetCtx.arc(bx + ox, pY + oy, r, 0, Math.PI * 2);
                    targetCtx.fill();
                });

                // Bukle katmanları ve gölgelendirmeleri
                targetCtx.fillStyle = midBrown;
                [
                    [side * 0.5, -15, 3.8],
                    [side * 1.8, -9, 3.8],
                    [0, -3, 3.5],
                    [side * 0.8, 3, 3.2]
                ].forEach(([ox, oy, r]) => {
                    targetCtx.beginPath();
                    targetCtx.arc(bx + ox, pY + oy, r, 0, Math.PI * 2);
                    targetCtx.fill();
                });

                // Işıltı noktacıkları
                targetCtx.fillStyle = lightBrown;
                targetCtx.beginPath();
                targetCtx.arc(bx + side * 0.5, pY - 12, 1.8, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Tepe saç kubbesi (Kıvırcık kabarık tepe)
            targetCtx.fillStyle = midBrown;
            targetCtx.beginPath();
            targetCtx.arc(pX, pY - 20, 11.5, Math.PI * 0.92, Math.PI * 2.08);
            targetCtx.fill();

            // Alındaki tatlı kıvırcık kakül / perçem bukleleri
            targetCtx.fillStyle = baseBrown;
            [-5, -1, 3, 6].forEach(kx => {
                targetCtx.beginPath();
                targetCtx.arc(pX + kx, pY - 20, 3, 0, Math.PI * 2);
                targetCtx.fill();
            });
            targetCtx.fillStyle = lightBrown;
            [-3, 2].forEach(kx => {
                targetCtx.beginPath();
                targetCtx.arc(pX + kx, pY - 22, 1.6, 0, Math.PI * 2);
                targetCtx.fill();
            });
        }
`;

if (!rendererContent.includes("hatType === 'hair_curly_brown'")) {
    rendererContent = rendererContent.replace(
        "    } else if (hatType === 'korsan') {",
        curlyHairDrawCode + "\n    } else if (hatType === 'korsan') {"
    );
}

// e) Update drawAvatarLegsAndShoes call in renderWardrobePreviewCanvas
if (!rendererContent.includes("pantsColor")) {
    rendererContent = rendererContent.replace(
        "drawAvatarLegsAndShoes(pCtx, 0, 0, 0, activeAv.skinColor, activeAv.shoes, isDressOrSkirt, false, facing, isFemale);",
        "let pantsColor = (activeAv.color === 'overalls_blue') ? '#1e40af' : null;\n    drawAvatarLegsAndShoes(pCtx, 0, 0, 0, activeAv.skinColor, activeAv.shoes, isDressOrSkirt, false, facing, isFemale, pantsColor);"
    );
}

// f) Update drawAvatarLegsAndShoes call in drawAnimatedPlayer
rendererContent = rendererContent.replace(
    "drawAvatarLegsAndShoes(ctx, pX, pY, legSwing, p.skinColor, p.shoes, isDressOrSkirt, isSitting, facing, isFemale);",
    "let pantsColor = (p.color === 'overalls_blue') ? '#1e40af' : null;\n    drawAvatarLegsAndShoes(ctx, pX, pY, legSwing, p.skinColor, p.shoes, isDressOrSkirt, isSitting, facing, isFemale, pantsColor);"
);

// g) Update sleeveColor in drawAnimatedPlayer
if (!rendererContent.includes("p.color === 'overalls_blue'")) {
    rendererContent = rendererContent.replace(
        "else if (p.color === 'leather') sleeveColor = \"#18181b\";",
        "else if (p.color === 'leather') sleeveColor = \"#18181b\";\n            else if (p.color === 'overalls_blue') sleeveColor = \"#f8fafc\";"
    );
}

fs.writeFileSync(rendererPath, rendererContent, 'utf8');
console.log('✅ avatarRenderer.js updated successfully!');
