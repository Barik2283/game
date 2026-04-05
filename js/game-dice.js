// Dice Game
let selectedDiceBet = null;

function selectDiceBet(type) {
    selectedDiceBet = type;
    document.querySelectorAll('#game-dice .dice-bet-btn').forEach(btn => btn.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function rollDice() {
    if (!selectedDiceBet) {
        showMessage('dice', '❌ Выберите ставку!', 'lose');
        return;
    }
    if (balance < bets.dice) {
        showMessage('dice', '❌ Недостаточно средств!', 'lose');
        return;
    }

    balance -= bets.dice;
    updateStats();

    const diceEls = [document.getElementById('dice-1'), document.getElementById('dice-2')];
    diceEls.forEach(die => die.classList.add('rolling'));

    setTimeout(() => {
        diceEls.forEach(die => die.classList.remove('rolling'));

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;

        diceEls[0].textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice1 - 1];
        diceEls[1].textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice2 - 1];

        let winMultiplier = 0;
        if (selectedDiceBet === 'under7' && total < 7) winMultiplier = 2;
        else if (selectedDiceBet === 'exactly7' && total === 7) winMultiplier = 5;
        else if (selectedDiceBet === 'over7' && total > 7) winMultiplier = 2;

        if (winMultiplier > 0) {
            const winAmount = bets.dice * winMultiplier;
            addToBalance(winAmount);
            lastWin = winAmount;
            showMessage('dice', `🎉 ПОБЕДА! ${winAmount}! 🎉`, 'win');
        } else {
            showMessage('dice', `Выпало ${total}. Не повезло!`, 'lose');
        }

        updateStats();
    }, 1000);
}
