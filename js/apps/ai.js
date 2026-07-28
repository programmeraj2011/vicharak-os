// AI Assistant App - Vicharak OS
(function() {
    'use strict';

    class AIApp {
        constructor() {
            this.id = 'ai';
            this.name = 'Vicharak AI';
            this.icon = '🧠';
            this.window = null;
            this.messages = [];
            this.isListening = false;
            this.recognition = null;
            this.typingTimeout = null;
            
            // Load conversation history
            this.loadHistory();
            
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
                width: 700,
                height: 550,
                x: 80,
                y: 50,
                content: content,
                onClose: () => {
                    this.saveHistory();
                    this.window = null;
                },
                onFocus: () => {
                    // Focus input
                    setTimeout(() => {
                        const input = document.getElementById('aiInput');
                        if (input) input.focus();
                    }, 100);
                }
            });

            // Setup event listeners after render
            setTimeout(() => {
                this.setupEventListeners();
                this.renderMessages();
            }, 50);
        }

        renderContent() {
            return `
                <div class="ai-app">
                    <div class="ai-header">
                        <div class="ai-avatar">🧠</div>
                        <div class="ai-info">
                            <h3>Vicharak AI Assistant</h3>
                            <p>Your intelligent desktop companion</p>
                            <div class="ai-status">
                                <span class="ai-status-dot" id="aiStatusDot"></span>
                                <span id="aiStatusText">Ready</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-chat-container">
                        <div class="ai-messages" id="aiMessages">
                            <div class="ai-message">
                                <div class="message-avatar">🧠</div>
                                <div class="message-bubble">
                                    Hello! I'm your Vicharak AI assistant. I can help you with:
                                    <ul style="margin-top: 8px; padding-left: 20px;">
                                        <li>Opening applications</li>
                                        <li>Searching files</li>
                                        <li>Answering questions</li>
                                        <li>Voice commands</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="ai-suggestions" id="aiSuggestions">
                            <div class="ai-suggestion" data-query="Open settings">⚙️ Open Settings</div>
                            <div class="ai-suggestion" data-query="What time is it?">🕐 What time is it?</div>
                            <div class="ai-suggestion" data-query="Create a new note">📝 Create a note</div>
                            <div class="ai-suggestion" data-query="Help me">❓ Help</div>
                        </div>
                        
                        <div class="ai-input-area">
                            <input type="text" id="aiInput" placeholder="Ask me anything..." />
                            <button id="aiSendBtn" title="Send">➤</button>
                            <button id="aiVoiceBtn" class="voice-btn" title="Voice Input">🎤</button>
                        </div>
                    </div>
                </div>
            `;
        }

        setupEventListeners() {
            const input = document.getElementById('aiInput');
            const sendBtn = document.getElementById('aiSendBtn');
            const voiceBtn = document.getElementById('aiVoiceBtn');
            const suggestions = document.querySelectorAll('.ai-suggestion');

            // Send message
            if (sendBtn) {
                sendBtn.addEventListener('click', () => {
                    this.sendMessageFromInput();
                });
            }

            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessageFromInput();
                    }
                });
                
                // Focus input
                setTimeout(() => input.focus(), 100);
            }

            // Voice input
            if (voiceBtn) {
                voiceBtn.addEventListener('click', () => {
                    this.toggleVoiceInput();
                });
            }

            // Suggestions
            suggestions.forEach(suggestion => {
                suggestion.addEventListener('click', () => {
                    const query = suggestion.dataset.query;
                    if (query) {
                        if (input) input.value = query;
                        this.sendMessageFromInput();
                    }
                });
            });

            // Auto-resize input
            if (input) {
                input.addEventListener('input', () => {
                    // Auto adjust height if needed
                });
            }
        }

        sendMessageFromInput() {
            const input = document.getElementById('aiInput');
            if (!input) return;
            
            const message = input.value.trim();
            if (!message) return;
            
            input.value = '';
            this.sendMessage(message);
        }

        sendMessage(message) {
            // Add user message
            this.addMessage('user', message);
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Process message
            setTimeout(() => {
                this.hideTypingIndicator();
                const response = this.processCommand(message);
                this.addMessage('assistant', response);
                this.saveHistory();
            }, 500 + Math.random() * 500);
        }

        processCommand(message) {
            const msg = message.toLowerCase().trim();
            
            // AI responses
            const responses = {
                'hello': 'Hello! How can I help you today? 😊',
                'hi': 'Hi there! What can I do for you?',
                'hey': 'Hey! Ready to assist you!',
                'how are you': 'I\'m functioning perfectly! How are you?',
                'what time is it': `It's ${new Date().toLocaleTimeString()}`,
                'what is the date': `Today is ${new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}`,
                'open settings': 'Opening Settings app...',
                'open calculator': 'Opening Calculator...',
                'open notes': 'Opening Notes app...',
                'open browser': 'Opening Browser...',
                'open terminal': 'Opening Terminal...',
                'open music': 'Opening Music Player...',
                'open gallery': 'Opening Gallery...',
                'open calendar': 'Opening Calendar...',
                'open explorer': 'Opening File Explorer...',
                'create note': 'Creating a new note for you...',
                'help': 'I can help you with:\n• Opening apps\n• Answering questions\n• Voice commands\n• Creating notes\n• And more!',
                'thank you': 'You\'re welcome! 😊',
                'thanks': 'Anytime! 😊',
                'who are you': 'I\'m Vicharak AI, your intelligent desktop assistant! 🧠',
                'what can you do': 'I can help you with various tasks like opening apps, answering questions, creating notes, and much more!'
            };

            // Check for exact matches
            for (const [key, value] of Object.entries(responses)) {
                if (msg.includes(key)) {
                    // Execute actions for certain commands
                    if (key === 'open settings') this.openApp('settings');
                    else if (key === 'open calculator') this.openApp('calculator');
                    else if (key === 'open notes') this.openApp('notes');
                    else if (key === 'open browser') this.openApp('browser');
                    else if (key === 'open terminal') this.openApp('terminal');
                    else if (key === 'open music') this.openApp('music');
                    else if (key === 'open gallery') this.openApp('gallery');
                    else if (key === 'open calendar') this.openApp('calendar');
                    else if (key === 'open explorer') this.openApp('explorer');
                    else if (key === 'create note') {
                        if (window.vicharakOS?.apps?.notes) {
                            window.vicharakOS.apps.notes.createNote();
                        }
                    }
                    
                    return value;
                }
            }

            // Check for app opening
            const appMap = {
                'settings': 'Settings',
                'calculator': 'Calculator',
                'notes': 'Notes',
                'browser': 'Browser',
                'terminal': 'Terminal',
                'music': 'Music Player',
                'gallery': 'Gallery',
                'calendar': 'Calendar',
                'explorer': 'File Explorer'
            };

            for (const [key, value] of Object.entries(appMap)) {
                if (msg.includes(`open ${key}`) || msg.includes(`launch ${key}`)) {
                    this.openApp(key);
                    return `Opening ${value}...`;
                }
            }

            // Default response
            return `I'm not sure about that. Try asking me to open an app, create a note, or ask for help! 🤔`;
        }

        openApp(appName) {
            if (window.openApp) {
                window.openApp(appName);
                window.showToast?.(`Opening ${appName}...`, 'success');
            }
        }

        addMessage(type, text) {
            const container = document.getElementById('aiMessages');
            if (!container) return;

            const message = document.createElement('div');
            message.className = `ai-message ${type}`;
            
            const avatar = type === 'user' ? '👤' : '🧠';
            const time = new Date().toLocaleTimeString();
            
            message.innerHTML = `
                <div class="message-avatar">${avatar}</div>
                <div>
                    <div class="message-bubble">${this.formatMessage(text)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
            
            container.appendChild(message);
            container.scrollTop = container.scrollHeight;
            
            // Store message
            this.messages.push({ type, text, time });
        }

        formatMessage(text) {
            // Convert newlines to <br>
            let formatted = text.replace(/\n/g, '<br>');
            
            // Convert markdown-like formatting
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
            formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
            
            // Convert URLs to links
            formatted = formatted.replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" style="color: var(--primary);">$1</a>'
            );
            
            return formatted;
        }

        showTypingIndicator() {
            const container = document.getElementById('aiMessages');
            if (!container) return;
            
            // Remove existing indicator
            this.hideTypingIndicator();
            
            const indicator = document.createElement('div');
            indicator.className = 'ai-message';
            indicator.id = 'typingIndicator';
            indicator.innerHTML = `
                <div class="message-avatar">🧠</div>
                <div>
                    <div class="message-bubble">
                        <div class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(indicator);
            container.scrollTop = container.scrollHeight;
            
            // Update status
            this.updateStatus('typing', 'Vicharak AI is typing...');
        }

        hideTypingIndicator() {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) {
                indicator.remove();
            }
            this.updateStatus('ready', 'Ready');
        }

        updateStatus(state, text) {
            const dot = document.getElementById('aiStatusDot');
            const statusText = document.getElementById('aiStatusText');
            
            if (dot) {
                dot.className = 'ai-status-dot';
                if (state === 'typing') {
                    dot.classList.add('typing');
                } else if (state === 'listening') {
                    dot.classList.add('listening');
                }
            }
            
            if (statusText) {
                statusText.textContent = text;
            }
        }

        toggleVoiceInput() {
            if (this.isListening) {
                this.stopVoiceInput();
            } else {
                this.startVoiceInput();
            }
        }

        startVoiceInput() {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                window.showToast?.('Voice input not supported in this browser', 'error');
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.lang = 'en-US';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            
            this.recognition.onstart = () => {
                this.isListening = true;
                const btn = document.getElementById('aiVoiceBtn');
                if (btn) btn.classList.add('listening');
                this.updateStatus('listening', 'Listening...');
                window.showToast?.('🎤 Listening... Speak now', 'info');
            };
            
            this.recognition.onresult = (event) => {
                const result = event.results[event.results.length - 1];
                const transcript = result[0].transcript;
                
                const input = document.getElementById('aiInput');
                if (input) {
                    input.value = transcript;
                }
                
                if (result.isFinal) {
                    this.stopVoiceInput();
                    this.sendMessageFromInput();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.warn('Voice recognition error:', event.error);
                this.stopVoiceInput();
                window.showToast?.('Voice recognition error', 'error');
            };
            
            this.recognition.onend = () => {
                this.stopVoiceInput();
            };
            
            this.recognition.start();
        }

        stopVoiceInput() {
            this.isListening = false;
            const btn = document.getElementById('aiVoiceBtn');
            if (btn) btn.classList.remove('listening');
            this.updateStatus('ready', 'Ready');
            
            if (this.recognition) {
                try {
                    this.recognition.stop();
                } catch (e) {
                    // Ignore
                }
                this.recognition = null;
            }
        }

        renderMessages() {
            const container = document.getElementById('aiMessages');
            if (!container) return;
            
            // Clear existing messages (keep first welcome message)
            container.innerHTML = '';
            
            // Add stored messages
            this.messages.forEach(msg => {
                const message = document.createElement('div');
                message.className = `ai-message ${msg.type}`;
                
                const avatar = msg.type === 'user' ? '👤' : '🧠';
                
                message.innerHTML = `
                    <div class="message-avatar">${avatar}</div>
                    <div>
                        <div class="message-bubble">${this.formatMessage(msg.text)}</div>
                        <div class="message-time">${msg.time || 'Just now'}</div>
                    </div>
                `;
                
                container.appendChild(message);
            });
            
            // If no messages, add welcome
            if (this.messages.length === 0) {
                const welcome = document.createElement('div');
                welcome.className = 'ai-message';
                welcome.innerHTML = `
                    <div class="message-avatar">🧠</div>
                    <div>
                        <div class="message-bubble">
                            Hello! I'm your Vicharak AI assistant. How can I help you today?
                        </div>
                    </div>
                `;
                container.appendChild(welcome);
            }
            
            container.scrollTop = container.scrollHeight;
        }

        loadHistory() {
            try {
                const saved = localStorage.getItem('ai_conversation_history');
                if (saved) {
                    this.messages = JSON.parse(saved);
                }
            } catch (error) {
                console.warn('Failed to load AI history:', error);
                this.messages = [];
            }
        }

        saveHistory() {
            try {
                // Keep only last 100 messages
                if (this.messages.length > 100) {
                    this.messages = this.messages.slice(-100);
                }
                localStorage.setItem('ai_conversation_history', JSON.stringify(this.messages));
            } catch (error) {
                console.warn('Failed to save AI history:', error);
            }
        }

        clearHistory() {
            this.messages = [];
            this.saveHistory();
            this.renderMessages();
            window.showToast?.('Conversation history cleared', 'info');
        }
    }

    // Register app
    if (window.vicharakOS) {
        window.vicharakOS.apps.ai = new AIApp();
    }

    // Export for use
    window.AIApp = AIApp;
})();