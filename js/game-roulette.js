// Roulette Game - Wheel of Fortune Style
let selectedRouletteBet = null;
let rouletteSpinning = false;

function selectRouletteBet(type) {
    selectedRouletteBet = type;
    document.querySelectorAll('.roulette-bet-btn').forEach(btn => btn.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function spinRoulette() {
    if (rouletteSpinning) return;
    if (!selectedRouletteBet) {
        showMessage('roulette', '❌ Выберите ставку!', 'lose');
        return;
    }
    if (balance < bets.roulette) {
        showMessage('roulette', '❌ Недостаточно средств!', 'lose');
        return;
    }

    balance -= bets.roulette;
    updateStats();
    rouletteSpinning = true;

    const wheel = document.getElementById('roulette-wheel');
    const resultEl = document.getElementById('roulette-result');
    resultEl.textContent = 'Крутим...';

    // Spin the wheel
    const rotations = 720 + Math.random() * 720;
    wheel.style.transform = `rotate(${rotations}deg)`;

    setTimeout(() => {
        // Reset wheel
        wheel.style.transition = 'none';
        wheel.style.transform = 'rotate(0deg)';
        setTimeout(() => {
            wheel.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        }, 50);

        // Calculate result (0-36)
        const resultNum = Math.floor(Math.random() * 37);
        let resultColor = 'black';
        if (resultNum === 0) {
            resultColor = 'green';
        } else if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(resultNum)) {
            resultColor = 'red';
        }

        const colors = { red: '🔴', green: '🟢', black: '⚫' };
        resultEl.textContent = `${colors[resultColor]} ${resultNum}`;

        let winMultiplier = 0;
        if (selectedRouletteBet === resultColor) {
            winMultiplier = resultColor === 'green' ? 14 : 2;
        }

        if (winMultiplier > 0) {
            const winBonus = getWinBonus();
            const winAmount = Math.floor(bets.roulette * winMultiplier * (1 + winBonus));
            balance += winAmount;
            lastWin = winAmount;
            showMessage('roulette', `🎉 ПОБЕДА! ${winAmount}! 🎉`, 'win');
        } else {
            showMessage('roulette', 'Не повезло!', 'lose');
        }

        rouletteSpinning = false;
        updateStats();
    }, 3000);
}
