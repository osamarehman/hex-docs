import { debugUtils } from './debug-utils.js';
import { calculateMonthlyCalc } from './calculations.js';

export function updateAnzahlungInput(value) {
    document.getElementById("anzahlung-no").value = value;
    calculateMonthlyCalc();
}

function selectRadioCore(div) {
    // Remove active class from all radio fields
    const allFields = document.querySelectorAll(".mutli_form_radio-field2");
    allFields.forEach((field) => field.classList.remove("is-active-inputactive"));

    // Get the associated radio input
    const radio = div.querySelector('input[type="radio"]');

    // Check the radio button and update the input value
    if (radio) {
        radio.checked = true;
        updateAnzahlungInput(radio.value);

        // Add active class to the selected radio field
        div.classList.add("is-active-inputactive");

        // Get and update the monthly price from the previous calculation
        const selectedProduct = radio.value;
        const monthlyCalcValue = document.getElementById("monthlyCalcValue");
        const previousMonthlyPrice = document.getElementById(`monthlyCalcValue`)?.textContent;
        
        if (monthlyCalcValue && previousMonthlyPrice) {
            // Keep the previous calculation
            debugUtils.info("Radio", "Keeping previous monthly price", { previousMonthlyPrice });
        } else {
            // Fallback to moPrice if no previous calculation
            const monthlyPrice = document.getElementById(`moPrice${selectedProduct}`)?.textContent;
            if (monthlyCalcValue && monthlyPrice) {
                monthlyCalcValue.textContent = monthlyPrice;
                debugUtils.info("Radio", "Updated monthly price from moPrice", { monthlyPrice });
            }
        }

        // Update calculations
        calculateMonthlyCalc();
    }
}

export function selectRadio(div) {
    debugUtils.info("Radio", "Selecting radio button", {
        radioValue: div.querySelector('input[type="radio"]')?.value,
    });
    
    try {
        selectRadioCore(div);
    } catch (error) {
        debugUtils.error("Radio", "Failed to select radio", error);
        throw error;
    }
}
