import { debugUtils } from './debug-utils.js';
import { API_ENDPOINTS, fetchDataPost } from './api.js';
import { PMT } from './utils.js';

export function resetFormValues() {
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
        }
    });
}

export function prefillFormFields(houseInfo) {
    debugUtils.info("Form", "Prefilling form fields", { houseInfo });

    const fieldMappings = {
        buildingAge: "buildingAge",
        livingArea: "livingArea",
        heatingType: "heatingType",
        heatingAge: "heatingAge",
        dhw: "dhw",
        dhwAge: "dhwAge"
    };

    Object.entries(fieldMappings).forEach(([field, infoKey]) => {
        const element = document.getElementById(field);
        if (element && houseInfo[infoKey] !== undefined) {
            element.value = houseInfo[infoKey];
        }
    });
}

export async function calculateMonthlyPayment(params) {
    try {
        debugUtils.info("Calculation", "Calculating monthly payment", { params });

        if (!validateCalculationParams(params)) {
            debugUtils.error("Calculation", "Invalid calculation parameters");
            return;
        }

        const results = await fetchDataPost(API_ENDPOINTS.calculation, params);
        displayCalculationResults(results);
    } catch (error) {
        debugUtils.error("Calculation", "Error calculating payment", { error });
    }
}

function validateCalculationParams(params) {
    const requiredFields = [
        "buildingAge",
        "livingArea",
        "heatingType",
        "heatingAge",
        "newHeatingType"
    ];

    return requiredFields.every(field => {
        const hasField = params[field] !== undefined && params[field] !== "";
        if (!hasField) {
            debugUtils.warn("Validation", `Missing required field: ${field}`);
        }
        return hasField;
    });
}

export function displayCalculationResults(data) {
    debugUtils.info("Display", "Showing calculation results", { data });

    const resultElements = {
        totalCost: document.getElementById("totalCost"),
        subsidies: document.getElementById("subsidies"),
        netCost: document.getElementById("netCost"),
        monthlyPayment: document.getElementById("monthlyPayment")
    };

    Object.entries(resultElements).forEach(([key, element]) => {
        if (element && data[key] !== undefined) {
            element.textContent = formatCurrency(data[key]);
        }
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency: 'CHF'
    }).format(amount);
}
