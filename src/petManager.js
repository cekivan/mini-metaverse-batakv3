// src/petManager.js - Sevimli Patiler Pet Shop Yoldaş (Companion Pet) Yöneticisi
// Kedi, Köpek ve Fare yoldaşlarının sunucu durum takibi, oda geçişleri ve senkronizasyonu

const activeCompanionPets = {}; // username -> petObject
const petExpireTimers = {};      // username -> Timeout
const petTalkIntervals = {};     // username -> Interval

let ioRef = null;
let playersRef = null;
let dataManagerRef = null;

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
        ]
    },
    dog: {
        type: 'dog',
        name: 'Sadık Köpek',
        emoji: '🐶',
        price: 3000,
        sayings: [
            "Hav hav! Seni koruyorum!",
            "Kuyruğum fırıl fırıl sallanıyor! 🐕",
            "En sadık dostun benim! ❤️",
            "Hadi biraz gezelim!",
            "Hav hav! Harikasın!"
        ]
    },
    mouse: {
        type: 'mouse',
        name: 'Hızlı Fare',
        emoji: '🐭',
        price: 1500,
        sayings: [
            "Cik cik! Peynir var mı? 🧀",
            "Buralarda kedi yok değil mi? 🐾",
            "Çok hızlıyım beni yakalayamazsın!",
            "Cik cik! Yanındayım!",
            "Peynir kokusu harika! 🧀"
        ]
    }
};

function init(io, players, dataManager) {
    ioRef = io;
    playersRef = players;
    dataManagerRef = dataManager;
}

/**
 * İstemcilere gönderilecek güvenli JSON nesnesi
 */
function toPetDTO(pet) {
    if (!pet) return null;
    return {
        id: pet.id,
        ownerId: pet.ownerId,
        ownerName: pet.ownerName,
        petType: pet.petType,
        name: pet.name,
        emoji: pet.emoji,
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
    };

    activeCompanionPets[username] = pet;

    // Süre bitim zamanlayıcısı (15 Dk)
    petExpireTimers[username] = setTimeout(() => {
        handlePetExpired(username);
    }, PET_DURATION_MS);

    // Rastgele sevimli konuşma / ses çıkarma döngüsü (Her 30-45 saniyede bir)
    startPetTalkLoop(username);

    // Odaya ve sahibine duyur
    if (ioRef) {
        ioRef.to(pet.room).emit('companionPetSpawned', {
            pet: toPetDTO(pet)
        });
    }

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

function despawnPet(key, reason = "") {
    let pet = activeCompanionPets[key];
    let username = key;
    if (!pet) {
        pet = getPetByOwnerId(key);
        if (pet) username = pet.ownerName;
    }
    if (!pet) return;

    if (petExpireTimers[username]) {
        clearTimeout(petExpireTimers[username]);
        delete petExpireTimers[username];
    }
    if (petTalkIntervals[username]) {
        clearInterval(petTalkIntervals[username]);
        delete petTalkIntervals[username];
    }

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
 * Oyuncu oda değiştirdiğinde peti de onunla beraber her yere gider
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
 * Kullanıcı yeniden bağlandığında süresi bitmemiş petini bağlar
 */
function handleLogin(socket, username) {
    if (!username) return;
    const pet = activeCompanionPets[username];
    if (pet && pet.expiresAt > Date.now()) {
        pet.ownerId = socket.id;
        const player = playersRef ? playersRef[socket.id] : null;
        if (player) {
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
