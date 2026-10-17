const AudioContextClass = (typeof window !== 'undefined') ? (window.AudioContext || window.webkitAudioContext) : null;
const audioCtx = AudioContextClass ? new AudioContextClass() : null;

// Ana Ses Düzeyi Yöneticisi (Settings Paneli ile Senkron)
const sfxGainNode = audioCtx ? audioCtx.createGain() : null;
if (sfxGainNode && audioCtx) sfxGainNode.connect(audioCtx.destination);

const musicGainNode = audioCtx ? audioCtx.createGain() : null;
if (musicGainNode && audioCtx) musicGainNode.connect(audioCtx.destination);

let sfxVolume = parseFloat((typeof localStorage !== 'undefined' ? localStorage.getItem('mm_sfxVolume') : null) ?? '0.8');
let musicVolume = parseFloat((typeof localStorage !== 'undefined' ? localStorage.getItem('mm_musicVolume') : null) ?? '0.7');
if (sfxGainNode && audioCtx) sfxGainNode.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
if (musicGainNode && audioCtx) musicGainNode.gain.setValueAtTime(musicVolume, audioCtx.currentTime);

function setSfxVolume(val) {
    sfxVolume = Math.max(0, Math.min(1, val));
    localStorage.setItem('mm_sfxVolume', sfxVolume);
    if (sfxGainNode) sfxGainNode.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
}
window.setSfxVolume = setSfxVolume;

function setMusicVolume(val) {
    musicVolume = Math.max(0, Math.min(1, val));
    localStorage.setItem('mm_musicVolume', musicVolume);
    if (musicGainNode) musicGainNode.gain.setValueAtTime(musicVolume, audioCtx.currentTime);
}
window.setMusicVolume = setMusicVolume;

window.getAudioSettings = () => ({ sfx: sfxVolume, music: musicVolume });

// Pre-generated SFX Noise Buffers (Performans & Sıfır GC Havuzlama)
let cardNoiseBuffer = null;
let splashNoiseBuffer = null;

function initNoiseBuffers() {
    if (!audioCtx) return;
    try {
        let sampleRate = audioCtx.sampleRate || 44100;
        // Kart hışırtısı tamponu (0.08s)
        let cSize = Math.floor(sampleRate * 0.08);
        cardNoiseBuffer = audioCtx.createBuffer(1, cSize, sampleRate);
        if (cardNoiseBuffer && typeof cardNoiseBuffer.getChannelData === 'function') {
            let cData = cardNoiseBuffer.getChannelData(0);
            if (cData) {
                for (let i = 0; i < cSize; i++) {
                    cData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (cSize * 0.3));
                }
            }
        }

        // Su şapırtısı tamponu (0.22s)
        let sSize = Math.floor(sampleRate * 0.22);
        splashNoiseBuffer = audioCtx.createBuffer(1, sSize, sampleRate);
        if (splashNoiseBuffer && typeof splashNoiseBuffer.getChannelData === 'function') {
            let sData = splashNoiseBuffer.getChannelData(0);
            if (sData) {
                for (let i = 0; i < sSize; i++) {
                    sData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sSize * 0.35));
                }
            }
        }
    } catch (e) {
        console.warn("Noise buffer havuzlama uyarısı:", e);
    }
}
try { initNoiseBuffers(); } catch (_) {}

// Nostaljik Gramofon Melodi Döngüsü
let gramophoneLoopInterval = null;
let isGramophonePlaying = false;

function playGramophoneMusic() {
    if (isGramophonePlaying) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    isGramophonePlaying = true;

    // Nostaljik Retro Melodi Notaları (Frekanslar ve Vuruşlar)
    const melodyNotes = [
        392.00, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00,
        349.23, 392.00, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00,
        329.63, 392.00, 440.00, 523.25, 659.25, 783.99, 659.25, 523.25,
        587.33, 659.25, 587.33, 523.25, 440.00, 392.00, 329.63, 261.63
    ];
    let noteIdx = 0;

    function playNextNote() {
        if (!isGramophonePlaying) return;
        let freq = melodyNotes[noteIdx % melodyNotes.length];
        noteIdx++;

        let now = audioCtx.currentTime;
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();

        // Hafif nostaljik plak/müzik kutusu tınısı (warm sine + slight vibrato)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(musicGainNode);

        osc.start(now);
        osc.stop(now + 0.40);
    }

    playNextNote();
    gramophoneLoopInterval = setInterval(playNextNote, 240);
}
window.playGramophoneMusic = playGramophoneMusic;

