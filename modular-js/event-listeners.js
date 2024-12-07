import { debugUtils } from './debug-utils.js';
import { handleAddressInput } from './address-handler.js';
import { calculateMonthlyPayment } from './form-handler.js';

export function setupEventListeners() {
    debugUtils.info("System", "Setting up event listeners");

    // Address input listener
    const addressInput = document.getElementById("addressInput");
    if (addressInput) {
        addressInput.addEventListener("input", handleAddressInput);
    }

    // Form field listeners
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
            element.addEventListener("change", () => {
                const formData = collectFormData();
                calculateMonthlyPayment(formData);
            });
        }
    });

    // Payment method tabs
    const paymentTabs = document.querySelectorAll('.payment-tab');
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', () => updatePaymentMethod(tab));
    });
}

function collectFormData() {
    return {
        buildingAge: document.getElementById("buildingAge").value,
        livingArea: document.getElementById("livingArea").value,
        heatingType: document.getElementById("heatingType").value,
        heatingAge: document.getElementById("heatingAge").value,
        newHeatingType: document.getElementById("newHeatingType").value,
        newHeatingPlace: document.getElementById("newHeatingPlace").value,
        dhw: document.getElementById("dhw").value,
        dhwAge: document.getElementById("dhwAge").value,
        newDhw: document.getElementById("newDhw").value,
        newDhwPlace: document.getElementById("newDhwPlace").value
    };
}

export function updatePaymentMethod(selectedTab) {
    const paymentTabs = document.querySelectorAll('.payment-tab');
    paymentTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    selectedTab.classList.add('active');
    
    const paymentMethod = selectedTab.getAttribute('data-payment');
    document.getElementById('chosenPayment').value = paymentMethod;
    
    calculateMonthlyPayment(collectFormData());
}
