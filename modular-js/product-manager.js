// import { debugUtils } from './debug-utils.js';

class ProductManager {
    constructor() {
        this.cards = ['A', 'B', 'C'];
    }

    updateProductDisplay(item, suffix) {
        try {
            if (!item || !suffix) {
                debugUtils.warn("Product", "Missing item or suffix for product display update");
                return false;
            }

            const heatPump = item.heatPump;
            if (!heatPump) {
                debugUtils.warn("Product", "No heat pump data available");
                return false;
            }

            debugUtils.info("Product", `Updating product display for suffix ${suffix}`, { heatPump });
            return true;
        } catch (error) {
            debugUtils.error("Product", "Error updating product display", { error, suffix });
            return false;
        }
    }

    updatePrices(item, suffix) {
        try {
            const priceElement = document.getElementById(`totalPrice${suffix}`);
            if (priceElement && item.totalPrice) {
                priceElement.textContent = item.totalPrice;
            }
        } catch (error) {
            debugUtils.error("Product", "Error updating prices", { error, suffix });
        }
    }

    updateSpecs(item, suffix) {
        try {
            if (item.specs) {
                Object.entries(item.specs).forEach(([key, value]) => {
                    const element = document.getElementById(`${key}${suffix}`);
                    if (element) {
                        element.textContent = value;
                    }
                });
            }
        } catch (error) {
            debugUtils.error("Product", "Error updating specs", { error, suffix });
        }
    }

    updateCalculationNumbers(item, suffix) {
        try {
            const calculationFields = [
                'serviceFeeValue',
                'maintenanceValue',
                'energyManagementValue',
                'ratInsuranceValue',
                'interestRateValue',
                'taxValue'
            ];

            calculationFields.forEach(field => {
                const element = document.getElementById(`${field}${suffix}`);
                if (element && item[field]) {
                    element.textContent = item[field];
                }
            });
        } catch (error) {
            debugUtils.error("Product", "Error updating calculation numbers", { error, suffix });
        }
    }
}

window.productManager = new ProductManager();
