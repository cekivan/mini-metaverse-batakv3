const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const regex = /id="([^"]*modal[^"]*|[^"]*overlay[^"]*)"[^>]*style="([^"]*)"/gi;
let match;
while ((match = regex.exec(html)) !== null) {
    const id = match[1];
    const style = match[2];
    if (!style.includes('display: none') && !style.includes('display:none')) {
        console.log('Potentially visible modal:', id, 'style:', style);
    }
}
console.log('Check completed.');
