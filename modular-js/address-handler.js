import { debugUtils } from './debug-utils.js';
import { API_ENDPOINTS, fetchDataGet } from './api.js';
import { debounce } from './utils.js';
import { showOnMap } from './map-handler.js';
import { CHtoWGSlat, CHtoWGSlng } from './coordinates.js';
import { resetFormValues, prefillFormFields } from './form-handler.js';

export const handleAddressInput = debounce(async function () {
    const address = document.getElementById("addressInput").value.trim();
    debugUtils.info("Address", "Address input changed", { value: address });
    
    if (address.length === 0) {
        debugUtils.info("Address", "Empty address, skipping fetch");
        const dropdown = document.getElementById("myDropdown");
        if (dropdown) {
            dropdown.innerHTML = "";
            dropdown.style.display = "none";
        }
        return;
    }
    
    try {
        debugUtils.info("Address", "Fetching possible addresses", { address });
        const url = `${API_ENDPOINTS.possibleAddress}?address=${encodeURIComponent(address)}`;
        debugUtils.info("Address", "API request URL", { url });
        
        const response = await fetch(url);
        debugUtils.info("Address", "API response status", { 
            status: response.status,
            ok: response.ok 
        });
        
        const possibleAddresses = await response.json();
        debugUtils.info("Address", "Received possible addresses", { 
            count: possibleAddresses.length,
            addresses: possibleAddresses 
        });
        
        updateDropdown(possibleAddresses);
        resetFormValues();
    } catch (error) {
        debugUtils.error("Address", "Error fetching possible addresses:", { 
            error: error.message,
            stack: error.stack,
            url: `${API_ENDPOINTS.possibleAddress}?address=${encodeURIComponent(address)}`
        });
        const dropdown = document.getElementById("myDropdown");
        if (dropdown) {
            dropdown.innerHTML = "<div class='error'>Error loading addresses</div>";
            dropdown.style.display = "block";
        }
    }
}, 300);

export const handleAddressSelection = async function (eingangId) {
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
        debugUtils.error("Address", "Error fetching house info", { 
            error: error.message,
            stack: error.stack,
            url: `${API_ENDPOINTS.houseInfo}?eingangId=${eingangId}`
        });
    }
}

export function updateDropdown(possibleAddresses) {
    const dropdown = document.getElementById("myDropdown");
    debugUtils.info("Address", "Updating dropdown", { 
        dropdownFound: !!dropdown,
        addressCount: possibleAddresses?.length 
    });
    
    if (!dropdown) {
        debugUtils.error("Address", "Dropdown element not found");
        return;
    }
    
    dropdown.innerHTML = "";
    
    if (possibleAddresses && possibleAddresses.length > 0) {
        debugUtils.info("Address", "Adding address options to dropdown");
        possibleAddresses.forEach((address) => {
            const div = document.createElement("div");
            div.textContent = address.address;
            div.onclick = () => handleAddressSelection(address.eingangId);
            dropdown.appendChild(div);
        });
        dropdown.style.display = "block";
    } else {
        debugUtils.info("Address", "No addresses to show, hiding dropdown");
        dropdown.style.display = "none";
    }
}
