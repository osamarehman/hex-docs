// validation.js
import { debugUtils } from './debug-utils.js';

export function validateCalculationParams(params) {
    debugUtils.info("Validation", "Validating calculation parameters", { params });

    const requiredFields = [
        'eingangId',
        'heatingType',
        'newHeatingPlace',
        'buildingType',
        'constructionYear',
        'heatedArea'
    ];

    const missingFields = requiredFields.filter(field => !params[field]);

    if (missingFields.length > 0) {
        debugUtils.error("Validation", "Missing required fields", { missingFields });
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate numeric fields
    if (isNaN(params.heatedArea) || params.heatedArea <= 0) {
        debugUtils.error("Validation", "Invalid heated area", { heatedArea: params.heatedArea });
        throw new Error('Heated area must be a positive number');
    }

    if (isNaN(params.constructionYear) || params.constructionYear < 1800 || params.constructionYear > new Date().getFullYear()) {
        debugUtils.error("Validation", "Invalid construction year", { constructionYear: params.constructionYear });
        throw new Error('Invalid construction year');
    }

    debugUtils.info("Validation", "Parameters validated successfully");
    return true;
}

export function validateAddressInput(address) {
    return address && address.trim().length >= 3;
}

export function validateHouseInfo(houseInfo) {
    return houseInfo && houseInfo.dkodeE && houseInfo.dkodeN;
}
