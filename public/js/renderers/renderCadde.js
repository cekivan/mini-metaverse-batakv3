// public/js/renderers/renderCadde.js - Cadde & Bulvar Çizim Modülü
function renderStaticCaddeTo(bctx, width, height) {
    // 1. Zemin & Gökyüzü / Cadde Arka Planı
    bctx.fillStyle = isNightMode ? "#090d16" : "#1e293b";
    bctx.fillRect(0, 0, width, height);

    // Gece gökyüzü / Yıldızlar (Y < 130)
    if (isNightMode) {
        bctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        for (let i = 0; i < 30; i++) {
            let sx = (i * 137) % width;
            let sy = (i * 73) % 115;
            bctx.beginPath();
            bctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
            bctx.fill();
        }
    }

    // 2. Geniş Asfalt Bulvar Yolu (Ortadan Geçen Cadde)
    let roadY = 135, roadH = 175;
    bctx.fillStyle = isNightMode ? "#1e293b" : "#334155";
    bctx.fillRect(0, roadY, width, roadH);

    // Yol Kenarı Bordür Taşları (Granit Kaldırım Kenarı)
    bctx.fillStyle = isNightMode ? "#475569" : "#64748b";
    bctx.fillRect(0, roadY - 6, width, 6);
    bctx.fillRect(0, roadY + roadH, width, 6);

    // Asfalt Dokusu ve Şerit Çizgileri
    bctx.strokeStyle = "#facc15";
    bctx.lineWidth = 3;
    bctx.setLineDash([24, 18]);
    bctx.beginPath();
    bctx.moveTo(0, roadY + roadH / 2);
    bctx.lineTo(width, roadY + roadH / 2);
    bctx.stroke();
    bctx.setLineDash([]); // Çizgiyi sıfırla

    // Üst Kaldırım Taşları (y: 110..130)
    bctx.fillStyle = isNightMode ? "#1e293b" : "#475569";
    bctx.fillRect(0, 110, width, 25);
    bctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    bctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
        bctx.beginPath(); bctx.moveTo(x, 110); bctx.lineTo(x, 135); bctx.stroke();
    }

    // Sol Yol Çıkışı: Türkiye Karayolları Tipi Çiftli Yol Tabelası (Kaldırım / Yol Üstü Yeşil Alanında - TAMAMEN GÖRÜNÜR)
    // Üstte: ⬅ MEYDAN, Altta: ⬅ SAHİL
    drawStackedTurkishSigns(bctx, 12, 80, [
        { text: "MEYDAN", dir: "left" },
        { text: "SAHİL", dir: "left" }
    ], 134);

    // 3. ÜST BİNALAR VE CEPHESİ (%10 YATAY KÜÇÜLTÜLMÜŞ GANYAN VE DEDENİN YERİ)
    // A) 🏇 GANYAN BAYİİ & HİPODROM CEPHESİ (Sol Üst: x: 90, y: 12, w: 300, h: 105)
    let gX = 90, gY = 12, gW = 300, gH = 105;
    bctx.fillStyle = isNightMode ? "#042f2e" : "#064e3b";
    bctx.beginPath(); bctx.roundRect(gX, gY, gW, gH, 12); bctx.fill();
    bctx.strokeStyle = "#f59e0b"; bctx.lineWidth = 2.5; bctx.stroke();

    // Tente (Koyu Yeşil - Beyaz Çizgili Tente)
    let gStripeW = gW / 12;
    for (let i = 0; i < 12; i++) {
        bctx.fillStyle = i % 2 === 0 ? "#10b981" : "#ffffff";
        bctx.fillRect(gX + i * gStripeW, gY + 30, gStripeW, 16);
    }

    // Işıklı Tabela
    bctx.fillStyle = "#facc15";
    bctx.font = "bold 12.5px sans-serif";
    bctx.textAlign = "center";
    bctx.fillText("🏇 TJK GANYAN BAYİİ & HİPODROM", gX + gW / 2, gY + 22);

    // Sol Vitrin: Canlı Yarış TV Ekranı
    bctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    bctx.fillRect(gX + 14, gY + 52, 85, 48);
    bctx.strokeStyle = "#10b981"; bctx.lineWidth = 1.5; bctx.strokeRect(gX + 14, gY + 52, 85, 48);
    bctx.fillStyle = "#34d399"; bctx.font = "bold 8.5px sans-serif";
    bctx.fillText("🔴 TJK TV CANLI", gX + 56, gY + 70);
    bctx.fillStyle = "#fde047"; bctx.font = "8px sans-serif";
    bctx.fillText("Canlı Hipodrom", gX + 56, gY + 84);

    // Ganyan Giriş Kapısı (x: 215, y: 50, w: 48, h: 54)
    bctx.fillStyle = "#78350f";
    bctx.beginPath(); bctx.roundRect(gX + 125, gY + 50, 48, 54, 6); bctx.fill();
    bctx.strokeStyle = "#facc15"; bctx.lineWidth = 2; bctx.stroke();
    bctx.fillStyle = "#facc15"; bctx.beginPath(); bctx.arc(gX + 162, gY + 77, 3, 0, Math.PI * 2); bctx.fill();
    bctx.fillStyle = "#facc15"; bctx.font = "bold 9px sans-serif";
    bctx.fillText("GİRİŞ", gX + 149, gY + 75);

    // Sağ Bilgi Panosu: Oranlar & Atlar
    bctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    bctx.fillRect(gX + 195, gY + 52, 90, 48);
    bctx.strokeStyle = "#f59e0b"; bctx.lineWidth = 1; bctx.strokeRect(gX + 195, gY + 52, 90, 48);
    bctx.fillStyle = "#fde047"; bctx.font = "bold 8px sans-serif";
    bctx.fillText("💰 6'lı Ganyan", gX + 240, gY + 68);
    bctx.fillStyle = "#ffffff"; bctx.font = "8px sans-serif";
    bctx.fillText("Seyis Binek Harası", gX + 240, gY + 82);

    // B) ⚡ DEDENİN YERİ KUMARHANESİ (Sağ Üst: x: 440, y: 12, w: 300, h: 105)
    let cX = 440, cY = 12, cW = 300, cH = 105;
    bctx.fillStyle = isNightMode ? "#09041a" : "#1e113a";
    bctx.beginPath(); bctx.roundRect(cX, cY, cW, cH, 12); bctx.fill();
    bctx.strokeStyle = "#06b6d4"; bctx.lineWidth = 2.5; bctx.stroke();

    // Altın ve Mor Neon Saçak
    bctx.fillStyle = "rgba(234, 179, 8, 0.25)";
    bctx.fillRect(cX, cY + 28, cW, 16);
    bctx.strokeStyle = "#facc15"; bctx.lineWidth = 1; bctx.strokeRect(cX, cY + 28, cW, 16);

    // GÖRKEMLİ DEDENİN YERİ TABELASI (ŞİMŞEK LOGOLU ⚡)
    bctx.fillStyle = "#fde047";
    bctx.font = "bold 13.5px sans-serif";
    bctx.textAlign = "center";
    bctx.fillText("⚡ DEDENİN YERİ ⚡", cX + cW / 2, cY + 22);

    bctx.fillStyle = "#22d3ee";
    bctx.font = "bold 8px sans-serif";
    bctx.fillText("🎰 VIP CASINO & CANLI BLACKJACK 21", cX + cW / 2, cY + 40);

    // Sol Vitrin: Neon İskambil & Rulet Figürleri
    bctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    bctx.fillRect(cX + 14, cY + 52, 85, 48);
    bctx.strokeStyle = "#e11d48"; bctx.lineWidth = 1.5; bctx.strokeRect(cX + 14, cY + 52, 85, 48);
    bctx.fillStyle = "#ef4444"; bctx.font = "15px sans-serif";
    bctx.fillText("♠️ ♥️ ♣️ ♦️", cX + 56, cY + 74);
    bctx.fillStyle = "#facc15"; bctx.font = "8px sans-serif";
    bctx.fillText("Blackjack 3:2", cX + 56, cY + 90);

    // Casino Giriş Kapısı (Altın Yaldızlı Çift Kanat Kapı)
    bctx.fillStyle = "#450a0a";
    bctx.beginPath(); bctx.roundRect(cX + 125, cY + 50, 50, 54, 6); bctx.fill();
    bctx.strokeStyle = "#facc15"; bctx.lineWidth = 2; bctx.stroke();
    bctx.fillStyle = "#facc15";
    bctx.beginPath(); bctx.arc(cX + 143, cY + 77, 3, 0, Math.PI * 2); bctx.fill();
    bctx.beginPath(); bctx.arc(cX + 157, cY + 77, 3, 0, Math.PI * 2); bctx.fill();
    bctx.font = "bold 9px sans-serif";
    bctx.fillText("GİRİŞ", cX + 150, cY + 92);

    // Sağ Vitrin: Slot Çarkı & Jackpot Grafiği
    bctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    bctx.fillRect(cX + 195, cY + 52, 90, 48);
    bctx.strokeStyle = "#facc15"; bctx.lineWidth = 1.5; bctx.strokeRect(cX + 195, cY + 52, 90, 48);
    bctx.fillStyle = "#facc15"; bctx.font = "14px sans-serif";
    bctx.fillText("7️⃣ 7️⃣ 7️⃣", cX + 240, cY + 73);
    bctx.fillStyle = "#38bdf8"; bctx.font = "8px sans-serif";
    bctx.fillText("VIP Jackpot", cX + 240, cY + 89);

    // 4. ALT PARK PROMENADI VE AÇIK HAVA ALANI (y: 315..500)
    let parkY = 320, parkH = height - parkY;
    bctx.fillStyle = isNightMode ? "#064e3b" : "#15803d";
    bctx.fillRect(0, parkY, width, parkH);

    // Minik Kır Çiçekleri & Çim Detayı (Park alanında)
    for (let i = 0; i < 22; i++) {
        let fx = ((i * 113) % 430) + 15;
        let fy = parkY + ((i * 67) % (parkH - 25)) + 10;
        bctx.fillStyle = i % 2 === 0 ? "#fef08a" : "#fca5a5";
        bctx.beginPath(); bctx.arc(fx, fy, 2, 0, Math.PI * 2); bctx.fill();
    }

    // Sol Parkta Klasik Mermer Süs Havuzu (Fountain)
    let fX = 220, fY = 415;
    bctx.fillStyle = "#334155";
    bctx.beginPath(); bctx.arc(fX, fY, 38, 0, Math.PI * 2); bctx.fill();
    bctx.strokeStyle = "#cbd5e1"; bctx.lineWidth = 3; bctx.stroke();

    bctx.fillStyle = "#0284c7";
    bctx.beginPath(); bctx.arc(fX, fY, 33, 0, Math.PI * 2); bctx.fill();
    bctx.strokeStyle = "#38bdf8"; bctx.lineWidth = 1.5; bctx.stroke();

    bctx.fillStyle = "#cbd5e1";
    bctx.beginPath(); bctx.arc(fX, fY, 12, 0, Math.PI * 2); bctx.fill();
    bctx.fillStyle = "#f8fafc";
    bctx.beginPath(); bctx.arc(fX, fY, 6, 0, Math.PI * 2); bctx.fill();

    // Sol Park Alanında Sevimli Patiler Pet Shop Kulübesi (x: 30, y: 340, w: 140, h: 110)
    drawPetShopBooth(bctx, 30, 340, 140, 110);

    // Park Bankları ve Sokak Lambaları
    drawBench(bctx, 340, 410);
    drawBench(bctx, 380, 225);

    drawLampPost(bctx, 50, 220);
    drawLampPost(bctx, 320, 220);
    drawLampPost(bctx, 420, 360);
}