function stopGramophoneMusic() {
    isGramophonePlaying = false;
    if (gramophoneLoopInterval) {
        clearInterval(gramophoneLoopInterval);
        gramophoneLoopInterval = null;
    }
}
window.stopGramophoneMusic = stopGramophoneMusic;

// Kullanıcı etkileşiminde (tıklama/tuş) AudioContext'i otomatik uyandırma
const unlockAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};
['click', 'keydown', 'touchstart'].forEach(evt => window.addEventListener(evt, unlockAudio, { once: true, passive: true }));

function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    try {
        if (type === 'footstep') {
            // Ritmik, hafif ve doğal zemin adım sesi
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100 + Math.random() * 25, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.035);

            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

            osc.connect(gain);
            gain.connect(sfxGainNode);
            osc.start(now);
            osc.stop(now + 0.04);
        }
        else if (type === 'card') {
            // İskambil kart atma / hışırtı sesi (Havuzlanmış tampon)
            if (!cardNoiseBuffer) initNoiseBuffers();
            let noise = audioCtx.createBufferSource();
            noise.buffer = cardNoiseBuffer;
            let filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.Q.setValueAtTime(2, now);

            let gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(sfxGainNode);
            noise.start(now);
        }
        else if (type === 'billiardHit' || type === 'billiard_hit') {
            // Bilardo toplarının çarpışma sesi (Önce assets/sounds/billiard_hit.mp3 dener, yoksa masif reçine akustik sentezine geçer)
            playCasinoSound('billiardHit');
        }
        else if (type === 'cueShoot') {
            // Istaka vuruş sesi (cue_shoot.mp3 veya deri uç akustik darbesi)
            playCasinoSound('cueShoot');
        }
        else if (type === 'pocket') {
            // Topun cebe düşme sesi (billiard_pocket.mp3 veya derin cep tok sesi)
            playCasinoSound('pocket');
        }
        else if (type === 'chatPop') {
            // Sohbet balonu patlama sesi
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(950, now + 0.06);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

            osc.connect(gain);
            gain.connect(sfxGainNode);
            osc.start(now);
            osc.stop(now + 0.07);
        }
        else if (type === 'win') {
            // El kazanma sevinç melodisi
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.2, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.2);
            });
        }
        else if (type === 'splash') {
            // Su şapırtısı sesi (balık vurma / olta atma - Havuzlanmış tampon)
            if (!splashNoiseBuffer) initNoiseBuffers();
            let noise = audioCtx.createBufferSource();
            noise.buffer = splashNoiseBuffer;
            let filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(550, now);
            filter.frequency.exponentialRampToValueAtTime(90, now + 0.22);
            let gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.45, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(sfxGainNode);
            noise.start(now);
        }
        else if (type === 'reel') {
            // Olta sarma dişli tıkırtısı
            for (let i = 0; i < 5; i++) {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1300 + i * 160, now + i * 0.04);
                gain.gain.setValueAtTime(0.18, now + i * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.025);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + i * 0.04);
                osc.stop(now + i * 0.04 + 0.025);
            }
        }
        else if (type === 'coin') {
            // Para kazanma şıngırtısı
            [1046.50, 1318.51, 1567.98].forEach((freq, idx) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                gain.gain.setValueAtTime(0.25, now + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + idx * 0.06);
                osc.stop(now + idx * 0.06 + 0.2);
            });
        }
        else if (type === 'okeyTile') {
            // Okey taşı vurma / çekme / masaya atma sesi (tok melamin 'tak' sesi)
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(860, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(sfxGainNode);
            osc.start(now);
            osc.stop(now + 0.05);
        }
        else if (type === 'tick') {
            // Süre sayacı tik-tak sesi
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            osc.connect(gain);
            gain.connect(sfxGainNode);
            osc.start(now);
            osc.stop(now + 0.03);
        }
        else if (type === 'fanfare') {
            // Zafer & Okey Bitiş Fanfarı
            [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.09);
                gain.gain.setValueAtTime(0.3, now + idx * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + idx * 0.09);
                osc.stop(now + idx * 0.09 + 0.35);
            });
        }
        else if (type === 'miracle') {
            // Mucizevi İlahi Göksel İniş Melodisi (Harp / Celestial Chime)
            [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                gain.gain.setValueAtTime(0.22, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.5);
            });
        }
        else if (type === 'nom' || type === 'gulp') {
            // Çizgi film "Ham / Çomp / Yutma" Komik Sesi
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.exponentialRampToValueAtTime(650, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(gain);
            gain.connect(sfxGainNode);
            osc.start(now);
            osc.stop(now + 0.2);
        }
        else if (type === 'turn' || type === 'turnBell') {
            // Kullanıcı Talebi: Oyunlardaki gibi sıranın geldiğini bildiren iki tonlu şık ding-dong melodisi
            [880.00, 1174.66].forEach((freq, idx) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                gain.gain.setValueAtTime(0.3, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.35);
            });
        }
        else if (type === 'smokeBlast') {
            // Yoğun nargile dumanı patlama ve gürleme efekti
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.5);
            gain.gain.setValueAtTime(0.45, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.connect(gain);
            gain.connect(sfxGainNode);
            osc.start(now);
            osc.stop(now + 0.5);
        }
        else if (CASINO_SOUND_FILES[type] || ['chip', 'wheel', 'roulette_spin', 'bet_start', 'card_deal', 'lose', 'spin', 'slot_spin', 'jackpot'].includes(type)) {
            playCasinoSound(type);
        }
    } catch(e) {
        // Tarayıcı otomatik ses engeli durumunda sessizce devam eder
    }
}

