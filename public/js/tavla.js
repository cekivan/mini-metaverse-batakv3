// public/js/tavla.js - İstemci Tarafı Tavla (Backgammon) Arayüzü (Y Ekseninde Simetrik)

let currentTavlaState = null;
let selectedTavlaPoint = null;
let tavlaValidTargets = [];

socket.on('tavlaUpdate', (state) => {
    currentTavlaState = state;
    window.currentActiveTableId = state.tableId;
    if (window.setVoiceTable && state.tableId) window.setVoiceTable(state.tableId);
    window.isSpectating = !!state.isSpectator;

    const specBanner = document.getElementById('spectatorBanner');
    if (specBanner) {
        if (state.isSpectator) {
            specBanner.style.display = 'block';
            let discKeys = Object.keys(state.disconnectedPlayers || {});
            if (discKeys.length > 0) {
                let dPid = discKeys[0];
                let dName = state.disconnectedPlayers[dPid].name;
                specBanner.innerHTML = `👁️ Yancısın | ⚠️ <b>${dName}</b> masadan ayrıldı! <button onclick="takeoverSeat('${state.tableId}', '${dPid}')" style="margin-left:8px; padding:4px 10px; background:#27ae60; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">💺 Boş Koltuğu Devral (${dName} yerine)</button>`;
            } else {
                specBanner.innerHTML = `👁️ Tavla Masasını İzliyorsun (Yancısın)`;
            }
        } else {
            specBanner.style.display = 'none';
        }
    }

    renderTavlaBoard(state);
});

function renderTavlaBoard(state) {
    const statusEl = document.getElementById('tavlaStatus');
    const rollBtn = document.getElementById('tavlaRollBtn');
    const diceDisplay = document.getElementById('tavlaDiceDisplay');
    const boardEl = document.getElementById('tavlaBoard');

    if (!boardEl) return;

    let myPid = socket.id;
    let myColor = state.playerColors ? state.playerColors[myPid] : null;
    let currentPid = state.players[state.turnIndex];
    let isMyTurn = !state.isSpectator && (currentPid === myPid);

    // 1. Durum Metni & Zar Butonu
    if (state.gameOver) {
        let isWinner = (state.winner === myPid);
        let winText = state.isSpectator ? "Maç Bitti!" : (isWinner ? "🏆 TEBRİKLER KAZANDIN! (+20 TL Kazandın)" : "KAYBETTİN!");
        statusEl.innerHTML = `<span style="color:#f1c40f; font-weight:800; font-size:17px;">${winText}</span>`;
        if (rollBtn) rollBtn.style.display = 'none';
    } else if (state.isSpectator) {
        let turnName = state.playerProfiles[currentPid]?.name || "Biri";
        statusEl.innerHTML = `<span style="color:#38bdf8;">👁️ Yancısın | Sıra: <b>${turnName}</b></span>`;
        if (rollBtn) rollBtn.style.display = 'none';
    } else {
        let colorName = myColor === 'white' ? "⚪ Beyaz Taşlar (Alt)" : "⚫ Siyah Taşlar (Üst)";
        if (isMyTurn) {
            if (!state.hasRolled) {
                statusEl.innerHTML = `<span style="color:#2ecc71; font-weight:bold;">SIRA SENDE (${colorName})! Zarları atın.</span>`;
                if (rollBtn) {
                    rollBtn.style.display = 'inline-block';
                    rollBtn.disabled = false;
                    rollBtn.innerText = '🎲 Zar At';
                    rollBtn.style.opacity = '1';
                }
            } else if (state.noMoves) {
                // Hamle yapılamayan durum bildirimi
                let diceText = state.dice.join(' - ');
                statusEl.innerHTML = `<span style="color:#f87171; font-weight:bold;">🎲 [${diceText}] atıldı fakat oynanacak geçerli hamle yok! Sıra rakibe devrediliyor...</span>`;
                if (rollBtn) rollBtn.style.display = 'none';
            } else {
                let movesText = state.remainingMoves.join(', ');
                statusEl.innerHTML = `<span style="color:#facc15; font-weight:bold;">Taşınızı seçip oynayın! Kalan hamleler: [${movesText}]</span>`;
                if (rollBtn) rollBtn.style.display = 'none';
            }
        } else {
            let oppName = state.playerProfiles[currentPid]?.name || "Rakip";
            if (state.noMoves) {
                let diceText = state.dice.join(' - ');
                statusEl.innerHTML = `<span style="color:#f87171; font-weight:bold;">🎲 ${oppName} [${diceText}] attı fakat hamlesi yok, sıra sana geçiyor...</span>`;
            } else {
                statusEl.innerHTML = `<span style="color:#e2e8f0;">Sıra <b>${oppName}</b> adlı oyuncuda (${myColor === 'white' ? '⚪ Beyaz' : '⚫ Siyah'})...</span>`;
            }
            if (rollBtn) rollBtn.style.display = 'none';
        }
    }

    // 2. Zar Gösterimi
    if (diceDisplay) {
        if (state.dice && state.dice.length === 2) {
            let d1 = state.dice[0];
            let d2 = state.dice[1];
            diceDisplay.innerHTML = `
                <div class="dice-box">${getDiceDotHtml(d1)}</div>
                <div class="dice-box">${getDiceDotHtml(d2)}</div>
            `;
        } else {
            diceDisplay.innerHTML = `<span style="color:#94a3b8; font-size:13px; font-style:italic;">Zar bekleniyor</span>`;
        }
    }

    // 3. Tahtayı Çiz
    drawTavlaBoardHTML(state, myColor, isMyTurn);
}

