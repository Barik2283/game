// Main Game State - CENSORED VERSION for Yandex Games
let balance = 5000;
let jackpot = 50000;
let lastWin = 0;
let credit = 0;
let creditTimer = null;
let furnitureOwned = ['tv', 'sofa', 'fridge', 'bed', 'table', 'lamp'];
let upgradesOwned = ['kidney', 'liver', 'eye', 'lung', 'heart', 'brain', 'stomach', 'skin']; // was organsOwned
let screenBroken = false;
let collectorsActive = false;
let collectorTimer = null;
let energy = 0; // was intoxication (0-100) - renamed for Yandex Games
let povertyMode = false;

// Upgrade bonuses (was organBonuses)
const upgradeBonuses = {
    'kidney': { name: 'Метаболизм', bonus: '🫘 -20% к энергии', effect: 'energy_reduction', value: 0.2 },
    'liver': { name: 'Выносливость', bonus: '🟤 -30% к энергии', effect: 'energy_reduction', value: 0.3 },
    'eye': { name: 'Зоркость', bonus: '👁️ +5% к удаче', effect: 'luck', value: 0.05 },
    'lung': { name: 'Дыхание', bonus: '🫁 Быстрее восстановление', effect: 'recovery_speed', value: 2 },
    'heart': { name: 'Удача', bonus: '❤️ +10% к выигрышам', effect: 'win_bonus', value: 0.1 },
    'brain': { name: 'Интеллект', bonus: '🧠 Видишь шансы', effect: 'show_odds', value: 1 },
    'stomach': { name: 'Железный желудок', bonus: '🤢 +50% к энергии', effect: 'energy_capacity', value: 0.5 },
    'skin': { name: 'Молодость', bonus: '👶 Молодой вид', effect: 'charm', value: 0.05 }
};

// Energy reduction from upgrades
function getEnergyReduction() {
    let reduction = 0;
    if (upgradesOwned.includes('kidney')) reduction += upgradeBonuses['kidney'].value;
    if (upgradesOwned.includes('liver')) reduction += upgradeBonuses['liver'].value;
    if (upgradesOwned.includes('stomach')) reduction += upgradeBonuses['stomach'].value;
    return reduction;
}

function getWinBonus() {
    let bonus = 0;
    if (upgradesOwned.includes('heart')) bonus += upgradeBonuses['heart'].value;
    return bonus;
}

function getRecoverySpeed() {
    let speed = 0;
    if (upgradesOwned.includes('lung')) speed += upgradeBonuses['lung'].value;
    return speed;
}

function getLuckBonus() {
    let luck = 0;
    if (upgradesOwned.includes('eye')) luck += upgradeBonuses['eye'].value;
    return luck;
}

