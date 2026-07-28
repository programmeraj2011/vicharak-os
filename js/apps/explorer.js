// Explorer App JS 
// File Explorer App - Vicharak OS
(function() {
    'use strict';

    class ExplorerApp {
        constructor() {
            this.id = 'explorer';
            this.name = 'File Explorer';
            this.icon = '📁';
            this.window = null;
            this.currentPath = '/';
            this.files = [];
            this.selectedFiles = [];
            
            // Load filesystem
            this.loadFileSystem();
            
            // Register app
            if (window.vicharakOS) {
                window.vicharakOS.apps[this.id] = this;
            }
        }

        open() {
            if (this.window && !this.window.isMinimized) {
                if (window.windowManager) {
                    window.windowManager.focusWindow(this.id);
                }
                return;
            }

            const content = this.renderContent();
            
            this.window = window.windowManager.createWindow({
                id: this.id,
                title: this.name,
                icon: this.icon,
                width: 800,
                height: 550,
                x: 100,
                y: 60,
                content: content,
                onClose: () => {
                    this.saveFileSystem();
                    this.window = null;
                },
                onFocus: () => {
                    this.refresh();
                }
            });

            setTimeout(() => {
                this.setupEventListeners();
                this.refresh();
            }, 50);
        }

        renderContent() {
            return `
                <div class="explorer-app">
                    <div class="explorer-toolbar">
                        <button id="explorerBack" title="Back">◀</button>
                        <button id="explorerForward" title="Forward">▶</button>
                        <button id="explorerUp" title="Up">⬆</button>
                        <button id="explorerRefresh" title="Refresh">🔄</button>
                        <div class="path-bar" id="explorerPath">/</div>
                        <button id="explorerNewFolder" title="New Folder">📁 New</button>
                        <button id="explorerNewNote" title="New Note">📝 Note</button>
                    </div>
                    
                    <div class="explorer-content">
                        <div class="explorer-sidebar">
                            <div class="explorer-sidebar-item active" data-path="/">
                                <span>🏠</span> Home
                            </div>
                            <div class="explorer-sidebar-item" data-path="/documents">
                                <span>📄</span> Documents
                            </div>
                            <div class="explorer-sidebar-item" data-path="/downloads">
                                <span>⬇️</span> Downloads
                            </div>
                            <div class="explorer-sidebar-item" data-path="/pictures">
                                <span>🖼️</span> Pictures
                            </div>
                            <div class="explorer-sidebar-item" data-path="/music">
                                <span>🎵</span> Music
                            </div>
                            <div class="explorer-sidebar-item" data-path="/notes">
                                <span>📝</span> Notes
                            </div>
                        </div>
                        
                        <div class="explorer-files" id="explorerFiles">
                            <!-- Files will be rendered here -->
                        </div>
                    </div>
                </div>
            `;
        }

        setupEventListeners() {
            // Toolbar buttons
            document.getElementById('explorerBack')?.addEventListener('click', () => this.goBack());
            document.getElementById('explorerForward')?.addEventListener('click', () => this.goForward());
            document.getElementById('explorerUp')?.addEventListener('click', () => this.goUp());
            document.getElementById('explorerRefresh')?.addEventListener('click', () => this.refresh());
            document.getElementById('explorerNewFolder')?.addEventListener('click', () => this.createFolder());
            document.getElementById('explorerNewNote')?.addEventListener('click', () => this.createNote());

            // Sidebar navigation
            document.querySelectorAll('.explorer-sidebar-item').forEach(item => {
                item.addEventListener('click', () => {
                    const path = item.dataset.path;
                    if (path) {
                        this.navigate(path);
                        // Update active
                        document.querySelectorAll('.explorer-sidebar-item').forEach(el => 
                            el.classList.remove('active'));
                        item.classList.add('active');
                    }
                });
            });

            // File container double-click for empty space
            const container = document.getElementById('explorerFiles');
            if (container) {
                container.addEventListener('dblclick', (e) => {
                    if (e.target === container) {
                        this.createFolder();
                    }
                });
            }
        }

        renderFiles() {
            const container = document.getElementById('explorerFiles');
            if (!container) return;

            container.innerHTML = '';

            if (this.files.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                        <div style="font-size: 48px; margin-bottom: 12px;">📂</div>
                        <div>This folder is empty</div>
                        <button onclick="window.vicharakOS?.apps?.explorer?.createFolder()" 
                                style="margin-top: 12px; padding: 8px 16px; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer;">
                            Create New Folder
                        </button>
                    </div>
                `;
                return;
            }

            this.files.forEach(file => {
                const fileEl = document.createElement('div');
                fileEl.className = 'explorer-file';
                if (this.selectedFiles.includes(file.name)) {
                    fileEl.classList.add('selected');
                }
                
                const icon = file.type === 'folder' ? '📁' : 
                            file.type === 'note' ? '📝' : '📄';
                
                fileEl.innerHTML = `
                    <div class="file-icon">${icon}</div>
                    <div class="file-name">${file.name}</div>
                    ${file.size ? `<div class="file-size">${this.formatSize(file.size)}</div>` : ''}
                    <div class="file-actions">
                        ${file.type === 'folder' || file.type === 'note' ? 
                            `<button class="rename-btn" title="Rename">✏️</button>` : ''}
                        <button class="delete-btn" title="Delete">🗑️</button>
                    </div>
                `;

                // Double-click to open
                fileEl.addEventListener('dblclick', () => {
                    if (file.type === 'folder') {
                        this.navigate(`${this.currentPath}${file.name}/`);
                    } else if (file.type === 'note') {
                        this.openNote(file);
                    }
                });

                // Click to select
                fileEl.addEventListener('click', (e) => {
                    if (e.ctrlKey) {
                        fileEl.classList.toggle('selected');
                        const index = this.selectedFiles.indexOf(file.name);
                        if (index > -1) {
                            this.selectedFiles.splice(index, 1);
                        } else {
                            this.selectedFiles.push(file.name);
                        }
                    } else {
                        this.selectedFiles = [file.name];
                        container.querySelectorAll('.explorer-file').forEach(el => 
                            el.classList.remove('selected'));
                        fileEl.classList.add('selected');
                    }
                });

                // Right-click context menu
                fileEl.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showFileContextMenu(e, file);
                });

                // Action buttons
                fileEl.querySelector('.rename-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.renameFile(file);
                });

                fileEl.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteFile(file);
                });

                container.appendChild(fileEl);
            });

            // Update path
            const pathEl = document.getElementById('explorerPath');
            if (pathEl) {
                pathEl.textContent = this.currentPath;
            }
        }

        navigate(path) {
            this.currentPath = path;
            this.loadFiles();
            this.renderFiles();
            this.saveFileSystem();
        }

        loadFiles() {
            const fs = this.getFileSystem();
            const path = this.currentPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
            
            let current = fs;
            for (const part of path) {
                if (current[part] && current[part].type === 'folder') {
                    current = current[part].children || {};
                } else {
                    this.files = [];
                    return;
                }
            }
            
            this.files = Object.entries(current)
                .filter(([name]) => name !== '_meta')
                .map(([name, data]) => ({
                    name,
                    type: data.type || 'file',
                    size: data.size || null,
                    data: data
                }));
        }

        refresh() {
            this.loadFiles();
            this.renderFiles();
        }

        goBack() {
            // Simple navigation history
            const pathParts = this.currentPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
            if (pathParts.length > 0) {
                pathParts.pop();
                this.navigate('/' + pathParts.join('/') + '/');
            }
        }

        goForward() {
            // Placeholder for forward navigation
            window.showToast?.('Forward navigation not available', 'info');
        }

        goUp() {
            const pathParts = this.currentPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
            if (pathParts.length > 0) {
                pathParts.pop();
                this.navigate('/' + pathParts.join('/') + '/');
            }
        }

        createFolder() {
            const name = prompt('Enter folder name:', 'New Folder');
            if (!name) return;
            
            const fs = this.getFileSystem();
            const path = this.getCurrentPathObject(fs);
            
            if (path[name]) {
                window.showToast?.('Folder already exists', 'error');
                return;
            }
            
            path[name] = {
                type: 'folder',
                children: {}
            };
            
            this.saveFileSystem();
            this.refresh();
            window.showToast?.(`Folder "${name}" created`, 'success');
        }

        createNote() {
            const name = prompt('Enter note name:', 'New Note');
            if (!name) return;
            
            const fs = this.getFileSystem();
            const path = this.getCurrentPathObject(fs);
            
            if (path[name]) {
                window.showToast?.('Note already exists', 'error');
                return;
            }
            
            path[name] = {
                type: 'note',
                content: '',
                size: 0,
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            };
            
            this.saveFileSystem();
            this.refresh();
            
            // Open the note
            this.openNote({ name, data: path[name] });
            window.showToast?.(`Note "${name}" created`, 'success');
        }

        openNote(file) {
            if (window.vicharakOS?.apps?.notes) {
                // Open the note in Notes app
                const notesApp = window.vicharakOS.apps.notes;
                if (notesApp) {
                    notesApp.openNote(file.name, file.data.content || '');
                }
            } else {
                window.showToast?.('Notes app not available', 'error');
            }
        }

        renameFile(file) {
            const newName = prompt('Enter new name:', file.name);
            if (!newName || newName === file.name) return;
            
            const fs = this.getFileSystem();
            const path = this.getCurrentPathObject(fs);
            
            if (path[newName]) {
                window.showToast?.('A file with this name already exists', 'error');
                return;
            }
            
            path[newName] = path[file.name];
            delete path[file.name];
            
            this.saveFileSystem();
            this.refresh();
            window.showToast?.(`Renamed to "${newName}"`, 'success');
        }

        deleteFile(file) {
            if (!confirm(`Delete "${file.name}"?`)) return;
            
            const fs = this.getFileSystem();
            const path = this.getCurrentPathObject(fs);
            
            delete path[file.name];
            
            this.saveFileSystem();
            this.refresh();
            window.showToast?.(`"${file.name}" deleted`, 'info');
        }

        getCurrentPathObject(fs) {
            const path = this.currentPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
            let current = fs;
            
            for (const part of path) {
                if (current[part] && current[part].type === 'folder') {
                    current = current[part].children;
                } else {
                    return current;
                }
            }
            
            return current;
        }

        getFileSystem() {
            if (!this._fs) {
                this.loadFileSystem();
            }
            return this._fs;
        }

        loadFileSystem() {
            try {
                const saved = localStorage.getItem('vicharak_filesystem');
                if (saved) {
                    this._fs = JSON.parse(saved);
                } else {
                    // Initialize default filesystem
                    this._fs = {
                        '_meta': { version: '1.0' },
                        'documents': {
                            type: 'folder',
                            children: {}
                        },
                        'downloads': {
                            type: 'folder',
                            children: {}
                        },
                        'pictures': {
                            type: 'folder',
                            children: {}
                        },
                        'music': {
                            type: 'folder',
                            children: {}
                        },
                        'notes': {
                            type: 'folder',
                            children: {}
                        }
                    };
                    this.saveFileSystem();
                }
            } catch (error) {
                console.warn('Failed to load filesystem:', error);
                this._fs = {};
            }
            return this._fs;
        }

        saveFileSystem() {
            try {
                localStorage.setItem('vicharak_filesystem', JSON.stringify(this._fs));
            } catch (error) {
                console.warn('Failed to save filesystem:', error);
            }
        }

        showFileContextMenu(e, file) {
            // Use global context menu
            const menu = document.getElementById('contextMenu');
            if (!menu) return;
            
            const items = [
                { label: '📂 Open', action: () => {
                    if (file.type === 'folder') {
                        this.navigate(`${this.currentPath}${file.name}/`);
                    } else if (file.type === 'note') {
                        this.openNote(file);
                    }
                }},
                { label: '✏️ Rename', action: () => this.renameFile(file) },
                { label: '🗑️ Delete', action: () => this.deleteFile(file) },
                { label: '📋 Copy', action: () => {
                    navigator.clipboard?.writeText(JSON.stringify(file));
                    window.showToast?.('Copied to clipboard', 'success');
                }}
            ];
            
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
            
            const x = Math.min(e.clientX, window.innerWidth - 200);
            const y = Math.min(e.clientY, window.innerHeight - 56 - 200);
            menu.style.left = x + 'px';
            menu.style.top = y + 'px';
            menu.style.display = 'block';
        }

        formatSize(bytes) {
            if (!bytes) return '';
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
        }
    }

    // Register app
    if (window.vicharakOS) {
        window.vicharakOS.apps.explorer = new ExplorerApp();
    }

    // Export for use
    window.ExplorerApp = ExplorerApp;
})();