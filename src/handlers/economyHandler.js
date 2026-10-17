const config = require('../config');
const dataManager = require('../dataManager');
const fatherPetManager = require('../fatherPetManager');
const { checkRateLimit } = require('../utils/securityUtils');

// Kuğu Bisikleti 5 Dakikalık Kiralama Zamanlayıcıları Havuzu
const playerSwanTimers = {};

function registerEconomyHandlers(io, socket, players, helpers) {
    const { playerFishingTimers, playerTeaTimers, givePlayerTeaWithTimer, getAdminOnlineUsers, getAdminSanctionsList, getPlayersInRoom } = helpers;

    // 1. GARDIROR VE KIYAFET SATIN ALMA
    socket.on('buyWardrobeItem', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'buyWardrobe', 5, 2000)) return;
        let username = players[socket.id].name;
        let userData = dataManager.persistentData.users[username];
        if (!userData) return;

        let cat = data.category;
        let normCat = (cat === 'watch' || cat === 'watches') ? 'watches' : (cat.endsWith('s') ? cat : (cat + 's'));
        let singleCat = (cat === 'watches' || cat === 'watch') ? 'watch' : (cat.endsWith('s') ? cat.slice(0, -1) : cat);
        let itemId = data.id;

        let itemKey = `${normCat}_${itemId}`;
        let altKey = itemId.startsWith(normCat + '_') ? itemId : null;
        let itemCost = 5;
        if (config.WARDROBE_ITEM_PRICES[itemKey] !== undefined) {
            itemCost = config.WARDROBE_ITEM_PRICES[itemKey];
        } else if (altKey && config.WARDROBE_ITEM_PRICES[altKey] !== undefined) {
            itemCost = config.WARDROBE_ITEM_PRICES[altKey];
            itemKey = altKey;
        } else if (config.WARDROBE_ITEM_PRICES[itemId] !== undefined) {
            itemCost = config.WARDROBE_ITEM_PRICES[itemId];
        }
        let isFree = (itemCost === 0 || itemId === 'none' || itemId === 'watch_none' || itemId === '#facc15' || itemId === '#3b82f6' || itemId === 'tshirt_divalar' || itemId === 'pants_camo_cargo' || itemId === 'pants_classic_jeans' || itemId === 'outfit_camo_set' || itemId === 'hair_sanalika_dreadlocks');

        if (normCat === 'props' && itemId !== 'none') {
            if (userData.money < itemCost) {
                socket.emit('gameError', `Yetersiz bakiye! Bu eşya ${itemCost} TL. Bakiyeniz: ${userData.money} TL.`);
                return;
            }
            userData.money -= itemCost;
            if (!userData.propInventory) userData.propInventory = {};
            userData.propInventory[itemKey] = (userData.propInventory[itemKey] || 0) + 1;

            if (!userData.inventory) userData.inventory = [];
            if (!userData.inventory.includes(itemKey)) userData.inventory.push(itemKey);

            if (itemId === 'cay') {
                givePlayerTeaWithTimer(socket.id, username, 300000);
                dataManager.recordQuestProgress(username, 'drink_tea', 1);
            } else {
                userData.avatar.heldItem = itemId;
                players[socket.id].heldItem = itemId;
            }

            dataManager.savePersistentData();
            socket.emit('moneyUpdate', userData.money);
            socket.emit('propInventoryUpdate', userData.propInventory);
            socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });
            io.to(players[socket.id].room).emit('playerAvatarChange', {
                id: socket.id,
                avatar: userData.avatar,
                heldItem: players[socket.id].heldItem
            });
            socket.emit('systemMessage', `✅ 1 adet ${itemId} satın aldın! Çantandaki toplam: ${userData.propInventory[itemKey]} adet.`);
            return;
        }

        let isAlreadyOwned = isFree || (userData.inventory && userData.inventory.includes(itemKey));

        if (!isAlreadyOwned) {
            if (userData.money < itemCost) {
                socket.emit('gameError', `Yetersiz bakiye! Bu eşya ${itemCost} TL. Bakiyeniz: ${userData.money} TL.`);
                return;
            }
            userData.money -= itemCost;
            if (!userData.inventory) userData.inventory = [];
            userData.inventory.push(itemKey);
        }

        if (singleCat === 'hat') {
            userData.avatar.hat = itemId;
            players[socket.id].hat = itemId;
        } else if (singleCat === 'face') {
            userData.avatar.face = itemId;
            players[socket.id].face = itemId;
        } else if (singleCat === 'skin') {
            userData.avatar.skinColor = itemId;
            players[socket.id].skinColor = itemId;
        } else if (singleCat === 'outfit') {
            userData.avatar.outfit = itemId;
            userData.avatar.shirtColor = itemId;
            userData.avatar.color = itemId;
            players[socket.id].outfit = itemId;
            players[socket.id].color = itemId;
        } else if (singleCat === 'tshirt' || singleCat === 'shirt') {
            userData.avatar.shirt = itemId;
            userData.avatar.shirtColor = itemId;
            userData.avatar.color = itemId;
            userData.avatar.outfit = null;
            players[socket.id].shirt = itemId;
            players[socket.id].color = itemId;
            players[socket.id].outfit = null;
        } else if (singleCat === 'pant') {
            userData.avatar.pants = itemId;
            userData.avatar.outfit = null;
            players[socket.id].pants = itemId;
            players[socket.id].outfit = null;
        } else if (singleCat === 'shoe') {
            userData.avatar.shoes = itemId;
            players[socket.id].shoes = itemId;
        } else if (singleCat === 'watch') {
            userData.avatar.watch = itemId;
            players[socket.id].watch = itemId;
        } else if (singleCat === 'prop' || normCat === 'props') {
            userData.avatar.heldItem = itemId;
            players[socket.id].heldItem = itemId;
            if (itemId === 'none') {
                if (players[socket.id].hasTea) players[socket.id].hasTea = false;
                if (playerTeaTimers && playerTeaTimers[socket.id]) {
                    clearTimeout(playerTeaTimers[socket.id]);
                    delete playerTeaTimers[socket.id];
                }
                userData.teaExpiresAt = null;
                socket.emit('systemMessage', "✋ Elindeki eşyayı bıraktın.");
            }
        }

        dataManager.savePersistentData();

        socket.emit('moneyUpdate', userData.money);
        socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });
        if (normCat === 'props') {
            socket.emit('propInventoryUpdate', userData.propInventory || {});
        }

        let updatedAvatar = userData.avatar;
        io.to(players[socket.id].room).emit('playerAvatarChange', {
            id: socket.id,
            avatar: updatedAvatar,
            model: updatedAvatar.model || 'classic',
            hat: updatedAvatar.hat,
            face: updatedAvatar.face,
            skinColor: updatedAvatar.skinColor,
            color: updatedAvatar.color,
            shirt: updatedAvatar.shirt,
            pants: updatedAvatar.pants,
            outfit: updatedAvatar.outfit,
            heldItem: updatedAvatar.heldItem,
            shoes: updatedAvatar.shoes,
            watch: updatedAvatar.watch,
            gender: updatedAvatar.gender
        });
    });

    // 1.1 AVATAR VÜCUT MODELİ SEÇİMİ (KLASİK, KLASİK 2 vs 2.5D İZOMETRİK)
    socket.on('setAvatarModel', (data) => {
        if (!players[socket.id] || !data || !data.model) return;
        let username = players[socket.id].name;
        let userData = dataManager.persistentData.users[username];
        if (!userData) return;

        let model = (data.model === 'sanalika_v2' || data.model === 'classic_2') ? data.model : 'classic';
        if (!userData.avatar) userData.avatar = {};
        userData.avatar.model = model;
        players[socket.id].model = model;

        dataManager.savePersistentData();

        socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });
        io.to(players[socket.id].room).emit('playerAvatarChange', {
            id: socket.id,
            avatar: userData.avatar,
            model: model,
            shirt: userData.avatar.shirt,
            pants: userData.avatar.pants,
            outfit: userData.avatar.outfit,
            watch: userData.avatar.watch
        });
    });

    // 2. KUĞU DENİZ BİSİKLETİ KİRALAMA (5 DAKİKA SÜRE)
    socket.on('rentSwanBoat', () => {
        if (!players[socket.id]) return;
        if (!checkRateLimit(socket, 'rentSwanBoat', 2, 5000)) return;
        let username = players[socket.id].name;
        let userData = dataManager.persistentData.users[username];
        if (!userData) return;

        if (players[socket.id].hasSwanBoat) {
            socket.emit('gameError', "Zaten Kuğu Deniz Bisikleti kiraladınız!");
            return;
        }
        if (userData.money < 20) {
            socket.emit('gameError', "Kuğu Deniz Bisikleti kiralamak için 20 TL gerekiyor! Bakiyeniz yetersiz.");
            return;
        }

        userData.money -= 20;
        players[socket.id].money = userData.money;
        players[socket.id].hasSwanBoat = true;
        dataManager.savePersistentData();

        const SWAN_DURATION_SECONDS = 300; // 5 dakika (5 * 60)
        if (playerSwanTimers[socket.id]) {
            clearTimeout(playerSwanTimers[socket.id]);
        }

        playerSwanTimers[socket.id] = setTimeout(() => {
            if (!players[socket.id]) return;
            players[socket.id].hasSwanBoat = false;
            delete playerSwanTimers[socket.id];

            io.to(players[socket.id].room).emit('playerSwanBoatUpdate', { id: socket.id, hasSwanBoat: false });
            socket.emit('swanBoatExpired');
            socket.emit('systemMessage', "🦢 Kuğu bisikleti kiralama süreniz (5 dakika) sona erdi!");

            // Eğer oyuncu denizdeyse, suda mahsur kalmaması için güvenle iskeleye/kumsala al
            if (players[socket.id].room === 'sahil') {
                let px = players[socket.id].x;
                let py = players[socket.id].y;
                let onPier = (px >= 70 && px <= 555 && py >= 150 && py <= 235);
                let onSand = (py >= 370 && px >= 210) || (py >= 260 && px >= 340) || (py >= 180 && px >= 440) || (py >= 120 && px >= 550) || (px >= 640);
                if (!onPier && !onSand) {
                    players[socket.id].x = 420;
                    players[socket.id].y = 350;
                    io.to('sahil').emit('playerMoved', { id: socket.id, x: 420, y: 350 });
                }
            }
        }, SWAN_DURATION_SECONDS * 1000);

        socket.emit('moneyUpdate', userData.money);
        socket.emit('swanBoatRented', { duration: SWAN_DURATION_SECONDS });
        io.to(players[socket.id].room).emit('playerSwanBoatUpdate', { id: socket.id, hasSwanBoat: true });
        socket.emit('systemMessage', "🦢 Tebrikler! 20 TL'ye Kuğu Deniz Bisikleti kiraladın. (Süre: 5 Dakika)");
    });

    // 2.1 TROPİK SAHİL KOKTEYL BARI SATIN ALMA
    socket.on('buyCocktail', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'buyCocktail', 5, 2000)) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const COCKTAILS = {
            'coconut': { name: 'Tropik Hindistan Cevizi Kokteyli', price: 25, icon: '🥥', chatText: 'Buz gibi Tropik Hindistan Cevizi Kokteyli yudumluyorum! 🌴' },
            'pineapple': { name: 'Buzlu Ananaslı Frappé', price: 30, icon: '🍍', chatText: 'Taze Buzlu Ananaslı Frappé harika! 🍍' },
            'mojito': { name: 'Çilekli Sahil Mojito', price: 35, icon: '🍓', chatText: 'Çilekli Sahil Mojito ile serinliyorum! 🍓' },
            'sunset': { name: 'Sunset Horizon (Güneş Batımı)', price: 45, icon: '🍹', chatText: 'Lüks Sunset Horizon kokteyli yudumluyorum! 🌅' },
            'lemonade': { name: 'Buzlu Nane & Limonata', price: 20, icon: '🍋', chatText: 'Buz gibi nane limonatamı yudumluyorum! 🍋' }
        };

        let item = COCKTAILS[data.id];
        if (!item) return;

        if ((userData.money || 0) < item.price) {
            socket.emit('gameError', `Yetersiz bakiye! Bu içecek ${item.price} TL. Bakiyeniz: ${userData.money || 0} TL.`);
            return;
        }

        userData.money = Math.max(0, (userData.money || 0) - item.price);
        players[socket.id].money = userData.money;

        // Oyuncunun eline içeceği ver
        userData.avatar = userData.avatar || {};
        userData.avatar.heldItem = 'cocktail_' + data.id;
        players[socket.id].heldItem = 'cocktail_' + data.id;

        dataManager.savePersistentData();

        socket.emit('moneyUpdate', userData.money);
        socket.emit('cocktailPurchasedSuccess', item);
        socket.emit('systemMessage', `${item.icon} [${item.name}] satın aldınız ve afiyetle içtiniz! (-${item.price} TL)`);

        let room = players[socket.id].room;
        io.to(room).emit('playerAvatarChange', { id: socket.id, avatar: userData.avatar, heldItem: players[socket.id].heldItem });

        // Karakterin odada chat mesajı ve balonu çıkarmasını sağla
        let chatMsg = `${item.icon} ${item.chatText}`;
        io.to(room).emit('chatUpdate', {
            id: socket.id,
            msg: chatMsg
        });
    });

    // 3. SAHİL BALIK TUTMA
    socket.on('startFishing', () => {
        if (!players[socket.id] || players[socket.id].room !== 'sahil') return;
        if (!checkRateLimit(socket, 'startFishing', 3, 4000)) return;
        if (players[socket.id].isFishing) {
            socket.emit('gameError', "Zaten oltan denizde! Balığın vurmasını bekle...");
            return;
        }

        players[socket.id].isFishing = true;
        io.to('sahil').emit('playerFishingState', { id: socket.id, isFishing: true });
        socket.emit('fishingStarted', { duration: 10 });

        if (playerFishingTimers[socket.id]) clearTimeout(playerFishingTimers[socket.id]);

        playerFishingTimers[socket.id] = setTimeout(() => {
            if (!players[socket.id] || !players[socket.id].isFishing) return;
            players[socket.id].isFishing = false;
            delete playerFishingTimers[socket.id];

            let currentLootTable = players[socket.id].hasSwanBoat 
                ? config.SWAN_BOAT_LOOT_TABLE 
                : config.FISH_LOOT_TABLE;

            let totalWeight = currentLootTable.reduce((sum, item) => sum + item.weight, 0);
            let rand = Math.random() * totalWeight;
            let chosen = currentLootTable[0];
            let acc = 0;
            for (let item of currentLootTable) {
                acc += item.weight;
                if (rand <= acc) {
                    chosen = item;
                    break;
                }
            }

            let uName = players[socket.id].name;

            // Çok nadir "Denizden babam çıktı" deyimi kontrolü
            if (chosen.id === 'baban') {
                dataManager.recordQuestProgress(uName, 'go_fishing', 1);
                io.to('sahil').emit('playerFishingState', { id: socket.id, isFishing: false });
                players[socket.id].pendingFatherChoice = true;
                socket.emit('fatherCaughtPrompt', {
                    title: "Denizden Baban Çıktı!",
                    proverb: "Denizden babam çıksa yerim...",
                    description: "Oltana takılan şey bir balık değil... Baban! Ne yapmak istersin?",
                    eatReward: 300,
                    playerGender: players[socket.id].gender || 'male'
                });
                return;
            }

            let earned = chosen.value;
            let uData = dataManager.persistentData.users[uName];
            if (uData) {
                uData.money = (uData.money || 0) + earned;
                players[socket.id].money = uData.money;
                dataManager.savePersistentData();
                dataManager.recordQuestProgress(uName, 'go_fishing', 1);
                socket.emit('moneyUpdate', players[socket.id].money);
            }

            socket.emit('fishingResult', {
                loot: chosen,
                money: players[socket.id].money
            });

            io.to('sahil').emit('playerFishingState', { id: socket.id, isFishing: false });

            if (['levrek', 'ahtapot', 'inci', 'mercan', 'hazine'].includes(chosen.id)) {
                io.to('sahil').emit('systemMessage', `🎣 VAY CANINA! ${uName} denizden ${chosen.emoji} ${chosen.name} tuttu! (+${earned} TL)`);
            }
        }, 10000);
    });

    // "Denizden Baban Çıktı" Seçim Olayı
    socket.on('fatherChoice', (data) => {
        if (!players[socket.id]) return;
        const choice = (data && data.choice) ? data.choice : 'spare';
        fatherPetManager.handleFatherChoice(socket, choice);
    });

    socket.on('cancelFishing', () => {
        if (players[socket.id] && players[socket.id].isFishing) {
            players[socket.id].isFishing = false;
            if (playerFishingTimers[socket.id]) {
                clearTimeout(playerFishingTimers[socket.id]);
                delete playerFishingTimers[socket.id];
            }
            io.to('sahil').emit('playerFishingState', { id: socket.id, isFishing: false });
        }
    });

    // 4. LİDERLİK TABLOSU
    socket.on('getLeaderboard', () => {
        const isHuman = (name) => name && !name.startsWith('🤖') && !name.startsWith('bot_') && !name.includes('🤖') && !name.toLowerCase().includes('dayı') && !name.toLowerCase().includes('ismail') && !name.toLowerCase().includes('emmi');

        let topBilliard = Object.entries(dataManager.persistentData.leaderboard.billiard || {})
            .filter(([name]) => isHuman(name))
            .map(([name, wins]) => ({ name, wins }))
            .sort((a, b) => b.wins - a.wins).slice(0, 5);

        let topBatak = Object.entries(dataManager.persistentData.leaderboard.batak || {})
            .filter(([name]) => isHuman(name))
            .map(([name, score]) => ({ name, score }))
            .sort((a, b) => b.score - a.score).slice(0, 5);

        let topTavla = Object.entries(dataManager.persistentData.leaderboard.tavla || {})
            .filter(([name]) => isHuman(name))
            .map(([name, wins]) => ({ name, wins }))
            .sort((a, b) => b.wins - a.wins).slice(0, 5);

        let topOkey101 = Object.entries(dataManager.persistentData.leaderboard.okey101 || {})
            .filter(([name]) => isHuman(name))
            .map(([name, wins]) => ({ name, wins }))
            .sort((a, b) => b.wins - a.wins).slice(0, 5);

        socket.emit('leaderboardData', {
            billiard: topBilliard,
            batak: topBatak,
            tavla: topTavla,
            okey101: topOkey101
        });
    });

    // 6. GÜNLÜK GÖREVLER (DAILY QUESTS)
    socket.on('getDailyQuests', async () => {
        if (!players[socket.id]) return;
        let username = players[socket.id].name;
        let quests = await dataManager.getUserDailyQuests(username);
        socket.emit('dailyQuestsData', quests);
    });

    socket.on('claimDailyQuest', async (questId) => {
        if (!players[socket.id] || !questId) return;
        if (!checkRateLimit(socket, 'claimDailyQuest', 5, 3000)) return;
        let username = players[socket.id].name;
        let res = await dataManager.claimQuestReward(username, questId);
        if (res.success) {
            socket.emit('moneyUpdate', res.newMoney);
            socket.emit('dailyQuestsData', res.quests);
            socket.emit('systemMessage', res.msg);
        } else {
            socket.emit('gameError', res.msg);
        }
    });
}

module.exports = { registerEconomyHandlers, playerSwanTimers };
