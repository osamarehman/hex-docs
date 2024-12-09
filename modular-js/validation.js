// validation.js
// Removed import for debugUtils as it's now available globally

window.validateCalculationParams = function (params) {
    debugUtils.info("Validation", "Validating calculation parameters", { params });

    const requiredFields = [
        "buildingAge",
        "livingArea",
        "currentHeating",
        "newHeatingPlace",
        "chosenPayment"
    ];

    // Check for missing required fields
    const missingFields = requiredFields.filter(field => !params[field]);
    if (missingFields.length > 0) {
        debugUtils.error("Validation", "Missing required fields", { missingFields });
        return false;
    }

    // Validate numeric fields
    const numericFields = ["buildingAge", "livingArea"];
    const invalidNumericFields = numericFields.filter(field => {
        const value = parseFloat(params[field]);
        return isNaN(value) || value <= 0;
    });

    if (invalidNumericFields.length > 0) {
        debugUtils.error("Validation", "Invalid numeric fields", { invalidNumericFields });
        return false;
    }

    debugUtils.info("Validation", "Validation successful");
    return true;
}

window.validateAddressInput = function (address) {
    return address && address.trim().length >= 3;
}

window.validateHouseInfo = function (houseInfo) {
    return houseInfo && houseInfo.dkodeE && houseInfo.dkodeN;
}