// Sevimli Patiler Pet Shop Binası Çizimi
function drawPetShopBooth(bctx, psX, psY, psW, psH) {
    bctx.save();

    // 1. Zemin Taban Gölgesi
    bctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    bctx.beginPath();
    bctx.roundRect(psX + 4, psY + psH - 8, psW + 4, 12, 6);
    bctx.fill();

    // 2. Ana Ahşap Kulübe Gövdesi (Sıcak Pastel Sarı / Karamel Ahşap)
    bctx.fillStyle = isNightMode ? "#451a03" : "#fef3c7";
    bctx.beginPath();
    bctx.roundRect(psX, psY + 18, psW, psH - 18, 8);
    bctx.fill();
    bctx.strokeStyle = "#d97706";
    bctx.lineWidth = 2;
    bctx.stroke();

    // Ahşap lambri çizgileri
    bctx.strokeStyle = isNightMode ? "rgba(255,255,255,0.08)" : "rgba(217, 119, 6, 0.2)";
    bctx.lineWidth = 1;
    for (let ly = psY + 28; ly < psY + psH - 6; ly += 9) {
        bctx.beginPath();
        bctx.moveTo(psX + 3, ly);
        bctx.lineTo(psX + psW - 3, ly);
        bctx.stroke();
    }

    // 3. Şık Çizgili Tente (Kavuniçi / Beyaz Çizgiler)
    let stripeCount = 8;
    let stripeW = psW / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
        bctx.fillStyle = (i % 2 === 0) ? "#f97316" : "#ffffff";
        bctx.beginPath();
        bctx.roundRect(psX + i * stripeW, psY + 16, stripeW, 14, [0, 0, 4, 4]);
        bctx.fill();
    }
    bctx.strokeStyle = "#ea580c";
    bctx.lineWidth = 1.2;
    bctx.strokeRect(psX, psY + 16, psW, 14);

    // 4. Işıklı Tabela (PET SHOP 🐾)
    bctx.fillStyle = isNightMode ? "#1e293b" : "#ea580c";
    bctx.beginPath();
    bctx.roundRect(psX + 6, psY, psW - 12, 20, 6);
    bctx.fill();
    bctx.strokeStyle = "#facc15";
    bctx.lineWidth = 1.5;
    bctx.stroke();

    bctx.fillStyle = "#fef08a";
    bctx.font = "bold 11px sans-serif";
    bctx.textAlign = "center";
    bctx.fillText("🐾 PET SHOP 🐾", psX + psW / 2, psY + 14);

    // 5. Vitrin Penceresi (Sol Taraf: x: psX + 8, y: psY + 36, w: 74, h: 54)
    let winX = psX + 8, winY = psY + 36, winW = 74, winH = 54;
    bctx.fillStyle = isNightMode ? "rgba(254, 240, 138, 0.18)" : "#e0f2fe";
    bctx.beginPath();
    bctx.roundRect(winX, winY, winW, winH, 4);
    bctx.fill();
    bctx.strokeStyle = "#b45309";
    bctx.lineWidth = 1.8;
    bctx.stroke();

    // Vitrin İçi Detayları: Sevimli Kedi ve Köpek Silueti
    bctx.font = "18px sans-serif";
    bctx.fillText("🐱", winX + 22, winY + 28);
    bctx.fillText("🐶", winX + 52, winY + 28);

    // Vitrin Altındaki "15 Dk Yoldaş" Etiketi
    bctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    bctx.beginPath();
    bctx.roundRect(winX + 4, winY + winH - 18, winW - 8, 14, 3);
    bctx.fill();
    bctx.fillStyle = "#facc15";
    bctx.font = "bold 8px sans-serif";
    bctx.fillText("15 Dk Yoldaş ⏳", winX + winW / 2, winY + winH - 7);

    // 6. Hizmet Kapısı / Gişesi (Sağ Taraf: x: psX + 88, y: psY + 36, w: 44, h: 64)
    let doorX = psX + 88, doorY = psY + 36, doorW = 44, doorH = 64;
    bctx.fillStyle = "#78350f";
    bctx.beginPath();
    bctx.roundRect(doorX, doorY, doorW, doorH, 4);
    bctx.fill();
    bctx.strokeStyle = "#f59e0b";
    bctx.lineWidth = 1.5;
    bctx.stroke();

    // Kapı Camı
    bctx.fillStyle = isNightMode ? "rgba(254, 240, 138, 0.25)" : "#bae6fd";
    bctx.fillRect(doorX + 5, doorY + 6, doorW - 10, 22);
    bctx.strokeStyle = "#451a03";
    bctx.lineWidth = 1;
    bctx.strokeRect(doorX + 5, doorY + 6, doorW - 10, 22);

    // Kapı Tokmağı
    bctx.fillStyle = "#facc15";
    bctx.beginPath();
    bctx.arc(doorX + doorW - 8, doorY + 38, 2.2, 0, Math.PI * 2);
    bctx.fill();

    // "AÇIK" Rozeti
    bctx.fillStyle = "#10b981";
    bctx.beginPath();
    bctx.roundRect(doorX + 6, doorY + 44, doorW - 12, 12, 3);
    bctx.fill();
    bctx.fillStyle = "#ffffff";
    bctx.font = "bold 7.5px sans-serif";
    bctx.fillText("AÇIK", doorX + doorW / 2, doorY + 53);

    // 7. Kapı Önü Pati Paspası
    bctx.fillStyle = "#334155";
    bctx.fillRect(doorX + 2, psY + psH - 4, doorW - 4, 5);
    bctx.fillStyle = "#fef08a";
    bctx.font = "bold 6px sans-serif";
    bctx.fillText("🐾 GİR", doorX + doorW / 2, psY + psH);

    bctx.restore();
}

