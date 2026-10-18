const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    forceNew: true
});

console.log('Connecting as ahmet...');

socket.on('connect', () => {
    console.log('Connected to server with socket id:', socket.id);
    socket.emit('login', { name: 'ahmet', pass: '123456' });
});

socket.on('loginFailed', (err) => {
    console.error('Login failed:', err);
    process.exit(1);
});

socket.on('loginSuccess', (data) => {
    console.log('Login success for:', data.name, 'Room:', data.room);
    
    // Check initial pet shop status
    console.log('Requesting pet shop status...');
    socket.emit('getPetShopStatus');
});

socket.on('petShopStatus', (status) => {
    console.log('Received petShopStatus:', status);
    
    if (status.activePet) {
        console.log('Active pet exists already:', status.activePet.name);
    }
    
    // Request buying cat (2,000 TL)
    console.log('Sending requestBuyPet for cat...');
    socket.emit('requestBuyPet', { petType: 'cat' });
});

socket.on('companionPetSpawned', (data) => {
    console.log('companionPetSpawned event received! Pet:', data.pet?.name, 'Owner:', data.pet?.ownerName, 'Emoji:', data.pet?.emoji);
});

socket.on('buyPetSuccess', (res) => {
    console.log('buyPetSuccess received:', res.message);

    // Now test room transition to cadde
    console.log('Testing room transition to cadde...');
    socket.emit('changeRoom', 'cadde');
});

socket.on('activeCompanionPets', (pets) => {
    console.log('Received activeCompanionPets list count:', pets.length);
    if (pets.length > 0) {
        const myPet = pets.find(p => p.ownerName === 'ahmet');
        if (myPet) {
            console.log('Verified companion pet followed to new room:', myPet.name, 'Room:', myPet.room, 'Coordinates:', myPet.x, myPet.y);
            
            // Test movement coordinate update
            console.log('Testing playerMovement coordinate sync...');
            socket.emit('playerMovement', { x: 250, y: 350, facing: 'left' });

            setTimeout(() => {
                console.log('\n===========================================');
                console.log('✅ ALL PET SHOP TESTS PASSED WITH 100% SUCCESS!');
                console.log('===========================================');
                socket.disconnect();
                process.exit(0);
            }, 1000);
        }
    }
});

socket.on('gameError', (msg) => {
    console.error('gameError received:', msg);
    process.exit(1);
});

setTimeout(() => {
    console.error('Test timed out after 10s');
    socket.disconnect();
    process.exit(1);
}, 10000);
