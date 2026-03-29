// Slots Game
function spinSlots() {
    if (balance < bets.slots) {
        showMessage('slots', '❌ Недостаточно средств!', 'lose');
        return;
    }

    balance -= bets.slots;
    updateStats();

    const reels = [];
    for (let i = 1; i <= 5; i++) {
        reels.push(document.getElementById(`slot-reel-${i}`));
        reels[i-1].classList.add('spinning');
        reels[i-1].classList.remove('winner');
    }

    const results = [];
    const spinTimes = [800, 1200, 1600, 2000, 2400];

    reels.forEach((reel, index) => {
        const interval = setInterval(() => {
            reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        }, 80);

        setTimeout(() => {
            clearInterval(interval);
            const symbol = getRandomSymbol();
            reel.textContent = symbol;
            results[index] = symbol;
            reel.classList.remove('spinning');

            if (index === 4) {
                checkSlotsWin(results);
            }
        }, spinTimes[index]);
    });
}

function checkSlotsWin(results) {
    const counts = {};
    results.forEach(s => counts[s] = (counts[s] || 0) + 1);

    let maxCount = 0;
    let bestSymbol = null;
    for (const [symbol, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            bestSymbol = symbol;
        }
    }

    const reels = [];
    for (let i = 1; i <= 5; i++) {
        reels.push(document.getElementById(`slot-reel-${i}`));
    }

    if (maxCount >= 3) {
        reels.forEach((reel, index) => {
            if (results[index] === bestSymbol) {
                reel.classList.add('winner');
            }
        });

        let winAmount = 0;
        let itemName = '';
        
        // Apply organ win bonus
        const winBonus = getWinBonus();
        
        if (slotMultipliers[bestSymbol] === 'jackpot') {
            winAmount = jackpot;
            itemName = `🎉 ДЖЕКПОТ (${bestSymbol})`;
            jackpot = 50000;
            showMessage('slots', `🎉🎉🎉 ДЖЕКПОТ! ${winAmount}! 🎉🎉🎉`, 'win');
        } else {
            const multiplier = maxCount >= 5 ? slotMultipliers[bestSymbol] : 
                              maxCount >= 4 ? slotMultipliers[bestSymbol] / 2 : 
                              slotMultipliers[bestSymbol] / 5;
            winAmount = Math.floor(bets.slots * multiplier * (1 + winBonus));
            itemName = `🎰 Выигрыш (${bestSymbol} x${maxCount})`;
            showMessage('slots', `🎉 ПОБЕДА! ${winAmount}! 🎉`, 'win');
        }

        addToBalance(winAmount, itemName);
        lastWin = winAmount;
    } else {
        showMessage('slots', 'Попробуй ещё раз!', 'lose');
    }

    updateStats();
}