function drawCaddeEnvironment() {
    let bg = bgCache.getCanvas('cadde', canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0);

    let now = Date.now();

    // Süs Havuzu Su Çırpıntısı Animasyonu (Sol Park Alanında: x: 220, y: 415)
    let fX = 220, fY = 415;
    let ripRad = 12 + ((now / 50) % 20);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(fX, fY, ripRad, 0, Math.PI * 2);
    ctx.stroke();

    // Fıskiye Su Sıçraması
    ctx.fillStyle = "#ffffff";
    for (let k = 0; k < 6; k++) {
        let ang = (k * Math.PI / 3) + (now / 400);
        let dist = 10 + Math.sin(now / 150 + k) * 6;
        ctx.beginPath();
        ctx.arc(fX + Math.cos(ang) * dist, fY + Math.sin(ang) * dist - 3, 1.8, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dedenin Yeri Şimşek Tabelası Nabız Parıltısı (Pulse)
    let pulse = (Math.sin(now / 200) + 1) / 2;
    ctx.fillStyle = `rgba(250, 204, 21, ${0.12 + pulse * 0.18})`;
    ctx.fillRect(440, 12, 300, 40);

    // Açık Hava Reklam Panosu (Cadde Sağ Alt: x: 470, y: 345, w: 260, h: 125)
    let isBillboardCaddeHover = (canvasMouseX >= 470 && canvasMouseX <= 730 && canvasMouseY >= 345 && canvasMouseY <= 470);
    if (typeof drawOutdoorBillboard === 'function') {
        drawOutdoorBillboard(ctx, 470, 345, 260, 125, isBillboardCaddeHover);
    }

    // Hover Etkileşim Kontrolleri
    let isPetShopHover = (canvasMouseX >= 30 && canvasMouseX <= 170 && canvasMouseY >= 340 && canvasMouseY <= 455);
    let isGanyanHover = (canvasMouseX >= 90 && canvasMouseX <= 390 && canvasMouseY >= 12 && canvasMouseY <= 125);
    let isCasinoHover = (canvasMouseX >= 440 && canvasMouseX <= 740 && canvasMouseY >= 12 && canvasMouseY <= 125);
    let isExitStreetHover = (canvasMouseX <= 66 && canvasMouseY >= 140 && canvasMouseY <= 315);

    if (isBillboardCaddeHover) {
        hoveredTableId = 'billboard_cadde';
        setGameCursor('pointer');
    } else if (isPetShopHover) {
        hoveredTableId = 'cadde_petshop';
        ctx.strokeStyle = "#fb923c";
        ctx.lineWidth = 3;
        ctx.strokeRect(30, 340, 140, 110);
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🐾 Sevimli Patiler Pet Shop (Tıkla)", 100, 332);
        setGameCursor('pointer');
    } else if (isGanyanHover) {
        hoveredTableId = 'cadde_ganyan';
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 3;
        ctx.strokeRect(90, 12, 300, 105);
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🏇 Ganyan Bayii & Hipodrom'a Gir", 240, 132);
        setGameCursor('pointer');
    } else if (isCasinoHover) {
        hoveredTableId = 'cadde_casino';
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 3;
        ctx.strokeRect(440, 12, 300, 105);
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⚡ Dedenin Yeri Casino'ya Gir (Blackjack 21)", 590, 132);
        setGameCursor('pointer');
    } else if (isExitStreetHover) {
        hoveredTableId = 'cadde_to_street';
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(4, 180, 64, 60);
        setGameCursor('pointer');
    } else {
        if (hoveredTableId === 'cadde_ganyan' || hoveredTableId === 'cadde_casino' || hoveredTableId === 'cadde_to_street' || hoveredTableId === 'billboard_cadde' || hoveredTableId === 'cadde_petshop') {
            hoveredTableId = null;
        }
        setGameCursor('default');
    }
}

// ============================================================================
// 13. DEDENİN YERİ CASINO & BLACKJACK 21 SALONU (İÇ MEKAN)
// ============================================================================

if (typeof window !== 'undefined') {
    window.renderStaticCaddeTo = renderStaticCaddeTo;
    window.drawCaddeEnvironment = drawCaddeEnvironment;
}