function applyUpgradeBonuses() {
    // Passive energy recovery over time
    if (energy > 0 && getRecoverySpeed() > 0) {
        energy = Math.max(0, energy - getRecoverySpeed());
        updateEnergyDisplay();
    }
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
function updateStats() {
    document.getElementById('balance').textContent = balance;
    document.getElementById('jackpot').textContent = jackpot;
    document.getElementById('lastWin').textContent = lastWin;

    // Show/hide credit display
    const creditStat = document.getElementById('credit-stat');
    const creditDisplay = document.getElementById('credit-display');
    const repayBtn = document.getElementById('repay-credit-btn');

    if (credit > 0) {
        creditStat.style.display = 'block';
        creditDisplay.textContent = credit;
        repayBtn.style.display = 'inline-block';
    } else {
        creditStat.style.display = 'none';
        creditDisplay.textContent = '0';
        repayBtn.style.display = 'none';
    }

    // Show/hide credit button based on balance
    const creditSection = document.getElementById('credit-section');
    if (balance <= 0) {
        creditSection.style.display = 'flex';
    } else {
        creditSection.style.display = 'none';
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
    }
}

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

// Withdraw Modal - CENSORED VERSION
function showWithdrawModal() {
    document.getElementById('withdraw-amount').textContent = balance;
    document.getElementById('withdrawModal').classList.add('active');
}

function hideWithdrawModal() {
    document.getElementById('withdrawModal').classList.remove('active');
}

function confirmWithdraw() {
    // Показываем напоминание о виртуальной валюте
    alert('⚠️ НАПОМИНАНИЕ\n\nВсе выигрыши являются виртуальными и не могут быть конвертированы в реальные деньги.\n\n(вывод отменён)');
    hideWithdrawModal();
}

// Credit Modal
function showCreditModal() {
    const debtDisplay = document.getElementById('current-debt-display');
    if (credit > 0) {
        debtDisplay.textContent = `Текущий долг: ${credit} монет`;
    } else {
        debtDisplay.textContent = '';
    }
    document.getElementById('creditModal').classList.add('active');
}

function hideCreditModal() {
    document.getElementById('creditModal').classList.remove('active');
}

function repayCredit() {
    if (credit <= 0) {
        alert('У тебя нет долга!');
        return;
    }

    if (balance >= credit) {
        balance -= credit;
        credit = 0;
        if (creditTimer) clearInterval(creditTimer);
        fixScreen();
        stopCollectors();
        updateStats();
        alert(`✅ Кредит погашен!\n\nСписано: ${credit} монет\n\nТы свободен! 🎉`);
    } else {
        const payment = balance;
        credit -= payment;
        balance = 0;
        updateStats();
        alert(`💳 Частичное погашение!\n\nВнесено: ${payment} монет\n💳 Остаток долга: ${credit}`);
    }
}

function takeCredit(amount) {
    credit += amount;
    balance += amount;
    updateStats();
    hideCreditModal();

    // Start credit timer
    if (creditTimer) clearInterval(creditTimer);
    creditTimer = setInterval(() => {
        if (credit > 0) {
            credit = Math.floor(credit * 1.1); // 10% interest
            updateStats();

            // Check if debt is too high
            if (credit > 50000 && !screenBroken) {
                breakScreen();
            }

            // Start collectors after 30 seconds of unpaid debt
            if (credit > 10000 && !collectorsActive) {
                startCollectors();
            }
        }
    }, 5000); // Every 5 seconds

    alert(`✅ Взято ${amount} монет\n\n💳 Долг: ${credit}\n⚠️ Проценты: 10% каждые 5 секунд!\n⚠️ При долге 50,000+ будет штраф!\n⚠️ При долге 10,000+ приедут коллекторы!`);
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
        alert('🚨 ВНИМАНИЕ! 🚨\n\nТЫ НЕ ОПЛАТИЛ КРЕДИТ!\n\nБРИГАДА ВЫЕХАЛА... 👊\n\nЭкран сломан! Продавай мебель чтобы оплатить долг!');
    }, 1500);
}

function fixScreen() {
    screenBroken = false;
    document.body.classList.remove('screen-broken');
    document.querySelectorAll('.crack').forEach(el => el.remove());
    alert('🔧 Экран починили! Продолжай игру!');
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

    alert('🚨 КОЛЛЕКТОРЫ ВЫЕХАЛИ! 🚨\n\nПродавай апгрейды чтобы оплатить долг!\n\nИли гаси кредит!');
}

function stopCollectors() {
    collectorsActive = false;
    document.body.classList.remove('collectors-mode');
    document.querySelectorAll('.collector-message').forEach(el => el.remove());
    if (collectorTimer) clearInterval(collectorTimer);
    alert('🎉 КОЛЛЕКТОРЫ УЕХАЛИ!\n\nДолг оплачен!');
}

// Upgrades (was Organs) - CENSORED VERSION
function showUpgradesModal() {
    renderUpgradesModal();
    document.getElementById('upgradesModal').classList.add('active');
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
    document.getElementById('upgradesModal').classList.remove('active');
}

function sellUpgrade(upgrade, price) {
    const index = upgradesOwned.indexOf(upgrade);
    if (index === -1) {
        alert('😵 Этот апгрейд уже куплен!');
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

        alert(`💳 Продано: ${names[upgrade]} за ${price} монет\n\n💳 Автоматически погашено кредита: ${payment}\n💳 Остаток долга: ${credit}`);

        if (credit <= 0) {
            credit = 0;
            if (creditTimer) clearInterval(creditTimer);
            fixScreen();
            stopCollectors();
            alert('🎉 КРЕДИТ ОПЛАЧЕН!\n\nТы свободен!');
        }
    } else {
        alert(`💰 Продано: ${names[upgrade]} за ${price} монет\n\n💰 Баланс: ${balance}`);
    }

    if (upgradesOwned.length === 0) {
        alert('⚡ ВСЕ АПГРЕЙДЫ ПРОДАНЫ!\n\nТеперь только выигрывать!');
    }

    hideUpgradesModal();
}

// Furniture Modal
function showFurnitureModal() {
    document.getElementById('furnitureModal').classList.add('active');
}

function hideFurnitureModal() {
    document.getElementById('furnitureModal').classList.remove('active');
}

