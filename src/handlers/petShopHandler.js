// src/handlers/petShopHandler.js - Pet Shop Satın Alım ve Soket Olayları Yöneticisi
const dataManager = require('../dataManager');
const petManager = require('../petManager');

function registerPetShopHandlers(io, socket, players) {

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

module.exports = {
    registerPetShopHandlers
};
