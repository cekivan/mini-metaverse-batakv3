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

    // Park Bankları ve Sokak Lambaları
    drawBench(bctx, 100, 410);
    drawBench(bctx, 340, 410);
    drawBench(bctx, 380, 225);

    drawLampPost(bctx, 50, 220);
    drawLampPost(bctx, 320, 220);
    drawLampPost(bctx, 420, 360);
    drawTree(bctx, 50, 400);
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
    let isGanyanHover = (canvasMouseX >= 90 && canvasMouseX <= 390 && canvasMouseY >= 12 && canvasMouseY <= 125);
    let isCasinoHover = (canvasMouseX >= 440 && canvasMouseX <= 740 && canvasMouseY >= 12 && canvasMouseY <= 125);
    let isExitStreetHover = (canvasMouseX <= 66 && canvasMouseY >= 140 && canvasMouseY <= 315);

    if (isBillboardCaddeHover) {
        hoveredTableId = 'billboard_cadde';
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
        if (hoveredTableId === 'cadde_ganyan' || hoveredTableId === 'cadde_casino' || hoveredTableId === 'cadde_to_street' || hoveredTableId === 'billboard_cadde') {
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
