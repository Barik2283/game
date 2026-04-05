// Main Game State - CENSORED VERSION for Yandex Games
let balance = 5000;
let jackpot = 50000;
let lastWin = 0;
let credit = 0;
let creditTimer = null;
let furnitureOwned = ['tv', 'sofa', 'fridge', 'bed', 'table', 'lamp'];
let upgradesOwned = ['kidney', 'liver', 'eye', 'lung', 'heart', 'brain', 'stomach', 'skin'];
let screenBroken = false;
let collectorsActive = false;
let collectorTimer = null;
let povertyMode = false;

// Upgrade bonuses
const upgradeBonuses = {
    'kidney': { name: 'Метаболизм', bonus: '💰 +10% к выигрышам', effect: 'win_bonus', value: 0.1 },
    'liver': { name: 'Выносливость', bonus: '🛡️ +20% к удаче', effect: 'luck', value: 0.2 },
    'eye': { name: 'Зоркость', bonus: '👁️ +5% к удаче', effect: 'luck', value: 0.05 },
    'lung': { name: 'Дыхание', bonus: '🫁 Быстрое восстановление', effect: 'recovery_speed', value: 2 },
    'heart': { name: 'Удача', bonus: '❤️ +15% к выигрышам', effect: 'win_bonus', value: 0.15 },
    'brain': { name: 'Интеллект', bonus: '🧠 Умные решения', effect: 'show_odds', value: 1 },
    'stomach': { name: 'Железный желудок', bonus: '💪 +10% к выигрышам', effect: 'win_bonus', value: 0.1 },
    'skin': { name: 'Молодость', bonus: '👶 Молодой вид', effect: 'charm', value: 0.05 }
};

function getWinBonus() {
    let bonus = 0;
    if (upgradesOwned.includes('kidney')) bonus += upgradeBonuses['kidney'].value;
    if (upgradesOwned.includes('liver')) bonus += upgradeBonuses['liver'].value;
    if (upgradesOwned.includes('heart')) bonus += upgradeBonuses['heart'].value;
    if (upgradesOwned.includes('stomach')) bonus += upgradeBonuses['stomach'].value;
    return bonus;
}

function getLuckBonus() {
    let luck = 0;
    if (upgradesOwned.includes('eye')) luck += upgradeBonuses['eye'].value;
    if (upgradesOwned.includes('liver')) luck += upgradeBonuses['liver'].value;
    return luck;
}

function applyUpgradeBonuses() {
    // Passive bonuses applied automatically
}

// Apply upgrade bonuses every 10 seconds
setInterval(() => {
    applyUpgradeBonuses();
}, 10000);

const bets = {
    slots: 100,
    roulette: 100,
    cards: 100,
    dice: 100,
    mines: 100,
    wheel: 100,
    blackjack: 100,
    poker: 100
};

// Slot symbols with weights
const slotSymbols = ['🍎', '🍏', '🍌', '🍇', '🌿', '💎'];
const slotWeights = [28, 23, 18, 10, 11, 10];
const slotMultipliers = { '🍎': 100, '🍏': 200, '🍌': 500, '🍇': 1000, '🌿': 2500, '💎': 'jackpot' };

// Utility Functions
let lastBalance = 5000;

function updateStats() {
    const balanceEl = document.getElementById('balance');
    const jackpotEl = document.getElementById('jackpot');
    const lastWinEl = document.getElementById('lastWin');

    if (balanceEl) balanceEl.textContent = balance;
    if (jackpotEl) jackpotEl.textContent = jackpot;
    if (lastWinEl) lastWinEl.textContent = lastWin;

    // Animate balance change
    if (balanceEl) {
        if (balance > lastBalance) {
            balanceEl.classList.add('balance-up');
            setTimeout(() => balanceEl.classList.remove('balance-up'), 1000);
        } else if (balance < lastBalance) {
            balanceEl.classList.add('balance-down');
            setTimeout(() => balanceEl.classList.remove('balance-down'), 1000);
        }
    }
    lastBalance = balance;

    // Show/hide credit display
    const creditStat = document.getElementById('credit-stat');
    const creditDisplay = document.getElementById('credit-display');
    const repayBtn = document.getElementById('repay-credit-btn');

    if (creditStat && creditDisplay && repayBtn) {
        if (credit > 0) {
            creditStat.style.display = 'block';
            creditDisplay.textContent = credit;
            repayBtn.style.display = 'inline-block';
        } else {
            creditStat.style.display = 'none';
            creditDisplay.textContent = '0';
            repayBtn.style.display = 'none';
        }
    }
}

