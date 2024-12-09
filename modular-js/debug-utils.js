// Debug utilities - Initialize immediately
console.log('Initializing debug utilities...');

// Create a promise that resolves when debugUtils is ready
window.debugUtilsReady = new Promise((resolve) => {
    window.debugUtils = (function() {
        let debugLevel = 0;
        
        const utils = {
            setLevel(level) {
                debugLevel = level;
                console.log(`Debug level set to ${level}`);
                this.info("Debug", `Debug level set to ${level}`);
            },

            getLevel() {
                return debugLevel;
            },

            log(level, category, message, data = null) {
                if (debugLevel >= level) {
                    const timestamp = new Date().toISOString();
                    const dataString = data ? JSON.stringify(data, null, 2) : '';
                    console.log(`[${timestamp}] [${category}] ${message} ${dataString}`);
                    
                    // Update debug UI if it exists
                    this.updateDebugUI(category, message, dataString);
                }
            },

            error(category, message, data = null) {
                this.log(0, category, `ERROR: ${message}`, data);
            },

            warn(category, message, data = null) {
                this.log(1, category, `WARNING: ${message}`, data);
            },

            info(category, message, data = null) {
                this.log(2, category, message, data);
            },

            debug(category, message, data = null) {
                this.log(3, category, message, data);
            },

            initializeDebugUI() {
                if (document.getElementById('debug-container')) {
                    return; // Already initialized
                }
                
                const debugContainer = document.createElement('div');
                debugContainer.id = 'debug-container';
                debugContainer.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    right: 0;
                    width: 300px;
                    height: 200px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 12px;
                    z-index: 9999;
                `;
                document.body.appendChild(debugContainer);
                
                this.info("Debug", "Debug UI initialized");
            },

            updateDebugUI(category, message, data) {
                const container = document.getElementById('debug-container');
                if (!container) return;

                const entry = document.createElement('div');
                entry.style.borderBottom = '1px solid #444';
                entry.style.marginBottom = '5px';
                entry.style.paddingBottom = '5px';
                
                const timestamp = new Date().toLocaleTimeString();
                entry.innerHTML = `
                    <div style="color: #aaa;">[${timestamp}]</div>
                    <div style="color: #4CAF50;">[${category}] ${message}</div>
                    ${data ? `<div style="color: #2196F3;">${data}</div>` : ''}
                `;
                
                container.appendChild(entry);
                container.scrollTop = container.scrollHeight;
            }
        };

        // Initialize debug UI when the DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                utils.initializeDebugUI();
                resolve(utils);
            });
        } else {
            utils.initializeDebugUI();
            resolve(utils);
        }

        console.log("Debug utilities initialized");
        return utils;
    })();
});

// Verify initialization
window.debugUtilsReady.then(() => {
    console.log("debugUtils ready:", !!window.debugUtils);
});
