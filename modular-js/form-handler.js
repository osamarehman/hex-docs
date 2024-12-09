// import { debugUtils } from './debug-utils.js';
// import { API_ENDPOINTS, fetchDataPost } from './api.js';
// import { PMT } from './utils.js';

// Form handling functions
window.resetFormValues = function() {
    debugUtils.info("Form", "Resetting form values");
    
    const formFields = [
        "buildingAge",
        "livingArea",
        "heatingType",
        "heatingAge",
        "newHeatingType",
        "newHeatingPlace",
        "dhw",
        "dhwAge",
        "newDhw",
        "newDhwPlace"
    ];

    formFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            if (element.type === "radio") {
                element.checked = false;
            } else {
                element.value = "";
            }
            debugUtils.info("Form", `Reset field: ${fieldId}`);
        } else {
            debugUtils.warn("Form", `Field not found: ${fieldId}`);
        }
    });
};

window.prefillFormFields = function(houseInfo) {
    debugUtils.info("Form", "Prefilling form fields", { houseInfo });
    
    try {
        if (!houseInfo) {
            debugUtils.warn("Form", "No house info provided for prefill");
            return;
        }

        // Map house info to form fields
        const fieldMappings = {
            buildingAge: houseInfo.buildingAge,
            livingArea: houseInfo.livingArea,
            heatingType: houseInfo.heatingType,
            heatingAge: houseInfo.heatingAge
        };

        // Update each field
        Object.entries(fieldMappings).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value;
                debugUtils.info("Form", `Prefilled field: ${fieldId}`, { value });
            } else {
                debugUtils.warn("Form", `Field not found for prefill: ${fieldId}`);
            }
        });
    } catch (error) {
        debugUtils.error("Form", "Error prefilling form fields", { 
            error: error.message,
            stack: error.stack 
        });
    }
};

window.calculateMonthlyPayment = async function(params) {
    debugUtils.info("Form", "Calculating monthly payment", { params });
    
    try {
        // Validate parameters
        if (!window.validateCalculationParams(params)) {
            return;
        }

        // Make API call
        const url = window.API_ENDPOINTS.calculation;
        const data = await window.fetchDataPost(url, params);
        
        // Display results
        window.displayCalculationResults(data);
        
        return data;
    } catch (error) {
        debugUtils.error("Form", "Error calculating monthly payment", { 
            error: error.message,
            stack: error.stack,
            params 
        });
    }
};

window.validateCalculationParams = function(params) {
    const requiredFields = [
        'buildingAge',
        'livingArea',
        'heatingType',
        'heatingAge',
        'newHeatingType',
        'newHeatingPlace'
    ];

    const missingFields = requiredFields.filter(field => !params[field]);
    
    if (missingFields.length > 0) {
        debugUtils.error("Form", "Missing required fields", { missingFields });
        return false;
    }

    return true;
};

window.displayCalculationResults = function(data) {
    debugUtils.info("Form", "Displaying calculation results", { data });
    
    try {
        const resultFields = {
            'monthlyPayment': data.monthlyPayment,
            'totalInvestment': data.totalInvestment,
            'subsidies': data.subsidies,
            'netInvestment': data.netInvestment
        };

        Object.entries(resultFields).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.textContent = window.formatCurrency(value);
                debugUtils.info("Form", `Updated result field: ${fieldId}`, { value });
            } else {
                debugUtils.warn("Form", `Result field not found: ${fieldId}`);
            }
        });
    } catch (error) {
        debugUtils.error("Form", "Error displaying calculation results", { 
            error: error.message,
            stack: error.stack,
            data 
        });
    }
};

window.formatCurrency = function(amount) {
    return new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency: 'CHF'
    }).format(amount);
};
