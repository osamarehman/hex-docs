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

// Setup all event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    debugUtils.info("System", "Initializing application");
    setupEventListeners();
    
    // Initialize debug UI if in debug mode
    if (debugUtils.getLevel() > 0) {
        debugUtils.initializeDebugUI();
        debugUtils.info("Debug", "Debug UI initialized");
    }
    
    // Set up initial display states
    updateDhpDisplay();
});
