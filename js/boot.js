// Boot JS 
// Boot Sequence - Vicharak OS
(function() {
    'use strict';

    // Boot configuration
    const BOOT_CONFIG = {
        minBootTime: 2000, // Minimum boot time in ms
        maxBootTime: 5000, // Maximum boot time in ms
        steps: [
            { id: 'kernel', label: 'Loading kernel...', duration: 300 },
            { id: 'drivers', label: 'Initializing drivers...', duration: 400 },
            { id: 'services', label: 'Starting system services...', duration: 500 },
            { id: 'filesystem', label: 'Mounting virtual filesystem...', duration: 400 },
            { id: 'ai', label: 'Loading AI assistant...', duration: 600 },
            { id: 'desktop', label: 'Preparing desktop environment...', duration: 500 },
            { id: 'ready', label: 'System ready!', duration: 300 }
        ]
    };

    // Boot manager
    class BootManager {
        constructor() {
            this.started = false;
            this.completed = false;
            this.startTime = null;
            this.currentStep = 0;
            this.callbacks = [];
            this.onCompleteCallbacks = [];
        }

        start() {
            if (this.started) return;
            this.started = true;
            this.startTime = Date.now();
            
            console.log('🚀 Starting boot sequence...');
            this.executeStep(0);
        }

        executeStep(index) {
            if (index >= BOOT_CONFIG.steps.length) {
                this.complete();
                return;
            }

            this.currentStep = index;
            const step = BOOT_CONFIG.steps[index];
            
            // Update UI
            this.updateBootUI(step);
            
            // Notify callbacks
            this.notifyCallbacks(step);
            
            // Execute step with duration
            setTimeout(() => {
                this.executeStep(index + 1);
            }, step.duration);
        }

        updateBootUI(step) {
            const progress = document.querySelector('.boot-progress');
            const status = document.querySelector('.boot-status');
            
            if (progress) {
                const percentage = ((this.currentStep + 1) / BOOT_CONFIG.steps.length) * 100;
                progress.style.width = `${Math.min(percentage, 100)}%`;
            }
            
            if (status) {
                status.textContent = step.label;
            }

            // Update logo animation
            const logo = document.querySelector('.boot-logo');
            if (logo) {
                if (this.currentStep === 0) {
                    logo.style.animation = 'pulse 1s ease-in-out infinite';
                } else if (this.currentStep >= BOOT_CONFIG.steps.length - 2) {
                    logo.style.animation = 'glowPulse 1.5s ease-in-out infinite';
                }
            }
        }

        complete() {
            if (this.completed) return;
            this.completed = true;
            
            const bootTime = Date.now() - this.startTime;
            console.log(`✅ Boot completed in ${bootTime}ms`);
            
            // Ensure minimum boot time
            const elapsed = Date.now() - this.startTime;
            const remaining = BOOT_CONFIG.minBootTime - elapsed;
            
            if (remaining > 0) {
                setTimeout(() => {
                    this.fireCompleteCallbacks();
                }, remaining);
            } else {
                this.fireCompleteCallbacks();
            }
        }

        fireCompleteCallbacks() {
            // Show login screen after boot
            const bootScreen = document.getElementById('bootScreen');
            if (bootScreen) {
                bootScreen.classList.add('fade-out');
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                    this.showLoginScreen();
                }, 800);
            }
            
            // Fire callbacks
            this.onCompleteCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error('Error in boot complete callback:', error);
                }
            });
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('bootComplete', {
                detail: { bootTime: Date.now() - this.startTime }
            }));
        }

        showLoginScreen() {
            const loginScreen = document.getElementById('loginScreen');
            const loginTime = document.getElementById('loginTime');
            
            if (loginScreen) {
                loginScreen.style.display = 'flex';
                loginScreen.style.animation = 'fadeIn 0.5s ease';
                
                // Update time
                if (loginTime) {
                    const now = new Date();
                    loginTime.textContent = now.toLocaleString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                    
                    // Update time every second
                    setInterval(() => {
                        const now = new Date();
                        loginTime.textContent = now.toLocaleString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        });
                    }, 1000);
                }
            }
        }

        onStep(callback) {
            this.callbacks.push(callback);
        }

        onComplete(callback) {
            this.onCompleteCallbacks.push(callback);
        }

        notifyCallbacks(step) {
            this.callbacks.forEach(callback => {
                try {
                    callback(step, this.currentStep, BOOT_CONFIG.steps.length);
                } catch (error) {
                    console.error('Error in boot step callback:', error);
                }
            });
        }

        getProgress() {
            if (!this.started) return 0;
            return ((this.currentStep + 1) / BOOT_CONFIG.steps.length) * 100;
        }

        getStatus() {
            if (!this.started) return 'Not started';
            if (this.completed) return 'Complete';
            return BOOT_CONFIG.steps[this.currentStep]?.label || 'Booting...';
        }
    }

    // Initialize boot
    document.addEventListener('DOMContentLoaded', function() {
        const bootManager = new BootManager();
        
        // Store reference globally
        window.bootManager = bootManager;
        
        // Start boot
        bootManager.start();
        
        // Handle errors
        window.addEventListener('error', function(e) {
            const status = document.querySelector('.boot-status');
            if (status) {
                status.textContent = '⚠️ Boot error: ' + e.message;
                status.style.color = '#ff6b6b';
            }
        });
        
        // Performance monitoring
        if (window.performance) {
            const perfData = window.performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`📊 Page load time: ${loadTime}ms`);
        }
    });

    // Export for use
    window.BootManager = BootManager;
})();