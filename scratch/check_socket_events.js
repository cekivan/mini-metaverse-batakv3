const fs = require('fs');
const path = require('path');

function getFiles(dir, filter) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        let fPath = path.join(dir, file);
        let stat = fs.statSync(fPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fPath, filter));
        } else if (filter(file)) {
            results.push(fPath);
        }
    });
    return results;
}

const serverFiles = [path.join(process.cwd(), 'server.js'), ...getFiles(path.join(process.cwd(), 'src'), f => f.endsWith('.js'))];
const clientFiles = getFiles(path.join(process.cwd(), 'public/js'), f => f.endsWith('.js') && !f.endsWith('.bak'));

const serverContent = serverFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const clientContent = clientFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

// 1. Client emits: socket.emit('event'...)
const clientEmits = new Set();
const clientEmitRegex = /(?:socket|window\.socket)\.emit\(\s*['"]([a-zA-Z0-9_\-]+)['"]/g;
let m;
while ((m = clientEmitRegex.exec(clientContent)) !== null) {
    clientEmits.add(m[1]);
}

// 2. Server listens: socket.on('event'...)
const serverListens = new Set();
const serverOnRegex = /socket\.on\(\s*['"]([a-zA-Z0-9_\-]+)['"]/g;
while ((m = serverOnRegex.exec(serverContent)) !== null) {
    serverListens.add(m[1]);
}

// 3. Server emits: (socket|io|ioInstance|targetSocket|targetSock)\S*\.emit('event'...)
const serverEmits = new Set();
const serverEmitRegex = /(?:socket|io|ioInstance|ioRef|targetSocket|targetSock)\S*\.emit\(\s*['"]([a-zA-Z0-9_\-]+)['"]/g;
while ((m = serverEmitRegex.exec(serverContent)) !== null) {
    serverEmits.add(m[1]);
}

// 4. Client listens: (socket|window\.socket)\.on('event'...)
const clientListens = new Set();
const clientOnRegex = /(?:socket|window\.socket)\.on\(\s*['"]([a-zA-Z0-9_\-]+)['"]/g;
while ((m = clientOnRegex.exec(clientContent)) !== null) {
    clientListens.add(m[1]);
}

console.log("=== SOCKET EVENT COMPARISON ===");
console.log(`Client emits ${clientEmits.size} unique events`);
console.log(`Server listens to ${serverListens.size} unique events`);
console.log(`Server emits ${serverEmits.size} unique events`);
console.log(`Client listens to ${clientListens.size} unique events\n`);

console.log("--- Client emits but Server does NOT listen: ---");
for (let ev of clientEmits) {
    if (!serverListens.has(ev)) {
        console.log("  [UNHANDLED BY SERVER]:", ev);
    }
}

console.log("\n--- Server emits but Client does NOT listen: ---");
for (let ev of serverEmits) {
    if (!clientListens.has(ev)) {
        console.log("  [UNHANDLED BY CLIENT]:", ev);
    }
}
