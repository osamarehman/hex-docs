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

// Initialize debugging
debugUtils.setLevel(1); // Enable logging (0 would disable it)
console.log("initialized");

// Initialize map when Google Maps API is loaded
window.initMap = initMap;

// Expose necessary functions to global scope for HTML event handlers
window.handleAddressSelection = handleAddressSelection;
window.displayCalculationResults = displayCalculationResults;
window.calculateMonthlyPayment = paymentCalculator.calculateProductMonthlyPayment.bind(paymentCalculator);

// Setup all event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    debugUtils.info("System", "Initializing application");
    setupEventListeners();
    
    // Initialize debug UI if in debug mode
    if (debugUtils.getLevel() > 0) {
        debugUtils.initializeDebugUI();
    }
    
    // Set up initial display states
    updateDhpDisplay();
});
