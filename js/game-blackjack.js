// Blackjack Game
let dealerHand = [];
let playerHand = [];
let deck = [];
let blackjackActive = false;

const cardValues = {
    'A': 11, 'K': 10, 'Q': 10, 'J': 10, '10': 10,
    '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
};

const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

function createDeck() {
    deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getCardValue(card) {
    return cardValues[card.value];
}

function calculateHand(hand) {
    let total = 0;
    let aces = 0;
    
    for (const card of hand) {
        total += getCardValue(card);
        if (card.value === 'A') aces++;
    }
    
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    
    return total;
}

function renderCard(card, container, hidden = false) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}`;
    
    if (hidden) {
        cardEl.classList.add('hidden');
        cardEl.textContent = '';
    } else {
        cardEl.textContent = `${card.value}${card.suit}`;
    }
    
    container.appendChild(cardEl);
}

function updateBlackjackDisplay(revealDealer = false) {
    const dealerContainer = document.getElementById('dealer-cards');
    const playerContainer = document.getElementById('player-cards');
    
    dealerContainer.innerHTML = '';
    playerContainer.innerHTML = '';
    
    dealerHand.forEach((card, index) => {
        if (index === 0 && !revealDealer) {
            renderCard(card, dealerContainer, true);
        } else {
            renderCard(card, dealerContainer);
        }
    });
    
    playerHand.forEach(card => renderCard(card, playerContainer));
    
    document.getElementById('player-total').textContent = calculateHand(playerHand);
    
    if (revealDealer) {
        document.getElementById('dealer-total').textContent = calculateHand(dealerHand);
    } else {
        document.getElementById('dealer-total').textContent = '?';
    }
}

function startBlackjack() {
    if (balance < bets.blackjack) {
        showMessage('blackjack', '❌ Недостаточно средств!', 'lose');
        return;
    }

    balance -= bets.blackjack;
    updateStats();

    createDeck();
    dealerHand = [deck.pop(), deck.pop()];
    playerHand = [deck.pop(), deck.pop()];
    blackjackActive = true;

    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;

    updateBlackjackDisplay();
    showMessage('blackjack', 'Ваш ход!', 'win');

    // Check for blackjack
    if (calculateHand(playerHand) === 21) {
        stand();
    }
}

function hit() {
    if (!blackjackActive) return;

    playerHand.push(deck.pop());
    updateBlackjackDisplay();

    const playerTotal = calculateHand(playerHand);
    
    if (playerTotal > 21) {
        endBlackjack('bust');
    }
}

function stand() {
    if (!blackjackActive) return;

    // Dealer plays
    while (calculateHand(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }

    updateBlackjackDisplay(true);

    const playerTotal = calculateHand(playerHand);
    const dealerTotal = calculateHand(dealerHand);

    if (dealerTotal > 21) {
        endBlackjack('dealer_bust');
    } else if (playerTotal > dealerTotal) {
        endBlackjack('win');
    } else if (playerTotal < dealerTotal) {
        endBlackjack('lose');
    } else {
        endBlackjack('push');
    }
}

function endBlackjack(result) {
    blackjackActive = false;
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;

    let winAmount = 0;
    let itemName = '';

    switch (result) {
        case 'bust':
            showMessage('blackjack', '💥 Перебор! Вы проиграли!', 'lose');
            break;
        case 'dealer_bust':
            winAmount = bets.blackjack * 2;
            showMessage('blackjack', `🎉 Дилер перебрал! Победа ${winAmount}! 🎉`, 'win');
            break;
        case 'win':
            const playerTotal = calculateHand(playerHand);
            const isBlackjack = playerHand.length === 2 && playerTotal === 21;
            winAmount = isBlackjack ? Math.floor(bets.blackjack * 2.5) : bets.blackjack * 2;
            showMessage('blackjack', isBlackjack ? `🎉 БЛЭКДЖЕК! Победа ${winAmount}! 🎉` : `🎉 Победа! ${winAmount}! 🎉`, 'win');
            break;
        case 'lose':
            showMessage('blackjack', 'Дилер выиграл!', 'lose');
            break;
        case 'push':
            winAmount = bets.blackjack;
            showMessage('blackjack', `Ничья! Возврат ${winAmount}`, 'win');
            break;
    }

    if (winAmount > 0) {
        addToBalance(winAmount);
        lastWin = winAmount;
    }

    updateStats();
}