window.playSound = playSound;

// ============================================================================
// KAPSAMLI CASINO SES SİSTEMİ (public/assets/sounds/ Desteği & Web Audio Fallback)
// ============================================================================
const CASINO_SOUND_FILES = {
    'chip': 'chip.mp3',
    'wheel': 'wheel.mp3',
    'roulette_spin': 'wheel.mp3',
    'bet_start': 'bet_start.mp3',
    'card_deal': 'card_deal.mp3',
    'deal': 'card_deal.mp3',
    'win': 'win.mp3',
    'lose': 'lose.mp3',
    'spin': 'spin.mp3',
    'slot_spin': 'spin.mp3',
    'jackpot': 'jackpot.mp3',
    'billiardHit': 'billiard_hit.mp3',
    'billiard_hit': 'billiard_hit.mp3',
    'billiard': 'billiard_hit.mp3',
    'cueShoot': 'cue_shoot.mp3',
    'pocket': 'billiard_pocket.mp3'
};

const activeAudioInstances = {};
const soundAvailabilityCache = {};

/**
 * Casino & Oyun sesini 'public/assets/sounds/' klasöründen oynatır.
 * Eğer dosya henüz eklenmemişse veya yüklenemezse otomatik olarak
 * zengin Web Audio API sentezleyicisi (Synthesizer Fallback) ile çalar.
 */
function playCasinoSound(soundName, options = {}) {
    const fileName = CASINO_SOUND_FILES[soundName] || (soundName + '.mp3');

    // Eğer bu dosyanın diskte olmadığı daha önce tespit edildiyse doğrudan sentezleyiciye geç (0ms gecikme)
    if (soundAvailabilityCache[fileName] === false) {
        playSynthesizedCasinoSound(soundName);
        return;
    }

    const soundPath = `assets/sounds/${fileName}`;
    const vol = (options.volume !== undefined) ? options.volume : sfxVolume;

    try {
        let audio = new Audio(soundPath);
        audio.volume = Math.max(0, Math.min(1, vol));

        if (options.loop) {
            audio.loop = true;
        }

        activeAudioInstances[soundName] = audio;

        let playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                soundAvailabilityCache[fileName] = true;
            }).catch(err => {
                soundAvailabilityCache[fileName] = false;
                playSynthesizedCasinoSound(soundName);
            });
        }
    } catch (e) {
        soundAvailabilityCache[fileName] = false;
        playSynthesizedCasinoSound(soundName);
    }
}
window.playCasinoSound = playCasinoSound;

function stopCasinoSound(soundName) {
    if (activeAudioInstances[soundName]) {
        try {
            activeAudioInstances[soundName].pause();
            activeAudioInstances[soundName].currentTime = 0;
        } catch (e) {}
        delete activeAudioInstances[soundName];
    }
}
window.stopCasinoSound = stopCasinoSound;

/**
 * Web Audio API ile gerçekçi casino ses sentezleme motoru (Fallback & Zero-dependency)
 */
