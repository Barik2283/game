// Cards Game
let selectedCardColor = null;
let selectedCardIndex = null;
let cards = [];

function selectCardColor(color) {
    selectedCardColor = color;
    document.querySelectorAll('#game-cards .dice-bet-btn').forEach(btn => btn.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function selectCard(index) {
    selectedCardIndex = index;
    document.querySelectorAll('#cards-area .card').forEach((card, i) => {
        card.style.border = i === index ? '3px solid #ffd700' : '3px solid #333';
    });
}

function playCards() {
    if (!selectedCardColor) {
        showMessage('cards', '❌ Выберите цвет!', 'lose');
        return;
    }
    if (selectedCardIndex === null) {
        showMessage('cards', '❌ Выберите карту!', 'lose');
        return;
    }
    if (balance < bets.cards) {
        showMessage('cards', '❌ Недостаточно средств!', 'lose');
        return;
    }

    balance -= bets.cards;
    updateStats();

    const suits = {
        red: ['♥', '♦'],
        black: ['♠', '♣']
    };
    const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

    cards = [];
    for (let i = 0; i < 3; i++) {
        const color = Math.random() > 0.5 ? 'red' : 'black';
        const suit = suits[color][Math.floor(Math.random() * 2)];
        const value = values[Math.floor(Math.random() * values.length)];
        cards.push({ color, suit, value });
    }

    const cardEls = document.querySelectorAll('#cards-area .card');
    cardEls.forEach((card, index) => {
        card.classList.remove('hidden');
        card.className = `card ${cards[index].color}`;
        card.textContent = `${cards[index].value}${cards[index].suit}`;
    });

    setTimeout(() => {
        if (cards[selectedCardIndex].color === selectedCardColor) {
            const winAmount = bets.cards * 2;
            addToBalance(winAmount);
            lastWin = winAmount;
            showMessage('cards', `🎉 УГАДАЛ! ${winAmount}! 🎉`, 'win');
        } else {
            showMessage('cards', 'Не угадал!', 'lose');
        }

        selectedCardIndex = null;
        updateStats();
    }, 500);
}
