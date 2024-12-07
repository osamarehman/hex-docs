// Debug utilities
let debugLevel = 1;

export const debugUtils = {
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
            this.updateDebugUI(category, message, data);
        }
    },

    error(category, message, data = null) {
        console.error(`[${category}] ERROR: ${message}`, data);
        this.log(1, category, `ERROR: ${message}`, data);
    },

    warn(category, message, data = null) {
        console.warn(`[${category}] WARNING: ${message}`, data);
        this.log(2, category, `WARNING: ${message}`, data);
    },

    info(category, message, data = null) {
        console.info(`[${category}] ${message}`, data);
        this.log(3, category, message, data);
    },

    debug(category, message, data = null) {
        console.debug(`[${category}] ${message}`, data);
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
            this.info("Debug", "Debug panel initialized");
        }
    },

    updateDebugUI(category, message, data) {
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            const entry = document.createElement('div');
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            entry.innerHTML = `[${timestamp}] [${category}] ${message}`;
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

debugUtils.initializeDebugUI();