function changeBet(game, amount) {
    bets[game] = Math.max(50, Math.min(bets[game] + amount, balance));
    document.getElementById(`bet-input-${game}`).value = bets[game];
}

function setBet(game, value) {
    let val = parseInt(value) || 50;
    bets[game] = Math.max(50, Math.min(val, balance));
    document.getElementById(`bet-input-${game}`).value = bets[game];
}

function maxBet(game) {
    bets[game] = balance;
    document.getElementById(`bet-input-${game}`).value = balance;
}

function showMessage(game, text, type) {
    const el = document.getElementById(`message-${game}`);
    if (el) {
        el.textContent = text;
        el.className = `message ${type}`;
        el.style.display = 'block';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        // Auto-hide after 6 seconds
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => {
                el.style.display = 'none';
                el.textContent = '';
                el.className = 'message';
            }, 300);
        }, 6000);
    }
}

// Show global notification (replaces alert)
function showNotification(text, type = 'info', duration = 4000) {
    // Remove existing notification
    const existing = document.querySelector('.global-notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = `global-notification ${type}`;
    notif.textContent = text;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        border-radius: 15px;
        font-size: 1.1em;
        font-weight: bold;
        z-index: 10000;
        animation: notifSlideIn 0.3s ease;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 5px 30px rgba(0,0,0,0.5);
    `;

    if (type === 'win') {
        notif.style.background = 'linear-gradient(45deg, #00b894, #00a085)';
        notif.style.color = '#fff';
    } else if (type === 'lose') {
        notif.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
        notif.style.color = '#fff';
    } else if (type === 'warning') {
        notif.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
        notif.style.color = '#fff';
    } else {
        notif.style.background = 'linear-gradient(45deg, #3498db, #2980b9)';
        notif.style.color = '#fff';
    }

    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'notifSlideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, duration);
}

// Make showNotification globally accessible
window.showNotification = showNotification;
window.showMessage = showMessage;

function getRandomSymbol() {
    const totalWeight = slotWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < slotSymbols.length; i++) {
        if (random < slotWeights[i]) return slotSymbols[i];
        random -= slotWeights[i];
    }
    return slotSymbols[0];
}

function addToBalance(amount, itemName) {
    balance += amount;
    lastWin = amount;
    updateStats();
}

// Game Navigation
function showGame(game) {
    document.querySelectorAll('.game-container').forEach(el => el.style.display = 'none');
    document.getElementById(`game-${game}`).style.display = 'block';

    document.querySelectorAll('.game-btn').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (game === 'mines') {
        initMinesGrid();
    }
}

// Age Verification
function confirmAge() {
    document.getElementById('ageWarningModal').classList.remove('active');
}

// Credit Modal
function showCreditModal() {
    const modal = document.getElementById('creditModal');
    const debtDisplay = document.getElementById('current-debt-display');
    const repayBtn = document.getElementById('repay-credit-btn');
    
    if (credit > 0) {
        if (debtDisplay) debtDisplay.textContent = `Текущий долг: ${credit} монет`;
        if (repayBtn) repayBtn.style.display = 'inline-block';
    } else {
        if (debtDisplay) debtDisplay.textContent = 'Долгов нет!';
        if (repayBtn) repayBtn.style.display = 'none';
    }
    
    if (modal) modal.classList.add('active');
}

function hideCreditModal() {
    const modal = document.getElementById('creditModal');
    if (modal) modal.classList.remove('active');
}

function repayCredit() {
    if (credit <= 0) {
        showNotification('У тебя нет долга!', 'info');
        return;
    }

    if (balance >= credit) {
        const debtAmount = credit;
        balance -= credit;
        credit = 0;
        if (creditTimer) clearInterval(creditTimer);
        fixScreen();
        stopCollectors();
        updateStats();
        showNotification(`✅ Кредит погашен! Списано: ${debtAmount} монет. Ты свободен! 🎉`, 'win', 5000);
        hideCreditModal();
    } else {
        const payment = balance;
        credit -= payment;
        balance = 0;
        updateStats();
        showNotification(`💳 Частичное погашение! Внесено: ${payment} | Остаток долга: ${credit}`, 'warning', 5000);
    }
}

function takeCredit(amount) {
    credit += amount;
    balance += amount;
    updateStats();
    hideCreditModal();

    showNotification(`✅ Взято ${amount} монет | Долг: ${credit}`, 'warning', 4000);

    // Start credit timer
    if (creditTimer) clearInterval(creditTimer);
    creditTimer = setInterval(() => {
        if (credit > 0) {
            credit = Math.floor(credit * 1.1); // 10% interest
            updateStats();
            saveGameData();

            // Check if debt is too high
            if (credit > 50000 && !screenBroken) {
                breakScreen();
            }

            // Start collectors after 30 seconds of unpaid debt
            if (credit > 10000 && !collectorsActive) {
                startCollectors();
            }
        }
    }, 30000); // Every 30 seconds (not 5!)
}

// Screen break effect
function breakScreen() {
    screenBroken = true;
    document.body.classList.add('screen-broken');

    // Create crack elements
    const cracks = [
        { top: '10%', left: '20%', rotation: 45 },
        { top: '30%', left: '60%', rotation: -30 },
        { top: '60%', left: '30%', rotation: 60 },
        { top: '50%', left: '70%', rotation: -45 },
        { top: '80%', left: '50%', rotation: 30 },
    ];

    cracks.forEach((crack, i) => {
        setTimeout(() => {
            const crackEl = document.createElement('div');
            crackEl.className = 'crack';
            crackEl.style.top = crack.top;
            crackEl.style.left = crack.left;
            crackEl.style.transform = `rotate(${crack.rotation}deg)`;
            document.body.appendChild(crackEl);
        }, i * 200);
    });

    // Show threat message
    setTimeout(() => {
        showNotification('🚨 ТЫ НЕ ОПЛАТИЛ КРЕДИТ! БРИГАДА ВЫЕХАЛА... 👊 Экран сломан!', 'lose', 5000);
    }, 1500);
}

function fixScreen() {
    screenBroken = false;
    document.body.classList.remove('screen-broken');
    document.querySelectorAll('.crack').forEach(el => el.remove());
    showNotification('🔧 Экран починили! Продолжай игру!', 'win');
}

// Collectors
function startCollectors() {
    collectorsActive = true;
    document.body.classList.add('collectors-mode');

    // Create collector message
    const collectorEl = document.createElement('div');
    collectorEl.className = 'collector-message';
    collectorEl.innerHTML = `
        <div class="collector-icon">👊</div>
        <div class="collector-text">КОЛЛЕКТОРЫ<br>ВЫЕХАЛИ</div>
    `;
    document.body.appendChild(collectorEl);

    // Collector threat messages (CENSORED)
    const threats = [
        '💳 КОЛЛЕКТОРЫ: "Где деньги?"',
        '🏃 ОНИ ВЫЕХАЛИ...',
        '📞 "АЛЛО, ЭТО БАНК? МЫ ВЫЕЗЖАЕМ..."',
        '💳 ДОЛГ: ' + credit + ' МОНЕТ',
        '⏰ ВРЕМЯ ВЫШЛО...'
    ];

    let threatIndex = 0;
    collectorTimer = setInterval(() => {
        if (credit > 0) {
            showMessage('blackjack', threats[threatIndex % threats.length], 'lose');
            threatIndex++;

            // Random screen flash
            if (Math.random() > 0.7) {
                document.body.classList.add('flash-red');
                setTimeout(() => document.body.classList.remove('flash-red'), 200);
            }
        } else {
            stopCollectors();
        }
    }, 8000);

    showNotification('🚨 КОЛЛЕКТОРЫ ВЫЕХАЛИ! Продавай апгрейды или гаси кредит!', 'lose', 5000);
}

function stopCollectors() {
    collectorsActive = false;
    document.body.classList.remove('collectors-mode');
    document.querySelectorAll('.collector-message').forEach(el => el.remove());
    if (collectorTimer) clearInterval(collectorTimer);
    showNotification('🎉 КОЛЛЕКТОРЫ УЕХАЛИ! Долг оплачен!', 'win');
}

// Upgrades (was Organs) - CENSORED VERSION
function showUpgradesModal() {
    renderUpgradesModal();
    const modal = document.getElementById('upgradesModal');
    if (modal) modal.classList.add('active');
}

function renderUpgradesModal() {
    const upgradesList = document.querySelector('.upgrades-list');
    if (!upgradesList) return;

    const upgrades = [
        { id: 'kidney', icon: '🫘', name: 'Метаболизм', price: 5000, bonus: '🫘 -20% энергии' },
        { id: 'liver', icon: '🟤', name: 'Выносливость', price: 8000, bonus: '🟤 -30% энергии' },
        { id: 'eye', icon: '👁️', name: 'Зоркость', price: 3000, bonus: '👁️ +5% удачи' },
        { id: 'lung', icon: '🫁', name: 'Дыхание', price: 6000, bonus: '🫁 Восстановление' },
        { id: 'heart', icon: '❤️', name: 'Удача', price: 10000, bonus: '❤️ +10% выигрыш' },
        { id: 'brain', icon: '🧠', name: 'Интеллект', price: 15000, bonus: '🧠 Видишь шансы' },
        { id: 'stomach', icon: '🤢', name: 'Железный желудок', price: 7000, bonus: '🤢 +50% энергия' },
        { id: 'skin', icon: '👶', name: 'Молодость', price: 4000, bonus: '👶 Свежий вид' }
    ];

    upgradesList.innerHTML = upgrades.map(upgrade => {
        const isSold = !upgradesOwned.includes(upgrade.id);
        return `
            <div class="upgrade-item ${isSold ? 'sold' : ''}"
                 onclick="${isSold ? 'return false;' : `sellUpgrade('${upgrade.id}', ${upgrade.price})`}">
                <span class="upgrade-icon">${upgrade.icon}</span>
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-bonus">${upgrade.bonus}</span>
                <span class="upgrade-price">${isSold ? 'КУПЛЕНО' : upgrade.price}</span>
            </div>
        `;
    }).join('');
}

function hideUpgradesModal() {
    const modal = document.getElementById('upgradesModal');
    if (modal) modal.classList.remove('active');
}

function sellUpgrade(upgrade, price) {
    const index = upgradesOwned.indexOf(upgrade);
    if (index === -1) {
        showNotification('😵 Этот апгрейд уже куплен!', 'warning');
        return;
    }

    upgradesOwned.splice(index, 1);
    balance += price;
    updateStats();

    const names = {
        'kidney': 'Метаболизм',
        'liver': 'Выносливость',
        'eye': 'Зоркость',
        'lung': 'Дыхание',
        'heart': 'Удача',
        'brain': 'Интеллект',
        'stomach': 'Железный желудок',
        'skin': 'Молодость'
    };

    // Auto-pay credit if exists
    if (credit > 0) {
        const payment = Math.min(credit, price);
        credit -= payment;
        balance -= payment;
        updateStats();

        showNotification(`💳 Продано: ${names[upgrade]} за ${price} | Погашено кредита: ${payment} | Остаток долга: ${credit}`, 'info', 5000);

        if (credit <= 0) {
            credit = 0;
            if (creditTimer) clearInterval(creditTimer);
            fixScreen();
            stopCollectors();
            showNotification('🎉 КРЕДИТ ОПЛАЧЕН! Ты свободен!', 'win', 5000);
        }
    } else {
        showNotification(`💰 Продано: ${names[upgrade]} за ${price} | Баланс: ${balance}`, 'win', 4000);
    }

    if (upgradesOwned.length === 0) {
        showNotification('⚡ ВСЕ АПГРЕЙДЫ ПРОДАНЫ! Теперь только выигрывать!', 'warning', 5000);
    }

    hideUpgradesModal();
}

// Furniture Modal
function showFurnitureModal() {
    const modal = document.getElementById('furnitureModal');
    if (modal) modal.classList.add('active');
}

function hideFurnitureModal() {
    const modal = document.getElementById('furnitureModal');
    if (modal) modal.classList.remove('active');
}

function sellFurniture(item, price) {
    const index = furnitureOwned.indexOf(item);
    if (index === -1) {
        showNotification('😅 Это уже продано!', 'warning');
        return;
    }

    furnitureOwned.splice(index, 1);
    balance += price;
    updateStats();

    const names = {
        'tv': 'Телевизор',
        'sofa': 'Диван',
        'fridge': 'Холодильник',
        'bed': 'Кровать',
        'table': 'Стол',
        'lamp': 'Лампа'
    };

    // Auto-pay credit if exists
    if (credit > 0) {
        const payment = Math.min(credit, price);
        credit -= payment;
        balance -= payment;
        updateStats();
        showNotification(`💰 Продано: ${names[item]} за ${price} | Погашено кредита: ${payment} | Остаток долга: ${credit}`, 'info', 5000);

        if (credit <= 0) {
            credit = 0;
            if (creditTimer) clearInterval(creditTimer);
            fixScreen();
            stopCollectors();
            showNotification('🎉 КРЕДИТ ОПЛАЧЕН! Ты свободен!', 'win', 5000);
        }
    } else {
        showNotification(`💰 Продано: ${names[item]} за ${price} монет`, 'win');
    }

    if (furnitureOwned.length === 0) {
        showNotification('🏠 ВСЁ! ПУСТАЯ ХАТА! Теперь только выигрывать!', 'warning', 5000);
    }

    hideFurnitureModal();
}

// Shop System - Bonus items
const shopItems = {
    'winboost': { name: '💰 Бонус удачи', price: 1000, effect: 'win_bonus', value: 0.1 },
    'luckboost': { name: '🍀 Бонус удачи', price: 2000, effect: 'luck_bonus', value: 0.15 },
    'megabonus': { name: '⭐ Мега бонус', price: 5000, effect: 'mega_bonus', value: 0.25 },
    'jackpot': { name: '💎 Джекпот буст', price: 10000, effect: 'jackpot_bonus', value: 10000 }
};

function showShopModal() {
    renderShopModal();
    const modal = document.getElementById('shopModal');
    if (modal) modal.classList.add('active');
}

function hideShopModal() {
    const modal = document.getElementById('shopModal');
    if (modal) modal.classList.remove('active');
}

function renderShopModal() {
    const shopList = document.querySelector('.shop-list');
    if (!shopList) return;

    shopList.innerHTML = Object.entries(shopItems).map(([id, item]) => `
        <div class="shop-item ${item.effect}" onclick="buyItem('${id}')">
            <span class="shop-icon">${item.name.split(' ')[0]}</span>
            <span class="shop-name">${item.name.split(' ').slice(1).join(' ')}</span>
            <span class="shop-price">${item.price}</span>
            <span class="shop-effect">+${Math.round(item.value * 100)}% бонус</span>
        </div>
    `).join('');
}

function buyItem(itemId) {
    const item = shopItems[itemId];
    if (!item) return;

    if (balance < item.price) {
        showNotification('❌ Недостаточно денег!', 'lose');
        return;
    }

    balance -= item.price;
    
    // Apply bonus
    if (item.effect === 'jackpot_bonus') {
        jackpot += item.value;
        showNotification(`${item.name} куплен! Джекпот: ${jackpot}`, 'win', 4000);
    } else {
        showNotification(`${item.name} куплен! Баланс: ${balance}`, 'win', 4000);
    }
    
    updateStats();
    renderShopModal();
}

function updateEnergyDisplay() {
    // Energy system removed
}

// Jackpot growth
setInterval(() => {
    jackpot += 10;
    updateStats();
}, 2000);

// Initialize after DOM is ready
function initGame() {
    updateStats();
    renderUpgradesModal();
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
