// display-handler.js
// import { debugUtils } from './debug-utils.js';

window.displayCalculationResults = function(data) {
    debugUtils.info("Display", "Displaying calculation results", { data });

    try {
        // Display total costs
        document.getElementById("totalCosts").textContent = data.totalCosts;
        document.getElementById("totalCostsWithoutSubvention").textContent = data.totalCostsWithoutSubvention;
        
        // Display subventions
        document.getElementById("subventionFederal").textContent = data.subventionFederal;
        document.getElementById("subventionCanton").textContent = data.subventionCanton;
        document.getElementById("subventionMunicipality").textContent = data.subventionMunicipality;
        document.getElementById("subventionTotal").textContent = data.subventionTotal;
        
        // Display financing details
        document.getElementById("financingAmount").textContent = data.financingAmount;
        document.getElementById("anzahlung").textContent = data.anzahlung;
        
        // Update monthly payment displays
        updateMonthlyPaymentDisplay(data);
        
        debugUtils.info("Display", "Calculation results displayed successfully");
    } catch (error) {
        debugUtils.error("Display", "Error displaying calculation results", { error });
    }
}

 window.updateMonthlyPaymentDisplay = function(data) {
    const monthlyPaymentElement = document.getElementById("monthlyPayment");
    const monthlyInterestElement = document.getElementById("monthlyInterest");
    
    if (monthlyPaymentElement && data.monthlyPayment) {
        monthlyPaymentElement.textContent = data.monthlyPayment.toFixed(2);
    }
    
    if (monthlyInterestElement && data.monthlyInterest) {
        monthlyInterestElement.textContent = data.monthlyInterest.toFixed(2);
    }
}

window.updateDhpDisplay = function() {
    debugUtils.info("Display", "Updating DHP display");
    const newHeatingPlace = document.getElementById("newHeatingPlace");
    const dhpDiv = document.getElementById("dhp");
    
    if (newHeatingPlace && dhpDiv) {
        const shouldShow = newHeatingPlace.value === "dhp";
        dhpDiv.style.display = shouldShow ? "block" : "none";
        debugUtils.info("Display", `${shouldShow ? "Showing" : "Hiding"} DHP section`);
    } else {
        debugUtils.warn("Display", "Required elements not found", {
            newHeatingPlace: !!newHeatingPlace,
            dhpDiv: !!dhpDiv
        });
    }
}
