// public/js/roomInteractions.js - Mekan Geçişleri, İnteraktif Objeler ve Kapı/Geçit Kayıt Yöneticisi
// (Spagetti if-else bloklarını ortadan kaldıran, bildirimsel ve yüksek performanslı etkileşim motoru)

(function () {
    const socket = window.socket || (typeof io !== 'undefined' ? io() : null);

    /**
     * 1. YÜRÜYEREK KORİDOR VE KAPI GEÇİŞLERİ (SEAMLESS WALK PORTALS)
     * Her mekanın kenar sınırları veya kapı koridorları burada tek bir yapıda toplanmıştır.
     */
    const ROOM_WALK_PORTALS = {
        kafe: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'sokak'
            }
        ],
        sokak: [
            {
                check: (p, w, h) => p.x <= 20 && p.y >= 180 && p.y <= 330,
                target: 'sahil'
            },
            {
                check: (p, w, h) => p.x >= w - 20 && p.y >= 180 && p.y <= 330,
                target: 'cadde'
            },
            {
                check: (p, w, h) => p.x >= 165 && p.x <= 225 && p.y <= 95,
                target: 'emlakci'
            },
            {
                check: (p, w, h) => p.x >= 370 && p.x <= 430 && p.y <= 95,
                target: 'kafe'
            },
            {
                check: (p, w, h) => p.x >= 640 && p.x <= 700 && p.y <= 95,
                target: 'nargile_cafe'
            },
            {
                check: (p, w, h) => p.x >= 685 && p.x <= 750 && p.y >= 345 && p.y <= 405,
                target: 'market'
            }
        ],
        cadde: [
            {
                check: (p, w, h) => p.x <= 20 && p.y >= 140 && p.y <= 330,
                target: 'sokak'
            },
            {
                check: (p, w, h) => p.x >= 200 && p.x <= 260 && p.y <= 95,
                target: 'ganyan'
            },
            {
                check: (p, w, h) => p.x >= 550 && p.x <= 610 && p.y <= 95,
                target: 'dedenin_yeri'
            }
        ],
        emlakci: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'sokak'
            }
        ],
        sahil: [
            {
                check: (p, w, h) => p.x >= w - 20 && p.y >= 180 && p.y <= 360,
                target: 'sokak'
            }
        ],
        nargile_cafe: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'sokak'
            }
        ],
        ganyan: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'cadde'
            }
        ],
        dedenin_yeri: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'cadde'
            }
        ],
        market: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'sokak'
            }
        ]
    };

    /**
     * Oyuncu bir mekan geçiş koridoruna bastı mı kontrol eder.
     * @returns {string|null} Hedef mekan adı veya null
     */
    function checkRoomWalkPortals(p, currentRoom, canvasWidth, canvasHeight) {
        if (!p || !currentRoom) return null;

        // Ev çıkış kapısı
        if (currentRoom.startsWith("house_")) {
            if (p.x <= 55 && p.y >= canvasHeight - 70) {
                if (window.isHouseEditMode) {
                    p.x = 65;
                    p.y = canvasHeight - 75;
                    if (!window._lastHouseEditWarnTime || Date.now() - window._lastHouseEditWarnTime > 2500) {
                        window._lastHouseEditWarnTime = Date.now();
                        if (typeof window.warnHouseEditActive === 'function') window.warnHouseEditActive();
                    }
                    return null;
                }
                if (currentRoom.startsWith("house_ornek_")) {
                    if (typeof exitHouseTour === 'function') exitHouseTour();
                    else if (typeof changeRoom === 'function') changeRoom('emlakci');
                } else {
                    if (typeof changeRoom === 'function') changeRoom('sokak');
                }
                return null;
            }
            return null;
        }

        const portals = ROOM_WALK_PORTALS[currentRoom];
        if (!portals) return null;

        for (let i = 0; i < portals.length; i++) {
            if (portals[i].check(p, canvasWidth, canvasHeight)) {
                return portals[i].target;
            }
        }
        return null;
    }

    /**
     * 2. MEKAN TIKLAMA / DOKUNMA ETKİLEŞİMİ (CLICK & TAP HANDLER)
     * Canvas üzerindeki tıklamaları ilgili mekanın nesnelerine yönlendirir.
     * @returns {boolean} Tıklama bir nesneye isabet ettiyse true
     */
    function handleRoomInteractionClick(clickX, clickY, currentRoom, p, canvasWidth, canvasHeight) {
        if (!currentRoom) return false;

        // --- KAFE ---
        if (currentRoom === "kafe") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            // Çay ocağı tezgahı
            if (clickX >= 20 && clickX <= 250 && clickY >= 15 && clickY <= 65) {
                if (typeof triggerPlayerAction === 'function') triggerPlayerAction('tea');
                return true;
            }
            // Masalar
            let tables = (typeof cafeTables !== 'undefined') ? cafeTables : [];
            for (let i = 0; i < tables.length; i++) {
                let obj = tables[i];
                if (clickX >= obj.x && clickX <= obj.x + obj.w && clickY >= obj.y && clickY <= obj.y + obj.h) {
                    if (obj.id === 'blackjack') {
                        if (typeof openBlackjackModal === 'function') openBlackjackModal();
                    } else if (socket) {
                        socket.emit('requestTableOptions', obj.id);
                    } else if (obj.id === 'xox') {
                        if (typeof openXoxModal === 'function') openXoxModal();
                    } else if (obj.id === 'amiral') {
                        if (typeof openAmiralBattiModal === 'function') openAmiralBattiModal();
                    }
                    return true;
                }
            }
            return false;
        }

        // --- GANYAN BAYİİ & HİPODROM ---
        if (currentRoom === "ganyan") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'cadde');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde');
                }
                return true;
            }
            // TJK Gişesi Kupon Masası
            if (clickX >= 20 && clickX <= 265 && clickY >= 248 && clickY <= 435) {
                if (typeof openGanyanKuponModal === 'function') openGanyanKuponModal();
                return true;
            }
            // At Kiralama / Harası
            if (clickX >= 525 && clickX <= 780 && clickY >= 245 && clickY <= 445) {
                if (typeof openHorseRentalModal === 'function') openHorseRentalModal();
                return true;
            }
            return false;
        }

        // --- SAHİL & PLAJ ---
        if (currentRoom === "sahil") {
            // Çıkış (Sokak Yolu ve Tabela)
            if (clickX >= canvasWidth - 80 && clickY >= 180 && clickY <= 360) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth - 16, 260, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            // Kuğu Deniz Bisikleti
            if (clickX >= 90 && clickX <= 175 && clickY >= 145 && clickY <= 235) {
                if (typeof handleRentSwanBoat === 'function') handleRentSwanBoat();
                return true;
            }
            // Tropik Sahil Barı
            if (clickX >= 645 && clickX <= 785 && clickY >= 385 && clickY <= 475) {
                if (typeof openCocktailBarModal === 'function') openCocktailBarModal();
                return true;
            }
            // Su ve İskele Alanı -> Balık Tutma
            if (clickX < 560 || clickY < 320) {
                if (typeof triggerFishing === 'function') triggerFishing();
                return true;
            }
            return false;
        }

        // --- SOKAK / ŞEHİR MEYDANI ---
        if (currentRoom === "sokak") {
            // Sahile geçiş yolu ve tabelası (Sol)
            if (clickX <= 80 && clickY >= 180 && clickY <= 330) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(16, 255, 'sahil');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sahil');
                }
                return true;
            }
            // Caddeye geçiş yolu ve tabelası (Sağ)
            if (clickX >= canvasWidth - 80 && clickY >= 180 && clickY <= 330) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth - 16, 255, 'cadde');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde');
                }
                return true;
            }
            // Emlakçı Binası (Sol Üst)
            if (clickX >= 20 && clickX <= 235 && clickY >= 10 && clickY <= 115) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(192, 90, 'emlakci');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('emlakci');
                }
                return true;
            }
            // Kafe Binası (Orta Üst)
            if (clickX >= 260 && clickX <= 540 && clickY >= 10 && clickY <= 115) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(400, 90, 'kafe');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kafe');
                }
                return true;
            }
            // Nargile Kafe Binası (Sağ Üst)
            if (clickX >= 560 && clickX <= 780 && clickY >= 10 && clickY <= 115) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(670, 90, 'nargile_cafe');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('nargile_cafe');
                }
                return true;
            }
            // Konutlar & Apartman Sitesi Girişi
            if (clickX >= 15 && clickX <= 250 && clickY >= 340 && clickY <= 475) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(205, 385, null, () => {
                        if (typeof openHousingPortalModal === 'function') openHousingPortalModal();
                    });
                } else {
                    if (typeof openHousingPortalModal === 'function') openHousingPortalModal();
                }
                return true;
            }
            // Açık Hava Reklam Panosu
            if (clickX >= 270 && clickX <= 530 && clickY >= 335 && clickY <= 470) {
                if (typeof openBillboardAdModal === 'function') openBillboardAdModal();
                return true;
            }
            // Mobilya Marketi Binası (Sağ Alt)
            if (clickX >= 550 && clickX <= 780 && clickY >= 335 && clickY <= 470) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(715, 355, 'market');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('market');
                }
                return true;
            }
            return false;
        }

        // --- YENİ CADDE ---
        if (currentRoom === "cadde") {
            // Sokağa / Meydana dönüş yolu (Sol)
            if (clickX <= 80 && clickY >= 140 && clickY <= 330) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(16, 235, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            // Ganyan Bayii & Hipodrom (Sol Üst)
            if (clickX >= 90 && clickX <= 390 && clickY >= 12 && clickY <= 125) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(235, 90, 'ganyan');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('ganyan');
                }
                return true;
            }
            // Dedenin Yeri Casino (Sağ Üst)
            if (clickX >= 440 && clickX <= 740 && clickY >= 12 && clickY <= 125) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(585, 90, 'dedenin_yeri');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('dedenin_yeri');
                }
                return true;
            }
            // Cadde Reklam Panosu
            if (clickX >= 465 && clickX <= 735 && clickY >= 335 && clickY <= 470) {
                if (typeof openBillboardAdModal === 'function') openBillboardAdModal();
                return true;
            }
            return false;
        }

        // --- 1. CADDE (SANALİKA İZOMETRİK HARİTA) ---
        if (currentRoom === "sanalika_cadde") {
            if (typeof handleSanalikaCaddeClick === 'function') {
                let handled = handleSanalikaCaddeClick(clickX, clickY);
                if (handled) return true;
            }
            return false;
        }

        // --- PRESTİJ GAYRİMENKUL & EMLAK OFİSİ ---
        if (currentRoom === "emlakci") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            if (clickX >= 310 && clickX <= 490 && clickY >= 65 && clickY <= 145) {
                if (typeof openRealEstateModal === 'function') openRealEstateModal();
                return true;
            }
            if (clickX >= 85 && clickX <= 255 && clickY >= 210 && clickY <= 360) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('standart');
                return true;
            }
            if (clickX >= 315 && clickX <= 485 && clickY >= 210 && clickY <= 360) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('garden');
                return true;
            }
            if (clickX >= 545 && clickX <= 715 && clickY >= 210 && clickY <= 360) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('pool');
                return true;
            }
            return false;
        }

        // --- DEDENİN YERİ CASINO ---
        if (currentRoom === "dedenin_yeri") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'cadde');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde');
                }
                return true;
            }
            if (clickX >= 25 && clickX <= 185 && clickY >= 115 && clickY <= 195) {
                if (typeof openSlotModal === 'function') openSlotModal();
                return true;
            }
            if (clickX >= 625 && clickX <= 775 && clickY >= 125 && clickY <= 235) {
                if (typeof openRouletteModal === 'function') openRouletteModal();
                return true;
            }
            if (clickX >= 310 && clickX <= 490 && clickY >= 155 && clickY <= 290) {
                if (typeof openBlackjackModal === 'function') openBlackjackModal();
                return true;
            }
            return false;
        }

        // --- NARGİLE KAFE ---
        if (currentRoom === "nargile_cafe") {
            // Mutfak kapısı
            if (clickX >= canvasWidth - 115 && clickX <= canvasWidth - 10 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof window.showKitchenStaffOnlyNotice === 'function') window.showKitchenStaffOnlyNotice();
                return true;
            }
            // Localar
            if (clickX >= 25 && clickX <= 215 && clickY >= 50 && clickY <= 175) {
                if (typeof window.checkAndOpenNargileMenu === 'function') window.checkAndOpenNargileMenu('lounge_sol');
                return true;
            }
            if (clickX >= 585 && clickX <= 775 && clickY >= 50 && clickY <= 175) {
                if (typeof window.checkAndOpenNargileMenu === 'function') window.checkAndOpenNargileMenu('lounge_sag');
                return true;
            }
            // 101 Masaları
            if (clickX >= 145 && clickX <= 365 && clickY >= 155 && clickY <= 355) {
                if (socket) socket.emit('requestTableOptions', 'okey101_tekli');
                return true;
            }
            if (clickX >= 435 && clickX <= 655 && clickY >= 155 && clickY <= 355) {
                if (socket) socket.emit('requestTableOptions', 'okey101');
                return true;
            }
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            return false;
        }

        // --- MOBİLYA MARKETİ ---
        if (currentRoom === "market") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 40 && clickX <= canvasWidth / 2 + 40 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 10) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            if (typeof openFurnitureMarketModal === 'function') {
                openFurnitureMarketModal();
                return true;
            }
            return false;
        }

        // --- OYUNCU EVLERİ (HOUSING) ---
        if (currentRoom.startsWith("house_")) {
            if (typeof getCurrentViewingHouse === 'function') {
                let house = getCurrentViewingHouse();
                if (house && house.furniture) {
                    // Limonata standı
                    let stand = house.furniture.find(f => f.id === 'meyve_arabasi');
                    if (stand && !window.isHouseEditMode) {
                        let cat = (typeof FURNITURE_CATALOG !== 'undefined') ? FURNITURE_CATALOG['meyve_arabasi'] : { w: 78, h: 68 };
                        let hw = (cat.w || 78) / 2 + 12;
                        let hh = (cat.h || 68) / 2 + 12;
                        if (clickX >= stand.x - hw && clickX <= stand.x + hw && clickY >= stand.y - hh && clickY <= stand.y + hh) {
                            if (typeof openLemonadeStandModal === 'function') {
                                openLemonadeStandModal(house);
                                return true;
                            }
                        }
                    }
                    // Vegas Slot Makinesi
                    let slotObj = house.furniture.find(f => f.id === 'slot_machine');
                    if (slotObj && !window.isHouseEditMode) {
                        let cat = (typeof FURNITURE_CATALOG !== 'undefined') ? FURNITURE_CATALOG['slot_machine'] : { w: 58, h: 74 };
                        let hw = (cat.w || 58) / 2 + 12;
                        let hh = (cat.h || 74) / 2 + 12;
                        if (clickX >= slotObj.x - hw && clickX <= slotObj.x + hw && clickY >= slotObj.y - hh && clickY <= slotObj.y + hh) {
                            if (typeof openSlotModal === 'function') {
                                window.currentSlotHouseOwner = house.owner;
                                openSlotModal();
                                return true;
                            }
                        }
                    }
                    // VIP Rulet Masası
                    let rouletteObj = house.furniture.find(f => f.id === 'roulette_table');
                    if (rouletteObj && !window.isHouseEditMode) {
                        let cat = (typeof FURNITURE_CATALOG !== 'undefined') ? FURNITURE_CATALOG['roulette_table'] : { w: 88, h: 64 };
                        let hw = (cat.w || 88) / 2 + 12;
                        let hh = (cat.h || 64) / 2 + 12;
                        if (clickX >= rouletteObj.x - hw && clickX <= rouletteObj.x + hw && clickY >= rouletteObj.y - hh && clickY <= rouletteObj.y + hh) {
                            if (typeof openRouletteModal === 'function') {
                                openRouletteModal();
                                return true;
                            }
                        }
                    }
                }
            }
            // Ev çıkış kapısı
            if (clickX >= 15 && clickX <= 75 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 10) {
                if (window.isHouseEditMode) {
                    if (typeof warnHouseEditActive === 'function') warnHouseEditActive();
                    return true;
                }
                let targetExit = currentRoom.startsWith("house_ornek_") ? 'emlakci' : 'sokak';
                let exitAction = () => {
                    if (currentRoom.startsWith("house_ornek_")) {
                        if (typeof exitHouseTour === 'function') exitHouseTour();
                        else if (typeof changeRoom === 'function') changeRoom('emlakci');
                    } else {
                        if (typeof changeRoom === 'function') changeRoom('sokak');
                    }
                };
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(45, canvasHeight - 40, targetExit, exitAction);
                } else {
                    exitAction();
                }
                return true;
            }
            return false;
        }

        return false;
    }

    /**
     * 3. YAKINLIK TABANLI "E" TUŞU VE MOBİL ETKİLEŞİM İŞLEYİCİSİ (PROXIMITY INTERACT)
     * Oyuncu bir objeye yakınken 'E' tuşuna bastığında ilgili aksiyonu çalıştırır.
     * @returns {boolean} Etkileşim tetiklendiyse true
     */
    function handleRoomMobileInteract(p, currentRoom, canvasWidth, canvasHeight) {
        if (!p || !currentRoom) return false;

        if (currentRoom === "kafe") {
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            if (p.x >= 20 && p.x <= 260 && p.y <= 120) {
                if (typeof triggerPlayerAction === 'function') triggerPlayerAction('tea');
                return true;
            }
            let tables = (typeof cafeTables !== 'undefined') ? cafeTables : [];
            let nearest = null;
            let minDist = 120;
            tables.forEach(t => {
                let cx = t.x + t.w / 2;
                let cy = t.y + t.h / 2;
                let dist = Math.hypot(p.x - cx, p.y - cy);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = t;
                }
            });
            if (nearest) {
                if (nearest.id === 'blackjack') {
                    if (typeof openBlackjackModal === 'function') openBlackjackModal();
                } else if (socket) {
                    socket.emit('requestTableOptions', nearest.id);
                } else if (nearest.id === 'xox') {
                    if (typeof openXoxModal === 'function') openXoxModal();
                } else if (nearest.id === 'amiral') {
                    if (typeof openAmiralBattiModal === 'function') openAmiralBattiModal();
                }
                return true;
            }
            return false;
        }

        if (currentRoom === "ganyan") {
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('cadde');
                return true;
            }
            let distTjk = Math.hypot(p.x - 140, p.y - 300);
            let distStable = Math.hypot(p.x - 650, p.y - 350);
            if (distTjk < 120) {
                if (typeof openGanyanKuponModal === 'function') openGanyanKuponModal();
                return true;
            }
            if (distStable < 120) {
                if (typeof openHorseRentalModal === 'function') openHorseRentalModal();
                return true;
            }
            return false;
        }

        if (currentRoom === "nargile_cafe") {
            let distTekli = Math.hypot(p.x - 255, p.y - 242);
            let distEsli = Math.hypot(p.x - 545, p.y - 242);
            if (distTekli < 130) {
                if (socket) socket.emit('requestTableOptions', 'okey101_tekli');
                return true;
            }
            if (distEsli < 130) {
                if (socket) socket.emit('requestTableOptions', 'okey101');
                return true;
            }
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            return false;
        }

        if (currentRoom === "sahil") {
            if (p.x >= canvasWidth - 66 && p.y >= 180 && p.y <= 360) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            let distSwan = Math.hypot(p.x - 135, p.y - 188);
            if (distSwan < 85) {
                if (typeof handleRentSwanBoat === 'function') handleRentSwanBoat();
                return true;
            }
            let distBar = Math.hypot(p.x - 715, p.y - 425);
            if (distBar < 95) {
                if (typeof openCocktailBarModal === 'function') openCocktailBarModal();
                return true;
            }
            if (typeof triggerFishing === 'function') triggerFishing();
            return true;
        }

        if (currentRoom === "sokak") {
            if (p.x <= 66 && p.y >= 180 && p.y <= 330) {
                if (typeof changeRoom === 'function') changeRoom('sahil');
                return true;
            }
            if (p.x >= canvasWidth - 66 && p.y >= 180 && p.y <= 330) {
                if (typeof changeRoom === 'function') changeRoom('cadde');
                return true;
            }
            if (p.x <= 235 && p.y <= 120) {
                if (typeof changeRoom === 'function') changeRoom('emlakci');
                return true;
            }
            if (p.x >= 260 && p.x <= 540 && p.y <= 120) {
                if (typeof changeRoom === 'function') changeRoom('kafe');
                return true;
            }
            if (p.x >= 560 && p.y <= 120) {
                if (typeof changeRoom === 'function') changeRoom('nargile_cafe');
                return true;
            }
            if (p.x <= 250 && p.y >= 335) {
                if (typeof openHousingPortalModal === 'function') openHousingPortalModal();
                return true;
            }
            if (p.x >= 270 && p.x <= 530 && p.y >= 335) {
                if (typeof openBillboardAdModal === 'function') openBillboardAdModal();
                return true;
            }
            if (p.x >= 550 && p.y >= 335) {
                if (typeof changeRoom === 'function') changeRoom('market');
                return true;
            }
            return false;
        }

        if (currentRoom === "cadde") {
            if (p.x <= 66 && p.y >= 140 && p.y <= 330) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            if (p.x >= 90 && p.x <= 390 && p.y <= 135) {
                if (typeof changeRoom === 'function') changeRoom('ganyan');
                return true;
            }
            if (p.x >= 440 && p.x <= 740 && p.y <= 135) {
                if (typeof changeRoom === 'function') changeRoom('dedenin_yeri');
                return true;
            }
            if (p.x >= 465 && p.x <= 735 && p.y >= 335) {
                if (typeof openBillboardAdModal === 'function') openBillboardAdModal();
                return true;
            }
            return false;
        }

        if (currentRoom === "emlakci") {
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            if (Math.hypot(p.x - 400, p.y - 135) < 95) {
                if (typeof openRealEstateModal === 'function') openRealEstateModal();
                return true;
            }
            if (Math.hypot(p.x - 170, p.y - 280) < 95) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('standart');
                return true;
            }
            if (Math.hypot(p.x - 400, p.y - 280) < 95) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('garden');
                return true;
            }
            if (Math.hypot(p.x - 630, p.y - 280) < 95) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('pool');
                return true;
            }
            return false;
        }

        if (currentRoom === "dedenin_yeri") {
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('cadde');
                return true;
            }
            if (Math.hypot(p.x - 105, p.y - 155) < 120) {
                if (typeof openSlotModal === 'function') openSlotModal();
                return true;
            }
            if (Math.hypot(p.x - 700, p.y - 180) < 120) {
                if (typeof openRouletteModal === 'function') openRouletteModal();
                return true;
            }
            let casinoT = (typeof casinoTables !== 'undefined' && casinoTables[0]) ? casinoTables[0] : { x: 310, y: 155, w: 180, h: 135 };
            let cx = casinoT.x + casinoT.w / 2;
            let cy = casinoT.y + casinoT.h / 2;
            if (Math.hypot(p.x - cx, p.y - cy) < 130) {
                if (typeof openBlackjackModal === 'function') openBlackjackModal();
                return true;
            }
            return false;
        }

        if (currentRoom === "market") {
            if (p.x >= 520 && p.y <= 170) {
                if (typeof openFurnitureMarketModal === 'function') openFurnitureMarketModal();
                return true;
            }
            if (p.y >= canvasHeight - 90) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            return false;
        }

        if (currentRoom.startsWith("house_")) {
            if (typeof getCurrentViewingHouse === 'function') {
                let house = getCurrentViewingHouse();
                if (house && house.furniture) {
                    let stand = house.furniture.find(f => f.id === 'meyve_arabasi');
                    if (stand && Math.hypot(p.x - stand.x, p.y - stand.y) < 110) {
                        if (typeof openLemonadeStandModal === 'function') {
                            openLemonadeStandModal(house);
                            return true;
                        }
                    }
                    let slotObj = house.furniture.find(f => f.id === 'slot_machine');
                    if (slotObj && !window.isHouseEditMode && Math.hypot(p.x - slotObj.x, p.y - slotObj.y) < 110) {
                        if (typeof openSlotModal === 'function') {
                            window.currentSlotHouseOwner = house.owner;
                            openSlotModal();
                            return true;
                        }
                    }
                    let rouletteObj = house.furniture.find(f => f.id === 'roulette_table');
                    if (rouletteObj && !window.isHouseEditMode && Math.hypot(p.x - rouletteObj.x, p.y - rouletteObj.y) < 110) {
                        if (typeof openRouletteModal === 'function') {
                            openRouletteModal();
                            return true;
                        }
                    }
                }
            }
            if (p.x <= 90 && p.y >= canvasHeight - 90) {
                if (window.isHouseEditMode) {
                    if (typeof warnHouseEditActive === 'function') warnHouseEditActive();
                    return true;
                }
                if (currentRoom.startsWith("house_ornek_")) {
                    if (typeof exitHouseTour === 'function') exitHouseTour();
                    else if (typeof changeRoom === 'function') changeRoom('emlakci');
                } else {
                    if (typeof changeRoom === 'function') changeRoom('sokak');
                }
                return true;
            }
            return false;
        }

        return false;
    }

    // Global dışa aktarım
    window.checkRoomWalkPortals = checkRoomWalkPortals;
    window.handleRoomInteractionClick = handleRoomInteractionClick;
    window.handleRoomMobileInteract = handleRoomMobileInteract;
})();