function playSynthesizedCasinoSound(name) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    try {
        if (name === 'chip') {
            // Gerçekçi seramik casino çipi çarpışma ve masaya konma sesi (çift klik)
            [0, 0.025].forEach((delay, idx) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(2600 + idx * 600, now + delay);
                osc.frequency.exponentialRampToValueAtTime(700, now + delay + 0.035);
                gain.gain.setValueAtTime(0.28, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + delay);
                osc.stop(now + delay + 0.045);
            });
        }
        else if (name === 'wheel' || name === 'roulette_spin') {
            // Rulet çarkı dönüşü ve topun metal bölmelere sürtünme pıtırtısı
            for (let i = 0; i < 28; i++) {
                let t = now + (i * 0.04) + Math.pow(i / 28, 2.2) * 2.8;
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2200 - i * 35, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.015);
                gain.gain.setValueAtTime(0.18 * (1 - i / 32), t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(t);
                osc.stop(t + 0.025);
            }
        }
        else if (name === 'bet_start') {
            // Tur başlangıcı / Bahis açılış zili (Zarif iki tonlu pirinç çan melodisi)
            [659.25, 830.61].forEach((freq, idx) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                gain.gain.setValueAtTime(0.3, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.5);
            });
        }
        else if (name === 'card_deal' || name === 'deal') {
            // İskambil kart çekme / dağıtma 'fışşt' sesi
            if (!cardNoiseBuffer) initNoiseBuffers();
            let noise = audioCtx.createBufferSource();
            noise.buffer = cardNoiseBuffer;
            let filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.Q.setValueAtTime(2.5, now);
            let gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(sfxGainNode);
            noise.start(now);
        }
        else if (name === 'win') {
            // Casino kazanç zafer akoru ve parıldayan altın melodisi
            [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.32, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.35);
            });
        }
        else if (name === 'lose') {
            // Casino el kaybetme hafif hüzünlü bas akoru
            [349.23, 311.13, 261.63, 196.00].forEach((freq, idx) => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.11);
                gain.gain.setValueAtTime(0.24, now + idx * 0.11);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.3);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + idx * 0.11);
                osc.stop(now + idx * 0.11 + 0.32);
            });
        }
        else if (name === 'spin' || name === 'slot_spin') {
            // Slot makara dönüşü tıkır tıkır dişli mekanizma sesi
            for (let i = 0; i < 12; i++) {
                let t = now + i * 0.06;
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(900 + (i % 3) * 120, t);
                gain.gain.setValueAtTime(0.18, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(t);
                osc.stop(t + 0.035);
            }
        }
        else if (name === 'jackpot') {
            // 🌟 BÜYÜK COŞKULU GLOBAL JACKPOT KUTLAMA FANFARI 🌟
            // 1. Bas ve Tiz Fanfar Akorları
            const fanfare = [
                { f: 523.25, d: 0.00 }, { f: 659.25, d: 0.00 }, { f: 783.99, d: 0.00 }, // C Maj
                { f: 659.25, d: 0.16 }, { f: 783.99, d: 0.16 }, { f: 987.77, d: 0.16 }, // E Maj
                { f: 783.99, d: 0.32 }, { f: 1046.50, d: 0.32 }, { f: 1318.51, d: 0.32 }, // G-C-E
                { f: 1046.50, d: 0.50 }, { f: 1318.51, d: 0.50 }, { f: 1567.98, d: 0.50 }, { f: 2093.00, d: 0.50 } // Yüksek Zafer Akoru
            ];

            fanfare.forEach(note => {
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(note.f, now + note.d);
                gain.gain.setValueAtTime(0.28, now + note.d);
                gain.gain.exponentialRampToValueAtTime(0.001, now + note.d + 0.45);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + note.d);
                osc.stop(now + note.d + 0.48);
            });

            // 2. Altın Sikke / Para Yağmuru Pırıltısı (Coin Shower Arpeggio)
            for (let c = 0; c < 16; c++) {
                let coinDelay = 0.55 + c * 0.055;
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1400 + Math.random() * 800, now + coinDelay);
                gain.gain.setValueAtTime(0.25, now + coinDelay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + coinDelay + 0.18);
                osc.connect(gain);
                gain.connect(sfxGainNode);
                osc.start(now + coinDelay);
                osc.stop(now + coinDelay + 0.2);
            }
        }
        else if (name === 'billiardHit' || name === 'billiard_hit' || name === 'billiard') {
            playRealisticBilliardHit(now);
        }
        else if (name === 'cueShoot') {
            playRealisticCueShoot(now);
        }
        else if (name === 'pocket') {
            playRealisticPocket(now);
        }
    } catch (e) {}
}

/**
 * 🎱 GERÇEKÇİ AKUSTİK BİLARDO TOPU ÇARPIŞMA SENTEZLEYİCİSİ (Aramith Phenolic Resin Acoustics)
 */
