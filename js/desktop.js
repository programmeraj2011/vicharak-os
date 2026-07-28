// Desktop JS 
// Desktop Manager - Vicharak OS
(function() {
    'use strict';

    class DesktopManager {
        constructor() {
            this.icons = [];
            this.widgets = [];
            this.selectedIcons = [];
            this.contextMenu = null;
            this.isDragging = false;
            this.dragStart = null;
            this.dragElement = null;
            
            this.init();
        }

        init() {
            console.log('🖥️ Initializing Desktop...');
            
            // Setup desktop features
            this.setupWallpaper();
            this.setupDesktopIcons();
            this.setupDragSelect();
            this.setupKeyboardShortcuts();
            this.loadDesktopState();
            
            console.log('✅ Desktop initialized');
        }

        setupWallpaper() {
            const wallpaper = document.getElementById('wallpaper');
            if (!wallpaper) return;
            
            // Load saved wallpaper
            const settings = window.vicharakOS?.settings || {};
            const wallpaperName = settings.wallpaper || 'default';
            
            this.setWallpaper(wallpaperName);
        }

        setWallpaper(name) {
            const wallpaper = document.getElementById('wallpaper');
            if (!wallpaper) return;
            
            const wallpapers = {
                'default': 'assets/wallpapers/default.jpg',
                'cyberpunk': 'assets/wallpapers/cyberpunk.jpg',
                'galaxy': 'assets/wallpapers/galaxy.jpg',
                'neon': 'assets/wallpapers/neon.jpg',
                'dark': 'assets/wallpapers/dark.jpg'
            };
            
            const path = wallpapers[name] || wallpapers['default'];
            wallpaper.style.backgroundImage = `url(${path})`;
            
            // Save preference
            if (window.vicharakOS) {
                window.vicharakOS.settings.wallpaper = name;
                localStorage.setItem('vicharak_settings', 
                    JSON.stringify(window.vicharakOS.settings));
            }
        }

        setupDesktopIcons() {
            const iconContainer = document.getElementById('desktopIcons');
            if (!iconContainer) return;
            
            // Add click and double-click handlers
            iconContainer.querySelectorAll('.desktop-icon').forEach(icon => {
                // Double-click to open
                icon.addEventListener('dblclick', (e) => {
                    const app = icon.dataset.app;
                    if (app && window.openApp) {
                        window.openApp(app);
                    }
                });
                
                // Click to select
                icon.addEventListener('click', (e) => {
                    if (!e.ctrlKey) {
                        this.clearSelection();
                    }
                    this.selectIcon(icon);
                });
                
                // Drag to reorder
                icon.addEventListener('mousedown', (e) => {
                    if (e.button === 0) {
                        this.startIconDrag(e, icon);
                    }
                });
                
                // Context menu
                icon.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showIconContextMenu(e, icon);
                });
            });
        }

        setupDragSelect() {
            const desktop = document.getElementById('desktop');
            if (!desktop) return;
            
            // Selection box
            const selectionBox = document.createElement('div');
            selectionBox.className = 'selection-box';
            selectionBox.style.cssText = `
                position: fixed;
                border: 1px solid var(--primary);
                background: rgba(0, 191, 255, 0.1);
                display: none;
                z-index: 999;
                pointer-events: none;
            `;
            document.body.appendChild(selectionBox);
            
            let startX, startY, isSelecting = false;
            
            desktop.addEventListener('mousedown', (e) => {
                if (e.target === desktop || e.target === document.getElementById('wallpaper')) {
                    startX = e.clientX;
                    startY = e.clientY;
                    isSelecting = true;
                    selectionBox.style.display = 'block';
                    selectionBox.style.left = startX + 'px';
                    selectionBox.style.top = startY + 'px';
                    selectionBox.style.width = '0px';
                    selectionBox.style.height = '0px';
                    
                    if (!e.ctrlKey) {
                        this.clearSelection();
                    }
                }
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isSelecting) return;
                
                const x = Math.min(e.clientX, startX);
                const y = Math.min(e.clientY, startY);
                const width = Math.abs(e.clientX - startX);
                const height = Math.abs(e.clientY - startY);
                
                selectionBox.style.left = x + 'px';
                selectionBox.style.top = y + 'px';
                selectionBox.style.width = width + 'px';
                selectionBox.style.height = height + 'px';
                
                // Select icons within box
                const icons = document.querySelectorAll('.desktop-icon');
                icons.forEach(icon => {
                    const rect = icon.getBoundingClientRect();
                    const isInside = rect.left >= x && rect.right <= x + width &&
                                   rect.top >= y && rect.bottom <= y + height;
                    
                    if (isInside) {
                        this.selectIcon(icon);
                    } else if (!e.ctrlKey) {
                        this.deselectIcon(icon);
                    }
                });
            });
            
            document.addEventListener('mouseup', () => {
                if (isSelecting) {
                    isSelecting = false;
                    selectionBox.style.display = 'none';
                }
            });
        }

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+A: Select all
                if (e.ctrlKey && e.key === 'a') {
                    e.preventDefault();
                    const icons = document.querySelectorAll('.desktop-icon');
                    icons.forEach(icon => this.selectIcon(icon));
                }
                
                // Delete: Remove selected
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    this.deleteSelectedIcons();
                }
                
                // F2: Rename selected
                if (e.key === 'F2') {
                    this.renameSelectedIcon();
                }
            });
        }

        selectIcon(icon) {
            if (!icon) return;
            icon.classList.add('selected');
            if (!this.selectedIcons.includes(icon)) {
                this.selectedIcons.push(icon);
            }
        }

        deselectIcon(icon) {
            if (!icon) return;
            icon.classList.remove('selected');
            const index = this.selectedIcons.indexOf(icon);
            if (index > -1) {
                this.selectedIcons.splice(index, 1);
            }
        }

        clearSelection() {
            this.selectedIcons.forEach(icon => {
                icon.classList.remove('selected');
            });
            this.selectedIcons = [];
        }

        startIconDrag(e, icon) {
            this.isDragging = true;
            this.dragStart = { x: e.clientX, y: e.clientY };
            this.dragElement = icon;
            
            const clone = icon.cloneNode(true);
            clone.style.cssText = `
                position: fixed;
                pointer-events: none;
                opacity: 0.8;
                z-index: 10000;
                transform: scale(1.1);
                width: ${icon.offsetWidth}px;
            `;
            clone.id = 'drag-clone';
            document.body.appendChild(clone);
            
            const rect = icon.getBoundingClientRect();
            clone.style.left = rect.left + 'px';
            clone.style.top = rect.top + 'px';
            
            document.addEventListener('mousemove', this.onDragMove);
            document.addEventListener('mouseup', this.onDragEnd);
        }

        onDragMove = (e) => {
            if (!this.isDragging || !this.dragElement) return;
            
            const clone = document.getElementById('drag-clone');
            if (clone) {
                const dx = e.clientX - this.dragStart.x;
                const dy = e.clientY - this.dragStart.y;
                clone.style.left = (parseInt(clone.style.left) + dx) + 'px';
                clone.style.top = (parseInt(clone.style.top) + dy) + 'px';
                this.dragStart = { x: e.clientX, y: e.clientY };
            }
        }

        onDragEnd = () => {
            const clone = document.getElementById('drag-clone');
            if (clone) clone.remove();
            
            this.isDragging = false;
            this.dragElement = null;
            this.dragStart = null;
            
            document.removeEventListener('mousemove', this.onDragMove);
            document.removeEventListener('mouseup', this.onDragEnd);
        }

        showIconContextMenu(e, icon) {
            const menu = document.getElementById('contextMenu');
            if (!menu) return;
            
            const items = [
                { label: '📂 Open', action: () => this.openIcon(icon) },
                { label: '✏️ Rename', action: () => this.renameIcon(icon) },
                { label: '🗑️ Delete', action: () => this.deleteIcon(icon) },
                { label: '📋 Copy', action: () => this.copyIcon(icon) },
                { label: '✂️ Cut', action: () => this.cutIcon(icon) }
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
            const y = Math.min(e.clientY, window.innerHeight - 56 - 200);
            menu.style.left = x + 'px';
            menu.style.top = y + 'px';
            menu.style.display = 'block';
        }

        openIcon(icon) {
            const app = icon.dataset.app;
            if (app && window.openApp) {
                window.openApp(app);
            }
        }

        renameIcon(icon) {
            const nameSpan = icon.querySelector('span');
            if (!nameSpan) return;
            
            const currentName = nameSpan.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.style.cssText = `
                background: rgba(255,255,255,0.1);
                border: 1px solid var(--primary);
                border-radius: 4px;
                color: var(--text-primary);
                font-size: 12px;
                padding: 2px 4px;
                text-align: center;
                width: 72px;
                outline: none;
            `;
            
            nameSpan.textContent = '';
            nameSpan.appendChild(input);
            input.focus();
            input.select();
            
            const finishRename = () => {
                const newName = input.value.trim() || currentName;
                nameSpan.textContent = newName;
                this.saveDesktopState();
            };
            
            input.addEventListener('blur', finishRename);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
                if (e.key === 'Escape') {
                    nameSpan.textContent = currentName;
                    this.saveDesktopState();
                }
            });
        }

        deleteIcon(icon) {
            if (confirm(`Delete "${icon.querySelector('span')?.textContent}"?`)) {
                icon.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    icon.remove();
                    this.saveDesktopState();
                }, 300);
            }
        }

        deleteSelectedIcons() {
            this.selectedIcons.forEach(icon => this.deleteIcon(icon));
        }

        renameSelectedIcon() {
            if (this.selectedIcons.length === 1) {
                this.renameIcon(this.selectedIcons[0]);
            }
        }

        copyIcon(icon) {
            // Copy icon data to clipboard
            const app = icon.dataset.app;
            const name = icon.querySelector('span')?.textContent || '';
            navigator.clipboard?.writeText(JSON.stringify({ app, name, type: 'icon' }));
            window.showToast?.(`Copied "${name}"`, 'success');
        }

        cutIcon(icon) {
            // Cut icon data
            this.copyIcon(icon);
            this.deleteIcon(icon);
        }

        saveDesktopState() {
            try {
                const icons = document.querySelectorAll('.desktop-icon');
                const state = [];
                icons.forEach(icon => {
                    const app = icon.dataset.app;
                    const name = icon.querySelector('span')?.textContent || '';
                    const style = icon.style.cssText;
                    state.push({ app, name, style });
                });
                localStorage.setItem('desktop_state', JSON.stringify(state));
            } catch (error) {
                console.warn('Failed to save desktop state:', error);
            }
        }

        loadDesktopState() {
            try {
                const saved = localStorage.getItem('desktop_state');
                if (!saved) return;
                
                const state = JSON.parse(saved);
                const container = document.getElementById('desktopIcons');
                if (!container) return;
                
                // Clear existing icons (except template)
                const icons = container.querySelectorAll('.desktop-icon');
                icons.forEach(icon => {
                    if (!icon.dataset.app) return;
                    icon.remove();
                });
                
                state.forEach(data => {
                    const icon = document.createElement('div');
                    icon.className = 'desktop-icon';
                    icon.dataset.app = data.app;
                    icon.style.cssText = data.style || '';
                    icon.innerHTML = `
                        <div class="icon-wrapper">${this.getIconEmoji(data.app)}</div>
                        <span>${data.name}</span>
                    `;
                    container.appendChild(icon);
                });
                
                // Re-setup event listeners
                this.setupDesktopIcons();
            } catch (error) {
                console.warn('Failed to load desktop state:', error);
            }
        }

        getIconEmoji(app) {
            const emojis = {
                'ai': '🧠',
                'explorer': '📁',
                'notes': '📝',
                'terminal': '💻',
                'browser': '🌐',
                'calculator': '🧮',
                'calendar': '📅',
                'music': '🎵',
                'gallery': '🖼️',
                'settings': '⚙️'
            };
            return emojis[app] || '📄';
        }

        addWidget(widgetData) {
            const container = document.getElementById('widgets');
            if (!container) return;
            
            const widget = document.createElement('div');
            widget.className = 'widget';
            widget.innerHTML = `
                <div class="widget-header">${widgetData.header}</div>
                <div class="widget-content">${widgetData.content}</div>
            `;
            
            container.appendChild(widget);
            this.widgets.push(widget);
        }

        removeWidget(widget) {
            const index = this.widgets.indexOf(widget);
            if (index > -1) {
                widget.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    widget.remove();
                    this.widgets.splice(index, 1);
                }, 300);
            }
        }
    }

    // Initialize desktop on boot complete
    document.addEventListener('bootComplete', function() {
        const desktop = new DesktopManager();
        window.desktopManager = desktop;
    });

    // Export for use
    window.DesktopManager = DesktopManager;
})();