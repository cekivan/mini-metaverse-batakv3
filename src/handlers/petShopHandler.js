<<<<<<< HEAD
// src/handlers/petShopHandler.js - Pet Shop Satın Alma ve İletişim Soket Olayları Yöneticisi

=======
// src/handlers/petShopHandler.js - Pet Shop Satın Alım ve Soket Olayları Yöneticisi
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
const dataManager = require('../dataManager');
const petManager = require('../petManager');

function registerPetShopHandlers(io, socket, players) {
<<<<<<< HEAD
    // 1. Evcil Hayvan Sahiplenme / Satın Alma İsteği
    socket.on('buyPet', (data) => {
        handleBuyPet(io, socket, players, data);
    });

    socket.on('requestBuyPet', (data) => {
        handleBuyPet(io, socket, players, data);
    });

    // 2. Pet Shop Durumunu Sorgulama (Kullanıcının mevcut peti var mı?)
    socket.on('getPetShopStatus', () => {
        const player = players[socket.id];
        if (!player || !player.name) return;

        const uData = dataManager.persistentData.users[player.name] || {};
        const userMoney = uData.money !== undefined ? uData.money : (player.money || 0);

        const currentPet = petManager.getPetByUsername(player.name);
        const now = Date.now();
        let activePetInfo = null;

        if (currentPet && currentPet.expiresAt > now) {
            activePetInfo = {
                petType: currentPet.petType,
                name: currentPet.name,
                emoji: currentPet.emoji,
                remainingMs: currentPet.expiresAt - now
            };
        }

        socket.emit('petShopStatus', {
            money: userMoney,
            activePet: activePetInfo
        });
    });

    // 3. İsteğe Bağlı: Peti Serbest Bırakma / Yuvaya Gönderme
    socket.on('abandonPet', () => {
        const player = players[socket.id];
        if (!player || !player.name) return;

        const currentPet = petManager.getPetByUsername(player.name);
        if (currentPet) {
            petManager.despawnPet(player.name, 'abandoned');
            socket.emit('systemMessage', `🐾 ${currentPet.name} sevgiyle yuvasına uğurlandı.`);
        }
    });
}

function handleBuyPet(io, socket, players, data) {
    if (!data || !data.petType) {
        socket.emit('gameError', "Geçersiz evcil hayvan seçimi!");
        return;
    }

    const petType = data.petType.toLowerCase().trim();
    const config = petManager.PET_CONFIGS[petType];
    if (!config) {
        socket.emit('gameError', "Böyle bir evcil hayvan Pet Shop'ta bulunmuyor!");
        return;
    }

    const player = players[socket.id];
    if (!player || !player.name) {
        socket.emit('gameError', "Oyuncu bilgisi bulunamadı!");
        return;
    }

    const username = player.name;
    const uData = dataManager.persistentData.users[username];
    if (!uData) {
        socket.emit('gameError', "Kullanıcı verisi yüklenemedi!");
        return;
    }

    const userMoney = uData.money !== undefined ? uData.money : (player.money || 0);
    const cost = config.price;

    // Bakiye kontrolü
    if (userMoney < cost) {
        socket.emit('gameError', `Yetersiz bakiye! ${config.name} sahiplenmek için ${cost.toLocaleString()} TL gerekiyor. (Mevcut: ${userMoney.toLocaleString()} TL)`);
        return;
    }

    // Parayı tahsil et
    uData.money = userMoney - cost;
    player.money = uData.money;
    dataManager.savePersistentData();

    // Bakiye güncellemesini istemciye bildir
    socket.emit('moneyUpdate', player.money);

    // Evcil hayvanı oluştur ve odaya sal
    const newPet = petManager.spawnPet(socket.id, username, petType);

    // Başarı bildirimi
    socket.emit('buyPetSuccess', {
        success: true,
        pet: petManager.toPetDTO(newPet),
        message: `🎉 Tebrikler! ${config.name} (${config.emoji}) başarıyla sahiplenildi! 15 dakika boyunca yanından ayrılmayacak.`
    });

    socket.emit('systemMessage', `🐾 ${config.name} sahiplendin! (-${cost.toLocaleString()} TL). 15 dakika boyunca seninle gezecek.`);
}

=======

    // 1. Pet Shop Kataloğunu İste
    socket.on('getPetShopCatalog', () => {
        socket.emit('petShopCatalog', {
            pets: petManager.PET_CONFIGS,
            durationMs: petManager.PET_DURATION_MS
        });
    });

    // 2. Mekandaki Aktif Evcil Hayvanları İste
    socket.on('getCompanionPetsInRoom', () => {
        if (!players[socket.id]) return;
        const room = players[socket.id].room || 'cadde';
        socket.emit('activeCompanionPets', petManager.getPetsInRoom(room));
    });

    // 3. Evcil Hayvan Satın Alma (Kedi: 2000 TL, Köpek: 3000 TL, Fare: 1500 TL)
    socket.on('buyCompanionPet', (data) => {
        if (!players[socket.id]) {
            socket.emit('gameError', "Önce oyuna giriş yapmalısınız!");
            return;
        }

        const player = players[socket.id];
        const username = player.name;
        if (!username) {
            socket.emit('gameError', "Giriş yapılmış bir kullanıcı bulunamadı!");
            return;
        }

        const petType = data ? data.petType : null;
        const petConfig = petManager.PET_CONFIGS[petType];
        if (!petConfig) {
            socket.emit('gameError', "Geçersiz evcil hayvan seçimi!");
            return;
        }

        const uData = dataManager.persistentData.users[username];
        const currentMoney = (uData && uData.money !== undefined) ? uData.money : (player.money || 0);

        if (currentMoney < petConfig.price) {
            socket.emit('gameError', `Yetersiz bakiye! ${petConfig.name} almak için ${petConfig.price} TL gerekiyor. (Mevcut bakiyeniz: ${currentMoney} TL)`);
            return;
        }

        // Ücreti düş
        const newBalance = currentMoney - petConfig.price;
        if (uData) {
            uData.money = newBalance;
            dataManager.savePersistentData(username);
        }
        player.money = newBalance;
        socket.emit('moneyUpdate', newBalance);

        // Peti dünyada yarat
        const pet = petManager.spawnPet(socket.id, petType);

        // Başarılı satın alma bildirimi
        socket.emit('petPurchaseSuccess', {
            petType: petType,
            name: petConfig.name,
            price: petConfig.price,
            emoji: petConfig.emoji,
            balance: newBalance,
            pet: petManager.toPetDTO(pet)
        });
    });
}

>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
module.exports = {
    registerPetShopHandlers
};
