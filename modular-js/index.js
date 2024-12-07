// Base URL for GitHub Pages
const baseUrl = 'https://osamarehman.github.io/Hex-webflow-code/modular-js';

// Import all required modules
import { debugUtils } from `${baseUrl}/debug-utils.js`;
import { CHtoWGSlat, CHtoWGSlng } from `${baseUrl}/coordinates.js`;
import { handleAddressInput, handleAddressSelection } from `${baseUrl}/address-handler.js`;
import { fetchDataGet, fetchDataPost } from `${baseUrl}/api.js`;
import { displayCalculationResults, updateDhpDisplay } from `${baseUrl}/display-handler.js`;
import { validateCalculationParams } from `${baseUrl}/validation.js`;
import { paymentCalculator } from `${baseUrl}/payment-calculator.js`;
import { setupEventListeners } from `${baseUrl}/event-listeners.js`;
import { initMap } from `${baseUrl}/map-handler.js`;

// Initialize debugging immediately
console.log("Module loading started");

// Function to initialize the application
async function initializeApp() {
    try {
        // Initialize debugging
        debugUtils.setLevel(1); // Enable logging (0 would disable it)
        console.log("initialized");

        // Initialize map when Google Maps API is loaded
        window.initMap = initMap;

        // Expose necessary functions to global scope for HTML event handlers
        window.handleAddressSelection = handleAddressSelection;
        window.handleAddressInput = handleAddressInput;
        window.displayCalculationResults = displayCalculationResults;
        window.calculateMonthlyPayment = paymentCalculator.calculateProductMonthlyPayment.bind(paymentCalculator);
        window.updateDhpDisplay = updateDhpDisplay;
        window.debugUtils = debugUtils; // Expose debug utils globally for testing

        debugUtils.info("System", "Global functions exposed");

        // Setup all event listeners when DOM is loaded
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
    debugUtils.info("System", "Initializing application");
    setupEventListeners();
    
    // Initialize debug UI if in debug mode
    if (debugUtils.getLevel() > 0) {
        debugUtils.initializeDebugUI();
        debugUtils.info("Debug", "Debug UI initialized");
    }
    
    // Set up initial display states
    updateDhpDisplay();
}

// Start initialization
initializeApp().catch(error => {
    console.error("Failed to initialize application:", error);
});