function getDiceDotHtml(val) {
    let pips = {
        1: '<span class="pip center"></span>',
        2: '<span class="pip top-left"></span><span class="pip bot-right"></span>',
        3: '<span class="pip top-left"></span><span class="pip center"></span><span class="pip bot-right"></span>',
        4: '<span class="pip top-left"></span><span class="pip top-right"></span><span class="pip bot-left"></span><span class="pip bot-right"></span>',
        5: '<span class="pip top-left"></span><span class="pip top-right"></span><span class="pip center"></span><span class="pip bot-left"></span><span class="pip bot-right"></span>',
        6: '<span class="pip top-left"></span><span class="pip top-right"></span><span class="pip mid-left"></span><span class="pip mid-right"></span><span class="pip bot-left"></span><span class="pip bot-right"></span>'
    };
    return pips[val] || val;
}

function drawTavlaBoardHTML(state, myColor, isMyTurn) {
    const boardEl = document.getElementById('tavlaBoard');
    if (!boardEl) return;

    // Y Ekseninde Kusursuz Simetrik Düzen:
    // Üst Sıra: Sol Kanat (13-18) | Sağ Kanat / Siyah Evi (19-24)
    // Alt Sıra: Sol Kanat (12-7)  | Sağ Kanat / Beyaz Evi (6-1)
    let topPoints = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
    let bottomPoints = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    let canBearOffNow = tavlaValidTargets.some(t => t.target === 'off');

    let html = `<div class="tavla-container">
        <!-- BAR (Kırık Taşlar) Sol Bölüm -->
        <div class="tavla-bar" onclick="handleTavlaPointClick('bar')">
            <div class="bar-section bar-top ${selectedTavlaPoint === 'bar' && myColor === 'white' ? 'selected-point' : ''}">
                <div class="bar-sec-title">⚪ Kırık (Beyaz)</div>
                <div class="bar-checkers">
                    ${renderCheckers('white', state.bar.white, selectedTavlaPoint === 'bar' && myColor === 'white')}
                </div>
            </div>
            <div class="bar-divider"><span>BAR</span></div>
            <div class="bar-section bar-bot ${selectedTavlaPoint === 'bar' && myColor === 'black' ? 'selected-point' : ''}">
                <div class="bar-checkers">
                    ${renderCheckers('black', state.bar.black, selectedTavlaPoint === 'bar' && myColor === 'black')}
                </div>
                <div class="bar-sec-title">⚫ Kırık (Siyah)</div>
            </div>
        </div>

        <!-- 24 KAPI ALANI (Tavla Tahtası) -->
        <div class="tavla-fields">
            <!-- Üst Sıra (13 - 24) -->
            <div class="tavla-row top-row">`;

    topPoints.forEach((ptIndex, idx) => {
        let pt = state.board[ptIndex];
        let isSelected = (selectedTavlaPoint === ptIndex);
        let isValidTarget = tavlaValidTargets.some(t => t.target === ptIndex);
        let triangleColorClass = (idx % 2 === 0) ? "tri-dark" : "tri-light";
        let isBlackHome = ptIndex >= 19;

        html += `<div class="tavla-point top-point ${triangleColorClass} ${isBlackHome ? 'home-point-top' : ''} ${isSelected ? 'selected-point' : ''} ${isValidTarget ? 'target-point' : ''}" onclick="handleTavlaPointClick(${ptIndex})">
            <span class="point-num point-num-top">${ptIndex}</span>
            <div class="point-checkers-top">
                ${renderCheckers(pt.player, pt.count, isSelected)}
            </div>
        </div>`;
    });

    html += `</div>
            <!-- Orta Ayraç Şerit (Ahşap İntarsiya) -->
            <div class="tavla-middle-divider">
                <div class="middle-line"></div>
            </div>
            <!-- Alt Sıra (12 - 1) -->
            <div class="tavla-row bot-row">`;

    bottomPoints.forEach((ptIndex, idx) => {
        let pt = state.board[ptIndex];
        let isSelected = (selectedTavlaPoint === ptIndex);
        let isValidTarget = tavlaValidTargets.some(t => t.target === ptIndex);
        let triangleColorClass = (idx % 2 === 0) ? "tri-light" : "tri-dark";
        let isWhiteHome = ptIndex <= 6;

        html += `<div class="tavla-point bot-point ${triangleColorClass} ${isWhiteHome ? 'home-point-bot' : ''} ${isSelected ? 'selected-point' : ''} ${isValidTarget ? 'target-point' : ''}" onclick="handleTavlaPointClick(${ptIndex})">
            <div class="point-checkers-bot">
                ${renderCheckers(pt.player, pt.count, isSelected)}
            </div>
            <span class="point-num point-num-bot">${ptIndex}</span>
        </div>`;
    });

    html += `</div>
        </div>

        <!-- Y EKSENİNDE SİMETRİK TOPLAMA BÖLMESİ (Borne Off Trays) -->
        <div class="tavla-borne-area">
            <!-- Üst Tepsi: Siyah Toplanan (19-24 evinden toplanır) -->
            <div class="tavla-borne-box borne-black ${canBearOffNow && myColor === 'black' ? 'target-point' : ''}" onclick="handleTavlaPointClick('off')">
                <div class="borne-box-title">⚫ Siyah Toplanan</div>
                <div class="borne-box-count"><b>${state.borneOff.black}</b> / 15</div>
                <div class="borne-checkers-stack">
                    ${renderBorneCheckers('black', state.borneOff.black)}
                </div>
                ${canBearOffNow && myColor === 'black' ? '<div class="collect-btn-badge">Buraya Topla!</div>' : ''}
            </div>

            <div class="borne-divider"></div>

            <!-- Alt Tepsi: Beyaz Toplanan (1-6 evinden toplanır) -->
            <div class="tavla-borne-box borne-white ${canBearOffNow && myColor === 'white' ? 'target-point' : ''}" onclick="handleTavlaPointClick('off')">
                ${canBearOffNow && myColor === 'white' ? '<div class="collect-btn-badge">Buraya Topla!</div>' : ''}
                <div class="borne-checkers-stack">
                    ${renderBorneCheckers('white', state.borneOff.white)}
                </div>
                <div class="borne-box-count"><b>${state.borneOff.white}</b> / 15</div>
                <div class="borne-box-title">⚪ Beyaz Toplanan</div>
            </div>
        </div>
    </div>`;

    boardEl.innerHTML = html;
}

