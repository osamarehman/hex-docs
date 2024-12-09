// Initialize debugging immediately
console.log("Application starting...");

// Function to initialize the application
async function initializeApp() {
    try {
        // Wait for debug utils to be ready
        await window.debugUtilsReady;
        
        // Verify debug utils is available
        if (typeof window.debugUtils === 'undefined') {
            throw new Error('debugUtils not available');
        }

        // Initialize debugging
        window.debugUtils.setLevel(1); // Enable logging (0 would disable it)
        window.debugUtils.info("System", "Initialization started");

        // Setup application when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupApplication);
        } else {
            setupApplication();
        }
    } catch (error) {
        console.error("Error initializing application:", error);
    }
}

function setupApplication() {
    try {
        window.debugUtils.info("System", "Setting up application");
        
        // Set up event listeners
        if (typeof window.setupEventListeners === 'function') {
            window.setupEventListeners();
        } else {
            console.error("setupEventListeners not available");
        }
        
        // Initialize debug UI if in debug mode
        if (window.debugUtils.getLevel() > 0) {
            window.debugUtils.initializeDebugUI();
            window.debugUtils.info("Debug", "Debug UI initialized");
        }
        
        // Set up initial display states
        if (typeof window.updateDhpDisplay === 'function') {
            window.updateDhpDisplay();
        } else {
            console.error("updateDhpDisplay not available");
        }
    } catch (error) {
        console.error("Error in setupApplication:", error);
    }
}

// Start initialization when window loads
window.addEventListener('load', initializeApp);
