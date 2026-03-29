// Wheel Game
let wheelSpinning = false;

function spinWheel() {
    if (wheelSpinning) return;
    if (balance < bets.wheel) {
        showMessage('wheel', '❌ Недостаточно средств!', 'lose');
        return;
    }

    balance -= bets.wheel;
    updateStats();
    wheelSpinning = true;

    const wheel = document.getElementById('wheel');
    const resultEl = document.getElementById('message-wheel');
    resultEl.textContent = '';
    resultEl.className = 'message';

    const rotations = 720 + Math.random() * 720;
    wheel.style.transform = `rotate(${rotations}deg)`;

    setTimeout(() => {
        wheel.style.transition = 'none';
        wheel.style.transform = 'rotate(0deg)';
        setTimeout(() => {
            wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        }, 50);

        // Calculate result based on final angle
        const segments = [2, 3, 5, 0, 10, 2, 3, 5];
        const normalizedRotation = rotations % 360;
        const segmentIndex = Math.floor((360 - normalizedRotation) / 45) % 8;
        const multiplier = segments[segmentIndex];

        if (multiplier > 0) {
            const winAmount = bets.wheel * multiplier;
            const itemName = `🎯 Колесо (x${multiplier})`;
            addToBalance(winAmount, itemName);
            lastWin = winAmount;
            showMessage('wheel', `🎉 ВЫПАЛО x${multiplier}! ПОБЕДА ${winAmount}! 🎉`, 'win');
        } else {
            showMessage('wheel', 'Выпало x0... Не повезло!', 'lose');
        }

        wheelSpinning = false;
        updateStats();
    }, 4000);
}
