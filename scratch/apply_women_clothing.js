const fs = require('fs');
const path = require('path');

// 1. UPDATE public/js/wardrobe.js
let wardrobePath = path.join(__dirname, '../public/js/wardrobe.js');
let wardrobeCode = fs.readFileSync(wardrobePath, 'utf8');

// A. Hats addition
const hatTarget = "{ id: 'crown', name: 'Prenses Tacı', cost: 480, icon: '👑', gender: 'female' }";
const hatReplacement = `{ id: 'crown', name: 'Prenses Tacı', cost: 480, icon: '👑', gender: 'female' },
        { id: 'hair_blonde_curls', name: 'Altın Bukleli Uzun Saç', cost: 310, icon: '👱‍♀️', gender: 'female' },
        { id: 'hair_bun_chopsticks', name: 'Zarif Topuz & Çiçekli Toka', cost: 290, icon: '🌸', gender: 'female' },
        { id: 'hair_redhead_wavy', name: 'Kızıl Dalgalı Romantik Saç', cost: 300, icon: '👩‍🦰', gender: 'female' },
        { id: 'hair_pigtails_ribbon', name: 'Kurdeleli İkili Yan Saç', cost: 280, icon: '🎀', gender: 'female' }`;

if (wardrobeCode.includes(hatTarget)) {
    wardrobeCode = wardrobeCode.replace(hatTarget, hatReplacement);
    console.log("Hats updated successfully!");
} else {
    console.error("Could not find hatTarget in wardrobe.js");
}

// B. Shirts addition
const shirtTarget = "{ id: 'dress_red', name: 'Kırmızı Kokteyl Elbisesi', cost: 310, color: '#e11d48', icon: '💃', gender: 'female' },";
const shirtReplacement = `{ id: 'dress_red', name: 'Kırmızı Kokteyl Elbisesi', cost: 310, color: '#e11d48', icon: '💃', gender: 'female' },
        { id: 'dress_emerald', name: 'Zümrüt Yeşil İpek Elbise', cost: 340, color: '#059669', icon: '👗', gender: 'female' },
        { id: 'dress_lavender', name: 'Lavanta Çiçeği Bahar Elbisesi', cost: 290, color: '#c084fc', icon: '🌸', gender: 'female' },
        { id: 'dress_bridal', name: 'Masalsı Beyaz Gelinlik & Balo', cost: 490, color: '#ffffff', icon: '👰', gender: 'female' },
        { id: 'outfit_goth', name: 'Korseli Gotik Lolita Elbisesi', cost: 360, color: '#581c87', icon: '🖤', gender: 'female' },
        { id: 'outfit_business', name: 'Pudra Şık Kadın Takım Elbisesi', cost: 330, color: '#fb7185', icon: '🧥', gender: 'female' },
        { id: 'outfit_boho', name: 'Bohem Şifon Elbise & Yelek', cost: 280, color: '#ea580c', icon: '🌻', gender: 'female' },
        { id: 'outfit_sporty', name: 'Pastel Fitness Takımı & Crop', cost: 250, color: '#38bdf8', icon: '🎽', gender: 'female' },
        { id: 'dress_vintage_polka', name: 'Vintage Puantiyeli Kırmızı Elbise', cost: 300, color: '#dc2626', icon: '💃', gender: 'female' },
        { id: 'dress_ocean_blue', name: 'Okyanus Mavisi Askılı Elbise', cost: 270, color: '#06b6d4', icon: '🌊', gender: 'female' },
        { id: 'outfit_turtleneck_skirt', name: 'Krem Balıkçı Yaka & Ekose Etek', cost: 290, color: '#fef3c7', icon: '🧣', gender: 'female' },`;

if (wardrobeCode.includes(shirtTarget)) {
    wardrobeCode = wardrobeCode.replace(shirtTarget, shirtReplacement);
    console.log("Shirts updated successfully!");
} else {
    console.error("Could not find shirtTarget in wardrobe.js");
}

// C. Shoes addition
const shoeTarget = "{ id: 'heels', name: 'Topuklu Stiletto', cost: 320, icon: '👠', gender: 'female' },";
const shoeReplacement = `{ id: 'heels', name: 'Topuklu Stiletto', cost: 320, icon: '👠', gender: 'female' },
        { id: 'heels_gold', name: 'Altın Simli Stiletto', cost: 340, icon: '👠', gender: 'female' },
        { id: 'boots_thigh_high', name: 'Diz Üstü Süet Çizme', cost: 350, icon: '👢', gender: 'female' },
        { id: 'sandals_gladiator', name: 'İncili Gladyatör Sandalet', cost: 220, icon: '👡', gender: 'female' },`;

if (wardrobeCode.includes(shoeTarget)) {
    wardrobeCode = wardrobeCode.replace(shoeTarget, shoeReplacement);
    console.log("Shoes updated successfully!");
} else {
    console.error("Could not find shoeTarget in wardrobe.js");
}

// D. Gender filter functions
const tabVarTarget = "let currentWardrobeTab = 'hats';";
const tabVarReplacement = `let currentWardrobeTab = 'hats';
let wardrobeGenderFilter = 'all';

function setWardrobeGenderFilter(filter) {
    wardrobeGenderFilter = filter;
    document.querySelectorAll('.wardrobe-gender-btn').forEach(btn => btn.classList.remove('active'));
    if (filter === 'female') document.getElementById('genderFilterFemale')?.classList.add('active');
    else if (filter === 'male') document.getElementById('genderFilterMale')?.classList.add('active');
    else document.getElementById('genderFilterAll')?.classList.add('active');
    renderWardrobeActiveGrid();
}
window.setWardrobeGenderFilter = setWardrobeGenderFilter;`;

if (wardrobeCode.includes(tabVarTarget)) {
    wardrobeCode = wardrobeCode.replace(tabVarTarget, tabVarReplacement);
    console.log("Gender filter variable & function added!");
}

// E. Filter logic in renderWardrobeActiveGrid
const filterTarget = `    let userGender = window.myGender || window.selectedGender || 'male';
    let allItems = WARDROBE_CATALOG[currentWardrobeTab] || [];
    let items = allItems.filter(item => {
        if (!item.gender) return true;
        return item.gender === userGender;
    });`;

const filterReplacement = `    let allItems = WARDROBE_CATALOG[currentWardrobeTab] || [];
    let items = allItems.filter(item => {
        if (!item.gender) return true;
        if (wardrobeGenderFilter === 'all') return true;
        return item.gender === wardrobeGenderFilter;
    });`;

if (wardrobeCode.includes(filterTarget)) {
    wardrobeCode = wardrobeCode.replace(filterTarget, filterReplacement);
    console.log("Grid filter updated successfully!");
}

// F. openWardrobe filter init
const openTarget = `function openWardrobe() {
    isWardrobeOpen = true;
    previewAvatar = { ...myAvatar };
    renderWardrobeUI();`;

const openReplacement = `function openWardrobe() {
    isWardrobeOpen = true;
    previewAvatar = { ...myAvatar };
    if (!wardrobeGenderFilter || wardrobeGenderFilter === 'all') {
        if (window.myGender === 'female' || window.selectedGender === 'female') {
            wardrobeGenderFilter = 'female';
        }
    }
    setWardrobeGenderFilter(wardrobeGenderFilter || 'all');
    renderWardrobeUI();`;

if (wardrobeCode.includes(openTarget)) {
    wardrobeCode = wardrobeCode.replace(openTarget, openReplacement);
    console.log("openWardrobe updated successfully!");
}

fs.writeFileSync(wardrobePath, wardrobeCode, 'utf8');
console.log("public/js/wardrobe.js successfully saved!");
