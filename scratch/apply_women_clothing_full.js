const fs = require('fs');
const path = require('path');

// 1. UPDATE wardrobe.js (renderWardrobeActiveGrid filter & openWardrobe)
let wardrobePath = path.join(__dirname, '../public/js/wardrobe.js');
let wardrobeCode = fs.readFileSync(wardrobePath, 'utf8');

// Replace gender filter inside renderWardrobeActiveGrid
wardrobeCode = wardrobeCode.replace(
    /let userGender = window\.myGender \|\| window\.selectedGender \|\| 'male';\s*let allItems = WARDROBE_CATALOG\[currentWardrobeTab\] \|\| \[\];\s*let items = allItems\.filter\(item => \{\s*if \(!item\.gender\) return true;\s*return item\.gender === userGender;\s*\}\);/,
    `let allItems = WARDROBE_CATALOG[currentWardrobeTab] || [];
    let items = allItems.filter(item => {
        if (!item.gender) return true;
        if (wardrobeGenderFilter === 'all') return true;
        return item.gender === wardrobeGenderFilter;
    });`
);

// Replace openWardrobe to set default gender filter
wardrobeCode = wardrobeCode.replace(
    /function openWardrobe\(\) \{\s*isWardrobeOpen = true;\s*previewAvatar = \{ \.\.\.myAvatar \};\s*renderWardrobeUI\(\);/,
    `function openWardrobe() {
    isWardrobeOpen = true;
    previewAvatar = { ...myAvatar };
    if (!wardrobeGenderFilter || wardrobeGenderFilter === 'all') {
        if (window.myGender === 'female' || window.selectedGender === 'female') {
            wardrobeGenderFilter = 'female';
        }
    }
    setWardrobeGenderFilter(wardrobeGenderFilter || 'all');
    renderWardrobeUI();`
);

fs.writeFileSync(wardrobePath, wardrobeCode, 'utf8');
console.log("1. wardrobe.js updated!");

// 2. UPDATE index.html (add wardrobe gender bar)
let indexPath = path.join(__dirname, '../public/index.html');
let indexCode = fs.readFileSync(indexPath, 'utf8');

const targetIndexHtml = `<div class="wardrobe-grid" id="wardrobeActiveGrid"></div>`;
const replacementIndexHtml = `<div class="wardrobe-gender-bar" id="wardrobeGenderBar">
                        <button class="wardrobe-gender-btn active" id="genderFilterFemale" onclick="setWardrobeGenderFilter('female')">👗 Kadın Koleksiyonu</button>
                        <button class="wardrobe-gender-btn" id="genderFilterAll" onclick="setWardrobeGenderFilter('all')">✨ Tümü</button>
                        <button class="wardrobe-gender-btn" id="genderFilterMale" onclick="setWardrobeGenderFilter('male')">👔 Erkek Koleksiyonu</button>
                    </div>
                    <div class="wardrobe-grid" id="wardrobeActiveGrid"></div>`;

if (indexCode.includes(targetIndexHtml) && !indexCode.includes('wardrobe-gender-bar')) {
    indexCode = indexCode.replace(targetIndexHtml, replacementIndexHtml);
    fs.writeFileSync(indexPath, indexCode, 'utf8');
    console.log("2. index.html updated with wardrobe-gender-bar!");
} else {
    console.log("2. index.html already has bar or target not found.");
}

// 3. UPDATE style.css (styling for wardrobe-gender-bar)
let stylePath = path.join(__dirname, '../public/style.css');
let styleCode = fs.readFileSync(stylePath, 'utf8');

const targetCss = `.wardrobe-tabs {`;
const newGenderCss = `.wardrobe-gender-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    align-items: center;
    flex-wrap: wrap;
}

.wardrobe-gender-btn {
    padding: 5px 14px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    background: rgba(15, 23, 42, 0.7);
    color: #94a3b8;
    cursor: pointer;
    font-weight: 700;
    font-size: 11.5px;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.wardrobe-gender-btn:hover {
    color: #f8fafc;
    border-color: rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
}

.wardrobe-gender-btn.active {
    background: linear-gradient(135deg, #ec4899, #db2777);
    color: white;
    border-color: #f472b6;
    box-shadow: 0 2px 10px rgba(236, 72, 153, 0.45);
}

.wardrobe-tabs {`;

if (styleCode.includes(targetCss) && !styleCode.includes('wardrobe-gender-bar')) {
    styleCode = styleCode.replace(targetCss, newGenderCss);
    fs.writeFileSync(stylePath, styleCode, 'utf8');
    console.log("3. style.css updated with gender bar styles!");
} else {
    console.log("3. style.css already has styles or target not found.");
}

// 4. UPDATE avatarRenderer.js
let rendererPath = path.join(__dirname, '../public/js/avatarRenderer.js');
let rendererCode = fs.readFileSync(rendererPath, 'utf8');

// 4A. In drawSingleShoe: Add heels_gold, boots_thigh_high, sandals_gladiator
const shoeTarget = `    } else if (shoeType === 'flats') {
        // Zarif Babet
        targetCtx.fillStyle = "#ec4899";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 3.5, y + 2, 3.8, 2, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(x + 4, y + 1.5, 1.2, 0, Math.PI * 2); targetCtx.fill();`;

const shoeReplacement = `    } else if (shoeType === 'flats') {
        // Zarif Babet
        targetCtx.fillStyle = "#ec4899";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 3.5, y + 2, 3.8, 2, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(x + 4, y + 1.5, 1.2, 0, Math.PI * 2); targetCtx.fill();
    } else if (shoeType === 'heels_gold') {
        // Altın Simli Abiye Stiletto
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 4, y + 2, 4, 2.5, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#d97706";
        targetCtx.fillRect(x, y + 2, 1.5, 4.5);
        targetCtx.fillStyle = "#ef4444";
        targetCtx.fillRect(x + 1.5, y + 4.5, 4, 0.8);
    } else if (shoeType === 'boots_thigh_high') {
        // Diz Üstü Süet Çizme
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        targetCtx.roundRect(x - 0.5, y - 5, 8.5, 10, [3, 3, 1, 1]);
        targetCtx.fill();
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.fillRect(x + 3.5, y - 5, 1, 9);
    } else if (shoeType === 'sandals_gladiator') {
        // İncili Gladyatör Sandalet
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        targetCtx.fillRect(x, y, 7.5, 4);
        targetCtx.fillStyle = "#d97706";
        targetCtx.fillRect(x, y + 3.5, 7.5, 1);
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(x + 2, y + 1.5, 1, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.arc(x + 5, y + 1.5, 1, 0, Math.PI * 2); targetCtx.fill();`;

if (rendererCode.includes(shoeTarget)) {
    rendererCode = rendererCode.replace(shoeTarget, shoeReplacement);
    console.log("4A. Shoes added to avatarRenderer.js!");
} else {
    console.error("4A. shoeTarget not found in avatarRenderer.js!");
}

// 4B. In drawAvatarBodyAndClothes: Add new dresses & outfits
const dressTarget = `    } else if (shirtColor === 'polo') {`;
const dressNewCode = `    } else if (shirtColor === 'dress_emerald') {
        // Zümrüt Yeşil İpek Gece Elbisesi
        targetCtx.fillStyle = "#059669";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 9, pY - 10, 18, 12, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 7, pY - 10); targetCtx.lineTo(pX, pY - 7); targetCtx.lineTo(pX + 7, pY - 10);
        targetCtx.stroke();
        targetCtx.fillStyle = "#047857";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 15);
        targetCtx.quadraticCurveTo(pX, pY + 17, pX + 14, pY + 15);
        targetCtx.lineTo(pX + 9, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#facc15";
        targetCtx.fillRect(pX - 9, pY, 18, 2);
    } else if (shirtColor === 'dress_lavender') {
        // Lavanta Çiçeği Bahar Elbisesi
        targetCtx.fillStyle = "#c084fc";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 9, pY - 10, 18, 11, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.fillRect(pX - 7, pY - 10, 2, 6);
        targetCtx.fillRect(pX + 5, pY - 10, 2, 6);
        targetCtx.fillStyle = "#a855f7";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY + 1);
        targetCtx.lineTo(pX - 13, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 13, pY + 14);
        targetCtx.lineTo(pX + 9, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 12, pY + 13, 24, 1.5);
    } else if (shirtColor === 'dress_bridal') {
        // Masalsı Beyaz Gelinlik & Balo Elbisesi
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 9, pY - 10, 18, 11, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.strokeStyle = "#e2e8f0"; targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.arc(pX - 4, pY - 8, 3, Math.PI, 0);
        targetCtx.arc(pX + 4, pY - 8, 3, Math.PI, 0);
        targetCtx.stroke();
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY + 1);
        targetCtx.lineTo(pX - 16, pY + 15);
        targetCtx.quadraticCurveTo(pX, pY + 18, pX + 16, pY + 15);
        targetCtx.lineTo(pX + 9, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "#e2e8f0"; targetCtx.lineWidth = 1; targetCtx.stroke();
        targetCtx.fillStyle = "#38bdf8"; targetCtx.fillRect(pX - 1.5, pY, 3, 2.5);
        targetCtx.fillStyle = "#cbd5e1"; targetCtx.fillRect(pX - 9, pY, 7.5, 2); targetCtx.fillRect(pX + 1.5, pY, 7.5, 2);
    } else if (shirtColor === 'outfit_goth') {
        // Korseli Gotik Lolita Elbisesi
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 9, pY - 10, 18, 12, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.strokeStyle = "#c084fc"; targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 4, pY - 8); targetCtx.lineTo(pX + 4, pY - 4);
        targetCtx.moveTo(pX + 4, pY - 8); targetCtx.lineTo(pX - 4, pY - 4);
        targetCtx.moveTo(pX - 4, pY - 4); targetCtx.lineTo(pX + 4, pY);
        targetCtx.moveTo(pX + 4, pY - 4); targetCtx.lineTo(pX - 4, pY);
        targetCtx.stroke();
        targetCtx.fillStyle = "#09090b";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 14, pY + 14);
        targetCtx.lineTo(pX + 9, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#ef4444";
        targetCtx.beginPath(); targetCtx.arc(pX, pY + 1, 2, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 13, pY + 13, 26, 1.2);
    } else if (shirtColor === 'outfit_business') {
        // Pudra Şık Kadın Takım Elbisesi
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 5, pY - 10, 10, 10);
        targetCtx.fillStyle = "#fb7185";
        targetCtx.beginPath();
        targetCtx.roundRect(pX - 10, pY - 10, 6, 21, [4, 0, 0, 3]);
        targetCtx.roundRect(pX + 4, pY - 10, 6, 21, [0, 4, 3, 0]);
        targetCtx.fill();
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath(); targetCtx.arc(pX, pY + 2, 1.5, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#fda4af";
        targetCtx.fillRect(pX - 5, pY + 4, 10, 9);
    } else if (shirtColor === 'outfit_boho') {
        // Bohem Şifon Elbise & Yelek
        targetCtx.fillStyle = "#ea580c";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 9, pY - 10, 18, 12, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#78350f";
        targetCtx.fillRect(pX - 9, pY - 10, 4, 12);
        targetCtx.fillRect(pX + 5, pY - 10, 4, 12);
        targetCtx.fillStyle = "#c2410c";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 15);
        targetCtx.quadraticCurveTo(pX, pY + 17, pX + 14, pY + 15);
        targetCtx.lineTo(pX + 9, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#fde047";
        targetCtx.fillRect(pX - 12, pY + 11, 24, 2);
    } else if (shirtColor === 'outfit_sporty') {
        // Pastel Fitness Takımı & Crop Top
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 9, pY - 10, 18, 9, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        targetCtx.fillRect(pX - 8, pY - 1, 16, 4);
        targetCtx.fillStyle = "#818cf8";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 9, pY + 3, 18, 9, [2, 2, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 9, pY + 3, 1.5, 9);
        targetCtx.fillRect(pX + 7.5, pY + 3, 1.5, 9);
    } else if (shirtColor === 'dress_vintage_polka') {
        // Vintage Puantiyeli Kırmızı Elbise
        targetCtx.fillStyle = "#dc2626";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 9, pY - 10, 18, 12, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 6, pY - 10); targetCtx.lineTo(pX, pY - 6); targetCtx.lineTo(pX + 6, pY - 10);
        targetCtx.lineTo(pX + 9, pY - 10); targetCtx.lineTo(pX - 9, pY - 10);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#b91c1c";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY + 1);
        targetCtx.lineTo(pX - 15, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 15, pY + 14);
        targetCtx.lineTo(pX + 9, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        [[-8, 6], [-2, 8], [4, 5], [9, 9], [-11, 11], [-5, 12], [2, 12], [9, 13]].forEach(([dx, dy]) => {
            targetCtx.beginPath(); targetCtx.arc(pX + dx, pY + dy, 1.1, 0, Math.PI * 2); targetCtx.fill();
        });
        targetCtx.fillStyle = "#18181b"; targetCtx.fillRect(pX - 9, pY, 18, 2);
        targetCtx.fillStyle = "#e2e8f0"; targetCtx.fillRect(pX - 2, pY - 0.5, 4, 3);
    } else if (shirtColor === 'dress_ocean_blue') {
        // Okyanus Mavisi Yazlık Askılı Elbise
        targetCtx.fillStyle = "#06b6d4";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 9, pY - 10, 18, 11, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#0891b2";
        targetCtx.fillRect(pX - 7, pY - 10, 1.5, 6);
        targetCtx.fillRect(pX + 5.5, pY - 10, 1.5, 6);
        targetCtx.fillStyle = "#0284c7";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 14, pY + 14);
        targetCtx.lineTo(pX + 9, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.fillRect(pX - 13, pY + 13, 26, 1.2);
    } else if (shirtColor === 'outfit_turtleneck_skirt') {
        // Krem Balıkçı Yaka Kazak & Ekose Tartan Etek
        targetCtx.fillStyle = "#fef3c7";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 10, pY - 10, 20, 12, 3); targetCtx.fill();
        targetCtx.fillStyle = "#fde68a";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 6, pY - 12, 12, 4, 2); targetCtx.fill();
        targetCtx.fillStyle = "#991b1b";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY + 2);
        targetCtx.lineTo(pX - 13, pY + 13);
        targetCtx.lineTo(pX + 13, pY + 13);
        targetCtx.lineTo(pX + 9, pY + 2);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "rgba(250, 204, 21, 0.4)"; targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 5, pY + 2); targetCtx.lineTo(pX - 7, pY + 13);
        targetCtx.moveTo(pX + 5, pY + 2); targetCtx.lineTo(pX + 7, pY + 13);
        targetCtx.moveTo(pX - 11, pY + 7); targetCtx.lineTo(pX + 11, pY + 7);
        targetCtx.stroke();
    } else if (shirtColor === 'polo') {`;

if (rendererCode.includes(dressTarget)) {
    rendererCode = rendererCode.replace(dressTarget, dressNewCode);
    console.log("4B. Dresses & Outfits added to avatarRenderer.js!");
} else {
    console.error("4B. dressTarget not found in avatarRenderer.js!");
}

// 4C. In drawAvatarHairAndHats: Add new hairstyles
const hatRenderMarker = `    } else if (hatType === 'korsan') {`;
const newHairCode = `    } else if (hatType === 'hair_blonde_curls') {
        // Altın Bukleli Uzun Saç
        targetCtx.fillStyle = "#eab308";
        [-1, 1].forEach(side => {
            let cx = pX + side * 10;
            targetCtx.beginPath();
            targetCtx.arc(cx, pY - 14, 4, 0, Math.PI * 2);
            targetCtx.arc(cx + side * 1, pY - 7, 4.5, 0, Math.PI * 2);
            targetCtx.arc(cx, pY, 4, 0, Math.PI * 2);
            targetCtx.arc(cx - side * 1, pY + 7, 3.5, 0, Math.PI * 2);
            targetCtx.fill();
        });
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 11, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        targetCtx.fillStyle = "#fef08a";
        targetCtx.beginPath(); targetCtx.ellipse(pX, pY - 25, 6, 2, 0, 0, Math.PI * 2); targetCtx.fill();
    } else if (hatType === 'hair_bun_chopsticks') {
        // Zarif Topuz & Çiçekli Toka
        targetCtx.fillStyle = "#1c1917";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 26, 6.5, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 1.5;
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY - 23); targetCtx.lineTo(pX + 9, pY - 29);
        targetCtx.stroke();
        targetCtx.fillStyle = "#f472b6";
        targetCtx.beginPath(); targetCtx.arc(pX + 6, pY - 27, 3, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(pX + 6, pY - 27, 1, 0, Math.PI * 2); targetCtx.fill();
    } else if (hatType === 'hair_redhead_wavy') {
        // Kızıl Dalgalı Romantik Saç
        targetCtx.fillStyle = "#c2410c";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY - 20); targetCtx.quadraticCurveTo(pX - 14, pY - 4, pX - 11, pY + 7);
        targetCtx.lineTo(pX - 6, pY + 7); targetCtx.quadraticCurveTo(pX - 8, pY - 4, pX - 5, pY - 14);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.beginPath();
        targetCtx.moveTo(pX + 9, pY - 20); targetCtx.quadraticCurveTo(pX + 15, pY - 2, pX + 12, pY + 9);
        targetCtx.lineTo(pX + 6, pY + 9); targetCtx.quadraticCurveTo(pX + 8, pY - 2, pX + 5, pY - 14);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#ea580c";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 11, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
    } else if (hatType === 'hair_pigtails_ribbon') {
        // Kurdeleli İkili Yan Saç
        targetCtx.fillStyle = "#78350f";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        [-1, 1].forEach(side => {
            let px = pX + side * 9;
            targetCtx.fillStyle = "#ec4899";
            targetCtx.beginPath(); targetCtx.arc(px, pY - 21, 2.5, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillStyle = "#78350f";
            targetCtx.beginPath();
            targetCtx.moveTo(px, pY - 21);
            targetCtx.quadraticCurveTo(px + side * 6, pY - 14, px + side * 4, pY - 4);
            targetCtx.quadraticCurveTo(px + side * 2, pY - 14, px, pY - 21);
            targetCtx.closePath(); targetCtx.fill();
        });
    } else if (hatType === 'korsan') {`;

if (rendererCode.includes(hatRenderMarker)) {
    rendererCode = rendererCode.replace(hatRenderMarker, newHairCode);
    console.log("4C. Hairstyles added to avatarRenderer.js!");
} else {
    console.error("4C. hatRenderMarker not found in avatarRenderer.js!");
}

// 4D. Update isDressOrSkirt checks
rendererCode = rendererCode.replace(
    /let isDressOrSkirt = \(activeAv\.color && \(activeAv\.color\.startsWith\('dress_'\) \|\| activeAv\.color\.startsWith\('skirt_'\)\)\);/g,
    `let isDressOrSkirt = (activeAv.color && (activeAv.color.startsWith('dress_') || activeAv.color.startsWith('skirt_') || activeAv.color.startsWith('outfit_')));`
);
rendererCode = rendererCode.replace(
    /let isDressOrSkirt = \(p\.color && \(p\.color\.startsWith\('dress_'\) \|\| p\.color\.startsWith\('skirt_'\)\)\);/g,
    `let isDressOrSkirt = (p.color && (p.color.startsWith('dress_') || p.color.startsWith('skirt_') || p.color.startsWith('outfit_')));`
);

// 4E. Update sleeveColor for sitting avatar
const sleeveTarget = `if (p.color === 'dress_pink') sleeveColor = "#f472b6";
            else if (p.color === 'dress_black') sleeveColor = "#18181b";
            else if (p.color === 'dress_red') sleeveColor = "#e11d48";`;

const sleeveReplacement = `if (p.color === 'dress_pink') sleeveColor = "#f472b6";
            else if (p.color === 'dress_black') sleeveColor = "#18181b";
            else if (p.color === 'dress_red') sleeveColor = "#e11d48";
            else if (p.color === 'dress_emerald') sleeveColor = "#059669";
            else if (p.color === 'dress_lavender') sleeveColor = "#c084fc";
            else if (p.color === 'dress_bridal') sleeveColor = "#ffffff";
            else if (p.color === 'outfit_goth') sleeveColor = "#18181b";
            else if (p.color === 'outfit_business') sleeveColor = "#fb7185";
            else if (p.color === 'outfit_boho') sleeveColor = "#78350f";
            else if (p.color === 'outfit_sporty') sleeveColor = skin;
            else if (p.color === 'dress_vintage_polka') sleeveColor = "#dc2626";
            else if (p.color === 'dress_ocean_blue') sleeveColor = "#06b6d4";
            else if (p.color === 'outfit_turtleneck_skirt') sleeveColor = "#fef3c7";`;

if (rendererCode.includes(sleeveTarget)) {
    rendererCode = rendererCode.replace(sleeveTarget, sleeveReplacement);
    console.log("4E. Sleeve colors updated for sitting avatars!");
} else {
    console.error("4E. sleeveTarget not found in avatarRenderer.js!");
}

fs.writeFileSync(rendererPath, rendererCode, 'utf8');
console.log("4. avatarRenderer.js successfully saved!");
