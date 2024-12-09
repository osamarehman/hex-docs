// radio-handler.js
// Removed imports as they're now available globally

window.updateAnzahlungInput = function (value) {
    document.getElementById("anzahlung-no").value = value;
    window.calculateMonthlyCalc();
}

window.selectRadioCore = function (div) {
    // Remove active class from all radio fields
    const allFields = document.querySelectorAll(".mutli_form_radio-field2");
    allFields.forEach((field) => field.classList.remove("is-active-inputactive"));

    // Add active class to selected field
    div.classList.add("is-active-inputactive");

    // Get the radio input and select it
    const radio = div.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
        
        // Handle special cases based on radio value
        switch (radio.value) {
            case "Öl":
                document.getElementById("currentHeating").value = "oil";
                break;
            case "Gas":
                document.getElementById("currentHeating").value = "gas";
                break;
            case "Wärmepumpe":
                document.getElementById("currentHeating").value = "heatpump";
                break;
            case "Holz":
                document.getElementById("currentHeating").value = "wood";
                break;
            case "Fernwärme":
                document.getElementById("currentHeating").value = "district";
                break;
        }
        
        // Update anzahlung input
        window.updateAnzahlungInput(radio.value);
        
        // Get and update the monthly price from the previous calculation
        const selectedProduct = radio.value;
        const monthlyCalcValue = document.getElementById("monthlyCalcValue");
        const previousMonthlyPrice = document.getElementById(`monthlyCalcValue`)?.textContent;
        
        if (monthlyCalcValue && previousMonthlyPrice) {
            // Keep the previous calculation
            window.debugUtils.info("Radio", "Keeping previous monthly price", { previousMonthlyPrice });
        } else {
            // Fallback to moPrice if no previous calculation
            const monthlyPrice = document.getElementById(`moPrice${selectedProduct}`)?.textContent;
            if (monthlyCalcValue && monthlyPrice) {
                monthlyCalcValue.textContent = monthlyPrice;
                window.debugUtils.info("Radio", "Updated monthly price from moPrice", { monthlyPrice });
            }
        }

        // Update calculations
        window.calculateMonthlyCalc();
    }
}

window.selectRadio = function (div) {
    window.debugUtils.info("Radio", "Selecting radio button", {
        radioValue: div.querySelector('input[type="radio"]')?.value,
    });
    
    try {
        window.selectRadioCore(div);
    } catch (error) {
        window.debugUtils.error("Radio", "Failed to select radio", error);
        throw error;
    }
}
