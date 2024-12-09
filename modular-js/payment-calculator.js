// import { debugUtils } from './debug-utils.js';
// import { productManager } from './product-manager.js';

class PaymentCalculator {
    constructor() {
        this.anzahlung = 0.1;
        this.years = 60;
    }

    getNumberFromElement(elementId, defaultValue = 0) {
        try {
            const element = document.getElementById(elementId);
            if (!element) {
                debugUtils.warn("Payment", `Element not found: ${elementId}`);
                return defaultValue;
            }
            const rawValue = element.textContent.replace(/[^0-9.-]+/g, '');
            const value = parseFloat(rawValue);
            return isNaN(value) ? defaultValue : value;
        } catch (error) {
            debugUtils.error("Payment", `Error parsing value for ${elementId}`, { error });
            return defaultValue;
        }
    }

    calculateProductMonthlyPayment(suffix) {
        try {
            // Get calculation values
            const serviceFee = this.getNumberFromElement(`serviceFeeValue${suffix}`) / 100;
            const maintenance = this.getNumberFromElement(`maintenanceValue${suffix}`);
            const energyManagement = this.getNumberFromElement(`energyManagementValue${suffix}`);
            const ratInsurance = this.getNumberFromElement(`ratInsuranceValue${suffix}`) / 100;
            const interestRate = this.getNumberFromElement(`interestRateValue${suffix}`);
            const tax = this.getNumberFromElement(`taxValue${suffix}`) / 100;
            const totalCost = this.getNumberFromElement(`totalPrice${suffix}`);

            debugUtils.info("Payment", `Calculation values for product ${suffix}`, {
                serviceFee, maintenance, energyManagement, ratInsurance, interestRate, tax, totalCost
            });

            // Calculate monthly payment
            const downpayment = totalCost * this.anzahlung;
            const principalAfterDownPayment = totalCost - downpayment;
            const monthlyInterestRate = interestRate > 0 ? (interestRate / 100) / 12 : 1e-9;
            const numberOfPayments = this.years;

            const annuityFactor = (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
                (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

            const monthlyPaymentBase = principalAfterDownPayment * annuityFactor;
            const additionalCosts = maintenance + energyManagement + (monthlyPaymentBase * serviceFee);
            const subtotal = monthlyPaymentBase + additionalCosts;
            const insuranceCost = subtotal * ratInsurance;
            const totalNet = subtotal + insuranceCost;
            const totalWithTax = totalNet * (1 + tax);
            const monthlyPayment = Math.round(totalWithTax);

            debugUtils.info("Payment", `Monthly payment calculation for product ${suffix}`, {
                downpayment,
                principalAfterDownPayment,
                monthlyPaymentBase,
                additionalCosts,
                totalNet,
                monthlyPayment
            });

            // Update the DOM
            const moPriceElement = document.getElementById(`moPrice${suffix}`);
            if (moPriceElement) {
                moPriceElement.textContent = monthlyPayment;
            } else {
                debugUtils.error("Payment", `Monthly price element not found for product ${suffix}`);
            }

            return monthlyPayment;
        } catch (error) {
            debugUtils.error("Payment", `Error calculating monthly payment for product ${suffix}`, { error });
            return 0;
        }
    }

    calculateAllMonthlyPayments() {
        try {
            const results = {};
            productManager.cards.forEach(suffix => {
                results[suffix] = this.calculateProductMonthlyPayment(suffix);
            });
            debugUtils.info("Payment", "Monthly payment calculations completed", results);
        } catch (error) {
            debugUtils.error("Payment", "Error in monthly payment calculations", { error });
        }
    }
}

window.paymentCalculator = new PaymentCalculator();
