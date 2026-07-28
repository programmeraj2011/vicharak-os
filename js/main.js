// Main JS 
// Main Entry Point - Vicharak OS
(function() {
    'use strict';

    // Initialize the OS
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🧠 Vicharak OS Initializing...');
        
        // Initialize core systems
        initializeOS();
    });

    function initializeOS() {
        // Check if OS is already initialized
        if (window.vicharakOS) {
            console.log('Vicharak OS already initialized');
            return;
        }

        // Create global namespace
        window.vicharakOS = {
            version: '1.0.0',
            initialized: false,
            bootTime: Date.now(),
            settings: {},
            apps: {},
            windows: [],
            activeWindow: null,
            fileSystem: null,
            aiAssistant: null,
            themeManager: null
        };

        // Initialize subsystems
        try {
            // Load settings
            loadSettings();
            
            // Initialize core modules
            window.vicharakOS.fileSystem = new FileSystem();
            window.vicharakOS.aiAssistant = new AIAssistant();
            window.vicharakOS.themeManager = new ThemeManager();
            
            // Initialize UI components
            initBootSequence();
            
            // Register keyboard shortcuts
            registerGlobalShortcuts();
            
            // Start clock
            startClock();
            
            // Initialize widgets
            initWidgets();
            
            // Mark as initialized
            window.vicharakOS.initialized = true;
            
            console.log('✅ Vicharak OS initialized successfully');
            console.log(`⏱️ Boot time: ${Date.now() - window.vicharakOS.bootTime}ms`);
        } catch (error) {
            console.error('❌ Failed to initialize Vicharak OS:', error);
            showErrorToast('Failed to initialize OS', error.message);
        }
    }

    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('vicharak_settings');
            if (savedSettings) {
                window.vicharakOS.settings = JSON.parse(savedSettings);
            } else {
                // Default settings
                window.vicharakOS.settings = {
                    theme: 'dark',
                    accentColor: '#00BFFF',
                    wallpaper: 'default',
                    animations: true,
                    fontSize: 'medium',
                    iconSize: 'medium',
                    layout: 'default'
                };
                saveSettings();
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
            window.vicharakOS.settings = {};
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem('vicharak_settings', 
                JSON.stringify(window.vicharakOS.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    function initBootSequence() {
        const bootScreen = document.getElementById('bootScreen');
        const progress = document.querySelector('.boot-progress');
        const status = document.querySelector('.boot-status');
        
        if (!bootScreen || !progress || !status) return;

        const bootSteps = [
            'Initializing kernel...',
            'Loading drivers...',
            'Starting services...',
            'Mounting filesystem...',
            'Loading AI assistant...',
            'Preparing desktop...',
            'Ready!'
        ];

        let step = 0;
        const interval = setInterval(() => {
            if (step < bootSteps.length) {
                status.textContent = bootSteps[step];
                progress.style.width = `${((step + 1) / bootSteps.length) * 100}%`;
                step++;
            } else {
                clearInterval(interval);
                // Show login screen
                setTimeout(() => {
                    bootScreen.classList.add('fade-out');
                    setTimeout(() => {
                        bootScreen.style.display = 'none';
                        showLoginScreen();
                    }, 800);
                }, 500);
            }
        }, 400);
    }

    function showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const desktop = document.getElementById('desktop');
        const loginTime = document.getElementById('loginTime');
        
        if (!loginScreen || !desktop) return;

        // Update time
        if (loginTime) {
            const now = new Date();
            loginTime.textContent = now.toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        loginScreen.style.display = 'flex';
        loginScreen.style.animation = 'fadeIn 0.5s ease';

        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                loginScreen.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    desktop.style.display = 'block';
                    desktop.style.animation = 'fadeIn 0.5s ease';
                    showToast('Welcome to Vicharak OS! 🧠', 'success');
                    
                    // Initialize desktop
                    initDesktop();
                    
                    // Show AI welcome message
                    setTimeout(() => {
                        if (window.vicharakOS.aiAssistant) {
                            window.vicharakOS.aiAssistant.sendMessage(
                                'Welcome to Vicharak OS! I\'m your AI assistant. How can I help you today? 😊'
                            );
                        }
                    }, 1000);
                }, 300);
            });
        }
    }

    function initDesktop() {
        // Setup desktop icons
        setupDesktopIcons();
        
        // Setup taskbar
        setupTaskbar();
        
        // Setup context menu
        setupContextMenu();
        
        // Setup start menu
        setupStartMenu();
        
        // Setup notifications
        setupNotifications();
        
        // Setup control center
        setupControlCenter();
        
        // Setup search
        setupSearch();

        // Apply theme
        if (window.vicharakOS.themeManager) {
            window.vicharakOS.themeManager.applyTheme(
                window.vicharakOS.settings.theme || 'dark'
            );
        }
    }

    function setupDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
            icon.addEventListener('dblclick', function() {
                const app = this.dataset.app;
                if (app && window.vicharakOS.apps[app]) {
                    window.vicharakOS.apps[app].open();
                } else if (app) {
                    // Try to open app dynamically
                    openApp(app);
                }
            });
        });
    }

    function setupTaskbar() {
        // Taskbar buttons
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', toggleStartMenu);
        }

        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', toggleSearch);
        }

        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', toggleNotifications);
        }

        const controlBtn = document.getElementById('controlBtn');
        if (controlBtn) {
            controlBtn.addEventListener('click', toggleControlCenter);
        }
    }

    function setupContextMenu() {
        const desktop = document.getElementById('desktop');
        const contextMenu = document.getElementById('contextMenu');
        
        if (!desktop || !contextMenu) return;

        desktop.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            const x = e.clientX;
            const y = e.clientY;
            
            // Position menu
            const menuWidth = 200;
            const menuHeight = contextMenu.children.length * 32 + 8;
            
            let left = x;
            let top = y;
            
            if (left + menuWidth > window.innerWidth) {
                left = window.innerWidth - menuWidth - 10;
            }
            if (top + menuHeight > window.innerHeight - 56) {
                top = window.innerHeight - menuHeight - 66;
            }
            
            contextMenu.style.left = left + 'px';
            contextMenu.style.top = top + 'px';
            contextMenu.style.display = 'block';
        });

        // Close context menu on click
        document.addEventListener('click', function(e) {
            if (!contextMenu.contains(e.target)) {
                contextMenu.style.display = 'none';
            }
        });

        // Context menu actions
        contextMenu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', function() {
                const action = this.dataset.action;
                handleContextAction(action);
                contextMenu.style.display = 'none';
            });
        });
    }

    function handleContextAction(action) {
        switch(action) {
            case 'refresh':
                showToast('Refreshed!', 'info');
                break;
            case 'new-folder':
                if (window.vicharakOS.apps.explorer) {
                    window.vicharakOS.apps.explorer.createFolder();
                }
                break;
            case 'new-note':
                if (window.vicharakOS.apps.notes) {
                    window.vicharakOS.apps.notes.createNote();
                }
                break;
            case 'settings':
                openApp('settings');
                break;
            case 'paste':
                showToast('Pasted!', 'info');
                break;
            default:
                console.warn('Unknown context action:', action);
        }
    }

    function setupStartMenu() {
        const startMenu = document.getElementById('startMenu');
        if (!startMenu) return;

        // Start menu apps
        startMenu.querySelectorAll('.start-app').forEach(app => {
            app.addEventListener('click', function() {
                const appName = this.dataset.app;
                if (appName) {
                    openApp(appName);
                    toggleStartMenu();
                }
            });
        });

        // Start menu search
        const searchInput = document.getElementById('startSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                const apps = startMenu.querySelectorAll('.start-app');
                apps.forEach(app => {
                    const text = app.textContent.toLowerCase();
                    app.style.display = text.includes(query) ? 'flex' : 'none';
                });
            });
        }

        // Power buttons
        const shutdownBtn = document.getElementById('startShutdown');
        if (shutdownBtn) {
            shutdownBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to shutdown?')) {
                    shutdownOS();
                }
            });
        }

        const restartBtn = document.getElementById('startRestart');
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to restart?')) {
                    restartOS();
                }
            });
        }
    }

    function toggleStartMenu() {
        const startMenu = document.getElementById('startMenu');
        if (!startMenu) return;

        if (startMenu.style.display === 'block') {
            startMenu.style.display = 'none';
        } else {
            startMenu.style.display = 'block';
            // Close other overlays
            closeSearch();
            closeNotifications();
            closeControlCenter();
        }
    }

    function setupNotifications() {
        // Setup notification system
        window.showToast = showToast;
        window.showNotification = showNotification;
    }

    function setupControlCenter() {
        const controlCenter = document.getElementById('controlCenter');
        if (!controlCenter) return;

        // Toggle controls
        controlCenter.querySelectorAll('.control-toggle').forEach(toggle => {
            toggle.addEventListener('click', function() {
                this.classList.toggle('active');
                const control = this.closest('.control-item');
                const name = control ? control.dataset.control : '';
                showToast(`${name} ${this.classList.contains('active') ? 'enabled' : 'disabled'}`, 'info');
            });
        });

        // Volume control
        const volumeInput = controlCenter.querySelector('[data-control="volume"] input');
        if (volumeInput) {
            volumeInput.addEventListener('input', function() {
                // Visual only
                const value = this.value;
                const icon = this.closest('.control-item').querySelector('.control-icon');
                if (icon) {
                    if (value > 50) icon.textContent = '🔊';
                    else if (value > 0) icon.textContent = '🔉';
                    else icon.textContent = '🔇';
                }
            });
        }
    }

    function setupSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchOverlay || !searchInput || !searchResults) return;

        // Search input
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            searchResults.innerHTML = '';
            
            if (query.length === 0) {
                searchResults.style.display = 'none';
                return;
            }

            searchResults.style.display = 'block';
            
            // Search apps
            const apps = [
                { name: 'Vicharak AI', icon: '🧠', app: 'ai', desc: 'AI Assistant' },
                { name: 'File Explorer', icon: '📁', app: 'explorer', desc: 'File Manager' },
                { name: 'Notes', icon: '📝', app: 'notes', desc: 'Note Taking' },
                { name: 'Terminal', icon: '💻', app: 'terminal', desc: 'Command Line' },
                { name: 'Browser', icon: '🌐', app: 'browser', desc: 'Web Browser' },
                { name: 'Calculator', icon: '🧮', app: 'calculator', desc: 'Calculator' },
                { name: 'Calendar', icon: '📅', app: 'calendar', desc: 'Calendar' },
                { name: 'Music Player', icon: '🎵', app: 'music', desc: 'Music Player' },
                { name: 'Gallery', icon: '🖼️', app: 'gallery', desc: 'Image Gallery' },
                { name: 'Settings', icon: '⚙️', app: 'settings', desc: 'System Settings' }
            ];

            const results = apps.filter(app => 
                app.name.toLowerCase().includes(query) ||
                app.desc.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                const noResult = document.createElement('div');
                noResult.className = 'search-result-item';
                noResult.innerHTML = `<span class="result-icon">🔍</span>
                    <div class="result-info">
                        <div class="result-name">No results found</div>
                        <div class="result-desc">Try a different search</div>
                    </div>`;
                searchResults.appendChild(noResult);
            } else {
                results.forEach(app => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <span class="result-icon">${app.icon}</span>
                        <div class="result-info">
                            <div class="result-name">${app.name}</div>
                            <div class="result-desc">${app.desc}</div>
                        </div>
                    `;
                    item.addEventListener('click', function() {
                        openApp(app.app);
                        closeSearch();
                    });
                    searchResults.appendChild(item);
                });
            }
        });

        // Close search on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchOverlay.style.display === 'block') {
                closeSearch();
            }
        });
    }

    function toggleSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        if (!searchOverlay) return;

        if (searchOverlay.style.display === 'flex') {
            closeSearch();
        } else {
            searchOverlay.style.display = 'flex';
            const input = document.getElementById('searchInput');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    function closeSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay) {
            searchOverlay.style.display = 'none';
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
                const results = document.getElementById('searchResults');
                if (results) {
                    results.innerHTML = '';
                    results.style.display = 'none';
                }
            }
        }
    }

    function toggleNotifications() {
        const center = document.getElementById('notificationCenter');
        if (!center) return;

        if (center.style.display === 'block') {
            center.style.display = 'none';
        } else {
            center.style.display = 'block';
            // Close other overlays
            closeSearch();
            closeControlCenter();
        }
    }

    function closeNotifications() {
        const center = document.getElementById('notificationCenter');
        if (center) {
            center.style.display = 'none';
        }
    }

    function toggleControlCenter() {
        const center = document.getElementById('controlCenter');
        if (!center) return;

        if (center.style.display === 'block') {
            center.style.display = 'none';
        } else {
            center.style.display = 'block';
            // Close other overlays
            closeSearch();
            closeNotifications();
        }
    }

    function closeControlCenter() {
        const center = document.getElementById('controlCenter');
        if (center) {
            center.style.display = 'none';
        }
    }

    function showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', function() {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        });

        // Auto dismiss
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    function showNotification(title, body, type = 'info') {
        const center = document.getElementById('notificationCenter');
        const list = document.getElementById('notificationList');
        if (!center || !list) return;

        const notification = document.createElement('div');
        notification.className = 'notification-item';
        notification.innerHTML = `
            <div class="notif-title">${title}</div>
            <div class="notif-body">${body}</div>
            <div class="notif-time">${new Date().toLocaleTimeString()}</div>
        `;

        list.prepend(notification);

        // Show notification center
        center.style.display = 'block';

        // Also show toast
        showToast(title, type);

        // Limit notifications
        while (list.children.length > 50) {
            list.removeChild(list.lastChild);
        }

        // Clear all button
        const clearBtn = document.getElementById('clearNotifications');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                list.innerHTML = '';
                center.style.display = 'none';
            });
        }
    }

    function openApp(appName) {
        if (!appName) return;

        // Check if app exists in registry
        if (window.vicharakOS.apps[appName]) {
            window.vicharakOS.apps[appName].open();
            return;
        }

        // Try to load app dynamically
        const appMap = {
            'ai': AIApp,
            'explorer': ExplorerApp,
            'notes': NotesApp,
            'terminal': TerminalApp,
            'browser': BrowserApp,
            'calculator': CalculatorApp,
            'calendar': CalendarApp,
            'music': MusicApp,
            'gallery': GalleryApp,
            'settings': SettingsApp
        };

        if (appMap[appName]) {
            try {
                const app = new appMap[appName]();
                window.vicharakOS.apps[appName] = app;
                app.open();
                showToast(`Opened ${appName}`, 'success');
            } catch (error) {
                console.error(`Failed to open ${appName}:`, error);
                showToast(`Failed to open ${appName}`, 'error');
            }
        } else {
            showToast(`App ${appName} not found`, 'error');
        }
    }

    function registerGlobalShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl + Space: Search
            if (e.ctrlKey && e.key === ' ') {
                e.preventDefault();
                toggleSearch();
            }
            
            // Ctrl + N: New Note
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                if (window.vicharakOS.apps.notes) {
                    window.vicharakOS.apps.notes.createNote();
                }
            }
            
            // Ctrl + ,: Settings
            if (e.ctrlKey && e.key === ',') {
                e.preventDefault();
                openApp('settings');
            }
            
            // Escape: Close menus
            if (e.key === 'Escape') {
                closeStartMenu();
                closeSearch();
                closeNotifications();
                closeControlCenter();
                closeContextMenu();
            }
            
            // F11: Fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            }
        });
    }

    function closeStartMenu() {
        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            startMenu.style.display = 'none';
        }
    }

    function closeContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    }

    function startClock() {
        function updateClock() {
            const now = new Date();
            
            // Update taskbar clock
            const clockEl = document.getElementById('clock');
            const dateEl = document.getElementById('date');
            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            }
            
            // Update widget clock
            const widgetClock = document.getElementById('widgetClock');
            const widgetDate = document.getElementById('widgetDate');
            if (widgetClock) {
                widgetClock.textContent = now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
            if (widgetDate) {
                widgetDate.textContent = now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        }

        updateClock();
        setInterval(updateClock, 1000);
    }

    function initWidgets() {
        // Weather widget placeholder
        const weatherWidget = document.querySelector('.weather-widget');
        if (weatherWidget) {
            // Simulate weather data
            const temps = [18, 20, 22, 24, 26, 28];
            const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Clear'];
            const locations = ['New York, NY', 'Los Angeles, CA', 'London, UK', 'Tokyo, JP'];
            
            setInterval(() => {
                const temp = temps[Math.floor(Math.random() * temps.length)];
                const condition = conditions[Math.floor(Math.random() * conditions.length)];
                const location = locations[Math.floor(Math.random() * locations.length)];
                
                const tempEl = weatherWidget.querySelector('.weather-temp');
                const descEl = weatherWidget.querySelector('.weather-desc');
                const locEl = weatherWidget.querySelector('.weather-location');
                
                if (tempEl) tempEl.textContent = `${temp}°C`;
                if (descEl) descEl.textContent = condition;
                if (locEl) locEl.textContent = location;
            }, 30000);
        }
    }

    function shutdownOS() {
        showToast('Shutting down...', 'warning', 2000);
        setTimeout(() => {
            document.querySelector('#desktop').style.display = 'none';
            document.querySelector('#loginScreen').style.display = 'flex';
            document.querySelector('#loginScreen').style.animation = 'fadeIn 0.5s ease';
            showToast('System shutdown', 'info', 3000);
        }, 2000);
    }

    function restartOS() {
        showToast('Restarting...', 'warning', 2000);
        setTimeout(() => {
            location.reload();
        }, 2000);
    }

    // Export functions to global scope
    window.openApp = openApp;
    window.showToast = showToast;
    window.showNotification = showNotification;
    window.shutdownOS = shutdownOS;
    window.restartOS = restartOS;
    window.toggleStartMenu = toggleStartMenu;
    window.toggleSearch = toggleSearch;
    window.toggleNotifications = toggleNotifications;
    window.toggleControlCenter = toggleControlCenter;
})();