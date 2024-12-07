// Debug utilities
let debugLevel = 0;

export const debugUtils = {
    setLevel(level) {
        debugLevel = level;
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
            this.updateDebugUI(category, message, data);
        }
    },

    error(category, message, data = null) {
        this.log(1, category, `ERROR: ${message}`, data);
    },

    warn(category, message, data = null) {
        this.log(2, category, `WARNING: ${message}`, data);
    },

    info(category, message, data = null) {
        this.log(3, category, message, data);
    },

    debug(category, message, data = null) {
        this.log(4, category, message, data);
    },

    initializeDebugUI() {
        if (!document.getElementById('debugPanel')) {
            const debugPanel = document.createElement('div');
            debugPanel.id = 'debugPanel';
            debugPanel.style.cssText = `
                position: fixed;
                bottom: 0;
                right: 0;
                width: 300px;
                height: 200px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 10px;
                font-family: monospace;
                font-size: 12px;
                overflow-y: auto;
                z-index: 9999;
            `;
            document.body.appendChild(debugPanel);
        }
    },

    updateDebugUI(category, message, data) {
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            const entry = document.createElement('div');
            entry.innerHTML = `[${category}] ${message}`;
            if (data) {
                entry.title = JSON.stringify(data, null, 2);
            }
            debugPanel.appendChild(entry);
            
            // Keep only last 50 messages
            while (debugPanel.children.length > 50) {
                debugPanel.removeChild(debugPanel.firstChild);
            }
            
            // Auto-scroll to bottom
            debugPanel.scrollTop = debugPanel.scrollHeight;
        }
    }
};
