// src/handlers/adminHandler.js - Yönetici Yetkileri, Moderasyon ve Denetim (Admin Controller)
const dataManager = require('../dataManager');
const fatherPetManager = require('../fatherPetManager');

// Yetki doğrulama yardımcısı (Admin Guard)
function requireAdminGuard(socket, players) {
    if (!socket || !players || !players[socket.id] || !players[socket.id].isAdmin) {
        if (socket && typeof socket.emit === 'function') {
            socket.emit('gameError', "Bu işlem için admin yetkisi gerekiyor!");
        }
        return false;
    }
    return true;
}

function registerAdminHandlers(io, socket, players, helpers) {
    const { getPlayersInRoom, getAdminOnlineUsers, getAdminSanctionsList } = helpers;

    const requireAdmin = () => requireAdminGuard(socket, players);

    // 1. ÇEVRİMİÇİ OYUNCULARI LİSTELEME
    socket.on('adminGetUsers', () => {
        if (!requireAdmin()) return;
        socket.emit('adminUsersList', getAdminOnlineUsers());
    });

    // 2. OYUNCU BAKİYESİNİ DÜZENLEME (EKLEME VEYA DOĞRUDAN BELİRLEME)
    socket.on('adminModifyMoney', (data) => {
        if (!requireAdmin()) return;
        if (!data || !data.targetUsername) return;

        let targetUser = data.targetUsername;
        let amount = dataManager.sanitizeAmount(data.amount, 0, 100000000);
        if (amount === null) {
            socket.emit('gameError', "Geçersiz para miktarı!");
            return;
        }

        let targetKey = dataManager.findUserKey(targetUser) || targetUser;
        if (!dataManager.persistentData.users[targetKey]) {
            socket.emit('gameError', "Kullanıcı bulunamadı!");
            return;
        }

        let adminName = players[socket.id].name;
        if (data.mode === 'set') {
            dataManager.persistentData.users[targetKey].money = amount;
            console.log(`[ADMIN AUDIT] ${adminName} kullanıcısı ${targetKey} bakiyesini ${amount} TL olarak ayarladı.`);
        } else {
            dataManager.persistentData.users[targetKey].money = (dataManager.persistentData.users[targetKey].money || 0) + amount;
            console.log(`[ADMIN AUDIT] ${adminName} kullanıcısı ${targetKey} hesabına ${amount} TL ekledi.`);
        }

        dataManager.savePersistentData();

        let updatedMoney = dataManager.persistentData.users[targetKey].money;

        for (let sid in players) {
            if (players[sid].name.toLowerCase() === targetKey.toLowerCase()) {
                players[sid].money = updatedMoney;
                io.to(sid).emit('moneyUpdate', updatedMoney);
                let noteMsg = (data.mode === 'set')
                    ? `👑 Admin hesabınızın bakiyesini ${amount} TL olarak güncelledi!`
                    : `👑 Admin hesabınıza ${amount} TL ekledi! (Yeni Bakiye: ${updatedMoney} TL)`;
                io.to(sid).emit('systemMessage', noteMsg);
            }
        }

        socket.emit('systemMessage', `✅ ${targetKey} kullanıcısının yeni bakiyesi: ${updatedMoney} TL`);
        socket.emit('adminUsersList', getAdminOnlineUsers());
    });

    // 3. GLOBAL DUYURU YAYINI (TÜM OYUNA ANLIK POP-UP)
    socket.on('adminBroadcastAnnouncement', (data) => {
        if (!requireAdmin()) return;
        let title = dataManager.sanitizeString(data?.title || "📢 SİSTEM VE YÖNETİCİ DUYURUSU", 60);
        let message = dataManager.sanitizeString(data?.message || "", 300);
        if (!message) {
            socket.emit('gameError', "Duyuru metni boş olamaz!");
            return;
        }

        let now = new Date();
        let timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        let adminName = players[socket.id].name || "Admin Yasin";

        let announcementData = {
            id: 'ann_' + Date.now(),
            title: title,
            message: message,
            sender: adminName,
            time: timeStr
        };

        console.log(`[ADMIN AUDIT] ${adminName} global duyuru yayınladı: "${title}" - "${message}"`);
        io.emit('globalAnnouncementPopup', announcementData);
        socket.emit('systemMessage', "✅ Duyuru tüm sunucudaki oyuncuların ekranına pop-up olarak yayınlandı!");
    });

    // 4. OYUNCU YANINA IŞINLANMA (TELEPORT)
    socket.on('adminTeleportTo', (data) => {
        if (!requireAdmin()) return;
        if (!data || !data.targetUsername) return;
        let targetSid = Object.keys(players).find(sid => players[sid]?.name?.toLowerCase() === data.targetUsername.toLowerCase());
        if (!targetSid || !players[targetSid]) {
            socket.emit('gameError', "Oyuncu çevrimdışı veya bulunamadı!");
            return;
        }

        let targetP = players[targetSid];
        let adminP = players[socket.id];
        let oldRoom = adminP.room;
        let newRoom = targetP.room;
        let newX = Math.max(30, Math.min(770, targetP.x + 30));
        let newY = targetP.y;

        adminP.room = newRoom;
        adminP.x = newX;
        adminP.y = newY;

        console.log(`[ADMIN AUDIT] ${adminP.name} oyuncusu ${targetP.name} yanına ışınlandı (${newRoom}).`);

        if (oldRoom !== newRoom) {
            socket.leave(oldRoom);
            socket.join(newRoom);
            socket.to(oldRoom).emit('playerDisconnected', socket.id);
            socket.emit('roomChanged', newRoom);
            fatherPetManager.handleRoomChange(socket.id, oldRoom, newRoom);
            socket.emit('currentPlayers', getPlayersInRoom(newRoom));
            socket.emit('activeFatherPets', fatherPetManager.getPetsInRoom(newRoom));
            socket.to(newRoom).emit('newPlayer', { id: socket.id, player: adminP });
        } else {
            io.to(newRoom).emit('playerMoved', { id: socket.id, x: newX, y: newY });
        }
        socket.emit('adminTeleported', { room: newRoom, x: newX, y: newY, target: targetP.name });
        socket.emit('systemMessage', `🚀 ${targetP.name} adlı oyuncunun yanına ışınlandınız! (${newRoom})`);
    });

    // 5. OYUNCUYU YANINA ÇEKME (SUMMON)
    socket.on('adminSummon', (data) => {
        if (!requireAdmin()) return;
        if (!data || !data.targetUsername) return;
        let targetSid = Object.keys(players).find(sid => players[sid]?.name?.toLowerCase() === data.targetUsername.toLowerCase());
        if (!targetSid || !players[targetSid]) {
            socket.emit('gameError', "Oyuncu çevrimdışı veya bulunamadı!");
            return;
        }

        let adminP = players[socket.id];
        let targetP = players[targetSid];
        let targetSocket = io.sockets.sockets.get(targetSid);
        let oldRoom = targetP.room;
        let adminRoom = adminP.room;
        let summonX = Math.max(30, Math.min(770, adminP.x + 30));
        let summonY = adminP.y;

        targetP.room = adminRoom;
        targetP.x = summonX;
        targetP.y = summonY;

        console.log(`[ADMIN AUDIT] ${adminP.name} oyuncusu ${targetP.name} kullanıcısını yanına çekti (${adminRoom}).`);

        if (targetSocket) {
            if (oldRoom !== adminRoom) {
                targetSocket.leave(oldRoom);
                targetSocket.join(adminRoom);
                targetSocket.to(oldRoom).emit('playerDisconnected', targetSid);
                targetSocket.emit('roomChanged', adminRoom);
                fatherPetManager.handleRoomChange(targetSid, oldRoom, adminRoom);
                targetSocket.emit('currentPlayers', getPlayersInRoom(adminRoom));
                targetSocket.emit('activeFatherPets', fatherPetManager.getPetsInRoom(adminRoom));
                targetSocket.to(adminRoom).emit('newPlayer', { id: targetSid, player: targetP });
            } else {
                io.to(adminRoom).emit('playerMoved', { id: targetSid, x: summonX, y: summonY });
            }
            targetSocket.emit('adminSummoned', { room: adminRoom, x: summonX, y: summonY, adminName: adminP.name });
            targetSocket.emit('systemMessage', `🧲 Admin ${adminP.name} sizi yanına ışınladı!`);
        }
        socket.emit('systemMessage', `🧲 ${targetP.name} adlı oyuncu yanınıza çekildi!`);
    });

    // 6. SÜRELİ SUSTURMA (MUTE)
    socket.on('adminMuteUser', (data) => {
        if (!requireAdmin()) return;
        if (!data || !data.targetUsername) return;
        let minutes = parseInt(data.minutes) || 5;
        let reason = dataManager.sanitizeString(data.reason || "Yönetici kararı", 100);
        let targetKey = dataManager.findUserKey(data.targetUsername);
        if (!targetKey || !dataManager.persistentData.users[targetKey]) {
            socket.emit('gameError', "Kullanıcı bulunamadı!");
            return;
        }
        let uData = dataManager.persistentData.users[targetKey];
        uData.muteExpiresAt = Date.now() + (minutes * 60 * 1000);
        uData.muteReason = reason;
        uData.mutedBy = players[socket.id].name;
        dataManager.savePersistentData();

        console.log(`[ADMIN AUDIT] ${players[socket.id].name} kullanıcısı ${targetKey} kullanıcısını ${minutes} dk susturdu. Sebep: ${reason}`);

        for (let sid in players) {
            if (players[sid]?.name?.toLowerCase() === targetKey.toLowerCase()) {
                players[sid].isMuted = true;
                io.to(sid).emit('playerMutedNotice', {
                    minutes: minutes,
                    expiresAt: uData.muteExpiresAt,
                    reason: reason
                });
                io.to(sid).emit('systemMessage', `🔇 Admin tarafından ${minutes} dakika süreyle susturuldunuz! (Sebep: ${reason})`);
            }
        }
        socket.emit('systemMessage', `🔇 ${targetKey} ${minutes} dakika süreyle susturuldu.`);
        socket.emit('adminUsersList', getAdminOnlineUsers());
        if (typeof getAdminSanctionsList === 'function') {
            socket.emit('adminSanctionsList', getAdminSanctionsList());
        }
    });

    // 7. SUSTURMAYI KALDIR (UNMUTE)
    socket.on('adminUnmuteUser', (data) => {
        if (!requireAdmin()) return;
        if (!data || !data.targetUsername) return;
        let targetKey = dataManager.findUserKey(data.targetUsername);
        if (!targetKey || !dataManager.persistentData.users[targetKey]) return;
        let uData = dataManager.persistentData.users[targetKey];
        uData.muteExpiresAt = null;
        uData.muteReason = null;
        uData.mutedBy = null;
        dataManager.savePersistentData();

        console.log(`[ADMIN AUDIT] ${players[socket.id].name} kullanıcısı ${targetKey} susturmasını kaldırdı.`);

        for (let sid in players) {
            if (players[sid]?.name?.toLowerCase() === targetKey.toLowerCase()) {
                players[sid].isMuted = false;
                io.to(sid).emit('systemMessage', `🔊 Susturmanız kaldırıldı, artık sohbet edebilirsiniz.`);
            }
        }
        socket.emit('systemMessage', `🔊 ${targetKey} kullanıcısının susturması kaldırıldı.`);
        socket.emit('adminUsersList', getAdminOnlineUsers());
        if (typeof getAdminSanctionsList === 'function') {
            socket.emit('adminSanctionsList', getAdminSanctionsList());
        }
    });

    // 8. SÜRELİ BAN (OYUNDAN UZAKLAŞTIRMA)
    socket.on('adminBanUser', (data) => {
        if (!requireAdmin()) return;
        if (!data || !data.targetUsername) return;
        let minutes = parseInt(data.minutes) || 15;
        let reason = dataManager.sanitizeString(data.reason || "Yönetici kararı", 100);
        let targetKey = dataManager.findUserKey(data.targetUsername);
        if (!targetKey || !dataManager.persistentData.users[targetKey]) {
            socket.emit('gameError', "Kullanıcı bulunamadı!");
            return;
        }
        if (dataManager.isUserAdmin(targetKey)) {
            socket.emit('gameError', "Adminler banlanamaz!");
            return;
        }
        let uData = dataManager.persistentData.users[targetKey];
        uData.banExpiresAt = Date.now() + (minutes * 60 * 1000);
        uData.banReason = reason;
        uData.bannedBy = players[socket.id].name;
        dataManager.savePersistentData();

        console.log(`[ADMIN AUDIT] ${players[socket.id].name} kullanıcısı ${targetKey} kullanıcısını ${minutes} dk banladı. Sebep: ${reason}`);

        for (let sid in players) {
            if (players[sid]?.name?.toLowerCase() === targetKey.toLowerCase()) {
                let targetSock = io.sockets.sockets.get(sid);
                if (targetSock) {
                    targetSock.emit('kickedOrBanned', {
                        type: 'ban',
                        minutes: minutes,
                        expiresAt: uData.banExpiresAt,
                        reason: reason
                    });
                    setTimeout(() => { targetSock.disconnect(true); }, 500);
                }
            }
        }
        socket.emit('systemMessage', `⛔ ${targetKey} ${minutes} dakika süreyle oyundan uzaklaştırıldı (banlandı).`);
        socket.emit('adminUsersList', getAdminOnlineUsers());
        if (typeof getAdminSanctionsList === 'function') {
            socket.emit('adminSanctionsList', getAdminSanctionsList());
        }
    });

    // 9. BANI KALDIR (UNBAN)
    socket.on('adminUnbanUser', (data) => {
        if (!requireAdmin()) return;
        if (!data || !data.targetUsername) return;
        let targetKey = dataManager.findUserKey(data.targetUsername);
        if (!targetKey || !dataManager.persistentData.users[targetKey]) return;
        let uData = dataManager.persistentData.users[targetKey];
        uData.banExpiresAt = null;
        uData.banReason = null;
        uData.bannedBy = null;
        dataManager.savePersistentData();

        console.log(`[ADMIN AUDIT] ${players[socket.id].name} kullanıcısı ${targetKey} banını kaldırdı.`);

        socket.emit('systemMessage', `✅ ${targetKey} kullanıcısının banı kaldırıldı.`);
        socket.emit('adminUsersList', getAdminOnlineUsers());
        if (typeof getAdminSanctionsList === 'function') {
            socket.emit('adminSanctionsList', getAdminSanctionsList());
        }
    });

    // 10. BANLI VE SUSTURULAN LİSTESİ
    socket.on('adminGetSanctionsList', () => {
        if (!requireAdmin()) return;
        if (typeof getAdminSanctionsList === 'function') {
            socket.emit('adminSanctionsList', getAdminSanctionsList());
        }
    });

    // 11. GÜVENLİ GELİŞTİRİCİ / TEST TETİKLEYİCİLERİ (YALNIZCA ADMİN)
    socket.on('devTriggerFatherCatch', () => {
        if (!requireAdmin()) return;
        players[socket.id].pendingFatherChoice = true;
        socket.emit('fatherCaughtPrompt', {
            title: "Denizden Baban Çıktı!",
            proverb: "Denizden babam çıksa yerim...",
            description: "Oltana takılan şey bir balık değil... Baban! Ne yapmak istersin?",
            eatReward: 300,
            playerGender: players[socket.id].gender || 'male'
        });
    });

    socket.on('devTriggerPocketMoney', () => {
        if (!requireAdmin()) return;
        fatherPetManager.giveFatherPocketMoney(socket.id);
    });
}

module.exports = { registerAdminHandlers, requireAdminGuard };
