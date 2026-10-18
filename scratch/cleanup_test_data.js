const fs = require('fs');
const path = require('path');

const dataFile = path.resolve(__dirname, '../data.json');
const backupFile = path.resolve(__dirname, '../data.json.bak');
const preCleanBackup = path.resolve(__dirname, `../data.json.pre_clean_${Date.now()}.bak`);

if (!fs.existsSync(dataFile)) {
    console.error('data.json not found at:', dataFile);
    process.exit(1);
}

const rawData = fs.readFileSync(dataFile, 'utf8');
fs.writeFileSync(preCleanBackup, rawData, 'utf8');
console.log('Created pre-cleanup backup at:', preCleanBackup);

const data = JSON.parse(rawData);
const initialUserCount = Object.keys(data.users || {}).length;
const initialSizeKB = (Buffer.byteLength(rawData, 'utf8') / 1024).toFixed(2);

const KNOWN_REAL_USERS = new Set([
    'yasin', 'babake', 'rümeysa', 'ahmet', 'maltoroz',
    'denemelik', 'qwdqd', 'aşldkwşlqkd', 'taktukhamdi',
    'Black_Widow', 'deneme', 'mehmet', 'cemal', 'kadın', 'ceki'
]);

const TEST_PATTERNS = [
    /^test/i,
    /^user_bahis_/i,
    /^user_bot_/i,
    /^user_tavla_/i,
    /^user_takeover_/i,
    /^user_rot_/i,
    /^user_req_/i,
    /^user_\d+$/i,
    /^user[XYZ]_\d+/i,
    /^rot_test_/i,
    /^obs_test_/i,
    /^OkeyTest_/i,
    /^HouseBuyer_/i,
    /^perf_p/i,
    /^sel_rot_/i,
    /^bj_p/i,
    /^ahmet_\d{10,}/i,
    /^ayse_\d{10,}/i,
    /^atci_\d+/i,
    /^test_lounge_/i,
    /^narg_/i,
    /^nargile_t_/i,
    /^ganyan_t_/i,
    /^block_t_/i,
    /^haydar_/i,
    /^bill_p/i,
    /^petowner_/i,
    /^spectator_/i,
    /^dbg_/i,
    /^p\d_\d+/i,
    /^adUser_/i,
    /^smoothTest_/i,
    /^beach_t_/i,
    /^smoke_t_/i,
    /^v_user_/i,
    /^r_tester_/i,
    /^tavla_p\d_/i,
    /^tavla_human_/i,
    /^slot_tester_/i,
    /^tester_p\d_/i,
    /^billboard_tester_/i,
    /^gamer_\d+/i,
    /^slothost_/i,
    /^slotguest_/i,
    /^c2_tester_/i,
    /^oyuncu_\d+/i
];

function isTestUser(username) {
    if (KNOWN_REAL_USERS.has(username)) return false;
    return TEST_PATTERNS.some(p => p.test(username));
}

const cleanedUsers = {};
const removedUsers = [];
const removedHouses = [];

for (const [username, userData] of Object.entries(data.users || {})) {
    if (isTestUser(username)) {
        removedUsers.push(username);
        if (userData.house || (userData.houses && Object.keys(userData.houses).length > 0)) {
            const hTypes = userData.houses ? Object.keys(userData.houses) : (userData.house ? [userData.house.type] : []);
            removedHouses.push({ username, types: hTypes });
        }
    } else {
        cleanedUsers[username] = userData;
    }
}

// Clean any friend references to removed users (just in case)
for (const [username, userData] of Object.entries(cleanedUsers)) {
    if (Array.isArray(userData.friends)) {
        userData.friends = userData.friends.filter(f => {
            const fname = typeof f === 'string' ? f : (f ? f.username : '');
            return cleanedUsers[fname] !== undefined;
        });
    }
    if (Array.isArray(userData.friendRequests)) {
        userData.friendRequests = userData.friendRequests.filter(req => {
            const from = typeof req === 'string' ? req : (req ? req.from : '');
            return cleanedUsers[from] !== undefined;
        });
    }
}

// Clean leaderboard
if (data.leaderboard) {
    for (const gameKey of Object.keys(data.leaderboard)) {
        const board = data.leaderboard[gameKey];
        if (board && typeof board === 'object') {
            for (const u of Object.keys(board)) {
                // Keep bot names that start with emoji or real users
                if (!u.startsWith('🤖') && !cleanedUsers[u]) {
                    delete board[u];
                }
            }
        }
    }
}

data.users = cleanedUsers;

const cleanedJson = JSON.stringify(data, null, 2);
fs.writeFileSync(dataFile, cleanedJson, 'utf8');
fs.writeFileSync(backupFile, cleanedJson, 'utf8');

const finalSizeKB = (Buffer.byteLength(cleanedJson, 'utf8') / 1024).toFixed(2);
const finalUserCount = Object.keys(data.users).length;

console.log('\n--- TEMİZLİK RAPORU ---');
console.log(`İlk kullanıcı sayısı: ${initialUserCount}`);
console.log(`Silinen test kullanıcısı: ${removedUsers.length}`);
console.log(`Kalan gerçek kullanıcı: ${finalUserCount}`);
console.log(`Silinen test evleri (${removedHouses.length} adet):`, removedHouses.map(h => `${h.username} (${h.types.join(', ')})`).join(', '));
console.log(`Dosya boyutu: ${initialSizeKB} KB -> ${finalSizeKB} KB`);
console.log('Kalan kullanıcılar:', Object.keys(cleanedUsers).join(', '));
console.log('data.json ve data.json.bak başarıyla güncellendi.');
