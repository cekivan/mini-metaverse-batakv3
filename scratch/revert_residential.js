const fs = require('fs');

const filePath = 'public/js/worldRenderer.js';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '// (Görkemli Prestij Rezidans & Lüks Konutlar Sitesi - Çift Kule, Penthouse, Güvenlikli Nizamiye ve Işıklı Tabela)';
const endMarker = 'function renderStaticStreetTo(bctx, width, height) {';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
    process.exit(1);
}

const replacement = `// (Konutlar & Apartman Sitesi - Orijinal Sade Tasarım)
function drawIsometricResidentialComplex(bctx, aptX, aptY, aptW, aptH, isNightMode) {
    bctx.save();
    bctx.fillStyle = isNightMode ? "#0f172a" : "#1e293b";
    bctx.beginPath(); bctx.roundRect(aptX, aptY, aptW, aptH, 12); bctx.fill();
    bctx.strokeStyle = "#f97316"; bctx.lineWidth = 2; bctx.stroke();
    bctx.fillStyle = "#fb923c"; bctx.font = "bold 13px sans-serif"; bctx.textAlign = "center";
    bctx.fillText("🏢 KONUTLAR & SİTE", aptX + aptW / 2, aptY + 22);
    bctx.fillStyle = "#94a3b8"; bctx.font = "10px sans-serif";
    bctx.fillText("(Arkadaşlarının ve Kendi Evin)", aptX + aptW / 2, aptY + 36);
    let winColors = ["#fde047", "#fed7aa", "#fef08a", "#67e8f9"];
    for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
            bctx.fillStyle = isNightMode ? winColors[(r * 2 + c)] : "rgba(255,255,255,0.4)";
            bctx.fillRect(aptX + 24 + c * 45, aptY + 48 + r * 34, 30, 24);
            bctx.strokeStyle = "#334155"; bctx.lineWidth = 1;
            bctx.strokeRect(aptX + 24 + c * 45, aptY + 48 + r * 34, 30, 24);
        }
    }
    bctx.fillStyle = "#0284c7"; bctx.fillRect(aptX + aptW - 65, aptY + 55, 45, 60);
    bctx.strokeStyle = "#ffffff"; bctx.lineWidth = 1.5; bctx.strokeRect(aptX + aptW - 65, aptY + 55, 45, 60);
    bctx.fillStyle = "#facc15"; bctx.font = "bold 10px sans-serif";
    bctx.fillText("GİRİŞ", aptX + aptW - 42, aptY + 88);
    bctx.restore();
}

`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced drawIsometricResidentialComplex successfully with original simple design!');
