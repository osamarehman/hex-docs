// Base URL for GitHub Pages
const baseUrl = './';

// Import all required modules
import { debugUtils } from './debug-utils.js';
import { CHtoWGSlat, CHtoWGSlng } from './coordinates.js';
import { handleAddressInput, handleAddressSelection } from './address-handler.js';
import { fetchDataGet, fetchDataPost } from './api.js';
import { displayCalculationResults, updateDhpDisplay } from './display-handler.js';
import { validateCalculationParams } from './validation.js';
import { paymentCalculator } from './payment-calculator.js';
import { setupEventListeners } from './event-listeners.js';
import { initMap } from './map-handler.js';

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
