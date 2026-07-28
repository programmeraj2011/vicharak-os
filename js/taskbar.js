// Taskbar JS 
// Taskbar Manager - Vicharak OS
(function() {
    'use strict';

    class TaskbarManager {
        constructor() {
            this.apps = {};
            this.activeApps = [];
            this.startMenuOpen = false;
            this.contextMenuOpen = false;
            
            this.init();
        }

        init() {
            console.log('📋 Initializing Taskbar...');
            
            this.setupClock();
            this.setupStartMenu();
            this.setupSearch();
            this.setupNotifications();
            this.setupControlCenter();
            this.setupStatusIcons();
            this.setupDragAndDrop();
            
            // Listen for window events
            document.addEventListener('windowOpened', (e) => {
                this.addAppToTaskbar(e.detail);
            });
            
            document.addEventListener('windowClosed', (e) => {
                this.removeAppFromTaskbar(e.detail);
            });
            
            console.log('✅ Taskbar initialized');
        }

        setupClock() {
            function updateClock() {
                const now = new Date();
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
            }
            
            updateClock();
            setInterval(updateClock, 1000);
        }

        setupStartMenu() {
            const startBtn = document.getElementById('startBtn');
            const startMenu = document.getElementById('startMenu');
            
            if (!startBtn || !startMenu) return;
            
            startBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleStartMenu();
            });
            
            // Close start menu on outside click
            document.addEventListener('click', (e) => {
                if (this.startMenuOpen && !startMenu.contains(e.target) && e.target !== startBtn) {
                    this.closeStartMenu();
                }
            });
            
            // Search in start menu
            const searchInput = document.getElementById('startSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    const apps = startMenu.querySelectorAll('.start-app');
                    
                    apps.forEach(app => {
                        const text = app.textContent.toLowerCase();
                        app.style.display = text.includes(query) ? 'flex' : 'none';
                    });
                });
            }
            
            // App clicks
            startMenu.querySelectorAll('.start-app').forEach(app => {
                app.addEventListener('click', () => {
                    const appName = app.dataset.app;
                    if (appName && window.openApp) {
                        window.openApp(appName);
                        this.closeStartMenu();
                    }
                });
            });
            
            // Power buttons
            const shutdownBtn = document.getElementById('startShutdown');
            if (shutdownBtn) {
                shutdownBtn.addEventListener('click', () => {
                    if (confirm('Shutdown Vicharak OS?')) {
                        window.shutdownOS?.();
                    }
                });
            }
            
            const restartBtn = document.getElementById('startRestart');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    if (confirm('Restart Vicharak OS?')) {
                        window.restartOS?.();
                    }
                });
            }
        }

        toggleStartMenu() {
            const startMenu = document.getElementById('startMenu');
            if (!startMenu) return;
            
            this.startMenuOpen = !this.startMenuOpen;
            startMenu.style.display = this.startMenuOpen ? 'block' : 'none';
            
            if (this.startMenuOpen) {
                // Focus search
                const search = document.getElementById('startSearch');
                if (search) {
                    setTimeout(() => search.focus(), 100);
                }
            }
        }

        closeStartMenu() {
            const startMenu = document.getElementById('startMenu');
            if (startMenu) {
                startMenu.style.display = 'none';
                this.startMenuOpen = false;
            }
        }

        setupSearch() {
            const searchBtn = document.getElementById('searchBtn');
            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    if (window.toggleSearch) {
                        window.toggleSearch();
                    }
                });
            }
        }

        setupNotifications() {
            const notificationBtn = document.getElementById('notificationBtn');
            if (notificationBtn) {
                notificationBtn.addEventListener('click', () => {
                    if (window.toggleNotifications) {
                        window.toggleNotifications();
                    }
                });
            }
            
            // Clear notifications
            const clearBtn = document.getElementById('clearNotifications');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    const list = document.getElementById('notificationList');
                    if (list) {
                        list.innerHTML = '';
                        const center = document.getElementById('notificationCenter');
                        if (center) {
                            center.style.display = 'none';
                        }
                    }
                });
            }
        }

        setupControlCenter() {
            const controlBtn = document.getElementById('controlBtn');
            if (controlBtn) {
                controlBtn.addEventListener('click', () => {
                    if (window.toggleControlCenter) {
                        window.toggleControlCenter();
                    }
                });
            }
            
            // Control toggles
            document.querySelectorAll('.control-toggle').forEach(toggle => {
                toggle.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const control = this.closest('.control-item');
                    if (control) {
                        const name = control.dataset.control || 'feature';
                        window.showToast?.(`${name} ${this.classList.contains('active') ? 'enabled' : 'disabled'}`, 'info');
                    }
                });
            });
        }

        setupStatusIcons() {
            // Battery indicator (visual only)
            const batteryLevel = 85;
            const batteryIcon = document.querySelector('.status-icon:last-child');
            if (batteryIcon) {
                batteryIcon.textContent = batteryLevel > 50 ? '🔋' : batteryLevel > 20 ? '🪫' : '⚠️';
                batteryIcon.title = `${batteryLevel}% battery`;
            }
            
            // Wi-Fi indicator
            const wifiIcon = document.querySelector('.status-icon:first-child');
            if (wifiIcon) {
                wifiIcon.textContent = '📶';
                wifiIcon.title = 'Connected';
            }
            
            // Volume indicator
            const volumeIcon = document.querySelector('.status-icon:nth-child(2)');
            if (volumeIcon) {
                volumeIcon.textContent = '🔊';
                volumeIcon.title = 'Volume: 75%';
            }
        }

        setupDragAndDrop() {
            const taskbar = document.getElementById('taskbar');
            if (!taskbar) return;
            
            // Allow apps to be pinned to taskbar via drag
            document.addEventListener('dragstart', (e) => {
                const icon = e.target.closest('.desktop-icon');
                if (icon) {
                    e.dataTransfer.setData('text/plain', icon.dataset.app);
                    e.dataTransfer.effectAllowed = 'copy';
                }
            });
            
            taskbar.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                taskbar.style.borderTop = '2px solid var(--primary)';
            });
            
            taskbar.addEventListener('dragleave', (e) => {
                taskbar.style.borderTop = 'none';
            });
            
            taskbar.addEventListener('drop', (e) => {
                e.preventDefault();
                taskbar.style.borderTop = 'none';
                const app = e.dataTransfer.getData('text/plain');
                if (app && window.openApp) {
                    window.openApp(app);
                    window.showToast?.(`Pinned ${app} to taskbar`, 'success');
                }
            });
        }

        addAppToTaskbar(detail) {
            const { appId, appName, icon } = detail;
            const center = document.getElementById('taskbarApps');
            if (!center) return;
            
            // Check if already exists
            const existing = center.querySelector(`[data-app-id="${appId}"]`);
            if (existing) return;
            
            const appEl = document.createElement('div');
            appEl.className = 'taskbar-app';
            appEl.dataset.appId = appId;
            appEl.dataset.appName = appName;
            appEl.innerHTML = `
                <span class="app-icon">${icon || '📄'}</span>
                <span class="app-name">${appName}</span>
                <span class="app-indicator"></span>
            `;
            
            appEl.addEventListener('click', () => {
                // Focus window
                if (window.windowManager) {
                    window.windowManager.focusWindow(appId);
                }
            });
            
            appEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showAppContextMenu(e, appEl, appId);
            });
            
            center.appendChild(appEl);
            this.activeApps.push(appId);
            
            // Update active state
            this.updateActiveApp(appId);
        }

        removeAppFromTaskbar(detail) {
            const { appId } = detail;
            const center = document.getElementById('taskbarApps');
            if (!center) return;
            
            const appEl = center.querySelector(`[data-app-id="${appId}"]`);
            if (appEl) {
                appEl.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => appEl.remove(), 300);
            }
            
            const index = this.activeApps.indexOf(appId);
            if (index > -1) {
                this.activeApps.splice(index, 1);
            }
        }

        updateActiveApp(appId) {
            const center = document.getElementById('taskbarApps');
            if (!center) return;
            
            // Remove active class from all
            center.querySelectorAll('.taskbar-app').forEach(el => {
                el.classList.remove('active');
            });
            
            // Add active class to specified
            const appEl = center.querySelector(`[data-app-id="${appId}"]`);
            if (appEl) {
                appEl.classList.add('active');
            }
        }

        showAppContextMenu(e, appEl, appId) {
            const menu = document.getElementById('contextMenu');
            if (!menu) return;
            
            const appName = appEl.dataset.appName || 'App';
            
            const items = [
                { label: '🔄 Open', action: () => {
                    if (window.windowManager) {
                        window.windowManager.focusWindow(appId);
                    }
                }},
                { label: '📌 Pin', action: () => {
                    window.showToast?.(`Pinned ${appName}`, 'success');
                }},
                { label: '❌ Close', action: () => {
                    if (window.windowManager) {
                        window.windowManager.closeWindow(appId);
                    }
                }}
            ];
            
            // Clear existing items
            menu.innerHTML = '';
            
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'context-item';
                div.textContent = item.label;
                div.addEventListener('click', () => {
                    item.action();
                    menu.style.display = 'none';
                });
                menu.appendChild(div);
            });
            
            // Position menu
            const x = Math.min(e.clientX, window.innerWidth - 200);
            const y = Math.min(e.clientY - 56, window.innerHeight - 56 - 200);
            menu.style.left = x + 'px';
            menu.style.top = y + 'px';
            menu.style.display = 'block';
        }

        getActiveApps() {
            return this.activeApps;
        }

        isAppActive(appId) {
            return this.activeApps.includes(appId);
        }
    }

    // Initialize taskbar on boot complete
    document.addEventListener('bootComplete', function() {
        const taskbar = new TaskbarManager();
        window.taskbarManager = taskbar;
    });

    // Export for use
    window.TaskbarManager = TaskbarManager;
})();