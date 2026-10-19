const fs = require('fs');
const path = require('path');

const worldRendererPath = path.join(__dirname, '../public/js/worldRenderer.js');
let code = fs.readFileSync(worldRendererPath, 'utf8');

// 1. Define drawFurnitureMarketExterior function before renderStaticStreetTo
const marketFunctionDef = `function drawFurnitureMarketExterior(bctx, mktX, mktY, mktW, mktH, isNightMode) {
    bctx.save();

    // 1. ZEMİN TAŞ TABANI & GİRİŞ BASAMAĞI
    bctx.fillStyle = isNightMode ? "#0f172a" : "#1e293b";
    bctx.fillRect(mktX - 4, mktY + mktH - 6, mktW + 8, 8);
    bctx.strokeStyle = isNightMode ? "#334155" : "#475569";
    bctx.lineWidth = 1;
    bctx.strokeRect(mktX - 4, mktY + mktH - 6, mktW + 8, 8);

    // Kapı önü arnavut kaldırımı geçiş deseni
    bctx.fillStyle = isNightMode ? "rgba(51, 65, 85, 0.4)" : "rgba(100, 116, 139, 0.35)";
    for (let cx = mktX + mktW - 74; cx < mktX + mktW - 14; cx += 10) {
        bctx.fillRect(cx, mktY + mktH - 4, 8, 4);
    }

    // 2. ANA BİNA GÖVDESİ (MODERN İSKANDİNAV & AHŞAP DOKU)
    // Ana kütle (Koyu lacivert / grafit slate)
    bctx.fillStyle = isNightMode ? "#091224" : "#111c34";
    bctx.beginPath();
    bctx.roundRect(mktX, mktY, mktW, mktH, [10, 10, 2, 2]);
    bctx.fill();
    bctx.strokeStyle = isNightMode ? "#0284c7" : "#0369a1";
    bctx.lineWidth = 2;
    bctx.stroke();

    // Üst ahşap çıta paneli (Doğal ceviz / tik kaplama)
    bctx.fillStyle = isNightMode ? "#3d1d07" : "#78350f";
    bctx.fillRect(mktX + 6, mktY + 30, mktW - 12, 16);
    bctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    bctx.lineWidth = 1;
    for (let py = mktY + 33; py < mktY + 46; py += 3.5) {
        bctx.beginPath();
        bctx.moveTo(mktX + 6, py);
        bctx.lineTo(mktX + mktW - 6, py);
        bctx.stroke();
    }

    // Çatı parapeti & altın pirinç korniş çıtası
    bctx.fillStyle = isNightMode ? "#0f172a" : "#1e293b";
    bctx.fillRect(mktX - 6, mktY - 4, mktW + 12, 9);
    bctx.strokeStyle = "#ca8a04";
    bctx.lineWidth = 1.5;
    bctx.beginPath();
    bctx.moveTo(mktX - 6, mktY + 5);
    bctx.lineTo(mktX + mktW + 6, mktY + 5);
    bctx.stroke();

    // 3. IŞIKLI BUTİK MAĞAZA TABELASI
    let signX = mktX + 16, signY = mktY + 2, signW = mktW - 32, signH = 25;
    bctx.fillStyle = isNightMode ? "#020617" : "#0b1222";
    bctx.beginPath();
    bctx.roundRect(signX, signY, signW, signH, 5);
    bctx.fill();
    bctx.strokeStyle = "#ca8a04";
    bctx.lineWidth = 1.5;
    bctx.stroke();

    // Tabela iç altın çerçevesi
    bctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
    bctx.lineWidth = 0.8;
    bctx.strokeRect(signX + 3, signY + 3, signW - 6, signH - 6);

    // Tabela Yazıları
    bctx.fillStyle = "#facc15";
    bctx.font = "900 11px sans-serif";
    bctx.textAlign = "center";
    bctx.fillText("🛋️ EV & MOBİLYA MARKETİ", mktX + mktW / 2, signY + 13);

    bctx.fillStyle = "#93c5fd";
    bctx.font = "bold 7px sans-serif";
    bctx.fillText("HASAN'IN ŞARK KÖŞESİ & EV DEKORASYONU", mktX + mktW / 2, signY + 21);

    // Tabela üstü 3 adet pirinç aplik aydınlatması
    [-55, 0, 55].forEach(off => {
        let lx = mktX + mktW / 2 + off;
        bctx.fillStyle = "#eab308";
        bctx.beginPath();
        bctx.arc(lx, signY - 1, 2.2, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = isNightMode ? "rgba(254, 240, 138, 0.18)" : "rgba(254, 240, 138, 0.1)";
        bctx.beginPath();
        bctx.moveTo(lx, signY);
        bctx.lineTo(lx - 8, signY + 16);
        bctx.lineTo(lx + 8, signY + 16);
        bctx.closePath();
        bctx.fill();
    });

    // 4. ŞIK KUMAŞ TENTE (SHOWROOM VİTRİNİNİN ÜSTÜNDE)
    let awnX = mktX + 10, awnY = mktY + 33, awnW = 138, awnH = 17;
    let stripeCount = 9;
    let stW = awnW / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
        bctx.fillStyle = (i % 2 === 0) ? "#15803d" : "#fef3c7";
        bctx.beginPath();
        bctx.moveTo(awnX + i * stW, awnY);
        bctx.lineTo(awnX + (i + 1) * stW, awnY);
        bctx.lineTo(awnX + (i + 1) * stW + 2, awnY + awnH - 4);
        bctx.lineTo(awnX + i * stW + 2, awnY + awnH - 4);
        bctx.closePath();
        bctx.fill();
    }
    // Tente altı dalgalı püskül fırfırları
    bctx.fillStyle = "#166534";
    bctx.fillRect(awnX + 2, awnY + awnH - 4, awnW, 3);
    for (let i = 0; i < stripeCount; i++) {
        bctx.fillStyle = (i % 2 === 0) ? "#15803d" : "#fef3c7";
        bctx.beginPath();
        bctx.arc(awnX + (i + 0.5) * stW + 2, awnY + awnH - 1, stW * 0.45, 0, Math.PI);
        bctx.fill();
    }
    // Tente alt gölgesi
    bctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    bctx.fillRect(awnX + 2, awnY + awnH + 1, awnW, 3);

    // 5. BÜYÜK CAM SHOWROOM VİTRİNİ
    let winX = mktX + 12, winY = mktY + 52, winW = 132, winH = 65;
    bctx.fillStyle = isNightMode ? "#1c1917" : "#292524";
    bctx.fillRect(winX - 1, winY - 1, winW + 2, winH + 2);
    bctx.strokeStyle = "#ca8a04";
    bctx.lineWidth = 1.2;
    bctx.strokeRect(winX - 1, winY - 1, winW + 2, winH + 2);

    // Vitrin içi sıcak ambiyans arka planı (Showroom içi)
    bctx.fillStyle = isNightMode ? "#2a1508" : "#451a03";
    bctx.fillRect(winX, winY, winW, winH);

    // Showroom parke zemini
    bctx.fillStyle = isNightMode ? "#521d0a" : "#7c2d12";
    bctx.fillRect(winX, winY + winH - 22, winW, 22);
    bctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    bctx.lineWidth = 0.8;
    for (let px = winX + 12; px < winX + winW; px += 16) {
        bctx.beginPath();
        bctx.moveTo(px, winY + winH - 22);
        bctx.lineTo(px, winY + winH);
        bctx.stroke();
    }

    // Vitrin İçi Dekorasyon 1: Klasik Taş Şömine (Alevli)
    let fX = winX + 7, fY = winY + 18, fW = 28, fH = 43;
    bctx.fillStyle = "#e2e8f0";
    bctx.fillRect(fX, fY, fW, fH);
    bctx.fillStyle = "#cbd5e1";
    bctx.fillRect(fX - 2, fY, fW + 4, 4);
    bctx.fillStyle = "#0a0a0a";
    bctx.beginPath();
    bctx.roundRect(fX + 4, fY + 12, fW - 8, fH - 12, [6, 6, 0, 0]);
    bctx.fill();
    bctx.fillStyle = "#78350f";
    bctx.fillRect(fX + 6, fY + fH - 5, fW - 12, 3);
    bctx.fillStyle = "#ef4444";
    bctx.beginPath();
    bctx.arc(fX + fW / 2 - 3, fY + fH - 5, 3, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = "#f59e0b";
    bctx.beginPath();
    bctx.arc(fX + fW / 2 + 3, fY + fH - 6, 2.5, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = "#facc15";
    bctx.beginPath();
    bctx.moveTo(fX + fW / 2 - 4, fY + fH - 6);
    bctx.lineTo(fX + fW / 2, fY + fH - 14);
    bctx.lineTo(fX + fW / 2 + 4, fY + fH - 6);
    bctx.closePath();
    bctx.fill();
    bctx.fillStyle = "rgba(245, 158, 11, 0.25)";
    bctx.beginPath();
    bctx.ellipse(fX + fW / 2, fY + fH - 1, 14, 4, 0, 0, Math.PI * 2);
    bctx.fill();

    // Vitrin İçi Dekorasyon 2: Lüks Kadife Şark Sediri
    let sX = winX + 44, sY = winY + 28, sW = 54, sH = 34;
    bctx.fillStyle = "#451a03";
    bctx.fillRect(sX, sY + 18, sW, 14);
    bctx.fillStyle = "#eab308";
    bctx.fillRect(sX + 2, sY + sH - 2, 4, 2);
    bctx.fillRect(sX + sW - 6, sY + sH - 2, 4, 2);

    bctx.fillStyle = "#991b1b";
    bctx.beginPath();
    bctx.roundRect(sX + 1, sY + 13, sW - 2, 10, 3);
    bctx.fill();

    bctx.fillStyle = "#b91c1c";
    bctx.beginPath();
    bctx.roundRect(sX + 3, sY + 3, sW - 6, 12, 3);
    bctx.fill();
    bctx.fillStyle = "#facc15";
    bctx.fillRect(sX + 5, sY + 7, sW - 10, 1.5);

    bctx.fillStyle = "#7f1d1d";
    bctx.beginPath();
    bctx.ellipse(sX + 5, sY + 14, 3.5, 6, 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.beginPath();
    bctx.ellipse(sX + sW - 5, sY + 14, 3.5, 6, 0, 0, Math.PI * 2);
    bctx.fill();

    bctx.fillStyle = "#b45309";
    bctx.fillRect(sX + 18, sY + 18, 18, 12);
    bctx.fillStyle = "#fde047";
    bctx.fillRect(sX + 20, sY + 22, 14, 2);
    bctx.fillStyle = "#38bdf8";
    bctx.fillRect(sX + 22, sY + 25, 10, 1.5);

    // Vitrin İçi Dekorasyon 3: Oymalı Ahşap Sehpa & Çay Bardağı
    let tX = winX + 107, tY = winY + 38;
    bctx.fillStyle = "#78350f";
    bctx.beginPath();
    bctx.ellipse(tX + 9, tY + 12, 11, 4, 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.strokeStyle = "#b45309";
    bctx.lineWidth = 1;
    bctx.stroke();
    bctx.fillStyle = "#451a03";
    bctx.fillRect(tX + 3, tY + 14, 2.5, 12);
    bctx.fillRect(tX + 13, tY + 14, 2.5, 12);
    bctx.fillStyle = "#f59e0b";
    bctx.fillRect(tX + 7, tY + 11, 5, 1);
    bctx.fillStyle = "#b91c1c";
    bctx.fillRect(tX + 8, tY + 8, 3, 3);
    bctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    bctx.fillRect(tX + 7.5, tY + 6.5, 4, 1.5);

    // Duvara asılı mini tablo
    bctx.fillStyle = "#ca8a04";
    bctx.fillRect(winX + 54, winY + 5, 18, 12);
    bctx.fillStyle = "#0284c7";
    bctx.fillRect(winX + 56, winY + 7, 14, 8);
    bctx.fillStyle = "#facc15";
    bctx.beginPath();
    bctx.arc(winX + 66, winY + 9, 2, 0, Math.PI * 2);
    bctx.fill();

    // Vitrin Camı Yansımaları
    bctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    bctx.lineWidth = 12;
    bctx.beginPath();
    bctx.moveTo(winX + 18, winY + winH);
    bctx.lineTo(winX + 54, winY);
    bctx.stroke();

    bctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    bctx.lineWidth = 6;
    bctx.beginPath();
    bctx.moveTo(winX + 68, winY + winH);
    bctx.lineTo(winX + 90, winY);
    bctx.stroke();

    // Vitrin "SHOWROOM" Rozeti
    bctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    bctx.beginPath();
    bctx.roundRect(winX + 4, winY + 4, 46, 12, 3);
    bctx.fill();
    bctx.strokeStyle = "rgba(250, 204, 21, 0.5)";
    bctx.lineWidth = 0.8;
    bctx.stroke();
    bctx.fillStyle = "#fef08a";
    bctx.font = "bold 7px sans-serif";
    bctx.textAlign = "center";
    bctx.fillText("✨ SHOWROOM", winX + 27, winY + 12.5);

    // 6. LÜKS GİRİŞ KAPISI (KEMERLİ CAM TAVAN & ÇİFT KANAT MAUN KAPI)
    let doorX = mktX + mktW - 74, doorY = mktY + 44, doorW = 58, doorH = 74;

    // Üst Kemerli Cam Pencere (Fanlight / Transom Window)
    bctx.fillStyle = isNightMode ? "rgba(254, 240, 138, 0.35)" : "rgba(253, 224, 71, 0.55)";
    bctx.beginPath();
    bctx.arc(doorX + doorW / 2, doorY + 16, 16, Math.PI, 0);
    bctx.fill();
    bctx.strokeStyle = "#ca8a04";
    bctx.lineWidth = 1.5;
    bctx.stroke();
    for (let a = Math.PI + 0.5; a < Math.PI * 2 - 0.4; a += 0.7) {
        bctx.beginPath();
        bctx.moveTo(doorX + doorW / 2, doorY + 16);
        bctx.lineTo(doorX + doorW / 2 + Math.cos(a) * 16, doorY + 16 + Math.sin(a) * 16);
        bctx.stroke();
    }

    // Kapı Dış Ahşap Kasası
    bctx.fillStyle = isNightMode ? "#1c1917" : "#2d1606";
    bctx.fillRect(doorX, doorY + 16, doorW, doorH - 16);
    bctx.strokeStyle = "#ca8a04";
    bctx.lineWidth = 1.8;
    bctx.strokeRect(doorX, doorY + 16, doorW, doorH - 16);

    // Çift Kanat Kapılar
    let leafW = (doorW - 4) / 2;
    [doorX + 1.5, doorX + leafW + 2.5].forEach((lx, idx) => {
        bctx.fillStyle = isNightMode ? "#2a1508" : "#451a03";
        bctx.fillRect(lx, doorY + 17, leafW, doorH - 18);
        bctx.strokeStyle = "#78350f";
        bctx.lineWidth = 1;
        bctx.strokeRect(lx, doorY + 17, leafW, doorH - 18);

        bctx.fillStyle = isNightMode ? "rgba(56, 189, 248, 0.25)" : "rgba(186, 230, 253, 0.45)";
        bctx.fillRect(lx + 3, doorY + 22, leafW - 6, 26);
        bctx.strokeStyle = "#0284c7";
        bctx.lineWidth = 0.8;
        bctx.strokeRect(lx + 3, doorY + 22, leafW - 6, 26);

        bctx.fillStyle = isNightMode ? "#1a0c04" : "#301202";
        bctx.fillRect(lx + 3, doorY + 52, leafW - 6, 16);
        bctx.strokeStyle = "#92400e";
        bctx.strokeRect(lx + 3, doorY + 52, leafW - 6, 16);

        bctx.fillStyle = "#facc15";
        let handleX = (idx === 0) ? (lx + leafW - 3) : (lx + 2);
        bctx.fillRect(handleX, doorY + 34, 1.8, 14);
        bctx.fillStyle = "#ffffff";
        bctx.fillRect(handleX, doorY + 38, 1.8, 4);
    });

    // Kapı Camı Üzerinde "AÇIK" Neon Rozeti
    bctx.fillStyle = "rgba(16, 185, 129, 0.25)";
    bctx.beginPath();
    bctx.roundRect(doorX + doorW / 2 - 14, doorY + 24, 28, 9, 3);
    bctx.fill();
    bctx.strokeStyle = "#10b981";
    bctx.lineWidth = 0.8;
    bctx.stroke();
    bctx.fillStyle = "#34d399";
    bctx.font = "900 6.5px sans-serif";
    bctx.textAlign = "center";
    bctx.fillText("● AÇIK", doorX + doorW / 2, doorY + 31);

    // Kapı "GİRİŞ" Yazısı
    bctx.fillStyle = "#facc15";
    bctx.font = "900 8.5px sans-serif";
    bctx.fillText("GİRİŞ ➔", doorX + doorW / 2, doorY + 63);

    // Kapı Önü Paspası: "HOŞGELDİNİZ"
    let matX = doorX + 2, matY = doorY + doorH - 4, matW = doorW - 4, matH = 7;
    bctx.fillStyle = isNightMode ? "#1e293b" : "#334155";
    bctx.beginPath();
    bctx.roundRect(matX, matY, matW, matH, 2);
    bctx.fill();
    bctx.strokeStyle = "#ca8a04";
    bctx.lineWidth = 0.8;
    bctx.stroke();
    bctx.fillStyle = "#fef08a";
    bctx.font = "bold 5.5px sans-serif";
    bctx.fillText("HOŞGELDİNİZ", matX + matW / 2, matY + 5.2);

    // 7. DIŞ MEKAN BİTKİSİ (SERAMİK SAKSI & AKDENİZ BİTKİSİ)
    let potX = doorX - 11, potY = doorY + doorH - 12;
    bctx.fillStyle = "#c2410c";
    bctx.beginPath();
    bctx.moveTo(potX, potY + 2);
    bctx.lineTo(potX + 8, potY + 2);
    bctx.lineTo(potX + 7, potY + 11);
    bctx.lineTo(potX + 1, potY + 11);
    bctx.closePath();
    bctx.fill();
    bctx.fillStyle = "#ea580c";
    bctx.fillRect(potX - 1, potY, 10, 2.5);

    bctx.fillStyle = isNightMode ? "#065f46" : "#15803d";
    bctx.beginPath();
    bctx.arc(potX + 4, potY - 5, 6.5, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = isNightMode ? "#047857" : "#22c55e";
    bctx.beginPath();
    bctx.arc(potX + 2.5, potY - 7, 4.5, 0, Math.PI * 2);
    bctx.fill();
    bctx.fillStyle = "#ef4444";
    bctx.beginPath(); bctx.arc(potX + 5, potY - 8, 1, 0, Math.PI * 2); bctx.fill();
    bctx.beginPath(); bctx.arc(potX + 2, potY - 4, 1, 0, Math.PI * 2); bctx.fill();

    // 8. KAPI YANI PİRİNÇ FENER APLİĞİ
    let lanX = doorX + doorW + 4, lanY = doorY + 36;
    bctx.strokeStyle = "#ca8a04";
    bctx.lineWidth = 1.2;
    bctx.beginPath();
    bctx.moveTo(doorX + doorW, lanY);
    bctx.lineTo(lanX, lanY);
    bctx.lineTo(lanX, lanY + 5);
    bctx.stroke();
    bctx.fillStyle = isNightMode ? "#facc15" : "#fde047";
    bctx.fillRect(lanX - 2.5, lanY + 4, 5, 7);
    bctx.fillStyle = "#78350f";
    bctx.fillRect(lanX - 3, lanY + 3, 6, 1.5);
    bctx.fillRect(lanX - 2, lanY + 11, 4, 1.5);
    if (isNightMode) {
        bctx.fillStyle = "rgba(254, 240, 138, 0.25)";
        bctx.beginPath();
        bctx.arc(lanX, lanY + 8, 14, 0, Math.PI * 2);
        bctx.fill();
    }

    bctx.restore();
}\n\n`;

