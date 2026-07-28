// Window Manager JS 
// Window Manager - Vicharak OS
(function() {
    'use strict';

    class WindowManager {
        constructor() {
            this.windows = new Map();
            this.activeWindow = null;
            this.zIndexCounter = 100;
            this.isDragging = false;
            this.isResizing = false;
            this.dragData = null;
            this.resizeData = null;
            
            this.init();
        }

        init() {
            console.log('🪟 Initializing Window Manager...');
            
            // Setup event listeners
            this.setupGlobalListeners();
            
            // Restore windows from state
            this.restoreWindows();
            
            console.log('✅ Window Manager initialized');
        }

        createWindow(options) {
            const {
                id = `window-${Date.now()}`,
                title = 'Window',
                content = '',
                icon = '📄',
                width = 600,
                height = 400,
                x = 50,
                y = 50,
                resizable = true,
                minimizable = true,
                maximizable = true,
                closable = true,
                onClose = null,
                onMinimize = null,
                onMaximize = null,
                onFocus = null
            } = options;

            // Check if window already exists
            if (this.windows.has(id)) {
                this.focusWindow(id);
                return this.windows.get(id);
            }

            // Create window element
            const container = document.getElementById('windowContainer');
            if (!container) {
                console.error('Window container not found');
                return null;
            }

            const windowEl = document.createElement('div');
            windowEl.className = 'window glass';
            windowEl.id = id;
            windowEl.style.width = width + 'px';
            windowEl.style.height = height + 'px';
            windowEl.style.left = x + 'px';
            windowEl.style.top = y + 'px';
            windowEl.style.zIndex = ++this.zIndexCounter;

            // Title bar
            const titlebar = document.createElement('div');
            titlebar.className = 'window-titlebar';
            titlebar.innerHTML = `
                <span class="window-icon">${icon}</span>
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    ${minimizable ? `<button class="window-control minimize" title="Minimize">─</button>` : ''}
                    ${maximizable ? `<button class="window-control maximize" title="Maximize">□</button>` : ''}
                    ${closable ? `<button class="window-control close" title="Close">✕</button>` : ''}
                </div>
            `;

            // Content
            const contentEl = document.createElement('div');
            contentEl.className = 'window-content';
            contentEl.innerHTML = content;

            // Resize handles
            const resizeHandles = resizable ? `
                <div class="window-resize-handle e"></div>
                <div class="window-resize-handle s"></div>
                <div class="window-resize-handle se"></div>
                <div class="window-resize-handle ne"></div>
                <div class="window-resize-handle nw"></div>
                <div class="window-resize-handle sw"></div>
            ` : '';

            windowEl.innerHTML = resizeHandles;
            windowEl.prepend(contentEl);
            windowEl.prepend(titlebar);

            container.appendChild(windowEl);

            // Store window data
            const windowData = {
                id,
                element: windowEl,
                title,
                icon,
                width,
                height,
                x,
                y,
                resizable,
                minimizable,
                maximizable,
                closable,
                isMinimized: false,
                isMaximized: false,
                previousState: null,
                callbacks: {
                    onClose,
                    onMinimize,
                    onMaximize,
                    onFocus
                },
                content: contentEl
            };

            this.windows.set(id, windowData);

            // Setup event listeners
            this.setupWindowEvents(windowData);

            // Focus window
            this.focusWindow(id);

            // Dispatch event
            document.dispatchEvent(new CustomEvent('windowOpened', {
                detail: {
                    appId: id,
                    appName: title,
                    icon: icon
                }
            }));

            return windowData;
        }

        setupWindowEvents(windowData) {
            const { element, id, content, callbacks } = windowData;
            const titlebar = element.querySelector('.window-titlebar');
            const controls = element.querySelectorAll('.window-control');

            // Focus on click
            element.addEventListener('mousedown', () => {
                this.focusWindow(id);
            });

            // Drag
            if (titlebar) {
                titlebar.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.window-controls')) return;
                    if (windowData.isMaximized) return;
                    
                    this.startDrag(e, windowData);
                });
            }

            // Controls
            controls.forEach(control => {
                if (control.classList.contains('close')) {
                    control.addEventListener('click', () => {
                        this.closeWindow(id);
                    });
                }
                if (control.classList.contains('minimize')) {
                    control.addEventListener('click', () => {
                        this.minimizeWindow(id);
                    });
                }
                if (control.classList.contains('maximize')) {
                    control.addEventListener('click', () => {
                        this.toggleMaximize(id);
                    });
                }
            });

            // Resize handles
            element.querySelectorAll('.window-resize-handle').forEach(handle => {
                handle.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    if (windowData.isMaximized) return;
                    
                    const direction = handle.className.split(' ')[1] || '';
                    this.startResize(e, windowData, direction);
                });
            });

            // Double-click on titlebar to maximize
            if (titlebar) {
                titlebar.addEventListener('dblclick', () => {
                    this.toggleMaximize(id);
                });
            }

            // Keyboard shortcuts for window
            element.addEventListener('keydown', (e) => {
                // Escape to close
                if (e.key === 'Escape' && windowData.closable) {
                    this.closeWindow(id);
                }
            });
        }

        setupGlobalListeners() {
            // Mouse move and up for drag and resize
            document.addEventListener('mousemove', (e) => {
                if (this.isDragging) {
                    this.onDrag(e);
                }
                if (this.isResizing) {
                    this.onResize(e);
                }
            });

            document.addEventListener('mouseup', () => {
                if (this.isDragging) {
                    this.stopDrag();
                }
                if (this.isResizing) {
                    this.stopResize();
                }
            });

            // Escape to close active window
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.activeWindow) {
                    const data = this.windows.get(this.activeWindow);
                    if (data && data.closable) {
                        this.closeWindow(this.activeWindow);
                    }
                }
            });
        }

        startDrag(e, windowData) {
            const rect = windowData.element.getBoundingClientRect();
            this.isDragging = true;
            this.dragData = {
                windowId: windowData.id,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
                startX: rect.left,
                startY: rect.top
            };
            
            windowData.element.style.cursor = 'grabbing';
            e.preventDefault();
        }

        onDrag(e) {
            if (!this.isDragging || !this.dragData) return;
            
            const data = this.windows.get(this.dragData.windowId);
            if (!data || data.isMaximized) return;
            
            let x = e.clientX - this.dragData.offsetX;
            let y = e.clientY - this.dragData.offsetY;
            
            // Keep within viewport
            x = Math.max(0, Math.min(x, window.innerWidth - data.width));
            y = Math.max(0, Math.min(y, window.innerHeight - 56 - data.height));
            
            data.x = x;
            data.y = y;
            data.element.style.left = x + 'px';
            data.element.style.top = y + 'px';
            
            // Check for snap
            this.checkSnap(data);
        }

        stopDrag() {
            this.isDragging = false;
            if (this.dragData) {
                const data = this.windows.get(this.dragData.windowId);
                if (data) {
                    data.element.style.cursor = '';
                }
                this.dragData = null;
            }
        }

        startResize(e, windowData, direction) {
            const rect = windowData.element.getBoundingClientRect();
            this.isResizing = true;
            this.resizeData = {
                windowId: windowData.id,
                direction: direction,
                startX: e.clientX,
                startY: e.clientY,
                startWidth: rect.width,
                startHeight: rect.height,
                startLeft: rect.left,
                startTop: rect.top
            };
            
            e.preventDefault();
        }

        onResize(e) {
            if (!this.isResizing || !this.resizeData) return;
            
            const data = this.windows.get(this.resizeData.windowId);
            if (!data || data.isMaximized) return;
            
            const dx = e.clientX - this.resizeData.startX;
            const dy = e.clientY - this.resizeData.startY;
            const dir = this.resizeData.direction;
            
            let newWidth = this.resizeData.startWidth;
            let newHeight = this.resizeData.startHeight;
            let newX = this.resizeData.startLeft;
            let newY = this.resizeData.startTop;
            
            // Adjust based on direction
            if (dir.includes('e')) {
                newWidth = Math.max(300, this.resizeData.startWidth + dx);
            }
            if (dir.includes('w')) {
                newWidth = Math.max(300, this.resizeData.startWidth - dx);
                newX = this.resizeData.startLeft + (this.resizeData.startWidth - newWidth);
            }
            if (dir.includes('s')) {
                newHeight = Math.max(200, this.resizeData.startHeight + dy);
            }
            if (dir.includes('n')) {
                newHeight = Math.max(200, this.resizeData.startHeight - dy);
                newY = this.resizeData.startTop + (this.resizeData.startHeight - newHeight);
            }
            
            // Update window
            data.width = newWidth;
            data.height = newHeight;
            data.x = newX;
            data.y = newY;
            
            data.element.style.width = newWidth + 'px';
            data.element.style.height = newHeight + 'px';
            data.element.style.left = newX + 'px';
            data.element.style.top = newY + 'px';
        }

        stopResize() {
            this.isResizing = false;
            this.resizeData = null;
        }

        checkSnap(data) {
            const threshold = 20;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight - 56;
            
            // Snap to edges
            if (data.x < threshold) {
                data.x = 0;
                data.element.style.left = '0px';
            }
            if (data.y < threshold) {
                data.y = 0;
                data.element.style.top = '0px';
            }
            if (data.x + data.width > windowWidth - threshold) {
                data.x = windowWidth - data.width;
                data.element.style.left = data.x + 'px';
            }
            if (data.y + data.height > windowHeight - threshold) {
                data.y = windowHeight - data.height;
                data.element.style.top = data.y + 'px';
            }
        }

        focusWindow(id) {
            const data = this.windows.get(id);
            if (!data) return;
            
            // Remove focus from all
            this.windows.forEach((win) => {
                win.element.classList.remove('focused');
            });
            
            // Focus this window
            data.element.classList.add('focused');
            data.element.style.zIndex = ++this.zIndexCounter;
            
            this.activeWindow = id;
            
            // Update taskbar
            if (window.taskbarManager) {
                window.taskbarManager.updateActiveApp(id);
            }
            
            // Callback
            if (data.callbacks.onFocus) {
                data.callbacks.onFocus(data);
            }
        }

        closeWindow(id) {
            const data = this.windows.get(id);
            if (!data) return;
            
            // Callback
            if (data.callbacks.onClose) {
                const shouldClose = data.callbacks.onClose(data);
                if (shouldClose === false) return;
            }
            
            // Animate close
            data.element.classList.add('closing');
            
            setTimeout(() => {
                data.element.remove();
                this.windows.delete(id);
                
                if (this.activeWindow === id) {
                    this.activeWindow = null;
                }
                
                // Update taskbar
                document.dispatchEvent(new CustomEvent('windowClosed', {
                    detail: { appId: id }
                }));
                
                // Focus next window
                if (this.windows.size > 0) {
                    const nextId = Array.from(this.windows.keys())[0];
                    this.focusWindow(nextId);
                }
            }, 300);
        }

        minimizeWindow(id) {
            const data = this.windows.get(id);
            if (!data) return;
            
            data.isMinimized = !data.isMinimized;
            
            if (data.isMinimized) {
                data.element.classList.add('minimized');
                if (this.activeWindow === id) {
                    this.activeWindow = null;
                    // Focus next window
                    const nextId = Array.from(this.windows.keys()).find(w => w !== id);
                    if (nextId) {
                        this.focusWindow(nextId);
                    }
                }
            } else {
                data.element.classList.remove('minimized');
                this.focusWindow(id);
            }
            
            // Callback
            if (data.callbacks.onMinimize) {
                data.callbacks.onMinimize(data, data.isMinimized);
            }
        }

        toggleMaximize(id) {
            const data = this.windows.get(id);
            if (!data) return;
            
            if (data.isMaximized) {
                // Restore
                data.isMaximized = false;
                data.element.classList.remove('maximized');
                
                if (data.previousState) {
                    data.width = data.previousState.width;
                    data.height = data.previousState.height;
                    data.x = data.previousState.x;
                    data.y = data.previousState.y;
                    
                    data.element.style.width = data.width + 'px';
                    data.element.style.height = data.height + 'px';
                    data.element.style.left = data.x + 'px';
                    data.element.style.top = data.y + 'px';
                }
            } else {
                // Maximize
                data.previousState = {
                    width: data.width,
                    height: data.height,
                    x: data.x,
                    y: data.y
                };
                
                data.isMaximized = true;
                data.element.classList.add('maximized');
                data.element.style.width = '100vw';
                data.element.style.height = 'calc(100vh - 56px)';
                data.element.style.left = '0';
                data.element.style.top = '0';
            }
            
            // Callback
            if (data.callbacks.onMaximize) {
                data.callbacks.onMaximize(data, data.isMaximized);
            }
        }

        updateWindowContent(id, content) {
            const data = this.windows.get(id);
            if (!data) return;
            
            data.content.innerHTML = content;
        }

        updateWindowTitle(id, title) {
            const data = this.windows.get(id);
            if (!data) return;
            
            const titleEl = data.element.querySelector('.window-title');
            if (titleEl) {
                titleEl.textContent = title;
            }
            data.title = title;
        }

        getWindow(id) {
            return this.windows.get(id);
        }

        getAllWindows() {
            return Array.from(this.windows.values());
        }

        closeAllWindows() {
            const ids = Array.from(this.windows.keys());
            ids.forEach(id => this.closeWindow(id));
        }

        restoreWindows() {
            try {
                const saved = localStorage.getItem('windows_state');
                if (!saved) return;
                
                const state = JSON.parse(saved);
                // Restore windows that were open
                // This would require storing app state as well
            } catch (error) {
                console.warn('Failed to restore windows:', error);
            }
        }

        saveWindowsState() {
            try {
                const state = [];
                this.windows.forEach((data, id) => {
                    state.push({
                        id,
                        title: data.title,
                        icon: data.icon,
                        width: data.width,
                        height: data.height,
                        x: data.x,
                        y: data.y,
                        isMaximized: data.isMaximized
                    });
                });
                localStorage.setItem('windows_state', JSON.stringify(state));
            } catch (error) {
                console.warn('Failed to save windows state:', error);
            }
        }
    }

    // Initialize window manager on boot complete
    document.addEventListener('bootComplete', function() {
        const windowManager = new WindowManager();
        window.windowManager = windowManager;
        
        // Save state periodically
        setInterval(() => {
            if (windowManager.windows.size > 0) {
                windowManager.saveWindowsState();
            }
        }, 30000);
    });

    // Export for use
    window.WindowManager = WindowManager;
})();