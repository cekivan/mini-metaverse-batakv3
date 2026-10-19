const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('public/js/worldRenderer.js', 'utf8');

try {
    new vm.Script(code);
    console.log("No syntax error in vm.Script!");
} catch (e) {
    console.error("Syntax error detail:", e);
}