function renderCheckers(player, count, isSelected) {
    if (!player || count <= 0) return "";
    let colorClass = player === 'white' ? 'checker-white' : 'checker-black';
    let countBadge = count > 5 ? `<span class="checker-count-badge">${count}</span>` : '';
    let visibleCount = Math.min(count, 5);

    let html = "";
    for (let i = 0; i < visibleCount; i++) {
        let isTopChecker = (i === visibleCount - 1);
        let selectedClass = (isSelected && isTopChecker) ? 'checker-selected' : '';
        html += `<div class="tavla-checker ${colorClass} ${selectedClass}">
            ${isTopChecker && count > 5 ? countBadge : ''}
        </div>`;
    }
    return html;
}

function renderBorneCheckers(player, count) {
    if (!count || count <= 0) return `<div class="empty-borne-hint">Boş</div>`;
    let colorClass = player === 'white' ? 'checker-white' : 'checker-black';
    let visible = Math.min(count, 6);
    let html = "";
    for (let i = 0; i < visible; i++) {
        html += `<div class="borne-checker-chip ${colorClass}"></div>`;
    }
    return html;
}

function handleTavlaRoll() {
    if (!currentTavlaState) return;
    const rollBtn = document.getElementById('tavlaRollBtn');
    if (rollBtn) {
        rollBtn.disabled = true;
        rollBtn.innerText = "🎲 Atılıyor...";
        rollBtn.style.opacity = '0.5';
    }
    if (window.playSound) window.playSound('chatPop');
    socket.emit('tavlaRoll');
}

