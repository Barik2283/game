// Slots Game
function spinSlots() {
    if (balance < bets.slots) {
        showMessage('slots', `❌ Недостаточно средств! Нужно ${bets.slots}, у вас ${balance}`, 'lose');
        showNotification('❌ Недостаточно монет!', 'lose');
        return;
    }

    const betAmount = bets.slots;
    balance -= betAmount;
    updateStats();

    showMessage('slots', `🎰 Крутим... Ставка: ${betAmount} монет`, 'info');

    const reels = [];
    for (let i = 1; i <= 5; i++) {
        const reel = document.getElementById(`slot-reel-${i}`);
        reels.push(reel);
        reel.classList.add('spinning');
        reel.classList.remove('winner', 'loser');
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
                checkSlotsWin(results, betAmount);
            }
        }, spinTimes[index]);
    });
}

function checkSlotsWin(results, betAmount) {
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

        const winBonus = getWinBonus();

        if (slotMultipliers[bestSymbol] === 'jackpot') {
            winAmount = jackpot;
            jackpot = 50000;
            showMessage('slots', `🎉🎉🎉 ДЖЕКПОТ! +${winAmount} монет! 🎉🎉🎉`, 'win');
            showNotification(`🎉 ДЖЕКПОТ! +${winAmount} монет! 🎉`, 'win', 6000);
        } else {
            const multiplier = maxCount >= 5 ? slotMultipliers[bestSymbol] :
                              maxCount >= 4 ? slotMultipliers[bestSymbol] / 2 :
                              slotMultipliers[bestSymbol] / 5;
            winAmount = Math.floor(bets.slots * multiplier * (1 + winBonus));
            showMessage('slots', `🎉 ПОБЕДА! +${winAmount} монет! ${bestSymbol} x${maxCount}`, 'win');
            showNotification(`🎰 Выигрыш: +${winAmount} монет!`, 'win', 4000);
        }

        addToBalance(winAmount);
        lastWin = winAmount;
    } else {
        reels.forEach(reel => reel.classList.add('loser'));
        setTimeout(() => {
            reels.forEach(reel => reel.classList.remove('loser'));
        }, 500);
        showMessage('slots', `❌ Проигрыш! -${betAmount} монет. Попробуй ещё!`, 'lose');
    }

    updateStats();
}
