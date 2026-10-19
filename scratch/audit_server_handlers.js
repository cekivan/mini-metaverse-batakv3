const fs = require('fs');
const path = require('path');

const handlersDir = path.join(process.cwd(), 'src', 'handlers');
const files = fs.readdirSync(handlersDir).filter(f => f.endsWith('.js'));
files.push('../../server.js');

const issues = [];

for (const file of files) {
    const filePath = path.resolve(handlersDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let currentEvent = null;
    let eventStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/socket\.on\(['"]([^'"]+)['"]\s*,\s*(async\s*)?\(([^)]*)\)\s*=>/);
        if (match) {
            currentEvent = match[1];
            eventStartLine = i + 1;
            const params = match[3].split(',').map(p => p.trim()).filter(Boolean);
            
            // Check if handler accesses property of param without checking if param is defined
            // e.g. socket.on('event', (data) => { let x = data.something; })
            if (params.length > 0) {
                const firstParam = params[0];
                for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
                    const nextLine = lines[j];
                    if (nextLine.includes('socket.on(') || nextLine.startsWith('});')) break;
                    const directAccess = new RegExp(`${firstParam}\\.[a-zA-Z0-9_]+`);
                    if (directAccess.test(nextLine) && 
                        !nextLine.includes(`if (${firstParam}`) && 
                        !nextLine.includes(`if (!${firstParam}`) && 
                        !nextLine.includes(`${firstParam} &&`) &&
                        !nextLine.includes(`${firstParam}?`)) {
                        issues.push({
                            file: path.basename(filePath),
                            line: j + 1,
                            event: currentEvent,
                            param: firstParam,
                            code: nextLine.trim()
                        });
                    }
                }
            }
        }
    }
}

console.log("=== Potential Unsafe Direct Payload Property Accesses ===");
console.log(issues);