function handleTavlaPointClick(pointIndex) {
    if (!currentTavlaState || window.isSpectating) return;

    let myPid = socket.id;
    let currentPid = currentTavlaState.players[currentTavlaState.turnIndex];
    if (currentPid !== myPid || !currentTavlaState.hasRolled || currentTavlaState.noMoves) return;

    // Eğer zaten bir taş seçiliyse ve geçerli bir hedef noktaya tıklandıysa
    if (selectedTavlaPoint !== null) {
        let matchingMove = tavlaValidTargets.find(t => t.target === pointIndex);
        if (matchingMove) {
            // Hamleyi gönder!
            if (window.playSound) window.playSound('card');
            socket.emit('tavlaMove', {
                fromPoint: selectedTavlaPoint,
                toPoint: pointIndex,
                usedDie: matchingMove.die
            });
            selectedTavlaPoint = null;
            tavlaValidTargets = [];
            return;
        }
    }

    // Yeni taş seçimi
    let myColor = currentTavlaState.playerColors[myPid];
    if (pointIndex === 'off') return;

    if (pointIndex === 'bar') {
        if (currentTavlaState.bar[myColor] > 0) {
            selectedTavlaPoint = 'bar';
            requestTavlaValidMoves('bar');
        }
        return;
    }

    // Kırık taş varken normal kapılardan taş seçilemez
    if (currentTavlaState.bar[myColor] > 0) {
        const errToast = document.getElementById('errorToast');
        if (errToast) {
            errToast.innerText = "Önce kırık taşınızı oyuna sokmalısınız!";
            errToast.style.display = 'block';
            setTimeout(() => { errToast.style.display = 'none'; }, 2500);
        }
        return;
    }

    let pt = currentTavlaState.board[pointIndex];
    if (pt && pt.player === myColor && pt.count > 0) {
        selectedTavlaPoint = pointIndex;
        requestTavlaValidMoves(pointIndex);
    } else {
        selectedTavlaPoint = null;
        tavlaValidTargets = [];
        renderTavlaBoard(currentTavlaState);
    }
}

function requestTavlaValidMoves(fromPoint) {
    socket.emit('getTavlaValidMoves', { fromPoint: fromPoint });
}

socket.on('tavlaValidMovesResponse', (data) => {
    tavlaValidTargets = data.moves || [];
    if (currentTavlaState) {
        renderTavlaBoard(currentTavlaState);
    }
});
