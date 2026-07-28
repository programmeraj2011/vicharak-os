// Notes App - Vicharak OS
(function() {
    'use strict';

    class NotesApp {
        constructor() {
            this.id = 'notes';
            this.name = 'Notes';
            this.icon = '📝';
            this.window = null;
            this.notes = [];
            this.currentNote = null;
            this.searchQuery = '';
            this.autoSaveTimer = null;
            
            // Load notes
            this.loadNotes();
            
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
                x: 80,
                y: 50,
                content: content,
                onClose: () => {
                    this.saveNotes();
                    this.window = null;
                },
                onFocus: () => {
                    if (this.currentNote) {
                        this.renderNote(this.currentNote);
                    }
                }
            });

            setTimeout(() => {
                this.setupEventListeners();
                this.renderNoteList();
                if (this.notes.length > 0) {
                    this.selectNote(this.notes[0]);
                }
            }, 50);
        }

        renderContent() {
            return `
                <div class="notes-app">
                    <div class="notes-toolbar">
                        <button id="notesNew" class="new-note-btn">➕ New Note</button>
                        <input type="text" id="notesSearch" class="notes-search" placeholder="Search notes..." />
                        <button id="notesDelete">🗑️ Delete</button>
                        <button id="notesExport">📤 Export</button>
                    </div>
                    
                    <div class="notes-container">
                        <div class="notes-list" id="notesList">
                            <!-- Notes will be rendered here -->
                        </div>
                        
                        <div class="notes-editor" id="notesEditor">
                            <input type="text" id="noteTitle" placeholder="Note title..." />
                            <textarea id="noteContent" placeholder="Write your note here..."></textarea>
                            <div class="note-actions">
                                <span style="font-size: 12px; color: var(--text-muted);" id="noteStatus">Auto-saved</span>
                                <button id="noteSave">💾 Save</button>
                                <button id="notePreview">👁️ Preview</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        setupEventListeners() {
            // New note
            document.getElementById('notesNew')?.addEventListener('click', () => {
                this.createNote();
            });

            // Delete note
            document.getElementById('notesDelete')?.addEventListener('click', () => {
                this.deleteCurrentNote();
            });

            // Export notes
            document.getElementById('notesExport')?.addEventListener('click', () => {
                this.exportNotes();
            });

            // Search
            document.getElementById('notesSearch')?.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderNoteList();
            });

            // Save note
            document.getElementById('noteSave')?.addEventListener('click', () => {
                this.saveCurrentNote();
            });

            // Preview note
            document.getElementById('notePreview')?.addEventListener('click', () => {
                this.togglePreview();
            });

            // Auto-save on input
            const titleInput = document.getElementById('noteTitle');
            const contentTextarea = document.getElementById('noteContent');
            
            if (titleInput) {
                titleInput.addEventListener('input', () => {
                    this.autoSaveNote();
                });
            }
            
            if (contentTextarea) {
                contentTextarea.addEventListener('input', () => {
                    this.autoSaveNote();
                });
            }

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (this.window && document.activeElement?.closest('.notes-app')) {
                    // Ctrl+S: Save
                    if (e.ctrlKey && e.key === 's') {
                        e.preventDefault();
                        this.saveCurrentNote();
                    }
                    // Ctrl+N: New note
                    if (e.ctrlKey && e.key === 'n') {
                        e.preventDefault();
                        this.createNote();
                    }
                }
            });
        }

        renderNoteList() {
            const container = document.getElementById('notesList');
            if (!container) return;

            container.innerHTML = '';

            let filteredNotes = this.notes;
            if (this.searchQuery) {
                filteredNotes = this.notes.filter(note => 
                    note.title.toLowerCase().includes(this.searchQuery) ||
                    note.content.toLowerCase().includes(this.searchQuery)
                );
            }

            if (filteredNotes.length === 0) {
                container.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: var(--text-muted);">
                        <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
                        ${this.searchQuery ? 'No notes found' : 'No notes yet. Create one!'}
                    </div>
                `;
                return;
            }

            filteredNotes.forEach(note => {
                const item = document.createElement('div');
                item.className = 'notes-list-item';
                if (this.currentNote && this.currentNote.id === note.id) {
                    item.classList.add('active');
                }
                
                const preview = note.content.substring(0, 60) + (note.content.length > 60 ? '...' : '');
                const date = new Date(note.updated).toLocaleDateString();
                
                item.innerHTML = `
                    <div class="note-title">${note.title || 'Untitled'}</div>
                    <div class="note-preview">${preview}</div>
                    <div class="note-date">${date}</div>
                `;
                
                item.addEventListener('click', () => {
                    this.selectNote(note);
                });
                
                container.appendChild(item);
            });
        }

        renderNote(note) {
            if (!note) return;
            
            const titleInput = document.getElementById('noteTitle');
            const contentTextarea = document.getElementById('noteContent');
            
            if (titleInput) titleInput.value = note.title || '';
            if (contentTextarea) contentTextarea.value = note.content || '';
            
            this.updateStatus('Loaded');
            this.renderNoteList();
        }

        selectNote(note) {
            this.currentNote = note;
            this.renderNote(note);
        }

        createNote() {
            const note = {
                id: Date.now().toString(),
                title: 'Untitled',
                content: '',
                created: Date.now(),
                updated: Date.now()
            };
            
            this.notes.unshift(note);
            this.currentNote = note;
            this.saveNotes();
            this.renderNoteList();
            this.renderNote(note);
            
            // Focus title
            setTimeout(() => {
                document.getElementById('noteTitle')?.focus();
            }, 100);
            
            window.showToast?.('New note created', 'success');
        }

        saveCurrentNote() {
            if (!this.currentNote) return;
            
            const titleInput = document.getElementById('noteTitle');
            const contentTextarea = document.getElementById('noteContent');
            
            if (titleInput) this.currentNote.title = titleInput.value || 'Untitled';
            if (contentTextarea) this.currentNote.content = contentTextarea.value;
            
            this.currentNote.updated = Date.now();
            this.saveNotes();
            this.renderNoteList();
            this.updateStatus('Saved!');
            
            window.showToast?.('Note saved', 'success');
        }

        autoSaveNote() {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                this.saveCurrentNote();
                this.updateStatus('Auto-saved');
            }, 1000);
        }

        deleteCurrentNote() {
            if (!this.currentNote) return;
            
            if (!confirm(`Delete "${this.currentNote.title}"?`)) return;
            
            const index = this.notes.findIndex(n => n.id === this.currentNote.id);
            if (index > -1) {
                this.notes.splice(index, 1);
                this.saveNotes();
                
                if (this.notes.length > 0) {
                    this.currentNote = this.notes[0];
                    this.renderNote(this.notes[0]);
                } else {
                    this.currentNote = null;
                    document.getElementById('noteTitle').value = '';
                    document.getElementById('noteContent').value = '';
                    this.updateStatus('No notes');
                }
                
                this.renderNoteList();
                window.showToast?.('Note deleted', 'info');
            }
        }

        openNote(title, content) {
            // Check if note exists
            let note = this.notes.find(n => n.title === title);
            
            if (!note) {
                // Create new note
                note = {
                    id: Date.now().toString(),
                    title: title || 'Untitled',
                    content: content || '',
                    created: Date.now(),
                    updated: Date.now()
                };
                this.notes.unshift(note);
                this.saveNotes();
            }
            
            // Open app and select note
            this.open();
            setTimeout(() => {
                this.selectNote(note);
            }, 200);
        }

        togglePreview() {
            const content = document.getElementById('noteContent');
            const preview = document.getElementById('notePreview');
            
            if (!content) return;
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                preview.textContent = '👁️ Preview';
            } else {
                content.style.display = 'none';
                preview.textContent = '✏️ Edit';
                
                // Show preview
                const previewEl = document.createElement('div');
                previewEl.className = 'notes-preview';
                previewEl.id = 'notesPreview';
                previewEl.innerHTML = this.formatMarkdown(content.value);
                
                const editor = document.getElementById('notesEditor');
                const existingPreview = document.getElementById('notesPreview');
                if (existingPreview) {
                    existingPreview.remove();
                }
                editor.insertBefore(previewEl, content.nextSibling);
            }
        }

        formatMarkdown(text) {
            // Simple markdown formatting
            let html = text;
            
            // Headers
            html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
            html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
            html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
            
            // Bold
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Italic
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Code
            html = html.replace(/`(.*?)`/g, '<code>$1</code>');
            
            // Lists
            html = html.replace(/^\s*-\s(.*$)/gim, '<li>$1</li>');
            html = html.replace(/^\s*\d+\.\s(.*$)/gim, '<li>$1</li>');
            
            // Newlines to <br>
            html = html.replace(/\n/g, '<br>');
            
            return html;
        }

        exportNotes() {
            if (this.notes.length === 0) {
                window.showToast?.('No notes to export', 'warning');
                return;
            }
            
            const data = JSON.stringify(this.notes, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `notes_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            window.showToast?.('Notes exported!', 'success');
        }

        updateStatus(text) {
            const status = document.getElementById('noteStatus');
            if (status) {
                status.textContent = text;
            }
        }

        loadNotes() {
            try {
                const saved = localStorage.getItem('vicharak_notes');
                if (saved) {
                    this.notes = JSON.parse(saved);
                } else {
                    // Add sample note
                    this.notes = [{
                        id: '1',
                        title: 'Welcome to Notes!',
                        content: 'This is your first note. Click the "New Note" button to create more.\n\nYou can use **bold** and *italic* text.\n\n- Create lists\n- Organize your thoughts\n- Save automatically',
                        created: Date.now(),
                        updated: Date.now()
                    }];
                }
            } catch (error) {
                console.warn('Failed to load notes:', error);
                this.notes = [];
            }
        }

        saveNotes() {
            try {
                localStorage.setItem('vicharak_notes', JSON.stringify(this.notes));
            } catch (error) {
                console.warn('Failed to save notes:', error);
            }
        }
    }

    // Register app
    if (window.vicharakOS) {
        window.vicharakOS.apps.notes = new NotesApp();
    }

    // Export for use
    window.NotesApp = NotesApp;
})();