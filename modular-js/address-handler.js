import { debugUtils } from './debug-utils.js';
import { API_ENDPOINTS, fetchDataGet } from './api.js';
import { debounce } from './utils.js';
import { showOnMap } from './map-handler.js';
import { CHtoWGSlat, CHtoWGSlng } from './coordinates.js';
import { resetFormValues, prefillFormFields } from './form-handler.js';

export const handleAddressInput = debounce(async function () {
    const address = document.getElementById("addressInput").value.trim();
    if (address.length === 0) {
        return;
    }
    try {
        const possibleAddresses = await fetchDataGet(
            `${API_ENDPOINTS.possibleAddress}?address=${encodeURIComponent(address)}`
        );
        updateDropdown(possibleAddresses);
        resetFormValues();
    } catch (error) {
        debugUtils.error("Address", "Error fetching possible addresses:", error);
    }
}, 300);

export async function handleAddressSelection(eingangId) {
    debugUtils.info("Address", "Handling address selection", { eingangId });

    try {
        resetFormValues();

        const houseInfo = await fetchDataGet(
            `${API_ENDPOINTS.houseInfo}?eingangId=${eingangId}`
        );
        
        debugUtils.info("Address", "Received house info", { 
            coordinates: {
                dkodeE: houseInfo.dkodeE,
                dkodeN: houseInfo.dkodeN
            }
        });

        prefillFormFields(houseInfo);

        const eingangIdInput = document.querySelector('input[name="eingangId"]');
        if (eingangIdInput) {
            eingangIdInput.value = eingangId;
        } else {
            debugUtils.error("Address", "eingangId input field not found");
        }

        if (houseInfo.dkodeE && houseInfo.dkodeN) {
            const lat = CHtoWGSlat(houseInfo.dkodeE, houseInfo.dkodeN);
            const lng = CHtoWGSlng(houseInfo.dkodeE, houseInfo.dkodeN);
            
            debugUtils.info("Map", "Converting coordinates", {
                swiss: { E: houseInfo.dkodeE, N: houseInfo.dkodeN },
                wgs84: { lat, lng }
            });

            showOnMap(lat, lng);
        } else {
            debugUtils.warn("Map", "No coordinates found in house info");
        }
    } catch (error) {
        debugUtils.error("Address", "Error fetching house info", { error });
    }
}

export function updateDropdown(possibleAddresses) {
    const dropdown = document.getElementById("myDropdown");
    dropdown.innerHTML = "";
    
    if (possibleAddresses && possibleAddresses.length > 0) {
        possibleAddresses.forEach((address) => {
            const div = document.createElement("div");
            div.textContent = address.address;
            div.onclick = () => handleAddressSelection(address.eingangId);
            dropdown.appendChild(div);
        });
        dropdown.classList.add("show");
    } else {
        dropdown.classList.remove("show");
    }
}
