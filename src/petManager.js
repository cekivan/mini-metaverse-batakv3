<<<<<<< HEAD
// src/petManager.js - Sevimli Patiler Pet Shop Yoldaş (Companion Pet) Yöneticisi
// Kedi, Köpek ve Fare yoldaşlarının sunucu durum takibi, oda geçişleri ve senkronizasyonu

const activeCompanionPets = {}; // username -> petObject
const petExpireTimers = {};      // username -> Timeout
const petTalkIntervals = {};     // username -> Interval
=======
// src/petManager.js - Mini Metaverse Evcil Hayvan (Pet) Yöneticisi
// Kedi, Köpek ve Fare yoldaşlarının sunucu durumunu, 15 dakikalık sürelerini ve takibini yönetir.

const activeCompanionPets = {};   // username -> petObject
const petExpireTimers = {};       // username -> Timeout
const petTalkIntervals = {};      // username -> Interval
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b

let ioRef = null;
let playersRef = null;
let dataManagerRef = null;

<<<<<<< HEAD
const PET_DURATION_MS = 15 * 60 * 1000; // 15 Dakika

const PET_CONFIGS = {
    cat: {
        type: 'cat',
        name: 'Sevimli Kedi',
        emoji: '🐱',
        price: 2000,
        sayings: [
            "Miyavv! ❤️",
            "Mırrr... keyfim yerinde!",
            "Beni sevdiğin için teşekkürler! 🐾",
            "Birlikte gezelim mi?",
            "Patilerim yumuşacık! 🧶"
=======
// Evcil Hayvan Özellikleri ve Fiyatları
const PET_CONFIGS = {
    cat: {
        type: 'cat',
        name: 'Kedi',
        price: 2000,
        emoji: '🐱',
        sayings: [
            "Miyavvv! 🐾",
            "Mırrrr... ❤️",
            "Süt var mı acaba? 🥛",
            "Tırmalarım ha! 😼",
            "Beni sevdin mi? ✨",
            "Güneşlenmek çok güzel... ☀️",
            "Miyav! Biraz başımı okşa."
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
        ]
    },
    dog: {
        type: 'dog',
<<<<<<< HEAD
        name: 'Sadık Köpek',
        emoji: '🐶',
        price: 3000,
        sayings: [
            "Hav hav! Seni koruyorum!",
            "Kuyruğum fırıl fırıl sallanıyor! 🐕",
            "En sadık dostun benim! ❤️",
            "Hadi biraz gezelim!",
            "Hav hav! Harikasın!"
=======
        name: 'Köpek',
        price: 3000,
        emoji: '🐶',
        sayings: [
            "Hav hav! 🐶",
            "Seni çok seviyorum! ❤️",
            "Kemik nerede? 🦴",
            "Kurt gibi sadığım! 🐕",
            "Birlikte koşalım mı? 🎾",
            "Kuyruğumu yakalayamıyorum!",
            "Hav hav! Hep yanındayım!"
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
        ]
    },
    mouse: {
        type: 'mouse',
<<<<<<< HEAD
        name: 'Hızlı Fare',
        emoji: '🐭',
        price: 1500,
        sayings: [
            "Cik cik! Peynir var mı? 🧀",
            "Buralarda kedi yok değil mi? 🐾",
            "Çok hızlıyım beni yakalayamazsın!",
            "Cik cik! Yanındayım!",
            "Peynir kokusu harika! 🧀"
=======
        name: 'Fare',
        price: 1500,
        emoji: '🐭',
        sayings: [
            "Peynirim nerede? 🧀",
            "Cik cik! Delik çok yakın! 🐭",
            "Şaman bir köprü atsana! ⚡",
            "Peyniri kaptım, kaçıyorum! 🧀💨",
            "Transformice hızım yerinde! 🚀",
            "Cik cik! Cebinde peynir var mı?",
            "Kulağımdaki peyniri sakın yeme! 🧀"
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
        ]
    }
};

<<<<<<< HEAD
=======
const PET_DURATION_MS = 15 * 60 * 1000; // 15 Dakika

>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
function init(io, players, dataManager) {
    ioRef = io;
    playersRef = players;
    dataManagerRef = dataManager;
}

/**
<<<<<<< HEAD
 * İstemcilere gönderilecek güvenli JSON nesnesi
=======
 * Socket.IO ile istemcilere gönderilmeden önce Timer/Döngüsel referanslardan
 * arındırılmış temiz DTO nesnesi döndürür.
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
 */
function toPetDTO(pet) {
    if (!pet) return null;
    return {
        id: pet.id,
        ownerId: pet.ownerId,
        ownerName: pet.ownerName,
        petType: pet.petType,
        name: pet.name,
<<<<<<< HEAD
        emoji: pet.emoji,
=======
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
        room: pet.room,
        x: pet.x,
        y: pet.y,
        facing: pet.facing || 'down',
        speech: pet.speech || null,
        speechUntil: pet.speechUntil || 0,
        expiresAt: pet.expiresAt,
        durationMs: pet.durationMs,
        createdAt: pet.createdAt
    };
}

function getActivePets() {
    return activeCompanionPets;
}

function getPetsInRoom(roomName) {
    const list = [];
    const now = Date.now();
    for (const u in activeCompanionPets) {
        const pet = activeCompanionPets[u];
        if (pet && pet.room === roomName && pet.expiresAt > now) {
            list.push(toPetDTO(pet));
        }
    }
    return list;
}

function getPetByOwnerId(ownerId) {
    for (const u in activeCompanionPets) {
        if (activeCompanionPets[u].ownerId === ownerId) {
            return activeCompanionPets[u];
        }
    }
    return null;
}

function getPetByUsername(username) {
    return activeCompanionPets[username] || null;
}

/**
<<<<<<< HEAD
 * Yeni bir evcil hayvan sahiplenildiğinde oluşturur
 */
function spawnPet(ownerId, username, petType) {
    const config = PET_CONFIGS[petType] || PET_CONFIGS.cat;
    const player = playersRef ? playersRef[ownerId] : null;
    if (!player) return null;

    // Eğer halihazırda aktif bir peti varsa eskisini temizle
    if (activeCompanionPets[username]) {
        despawnPet(username, "new_pet_bought");
    }

    const now = Date.now();
    const expiresAt = now + PET_DURATION_MS;

    const pet = {
        id: `pet_${username}_${Date.now()}`,
        ownerId: ownerId,
        ownerName: username,
        petType: config.type,
        name: config.name,
        emoji: config.emoji,
        room: player.room || 'cadde',
        x: player.x + 24,
        y: player.y + 6,
        facing: 'down',
        speech: `${config.name} seni çok sevdi! 🐾`,
        speechUntil: now + 5000,
        expiresAt: expiresAt,
        durationMs: PET_DURATION_MS,
        createdAt: now
=======
 * Bir oyuncuya yeni evcil hayvan çağırır
 */
function spawnPet(ownerId, petType) {
    if (!playersRef || !playersRef[ownerId]) return null;
    const player = playersRef[ownerId];
    const username = player.name;
    const room = player.room || 'cadde';
    const cfg = PET_CONFIGS[petType];
    if (!cfg) return null;

    // Eğer zaten bir evcil hayvanı varsa yenisi için eskisi temizlensin
    if (activeCompanionPets[username]) {
        despawnPet(username, "Yeni pet alındı");
    }

    const petId = `pet_${petType}_${ownerId}_${Date.now()}`;
    const petDisplayName = `${username}'in ${cfg.name}si`;
    const spawnX = (player.x || 400) + 26;
    const spawnY = (player.y || 300) + 6;

    const pet = {
        id: petId,
        ownerId: ownerId,
        ownerName: username,
        petType: petType,
        name: petDisplayName,
        room: room,
        x: spawnX,
        y: spawnY,
        facing: 'down',
        createdAt: Date.now(),
        durationMs: PET_DURATION_MS,
        expiresAt: Date.now() + PET_DURATION_MS,
        speech: `${cfg.emoji} Merhaba!`,
        speechUntil: Date.now() + 6000
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
    };

    activeCompanionPets[username] = pet;

<<<<<<< HEAD
    // Süre bitim zamanlayıcısı (15 Dk)
    petExpireTimers[username] = setTimeout(() => {
        handlePetExpired(username);
    }, PET_DURATION_MS);

    // Rastgele sevimli konuşma / ses çıkarma döngüsü (Her 30-45 saniyede bir)
    startPetTalkLoop(username);

    // Odaya ve sahibine duyur
    if (ioRef) {
        ioRef.to(pet.room).emit('companionPetSpawned', {
=======
    // Odaya duyur
    if (ioRef) {
        ioRef.to(room).emit('systemMessage', `🐾 ${username}, sevimli bir ${cfg.name} edindi!`);
        ioRef.to(room).emit('companionPetSpawned', {
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
            pet: toPetDTO(pet)
        });
    }

<<<<<<< HEAD
    return pet;
}

function startPetTalkLoop(username) {
    if (petTalkIntervals[username]) {
        clearInterval(petTalkIntervals[username]);
    }

    petTalkIntervals[username] = setInterval(() => {
        const pet = activeCompanionPets[username];
        if (!pet) return;

        const config = PET_CONFIGS[pet.petType] || PET_CONFIGS.cat;
        const sayings = config.sayings;
        const randomSpeech = sayings[Math.floor(Math.random() * sayings.length)];

        pet.speech = randomSpeech;
        pet.speechUntil = Date.now() + 6000;

        if (ioRef && pet.room) {
            ioRef.to(pet.room).emit('companionPetSpeak', {
                petId: pet.id,
                ownerId: pet.ownerId,
                speech: pet.speech
            });
        }
    }, 35000);
}

function handlePetExpired(username) {
    const pet = activeCompanionPets[username];
    if (!pet) return;

    if (ioRef && pet.ownerId) {
        ioRef.to(pet.ownerId).emit('companionPetExpired', {
            petType: pet.petType,
            message: `⏳ ${pet.name} ile olan 15 dakikalık süren doldu ve yuvasına döndü.`
        });
    }

    despawnPet(username, "expired");
}

=======
    // 1. PERİYODİK PET SESLERİ (Her 45 saniyede bir sevimli miyav/hav/cik)
    petTalkIntervals[username] = setInterval(() => {
        triggerRandomPetTalk(username);
    }, 45000);

    // 2. 15 DAKİKA SONRA VEDA VE DESPAWN
    petExpireTimers[username] = setTimeout(() => {
        despawnPet(username, "15 dakikalık süre doldu");
    }, PET_DURATION_MS);

    return pet;
}

/**
 * Petin rastgele konuşması
 */
function triggerRandomPetTalk(username) {
    const pet = activeCompanionPets[username];
    if (!pet || Date.now() >= pet.expiresAt) return;

    const cfg = PET_CONFIGS[pet.petType];
    if (!cfg || !cfg.sayings || cfg.sayings.length === 0) return;

    const chosen = cfg.sayings[Math.floor(Math.random() * cfg.sayings.length)];
    pet.speech = chosen;
    pet.speechUntil = Date.now() + 7000;

    if (ioRef && pet.room) {
        ioRef.to(pet.room).emit('companionPetSpeak', {
            petId: pet.id,
            ownerId: pet.ownerId,
            speech: pet.speech
        });
    }
}

/**
 * Peti haritadan kaldırır
 */
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
function despawnPet(key, reason = "") {
    let pet = activeCompanionPets[key];
    let username = key;
    if (!pet) {
        pet = getPetByOwnerId(key);
        if (pet) username = pet.ownerName;
    }
    if (!pet) return;

<<<<<<< HEAD
    if (petExpireTimers[username]) {
        clearTimeout(petExpireTimers[username]);
        delete petExpireTimers[username];
    }
=======
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
    if (petTalkIntervals[username]) {
        clearInterval(petTalkIntervals[username]);
        delete petTalkIntervals[username];
    }
<<<<<<< HEAD
=======
    if (petExpireTimers[username]) {
        clearTimeout(petExpireTimers[username]);
        delete petExpireTimers[username];
    }
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b

    if (ioRef && pet.room) {
        ioRef.to(pet.room).emit('companionPetDespawned', {
            petId: pet.id,
            ownerId: pet.ownerId,
            reason: reason
        });
    }

    delete activeCompanionPets[username];
}

/**
<<<<<<< HEAD
 * Oyuncu oda değiştirdiğinde peti de onunla beraber her yere gider
=======
 * Oyuncu oda değiştirdiğinde peti de onunla beraber her mekana gider
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
 */
function handleRoomChange(ownerId, oldRoom, newRoom) {
    const pet = getPetByOwnerId(ownerId);
    if (!pet) return;

    if (ioRef && oldRoom && oldRoom !== newRoom) {
        ioRef.to(oldRoom).emit('companionPetDespawned', {
            petId: pet.id,
            ownerId: ownerId,
            reason: 'room_change'
        });
    }

    pet.room = newRoom;
    const player = playersRef ? playersRef[ownerId] : null;
    if (player) {
        pet.x = player.x + 24;
        pet.y = player.y + 6;
    }

    if (ioRef && newRoom) {
        ioRef.to(newRoom).emit('companionPetSpawned', {
            pet: toPetDTO(pet)
        });
    }
<<<<<<< HEAD

=======
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
    if (ioRef && ownerId) {
        ioRef.to(ownerId).emit('companionPetSpawned', {
            pet: toPetDTO(pet)
        });
    }
}

/**
 * Sahip yürüdükçe pet koordinatını günceller
 */
function updateOwnerPosition(ownerId, x, y) {
    const pet = getPetByOwnerId(ownerId);
    if (!pet) return;
    pet.x = x + 24;
    pet.y = y + 6;
}

/**
<<<<<<< HEAD
 * Kullanıcı yeniden bağlandığında süresi bitmemiş petini bağlar
=======
 * Oyuncu yeniden bağlandığında süresi bitmemiş petini geri bağlar
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
 */
function handleLogin(socket, username) {
    if (!username) return;
    const pet = activeCompanionPets[username];
    if (pet && pet.expiresAt > Date.now()) {
        pet.ownerId = socket.id;
        const player = playersRef ? playersRef[socket.id] : null;
        if (player) {
<<<<<<< HEAD
            pet.room = player.room || 'sokak';
            pet.x = player.x + 24;
            pet.y = player.y + 6;
        }

        setTimeout(() => {
            if (ioRef && pet.room) {
                ioRef.to(pet.room).emit('companionPetSpawned', {
                    pet: toPetDTO(pet)
                });
            }
        }, 600);
    }
}

function handleDisconnect(ownerId) {
    // Kullanıcı bağlantısı kesilirse süresi dolana kadar nesne bellekte kalır, sadece odadan çıkarılır
    const pet = getPetByOwnerId(ownerId);
    if (pet) {
        if (ioRef && pet.room) {
            ioRef.to(pet.room).emit('companionPetDespawned', {
                petId: pet.id,
                ownerId: ownerId,
                reason: 'disconnect'
            });
        }
        pet.ownerId = null;
=======
            pet.room = player.room || 'cadde';
            pet.x = player.x + 24;
            pet.y = player.y + 6;
        }
        socket.emit('companionPetSpawned', { pet: toPetDTO(pet) });
        if (ioRef && pet.room) {
            ioRef.to(pet.room).emit('companionPetSpawned', { pet: toPetDTO(pet) });
        }
    }
}

/**
 * Oyuncu ayrıldığında
 */
function handleDisconnect(ownerId) {
    const pet = getPetByOwnerId(ownerId);
    if (!pet) return;

    if (ioRef && pet.room) {
        ioRef.to(pet.room).emit('companionPetDespawned', {
            petId: pet.id,
            ownerId: ownerId,
            reason: 'Oyuncu ayrıldı'
        });
>>>>>>> 64a17288a360563a489a99fd0bb3bea7bb8cdf6b
    }
}

module.exports = {
    PET_CONFIGS,
    PET_DURATION_MS,
    init,
    toPetDTO,
    getActivePets,
    getPetsInRoom,
    getPetByOwnerId,
    getPetByUsername,
    spawnPet,
    despawnPet,
    handleRoomChange,
    updateOwnerPosition,
    handleLogin,
    handleDisconnect
};