function playRealisticBilliardHit(now) {
    if (!audioCtx) return;
    const t = now || audioCtx.currentTime;

    // Doğal akustik çeşitlilik (Her çarpışma farklı bir açı ve güçtedir)
    const jitter = (Math.random() - 0.5) * 80;
    const crackFreq = 3400 + jitter * 2;
    const bodyFreq1 = 1180 + jitter;
    const bodyFreq2 = 2450 + jitter * 1.5;

    // 1. Sert Fenolik Reçine Çarpışma Transient'i (Aramith 'CRACK' İmpulsu - 3400Hz -> 1400Hz)
    let oscCrack = audioCtx.createOscillator();
    let gainCrack = audioCtx.createGain();
    oscCrack.type = 'triangle';
    oscCrack.frequency.setValueAtTime(crackFreq, t);
    oscCrack.frequency.exponentialRampToValueAtTime(1400, t + 0.008);

    gainCrack.gain.setValueAtTime(0.55, t);
    gainCrack.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

    oscCrack.connect(gainCrack);
    gainCrack.connect(sfxGainNode);
    oscCrack.start(t);
    oscCrack.stop(t + 0.015);

    // 2. Masif Reçine Gövde Tınlaması (Katı Küre Rezonansı - 1180 Hz)
    let oscBody1 = audioCtx.createOscillator();
    let gainBody1 = audioCtx.createGain();
    oscBody1.type = 'sine';
    oscBody1.frequency.setValueAtTime(bodyFreq1, t);
    oscBody1.frequency.exponentialRampToValueAtTime(bodyFreq1 * 0.88, t + 0.045);

    gainBody1.gain.setValueAtTime(0.35, t);
    gainBody1.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    oscBody1.connect(gainBody1);
    gainBody1.connect(sfxGainNode);
    oscBody1.start(t);
    oscBody1.stop(t + 0.05);

    // 3. Yüksek Cam/Seramik Parlaklığı (Harmonik Rezonans - 2450 Hz)
    let oscBody2 = audioCtx.createOscillator();
    let gainBody2 = audioCtx.createGain();
    oscBody2.type = 'triangle';
    oscBody2.frequency.setValueAtTime(bodyFreq2, t);
    oscBody2.frequency.exponentialRampToValueAtTime(1800, t + 0.025);

    gainBody2.gain.setValueAtTime(0.25, t);
    gainBody2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    oscBody2.connect(gainBody2);
    gainBody2.connect(sfxGainNode);
    oscBody2.start(t);
    oscBody2.stop(t + 0.035);

    // 4. Çuha ve Mermer Masa Tokluğu (170 gramlık ağır topun fiziksel ağırlık hissi - Low-End Thump)
    let oscThud = audioCtx.createOscillator();
    let gainThud = audioCtx.createGain();
    oscThud.type = 'sine';
    oscThud.frequency.setValueAtTime(220 + (Math.random() - 0.5) * 30, t);
    oscThud.frequency.exponentialRampToValueAtTime(75, t + 0.04);

    gainThud.gain.setValueAtTime(0.42, t);
    gainThud.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    oscThud.connect(gainThud);
    gainThud.connect(sfxGainNode);
    oscThud.start(t);
    oscThud.stop(t + 0.045);
}

/**
 * 🎱 ISTAKA VURUŞ SESİ (Leather Cue Tip Impact)
 */
function playRealisticCueShoot(now) {
    if (!audioCtx) return;
    const t = now || audioCtx.currentTime;

    // Deri tebeşirli ıstaka ucu darbesi
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.05);

    gain.gain.setValueAtTime(0.48, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    osc.connect(gain);
    gain.connect(sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.06);

    // Ahşap gövde şaft titreşimi
    let oscWood = audioCtx.createOscillator();
    let gainWood = audioCtx.createGain();
    oscWood.type = 'sine';
    oscWood.frequency.setValueAtTime(280, t);
    oscWood.frequency.exponentialRampToValueAtTime(90, t + 0.04);

    gainWood.gain.setValueAtTime(0.25, t);
    gainWood.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    oscWood.connect(gainWood);
    gainWood.connect(sfxGainNode);
    oscWood.start(t);
    oscWood.stop(t + 0.045);
}

/**
 * 🎱 TOPUN CEBE DÜŞME SESİ (Cloth / Leather Pocket Drop)
 */
function playRealisticPocket(now) {
    if (!audioCtx) return;
    const t = now || audioCtx.currentTime;

    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(175, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.13);
}

