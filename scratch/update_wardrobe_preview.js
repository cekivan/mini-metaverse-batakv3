// scratch/update_wardrobe_preview.js
const fs = require('fs');
const path = require('path');

const wardrobePath = path.join(__dirname, '..', 'public', 'js', 'wardrobe.js');
let code = fs.readFileSync(wardrobePath, 'utf8');

if (!code.includes('rotateAvatarPreview')) {
    const extra = `

// --- 8 AÇILI AVATAR ÖNİZLEME DÖNDÜRME SİSTEMİ ---
const PREVIEW_FACING_ANGLES = [
    { key: 'down', label: 'Ön (Güney)' },
    { key: 'down-right', label: 'Sağ İleri' },
    { key: 'right', label: 'Sağ Profil' },
    { key: 'up-right', label: 'Sağ Geri' },
    { key: 'up', label: 'Tam Arka' },
    { key: 'up-left', label: 'Sol Geri' },
    { key: 'left', label: 'Sol Profil' },
    { key: 'down-left', label: 'Sol İleri' }
];
window.previewFacing = 'down';

function rotateAvatarPreview(delta) {
    let curIdx = PREVIEW_FACING_ANGLES.findIndex(a => a.key === (window.previewFacing || 'down'));
    if (curIdx === -1) curIdx = 0;
    let nextIdx = (curIdx + delta + 8) % 8;
    window.previewFacing = PREVIEW_FACING_ANGLES[nextIdx].key;
    let badge = document.getElementById('previewFacingBadge');
    if (badge) badge.innerText = PREVIEW_FACING_ANGLES[nextIdx].label;
    if (typeof drawAvatarPreview === 'function') drawAvatarPreview();
}
window.rotateAvatarPreview = rotateAvatarPreview;

(function setupPreviewCanvasDrag() {
    function initDrag() {
        let canvas = document.getElementById('avatarPreviewCanvas');
        if (!canvas) return;
        let isDragging = false;
        let startX = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            canvas.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let diffX = e.clientX - startX;
            if (Math.abs(diffX) > 22) {
                rotateAvatarPreview(diffX > 0 ? 1 : -1);
                startX = e.clientX;
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                canvas.style.cursor = 'grab';
            }
        });
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initDrag);
    } else {
        initDrag();
    }
})();
`;
    fs.writeFileSync(wardrobePath, code + extra, 'utf8');
    console.log('Successfully added rotateAvatarPreview to wardrobe.js');
} else {
    console.log('Already includes rotateAvatarPreview');
}
