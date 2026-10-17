const { evaluateSlotSpin, ALLOWED_BETS } = require('../src/handlers/slotHandler');

console.log("Testing Slot Jackpot Evaluation:");

let jackpotResult = evaluateSlotSpin(['seven', 'seven', 'seven'], 500);
console.log("Jackpot Result:", jackpotResult);
if (!jackpotResult.isJackpot || jackpotResult.multiplier !== 50 || jackpotResult.winAmount !== 25000) {
    throw new Error("Jackpot evaluation failed!");
}

let regularWin = evaluateSlotSpin(['diamond', 'diamond', 'diamond'], 100);
console.log("Regular Win Result:", regularWin);
if (regularWin.isJackpot || regularWin.multiplier !== 25 || regularWin.winAmount !== 2500) {
    throw new Error("Regular win evaluation failed!");
}

let cherryWin = evaluateSlotSpin(['cherry', 'lemon', 'grape'], 50);
console.log("Cherry 1x Result:", cherryWin);
if (cherryWin.isJackpot || cherryWin.multiplier !== 1) {
    throw new Error("Cherry evaluation failed!");
}

console.log("All Slot Math & Jackpot Unit Tests PASSED!");
