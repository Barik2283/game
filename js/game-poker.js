// Poker Game
let pokerHand = [];
let pokerHeld = [];
let pokerPhase = 'deal'; // 'deal' or 'draw'

const pokerSuits = ['♠', '♥', '♦', '♣'];
const pokerValues = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

function createPokerDeck() {
    const deck = [];
    for (const suit of pokerSuits) {
        for (const value of pokerValues) {
            deck.push({ suit, value });
        }
    }
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function getCardColor(suit) {
    return (suit === '♥' || suit === '♦') ? 'red' : 'black';
}

function renderPokerHand() {
    const container = document.getElementById('poker-cards');
    container.innerHTML = '';
    
    pokerHand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${getCardColor(card.suit)}`;
        
        if (card === null) {
            cardEl.classList.add('hidden');
        } else {
            cardEl.textContent = `${card.value}${card.suit}`;
            if (pokerHeld[index]) {
                cardEl.classList.add('held');
            }
            cardEl.onclick = () => toggleHold(index);
        }
        
        container.appendChild(cardEl);
    });
}

function toggleHold(index) {
    if (pokerPhase !== 'draw') return;
    pokerHeld[index] = !pokerHeld[index];
    renderPokerHand();
}

function dealPoker() {
    if (balance < bets.poker) {
        showMessage('poker', '❌ Недостаточно средств!', 'lose');
        return;
    }

    balance -= bets.poker;
    updateStats();

    const deck = createPokerDeck();
    pokerHand = [];
    pokerHeld = [false, false, false, false, false];

    for (let i = 0; i < 5; i++) {
        pokerHand.push(deck.pop());
    }

    pokerPhase = 'draw';
    renderPokerHand();

    document.getElementById('hold-btn').disabled = false;
    document.getElementById('draw-btn').disabled = false;

    showMessage('poker', 'Выберите карты для замены', 'win');
}

function holdCards() {
    if (pokerPhase !== 'draw') return;
    showMessage('poker', 'Нажмите "Добрать" чтобы продолжить', 'win');
}

function drawPoker() {
    if (pokerPhase !== 'draw') return;

    const deck = createPokerDeck();
    
    // Replace unheld cards
    for (let i = 0; i < 5; i++) {
        if (!pokerHeld[i]) {
            pokerHand[i] = deck.pop();
        }
    }
    
    pokerPhase = 'deal';
    renderPokerHand();
    
    document.getElementById('hold-btn').disabled = true;
    document.getElementById('draw-btn').disabled = true;
    
    // Evaluate hand
    evaluatePokerHand();
}

function evaluatePokerHand() {
    const values = pokerHand.map(c => c.value);
    const suits = pokerHand.map(c => c.suit);
    
    const valueCounts = {};
    values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
    
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const isFlush = suits.every(s => s === suits[0]);
    
    const valueOrder = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    const indices = values.map(v => valueOrder.indexOf(v)).sort((a, b) => a - b);
    const isStraight = indices.every((v, i, arr) => i === 0 || v === arr[i-1] + 1) ||
                       (indices[0] === 0 && indices[1] === 1 && indices[2] === 2 && indices[3] === 3 && indices[4] === 12); // A-2-3-4-5
    
    let multiplier = 0;
    let handName = '';
    
    if (isFlush && isStraight && values.includes('A') && values.includes('K')) {
        multiplier = 250;
        handName = '🂡 РОЯЛЬ ФЛЕШ!';
    } else if (isStraight && isFlush) {
        multiplier = 50;
        handName = '🂦 СТРИТ ФЛЕШ!';
    } else if (counts[0] === 4) {
        multiplier = 25;
        handName = '🂡🂡🂡🂡 КАРЕ!';
    } else if (counts[0] === 3 && counts[1] === 2) {
        multiplier = 9;
        handName = '🂡🂡🂡🂫🂫 ФУЛЛ ХАУС!';
    } else if (isFlush) {
        multiplier = 6;
        handName = '🂡♥ ФЛЕШ!';
    } else if (isStraight) {
        multiplier = 4;
        handName = '🂦 СТРИТ!';
    } else if (counts[0] === 3) {
        multiplier = 3;
        handName = '🂡🂡🂡 СЕТ!';
    } else if (counts[0] === 2 && counts[1] === 2) {
        multiplier = 2;
        handName = '🂡🂡🂫🂫 2 ПАРЫ!';
    } else if (counts[0] === 2) {
        // Check if Jacks or Better
        const pairValue = Object.keys(valueCounts).find(k => valueCounts[k] === 2);
        if (['A', 'K', 'Q', 'J'].includes(pairValue)) {
            multiplier = 1;
            handName = '🂡🂫 ПАРА (Валеты+)!';
        }
    }
    
    if (multiplier > 0) {
        const winAmount = bets.poker * multiplier;
        addToBalance(winAmount);
        lastWin = winAmount;
        showMessage('poker', `🎉 ${handName} ПОБЕДА ${winAmount}! 🎉`, 'win');
    } else {
        showMessage('poker', 'Нет комбинации. Попробуй ещё!', 'lose');
    }

    updateStats();
}
