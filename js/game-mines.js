// Mines Game
let minesCount = 3;
let minesGrid = [];
let minesRevealed = 0;
let minesActive = false;

function initMinesGrid() {
    const grid = document.getElementById('mines-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'card hidden';
        cell.style.width = '60px';
        cell.style.height = '60px';
        cell.style.fontSize = '2em';
        cell.style.margin = '0 auto';
        cell.onclick = () => revealMine(i);
        grid.appendChild(cell);
    }
}

function setMinesCount(count) {
    minesCount = count;
    document.querySelectorAll('#game-mines .dice-bet-btn').forEach(btn => btn.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function startMines() {
    if (balance < bets.mines) {
        showMessage('mines', '❌ Недостаточно средств!', 'lose');
        return;
    }

    balance -= bets.mines;
    updateStats();

    minesGrid = Array(25).fill('gem');
    let placed = 0;
    while (placed < minesCount) {
        const pos = Math.floor(Math.random() * 25);
        if (minesGrid[pos] !== 'mine') {
            minesGrid[pos] = 'mine';
            placed++;
        }
    }

    minesRevealed = 0;
    minesActive = true;
    document.getElementById('cashout-btn').style.display = 'inline-block';
    showMessage('mines', 'Ищите сокровища! 💎', 'win');

    initMinesGrid();
}

function revealMine(index) {
    if (!minesActive) return;

    const cells = document.querySelectorAll('#mines-grid .card');
    const cell = cells[index];
    
    if (cell.classList.contains('revealed')) return;

    cell.classList.add('revealed');

    if (minesGrid[index] === 'mine') {
        cell.textContent = '💣';
        cell.style.background = '#e74c3c';
        minesActive = false;
        document.getElementById('cashout-btn').style.display = 'none';
        showMessage('mines', '💣 БУМ! Проиграл!', 'lose');
        
        cells.forEach((c, i) => {
            if (minesGrid[i] === 'mine') {
                c.textContent = '💣';
                c.style.background = '#e74c3c';
            } else if (!c.classList.contains('revealed')) {
                c.textContent = '💎';
            }
        });
    } else {
        cell.textContent = '💎';
        cell.style.background = '#00b894';
        minesRevealed++;
        
        const currentWin = Math.floor(bets.mines * (1 + minesRevealed * 0.5));
        showMessage('mines', `Можно забрать: ${currentWin}`, 'win');
    }
}

function cashoutMines() {
    if (!minesActive) return;

    const winAmount = Math.floor(bets.mines * (1 + minesRevealed * 0.5));
    const itemName = `💣 Мины (${minesRevealed} камней)`;
    addToBalance(winAmount, itemName);
    lastWin = winAmount;
    minesActive = false;
    document.getElementById('cashout-btn').style.display = 'none';
    showMessage('mines', `🎉 Забрал ${winAmount}! 🎉`, 'win');
    updateStats();

    const cells = document.querySelectorAll('#mines-grid .card');
    cells.forEach((c, i) => {
        if (minesGrid[i] === 'mine') {
            c.textContent = '💣';
            c.style.background = '#e74c3c';
        } else {
            c.textContent = '💎';
        }
    });
}
