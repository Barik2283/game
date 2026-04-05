// Yandex Games SDK Integration
let ysdk = null;
let player = null;
let adShown = false;
let lastAdTime = 0;
const AD_COOLDOWN = 30000; // 30 seconds between ads
let currentLang = 'ru'; // Default language

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Disable context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // Prevent scroll/touch actions that could cause browser scroll
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('wheel', (e) => {
        e.preventDefault();
    }, { passive: false });

    // Prevent text selection during gameplay
    document.addEventListener('mousedown', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    });

    // Initialize Yandex SDK (silently handle errors)
    initYandexSDK().catch(() => {
        // SDK not available - running in standalone mode, this is fine
    });
});

// Initialize Yandex SDK
function initYandexSDK() {
    return new Promise((resolve) => {
        if (typeof YaGames === 'undefined') {
            console.log('Yandex SDK not available - running in standalone mode');
            hideLoadingScreen();
            resolve(null);
            return;
        }

        YaGames.init()
            .then(ysdkInstance => {
                ysdk = ysdkInstance;

                // Auto-detect language
                try {
                    currentLang = ysdk.environment.i18n.lang || 'ru';
                    document.documentElement.lang = currentLang;
                } catch (e) {
                    // Ignore environment errors in local testing
                }

                // Initialize player for saves
                return ysdk.getPlayer();
            })
            .then(playerInstance => {
                player = playerInstance;

                // Load saved data
                loadGameData();

                // Hide loading screen
                hideLoadingScreen();

                // Show interstitial ad on game start
                showInterstitialAd();

                // Signal GAME READY
                try {
                    if (ysdk.features?.LoadingAPI?.ready) {
                        ysdk.features.LoadingAPI.ready();
                    }
                } catch (e) {
                    // Ignore errors
                }

                resolve(ysdk);
            })
            .catch(err => {
                // Silently handle SDK errors - this is normal for local testing
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

    if (!ysdk) return;

    try {
        // Signal GAME START
        if (ysdk.features?.GameplayAPI?.start) {
            ysdk.features.GameplayAPI.start();
        }

        ysdk.adv.showFullscreenAdv({
            callbacks: {
                onClose: function(wasShown) {
                    lastAdTime = Date.now();
                    adShown = false;
                    try {
                        if (ysdk.features?.GameplayAPI?.start) {
                            ysdk.features.GameplayAPI.start();
                        }
                    } catch (e) {}
                },
                onError: function(error) {
                    lastAdTime = Date.now();
                }
            }
        });
    } catch (e) {
        // Ignore ad errors - this is normal for local testing
    }
}

// Signal GAME STOP (for pauses, modals, etc.)
function gameStop() {
    try {
        if (ysdk && ysdk.features?.GameplayAPI?.stop) {
            ysdk.features.GameplayAPI.stop();
        }
    } catch (e) {}
}

// Signal GAME START (resume)
function gameStart() {
    try {
        if (ysdk && ysdk.features?.GameplayAPI?.start) {
            ysdk.features.GameplayAPI.start();
        }
    } catch (e) {}
}

// Show Rewarded Ad (for bonuses)
function showRewardedAd(type) {
    if (!ysdk) {
        showNotification('Реклама недоступна в режиме разработки', 'info');
        applyAdReward(type);
        return;
    }

    try {
        ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                    gameStop();
                },
                onRewarded: () => {
                    applyAdReward(type);
                },
                onClose: () => {
                    lastAdTime = Date.now();
                    hideAdRewardModal();
                    gameStart();
                },
                onError: (e) => {
                    showNotification('Ошибка загрузки рекламы. Попробуйте позже.', 'lose');
                }
            }
        });
    } catch (e) {
        showNotification('Реклама недоступна', 'info');
    }
}

// Apply reward from ad
function applyAdReward(type) {
    switch(type) {
        case 'coins':
            balance += 1000;
            updateStats();
            saveGameData();
            showNotification('🎁 +1000 монет! Баланс: ' + balance, 'win', 4000);
            break;

        case 'bonus':
            // Temporary win bonus (can be implemented in game logic)
            window.adBonusMultiplier = 2;
            setTimeout(() => {
                window.adBonusMultiplier = 1;
            }, 300000); // 5 minutes
            showNotification('🎰 x2 к выигрышу на 5 минут!', 'win', 4000);
            break;

        case 'debt':
            if (credit > 0) {
                const reduction = Math.floor(credit * 0.1);
                credit -= reduction;
                updateStats();
                saveGameData();
                showNotification('💳 Долг уменьшен на ' + reduction + ' монет! Остаток: ' + credit, 'win', 4000);
            } else {
                showNotification('У вас нет долга! Выберите другой бонус.', 'info');
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
            furnitureOwned: furnitureOwned,
            upgradesOwned: upgradesOwned,
            screenBroken: screenBroken,
            povertyMode: povertyMode
        };
        try {
            localStorage.setItem('casinoSaveData', JSON.stringify(gameData));
        } catch (e) {}
        return;
    }

    const gameData = {
        balance: balance,
        jackpot: jackpot,
        credit: credit,
        furnitureOwned: furnitureOwned,
        upgradesOwned: upgradesOwned,
        screenBroken: screenBroken,
        povertyMode: povertyMode,
        lastSave: Date.now()
    };

    player.setData(gameData)
        .catch(() => {
            // Fallback to localStorage
            try {
                localStorage.setItem('casinoSaveData', JSON.stringify(gameData));
            } catch (e) {}
        });
}

// Load game data from Yandex Cloud
function loadGameData() {
    if (!player) {
        // Load from localStorage as fallback
        try {
            const savedData = localStorage.getItem('casinoSaveData');
            if (savedData) {
                const data = JSON.parse(savedData);
                applyGameData(data);
            }
        } catch (e) {}
        return;
    }

    player.getData()
        .then(data => {
            if (data && Object.keys(data).length > 0) {
                applyGameData(data);
            }
        })
        .catch(() => {
            // Try localStorage fallback
            try {
                const savedData = localStorage.getItem('casinoSaveData');
                if (savedData) {
                    const data = JSON.parse(savedData);
                    applyGameData(data);
                }
            } catch (e) {}
        });
}

// Apply loaded game data
function applyGameData(data) {
    if (data.balance !== undefined) balance = data.balance;
    if (data.jackpot !== undefined) jackpot = data.jackpot;
    if (data.credit !== undefined) credit = data.credit;
    if (data.furnitureOwned !== undefined) furnitureOwned = data.furnitureOwned;
    if (data.upgradesOwned !== undefined) upgradesOwned = data.upgradesOwned;
    if (data.screenBroken !== undefined) screenBroken = data.screenBroken;
    if (data.povertyMode !== undefined) povertyMode = data.povertyMode;

    updateStats();

    // Restore screen state if broken
    if (screenBroken && data.credit > 50000) {
        document.body.classList.add('screen-broken');
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

// Export functions for use in other scripts
window.yandexSDK = {
    showInterstitialAd,
    showRewardedAd,
    saveGameData,
    loadGameData,
    showAdRewardModal,
    gameStart,
    gameStop
};