// Insert drawFurnitureMarketExterior before renderStaticStreetTo
if (!code.includes('function drawFurnitureMarketExterior')) {
    code = code.replace('function renderStaticStreetTo(bctx, width, height) {', marketFunctionDef + 'function renderStaticStreetTo(bctx, width, height) {');
    console.log("1. drawFurnitureMarketExterior function added!");
}

// 2. Replace lines 859-878 inside renderStaticStreetTo
const oldMarketBlockRegex = /\/\/ E\) 🛒 MOBİLYA & EV MARKETİ[\s\S]*?bctx\.fillText\("GİRİŞ", mktX \+ mktW - 42, mktY \+ 88\);/;

const newMarketBlock = `// E) 🛒 MOBİLYA & EV MARKETİ (LÜKS VİTRİNLİ, KUMAŞ TENTELİ & ŞIK BUTİK CEPHE)
    let mktX = 550, mktY = 345, mktW = 230, mktH = 125;
    drawFurnitureMarketExterior(bctx, mktX, mktY, mktW, mktH, isNightMode);`;

if (oldMarketBlockRegex.test(code)) {
    code = code.replace(oldMarketBlockRegex, newMarketBlock);
    console.log("2. renderStaticStreetTo market block replaced with drawFurnitureMarketExterior!");
} else {
    console.error("2. oldMarketBlockRegex did not match!");
}

// 3. Add interactive hover tooltip in drawStreetEnvironment
const oldHoverBlock = `    } else if (isMarketHover) {
        hoveredTableId = 'street_market';
        canvas.style.cursor = 'pointer';`;

const newHoverBlock = `    } else if (isMarketHover) {
        hoveredTableId = 'street_market';
        canvas.style.cursor = 'pointer';
        // Mobilya Marketi Üzerine Gelindiğinde Şık İpucu Rozeti
        let hoverBounce = Math.sin(Date.now() / 180) * 3;
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(575, 312 + hoverBounce, 180, 26, 8);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🛒 Mobilya Marketi'ne Gir (Tıkla)", 665, 329 + hoverBounce);
        ctx.restore();`;

if (code.includes(oldHoverBlock) && !code.includes("Mobilya Marketi (Tıkla)")) {
    code = code.replace(oldHoverBlock, newHoverBlock);
    console.log("3. drawStreetEnvironment market hover tooltip added!");
}

fs.writeFileSync(worldRendererPath, code, 'utf8');
console.log("4. public/js/worldRenderer.js saved successfully!");