function sellFurniture(item, price) {
    const index = furnitureOwned.indexOf(item);
    if (index === -1) {
        alert('😅 Это уже продано!');
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
        alert(`💰 Продано: ${names[item]} за ${price} монет\n\n💳 Автоматически погашено кредита: ${payment}\n💳 Остаток долга: ${credit}`);

        if (credit <= 0) {
            credit = 0;
            if (creditTimer) clearInterval(creditTimer);
            fixScreen();
            stopCollectors();
            alert('🎉 КРЕДИТ ОПЛАЧЕН! 🎉\n\nТы свободен!');
        }
    } else {
        alert(`💰 Продано: ${names[item]} за ${price} монет`);
    }

    if (furnitureOwned.length === 0) {
        alert('🏠 ВСЁ! ПУСТАЯ ХАТА!\nТеперь только выигрывать!');
    }

    hideFurnitureModal();
}

// Shop System - CENSORED (Energy instead of Alcohol)
const shopItems = {
    'energy': { name: '⚡ Энергетик', price: 100, effect: 10, type: 'energy' },
    'double': { name: '🔋 Двойной заряд', price: 300, effect: 25, type: 'energy' },
    'mega': { name: '⚡ Мега заряд', price: 500, effect: 40, type: 'energy' },
    'ultra': { name: '💎 Ультра буст', price: 1000, effect: 50, type: 'energy' }
};

function showShopModal() {
    renderShopModal();
    document.getElementById('shopModal').classList.add('active');
}

function hideShopModal() {
    document.getElementById('shopModal').classList.remove('active');
}

function renderShopModal() {
    const shopList = document.querySelector('.shop-list');
    if (!shopList) return;

    shopList.innerHTML = Object.entries(shopItems).map(([id, item]) => `
        <div class="shop-item ${item.type}" onclick="buyItem('${id}')">
            <span class="shop-icon">${item.name.split(' ')[0]}</span>
            <span class="shop-name">${item.name.split(' ').slice(1).join(' ')}</span>
            <span class="shop-price">${item.price}</span>
            <span class="shop-effect">+${item.effect}%</span>
        </div>
    `).join('');

    updateEnergyDisplay();
}

function buyItem(itemId) {
    const item = shopItems[itemId];
    if (!item) return;

    if (balance < item.price) {
        alert('❌ Недостаточно денег!');
        return;
    }

    balance -= item.price;

    // Apply upgrade bonuses to energy
    const reduction = getEnergyReduction();
    const actualEffect = item.effect * (1 - reduction);

    energy = Math.min(100, energy + actualEffect);
    updateStats();
    updateEnergyDisplay();

    let message = `${item.name} куплен!\n\nЭнергия: ${energy}%`;
    if (reduction > 0) {
        message += `\n\n⚡ Бонус апгрейдов: -${Math.round(reduction * 100)}% к энергии!`;
    }
    alert(message);

    // Check for overload
    if (energy >= 100) {
        triggerOverloadMode();
    }

    renderShopModal();
}

function updateEnergyDisplay() {
    const bar = document.getElementById('intoxication-bar');
    const value = document.getElementById('intoxication-value');
    if (bar && value) {
        bar.style.width = energy + '%';
        value.textContent = energy + '%';

        if (energy > 75) {
            bar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        } else if (energy > 50) {
            bar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else if (energy > 25) {
            bar.style.background = 'linear-gradient(90deg, #f1c40f, #f39c12)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
        }
    }
}

function triggerOverloadMode() {
    // Lose all money
    const lostMoney = balance;
    balance = 0;

    // Lose random upgrade
    let lostUpgrade = null;
    if (upgradesOwned.length > 0) {
        const randomIndex = Math.floor(Math.random() * upgradesOwned.length);
        lostUpgrade = upgradesOwned[randomIndex];
        upgradesOwned.splice(randomIndex, 1);
    }

    // Get random credit debt
    const newDebt = Math.floor(Math.random() * 10000) + 5000;
    credit += newDebt;

    updateStats();
    renderUpgradesModal();

    const upgradeNames = {
        'kidney': 'Метаболизм',
        'liver': 'Выносливость',
        'eye': 'Зоркость',
        'lung': 'Дыхание',
        'heart': 'Удача',
        'brain': 'Интеллект',
        'stomach': 'Железный желудок',
        'skin': 'Молодость'
    };

    alert(`🚨 ПЕРЕБРАЛ! 🚨\n\n💸 Потеряно: ${lostMoney} монет\n⚡ Потерян апгрейд: ${lostUpgrade ? upgradeNames[lostUpgrade] : 'ничего'}\n💳 Кредит: ${newDebt} монет\n\nТеперь ты в минусе...`);

    // Start collectors immediately
    if (credit > 10000 && !collectorsActive) {
        startCollectors();
    }

    // Break screen if debt too high
    if (credit > 50000 && !screenBroken) {
        breakScreen();
    }
}

// Jackpot growth
setInterval(() => {
    jackpot += 10;
    updateStats();
}, 2000);

// Initialize
updateStats();
renderUpgradesModal();
renderShopModal();
