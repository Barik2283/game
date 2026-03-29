// Yandex Games SDK Integration
let ysdk = null;
let player = null;
let adShown = false;
let lastAdTime = 0;
const AD_COOLDOWN = 30000; // 30 seconds between ads

// Initialize Yandex SDK
function initYandexSDK() {
    return new Promise((resolve, reject) => {
        if (typeof YaGames === 'undefined') {
            console.log('Yandex SDK not available - running in standalone mode');
            resolve(null);
            return;
        }

        YaGames.init()
            .then(ysdkInstance => {
                ysdk = ysdkInstance;
                console.log('Yandex SDK initialized');
                
                // Initialize player for saves
                return ysdk.getPlayer();
            })
            .then(playerInstance => {
                player = playerInstance;
                console.log('Player initialized');
                
                // Load saved data
                loadGameData();
                
                // Hide loading screen
                hideLoadingScreen();
                
                // Show interstitial ad on game start
                showInterstitialAd();
                
                resolve(ysdk);
            })
            .catch(err => {
                console.error('Yandex SDK initialization error:', err);
                hideLoadingScreen();
                resolve(null);
            });
    });
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Show Interstitial Ad (full screen)
function showInterstitialAd() {
    const now = Date.now();
    if (now - lastAdTime < AD_COOLDOWN) {
        return;
    }
    
    if (ysdk) {
        ysdk.adv.showFullscreenAdv({
            callbacks: {
                onClose: function(wasShown) {
                    console.log('Interstitial ad closed');
                    lastAdTime = Date.now();
                    adShown = false;
                },
                onError: function(error) {
                    console.log('Interstitial ad error:', error);
                    lastAdTime = Date.now();
                }
            }
        });
    }
}

// Show Rewarded Ad (for bonuses)
function showRewardedAd(type) {
    if (!ysdk) {
        alert('Реклама недоступна в режиме разработки');
        applyAdReward(type);
        return;
    }

    ysdk.adv.showRewardedVideo({
        callbacks: {
            onOpen: () => {
                console.log('Rewarded video opened');
                // Pause game logic here if needed
            },
            onRewarded: () => {
                console.log('Rewarded!');
                applyAdReward(type);
            },
            onClose: () => {
                console.log('Rewarded video closed');
                lastAdTime = Date.now();
                hideAdRewardModal();
                // Resume game logic here if needed
            },
            onError: (e) => {
                console.log('Error while open rewarded video:', e);
                alert('Ошибка загрузки рекламы. Попробуйте позже.');
            }
        }
    });
}

// Apply reward from ad
function applyAdReward(type) {
    switch(type) {
        case 'coins':
            balance += 1000;
            updateStats();
            saveGameData();
            alert('🎁 +1000 монет!\n\nБаланс: ' + balance);
            break;
            
        case 'bonus':
            // Temporary win bonus (can be implemented in game logic)
            window.adBonusMultiplier = 2;
            setTimeout(() => {
                window.adBonusMultiplier = 1;
            }, 300000); // 5 minutes
            alert('🎰 x2 к выигрышу на 5 минут!');
            break;
            
        case 'debt':
            if (credit > 0) {
                const reduction = Math.floor(credit * 0.1);
                credit -= reduction;
                updateStats();
                saveGameData();
                alert('💳 Долг уменьшен на ' + reduction + ' монет!\n\nОстаток: ' + credit);
            } else {
                alert('У вас нет долга! Выберите другой бонус.');
            }
            break;
    }
}

// Save game data to Yandex Cloud
function saveGameData() {
    if (!player) {
        // Save to localStorage as fallback
        const gameData = {
            balance: balance,
            jackpot: jackpot,
            credit: credit,
            energy: energy, // was intoxication
            furnitureOwned: furnitureOwned,
            upgradesOwned: upgradesOwned, // was organsOwned
            screenBroken: screenBroken,
            povertyMode: povertyMode
        };
        localStorage.setItem('casinoSaveData', JSON.stringify(gameData));
        console.log('Game saved to localStorage');
        return;
    }

    const gameData = {
        balance: balance,
        jackpot: jackpot,
        credit: credit,
        energy: energy, // was intoxication
        furnitureOwned: furnitureOwned,
        upgradesOwned: upgradesOwned, // was organsOwned
        screenBroken: screenBroken,
        povertyMode: povertyMode,
        lastSave: Date.now()
    };

    player.setData(gameData)
        .then(() => {
            console.log('Game data saved to Yandex Cloud');
        })
        .catch(err => {
            console.error('Save error:', err);
            // Fallback to localStorage
            localStorage.setItem('casinoSaveData', JSON.stringify(gameData));
        });
}

// Load game data from Yandex Cloud
function loadGameData() {
    if (!player) {
        // Load from localStorage as fallback
        const savedData = localStorage.getItem('casinoSaveData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                applyGameData(data);
                console.log('Game loaded from localStorage');
            } catch (e) {
                console.error('Load error:', e);
            }
        }
        return;
    }

    player.getData()
        .then(data => {
            if (data && Object.keys(data).length > 0) {
                applyGameData(data);
                console.log('Game loaded from Yandex Cloud');
            } else {
                // No saved data, use defaults
                console.log('No saved data found, using defaults');
            }
        })
        .catch(err => {
            console.error('Load error:', err);
            // Try localStorage fallback
            const savedData = localStorage.getItem('casinoSaveData');
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    applyGameData(data);
                    console.log('Game loaded from localStorage (fallback)');
                } catch (e) {
                    console.error('Fallback load error:', e);
                }
            }
        });
}

// Apply loaded game data
function applyGameData(data) {
    if (data.balance !== undefined) balance = data.balance;
    if (data.jackpot !== undefined) jackpot = data.jackpot;
    if (data.credit !== undefined) credit = data.credit;
    if (data.energy !== undefined) energy = data.energy; // was intoxication
    if (data.furnitureOwned !== undefined) furnitureOwned = data.furnitureOwned;
    if (data.upgradesOwned !== undefined) upgradesOwned = data.upgradesOwned; // was organsOwned
    if (data.screenBroken !== undefined) screenBroken = data.screenBroken;
    if (data.povertyMode !== undefined) povertyMode = data.povertyMode;
    
    updateStats();
    updateEnergyDisplay(); // was updateIntoxicationDisplay
    
    // Restore screen state if broken
    if (screenBroken && data.credit > 50000) {
        breakScreen();
    }
    
    // Restart credit timer if needed
    if (credit > 0 && !creditTimer) {
        creditTimer = setInterval(() => {
            if (credit > 0) {
                credit = Math.floor(credit * 1.1);
                updateStats();
                saveGameData();

                if (credit > 50000 && !screenBroken) {
                    breakScreen();
                }

                if (credit > 10000 && !collectorsActive) {
                    startCollectors();
                }
            }
        }, 5000);
    }
}

// Show ad reward modal
function showAdRewardModal() {
    document.getElementById('adRewardModal').classList.add('active');
}

function hideAdRewardModal() {
    document.getElementById('adRewardModal').classList.remove('active');
}

// Auto-save every 30 seconds
setInterval(() => {
    saveGameData();
}, 30000);

// Save on page unload
window.addEventListener('beforeunload', () => {
    saveGameData();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initYandexSDK();
});

// Export functions for use in other scripts
window.yandexSDK = {
    showInterstitialAd,
    showRewardedAd,
    saveGameData,
    loadGameData,
    showAdRewardModal
};
