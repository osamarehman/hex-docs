console.log("initialzed");
debug.setLevel(1); // Enable logging (0 would disable it)

// Conversion functions for Swiss coordinates to WGS84
function CHtoWGSlat(y, x) {
  const y_aux = (y - 2600000) / 1000000;
  const x_aux = (x - 1200000) / 1000000;

  let lat =
    16.9023892 +
    3.238272 * x_aux -
    0.270978 * Math.pow(y_aux, 2) -
    0.002528 * Math.pow(x_aux, 2) -
    0.0447 * Math.pow(y_aux, 2) * x_aux -
    0.014 * Math.pow(x_aux, 3);

  lat = (lat * 100) / 36;
  return lat;
}

function CHtoWGSlng(y, x) {
  const y_aux = (y - 2600000) / 1000000;
  const x_aux = (x - 1200000) / 1000000;

  let lng =
    2.6779094 +
    4.728982 * y_aux +
    0.791484 * y_aux * x_aux +
    0.1306 * y_aux * Math.pow(x_aux, 2) -
    0.0436 * Math.pow(y_aux, 3);

  lng = (lng * 100) / 36;
  return lng;
}

// Debounce function
function debounce(func, delay) {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// API endpoint URLs
const possibleAddressEndpoint =
  "https://hex-api.climartis.ch/api/getPossibleAddress";
const houseInfoEndpoint = "https://hex-api.climartis.ch/api/getHouseInfo";
const calculationEndpoint = "https://hex-api.climartis.ch/api/getCalculation";

// Function to fetch data from API endpoints (GET requests)
async function fetchDataGet(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error, status = ${response.status}`);
  return await response.json();
}

// Function to fetch data from API endpoints (POST requests)
async function fetchDataPost(url, params) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error(`HTTP error, status = ${response.status}`);
  return await response.json();
}

// Function to handle address input using GET request
const handleAddressInput = debounce(async function () {
  const address = document.getElementById("addressInput").value.trim(); // Trim whitespace
  if (address.length === 0) {
    return; // Don't make API request if address is empty
  }
  try {
    const possibleAddresses = await fetchDataGet(
      `${possibleAddressEndpoint}?address=${encodeURIComponent(address)}`
    );
    updateDropdown(possibleAddresses); // Update dropdown with suggestions
    resetFormValues(); // Reset form values when address input changes
  } catch (error) {
    console.error("Error fetching possible addresses:", error);
  }
}, 300);

// Function to handle address selection using GET request
async function handleAddressSelection(eingangId) {
  debugUtils.info("Address", "Handling address selection", { eingangId });

  try {
    resetFormValues(); // Reset form values before fetching house info

    const houseInfo = await fetchDataGet(
      `${houseInfoEndpoint}?eingangId=${eingangId}`
    );

    debugUtils.info("Address", "Received house info", {
      coordinates: {
        dkodeE: houseInfo.dkodeE,
        dkodeN: houseInfo.dkodeN,
      },
    });

    prefillFormFields(houseInfo); // Prefill form fields with house info

    // Set the eingangId in the hidden input field
    const eingangIdInput = document.querySelector('input[name="eingangId"]');
    if (eingangIdInput) {
      eingangIdInput.value = eingangId;
    } else {
      debugUtils.error("Address", "eingangId input field not found");
    }

    // Convert Swiss coordinates to WGS84 and show on Google Maps
    if (houseInfo.dkodeE && houseInfo.dkodeN) {
      const lat = CHtoWGSlat(houseInfo.dkodeE, houseInfo.dkodeN);
      const lng = CHtoWGSlng(houseInfo.dkodeE, houseInfo.dkodeN);

      debugUtils.info("Map", "Converting coordinates", {
        swiss: { E: houseInfo.dkodeE, N: houseInfo.dkodeN },
        wgs84: { lat, lng },
      });

      showOnMap(lat, lng);
    } else {
      debugUtils.warn("Map", "No coordinates found in house info");
    }
  } catch (error) {
    debugUtils.error("Address", "Error fetching house info", { error });
  }
}

// Function to initialize and display Google Map
function initMap() {
  debugUtils.info("Map", "Initializing Google Map");

  try {
    const defaultLocation = { lat: 46.8182, lng: 8.2275 }; // Coordinates of Switzerland
    const mapOptions = {
      zoom: 8,
      center: defaultLocation,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    };

    const mapElement = document.getElementById("map");
    if (!mapElement) {
      debugUtils.error("Map", "Map element not found");
      return;
    }

    const map = new google.maps.Map(mapElement, mapOptions);

    // Store the map instance globally
    window.map = map;
    window.marker = null;

    debugUtils.info("Map", "Map initialized successfully", { defaultLocation });
  } catch (error) {
    debugUtils.error("Map", "Error initializing map", { error });
  }
}

// Function to show coordinates on Google Map
function showOnMap(lat, lng) {
  debugUtils.info("Map", "Updating map position", { lat, lng });

  try {
    if (!window.map) {
      debugUtils.error("Map", "Map instance not found");
      return;
    }

    const position = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    if (isNaN(position.lat) || isNaN(position.lng)) {
      debugUtils.error("Map", "Invalid coordinates", position);
      return;
    }

    // Update the map center and zoom
    window.map.setCenter(position);
    window.map.setZoom(18); // Zoom in to the location

    // Handle marker
    if (window.marker) {
      window.marker.setPosition(position);
      debugUtils.info("Map", "Updated existing marker position");
    } else {
      window.marker = new google.maps.Marker({
        position: position,
        map: window.map,
        animation: google.maps.Animation.DROP,
      });
      debugUtils.info("Map", "Created new marker");
    }

    // Ensure the marker is visible
    window.marker.setVisible(true);
  } catch (error) {
    debugUtils.error("Map", "Error updating map", { error });
  }
}

// Function to reset form values
function resetFormValues() {
  debugUtils.info("Form", "Resetting form values");

  const ruckbauInput = document.querySelector('input[name="ruckbau"]');
  if (ruckbauInput) ruckbauInput.value = "true";

  const distanceInput = document.querySelector(
    'select[name="distanceToHeatingPlace"]'
  );
  if (distanceInput) distanceInput.value = "0";

  document.getElementById("newHeatingPlace").value = "outside";
  document.getElementById("dhp").style.display = "flex";

  // Don't clear the address field since it will be populated by house info
  const addressInput = document.getElementById("address");
  if (addressInput) {
    debugUtils.info("Form", "Preserving address field value:", {
      value: addressInput.value,
    });
  }
}

// Dropdown function
document.addEventListener("DOMContentLoaded", function () {
  const inputField = document.getElementById("addressInput");
  const dropdown = document.getElementById("myDropdown");

  // Show dropdown when the input field is focused and there are items
  inputField.addEventListener("focus", () => {
    if (dropdown.children.length > 0) {
      dropdown.style.display = "block";
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !inputField.contains(event.target) &&
      !dropdown.contains(event.target)
    ) {
      dropdown.style.display = "none";
    }
  });
});

function updateDropdown(possibleAddresses) {
  const dropdown = document.getElementById("myDropdown");
  const inputField = document.getElementById("addressInput");
  dropdown.innerHTML = ""; // Clear previous options

  possibleAddresses.forEach((address) => {
    const option = document.createElement("div");
    option.textContent = `${address.street_name} ${address.house_number} ${address.postal_code_name} ${address.postal_code}`;
    option.style.padding = "10px"; // Add padding for better readability
    option.style.cursor = "pointer"; // Change cursor on hover

    // When an option is clicked, set input field and hide dropdown
    option.addEventListener("click", () => {
      inputField.value = option.textContent; // Set the selected address in the input field
      handleAddressSelection(address.eingang_id); // Use your existing function
      dropdown.style.display = "none"; // Hide the dropdown after selection
    });

    dropdown.appendChild(option);
  });

  // Show dropdown if there are new options, otherwise keep it hidden
  dropdown.style.display = possibleAddresses.length > 0 ? "block" : "none";
}

// Function to prefill form fields with house info
function prefillFormFields(houseInfo) {
  debugUtils.info("Form", "Prefilling form fields with house info", {
    houseInfo,
  });

  // Populate the address field
  const addressInput = document.getElementById("address");
  if (addressInput) {
    // Construct full address from houseInfo using postal_code_name and house_number
    const addressParts = [
      houseInfo.street_name || "", // Use empty string if street_name is not available
      houseInfo.house_number,
      houseInfo.postal_code,
      houseInfo.postal_code_name, // Use the city name from postal_code_name
    ].filter(Boolean); // Remove empty values

    const fullAddress = addressParts.join(" ");
    if (fullAddress.trim()) {
      // Only set if we have some address data
      addressInput.value = fullAddress;
      debugUtils.info("Form", "Updated address field", {
        fullAddress,
        addressParts,
        inputElement: addressInput.id,
      });

      // Trigger a change event to ensure any listeners are notified
      const event = new Event("change", { bubbles: true });
      addressInput.dispatchEvent(event);
    } else {
      debugUtils.warn("Form", "No address data available to populate field", {
        houseInfo: {
          street: houseInfo.street_name,
          number: houseInfo.house_number,
          zip: houseInfo.postal_code,
          city: houseInfo.postal_code_name,
        },
      });
    }
  } else {
    debugUtils.error("Form", "Address input field not found", {
      elementId: "address",
      availableFields: document.querySelectorAll('input[type="text"]').length,
    });
  }

  const dropdowns = [
    { id: "genh1", value: houseInfo.genh1Name },
    { id: "gwaerzh1Name", value: houseInfo.gwaerzh1Name },
  ];

  dropdowns.forEach((dropdown) => {
    const selectElement = document.getElementById(dropdown.id);
    if (
      selectElement &&
      dropdown.value &&
      selectElement.querySelector(`option[value="${dropdown.value}"]`)
    ) {
      selectElement.value = dropdown.value;
    } else if (selectElement) {
      selectElement.value = "not set"; // Default to 'not set' if no match is found
    }

    // Manually trigger the change event to let Finsweet's dropdown know the value has changed
    if (selectElement) {
      const event = new Event("change", { bubbles: true });
      selectElement.dispatchEvent(event);
    }
  });

  const gwaerzw1NameSelect = document.getElementById("gwaerzw1Name");
  if (
    houseInfo.gwaerzw1Name &&
    gwaerzw1NameSelect.querySelector(
      `option[value="${houseInfo.gwaerzw1Name}"]`
    )
  ) {
    gwaerzw1NameSelect.value = houseInfo.gwaerzw1Name;
  } else {
    gwaerzh1NameSelect.value = "not set"; // Default to 'not set' if no match is found
  }

  document.querySelector('input[name="warea"]').value = houseInfo.warea;
  document.querySelector('input[name="wazim"]').value = houseInfo.wazim;
  document.querySelector('input[name="wbauj"]').value = houseInfo.wbauj;

  // Logic for oilUsageLiters and kwhPerYear
  const genh1Input = document.querySelector('select[name="genh1"]');
  const oilUsageLitersInput = document.querySelector(
    'input[name="oilUsageLiters"]'
  );
  const kwhPerYearInput = document.querySelector('input[name="kwhPerYear"]');

  function updateHeatingInputs() {
    if (genh1Input && genh1Input.value === "Heizöl") {
      // Show and enable oilUsageLiters
      oilUsageLitersInput.value = houseInfo.recommendedHeatingUsage;
      oilUsageLitersInput.style.display = "block";
      oilUsageLitersInput.removeAttribute("disabled");
      oilUsageLitersInput.setAttribute("required", "required");

      // Hide and disable kwhPerYear
      kwhPerYearInput.value = 0;
      kwhPerYearInput.style.display = "none";
      kwhPerYearInput.removeAttribute("required");
      kwhPerYearInput.setAttribute("disabled", "disabled");
    } else {
      // Show and enable kwhPerYear
      kwhPerYearInput.value = houseInfo.recommendedHeatingUsage;
      kwhPerYearInput.style.display = "block";
      kwhPerYearInput.removeAttribute("disabled");
      kwhPerYearInput.setAttribute("required", "required");

      // Hide and disable oilUsageLiters
      oilUsageLitersInput.value = 0;
      oilUsageLitersInput.style.display = "none";
      oilUsageLitersInput.removeAttribute("required");
      oilUsageLitersInput.setAttribute("disabled", "disabled");
    }
  }

  // Initial call to set the inputs
  updateHeatingInputs();

  // Event listener for dynamic updates
  genh1Input.addEventListener("change", updateHeatingInputs);
}

// Event listener for address input
document
  .getElementById("addressInput")
  .addEventListener("input", handleAddressInput);

// Global variable to store the calculation results
let calculationResults = [];

// Enhanced version of getCalculationResults with better error handling
async function getCalculationResults(params) {
  // Validate parameters before proceeding
  if (!validateCalculationParams(params)) {
    console.error("Invalid calculation parameters");
    document.getElementById("fullOfferForm").style.display = "none";
    document.getElementById("errorForm").style.display = "block";
    return;
  }

  const endpoint = "https://hex-api.climartis.ch/api/getCalculation";
  const formData = new FormData();

  // Append parameters as form data
  Object.keys(params).forEach((key) => {
    formData.append(key, params[key] || ""); // Use empty string for falsy values
  });

  try {
    debugUtils.info("Calculation", "Sending data to server", params);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      debugUtils.error("Calculation", "Server error response", {
        status: response.status,
        error: errorText,
      });

      document.getElementById("fullOfferForm").style.display = "none";
      document.getElementById("errorForm").style.display = "block";

      const errorMessageElement = document.getElementById("errorMessage");
      if (errorMessageElement) {
        errorMessageElement.textContent = `Server error (${response.status}). Please try again or contact support.`;
      }

      throw new Error(`HTTP error, status = ${response.status}`);
    }

    const data = await response.json();
    debugUtils.info("Calculation", "Received response", data);

    // Store the response data globally
    calculationResults = data;

    // Check if the response is null or empty
    if (!calculationResults || Object.keys(calculationResults).length === 0) {
      debugUtils.error("Calculation", "Empty response received");
      document.getElementById("fullOfferForm").style.display = "none";
      document.getElementById("errorForm").style.display = "block";

      const errorMessageElement = document.getElementById("errorMessage");
      if (errorMessageElement) {
        errorMessageElement.textContent =
          "No calculation results available. Please try again.";
      }
    } else {
      // Display the results
      displayCalculationResults(calculationResults);
      document.getElementById("fullOfferForm").style.display = "block";
      document.getElementById("errorForm").style.display = "none";
    }
  } catch (error) {
    debugUtils.error("Calculation", "Error in calculation", {
      error: error.message,
    });

    document.getElementById("fullOfferForm").style.display = "none";
    document.getElementById("errorForm").style.display = "block";

    const errorMessageElement = document.getElementById("errorMessage");
    if (errorMessageElement) {
      errorMessageElement.textContent = `Error: ${error.message}. Please try again or contact support if the problem persists.`;
    }
  }
}

// Helper function to validate the parameters before sending
function validateCalculationParams(params) {
  const requiredFields = [
    "eingangId",
    "newHeatingPlace",
    "genh1",
    "gwaerzh1Name",
    "warea",
    "wbauj",
  ];

  const missingFields = requiredFields.filter((field) => !params[field]);

  if (missingFields.length > 0) {
    console.error("Missing required fields:", missingFields);
    return false;
  }

  return true;
}

function displayCalculationResults(data) {
  debugUtils.info("Calculation", "Starting to display calculation results", {
    dataLength: data?.length,
  });

  // Type definitions and helpers
  const ProductTypes = {
    CARD_A: "A",
    CARD_B: "B",
    CARD_C: "C",
  };

  // Helper functions
  const helpers = {
    safeGet: (obj, path, defaultValue) => {
      try {
        return path.reduce(
          (xs, x) => (xs && xs[x] != null ? xs[x] : defaultValue),
          obj
        );
      } catch (error) {
        debugUtils.error("Calculation", "Error accessing path", {
          path,
          error,
        });
        return defaultValue;
      }
    },

    formatNumber: (value, defaultValue = "0") => {
      if (typeof value !== "number" || isNaN(value)) {
        debugUtils.warn("Calculation", "Invalid number format", { value });
        return defaultValue;
      }
      return Math.round(value).toString();
    },

    updateElement: (elementId, value, options = {}) => {
      const element = document.getElementById(elementId);
      if (!element) {
        debugUtils.error("UI", `Element not found: ${elementId}`);
        return false;
      }

      if (options.isHTML) {
        element.innerHTML = DOMPurify.sanitize(value);
      } else if (options.isPrice) {
        // Format price with Swiss formatting (1'234.56)
        const formattedPrice = Math.round(value)
          .toLocaleString("en-US")
          .replace(/,/g, "'");
        element.textContent = options.prefix
          ? `${options.prefix}${formattedPrice}`
          : formattedPrice;
      } else if (options.prefix) {
        element.textContent = `${options.prefix} ${Math.round(value)
          .toLocaleString("en-US")
          .replace(/,/g, "'")}`;
      } else {
        element.textContent = value;
      }
      return true;
    },
  };

  // Validation
  if (!Array.isArray(data)) {
    debugUtils.error("Calculation", "Invalid data format", { data });
    return;
  }

  // Product display manager
  const productManager = {
    cards: ["A", "B", "C"],

    hideAllCards() {
      this.cards.forEach((suffix) => {
        const card = document.getElementById(`productCard${suffix}`);
        if (card) card.style.display = "none";
      });
    },

    updateProductDisplay(item, suffix) {
      debugUtils.info("Product", `Updating display for product ${suffix}`, {
        productType: item?.heatPump?.productType,
        manufacturer: item?.heatPump?.manufactorer,
      });

      const card = document.getElementById(`productCard${suffix}`);
      if (!card) {
        debugUtils.error("UI", `Product card ${suffix} not found`);
        return false;
      }

      card.style.display = "grid";

      // Add click event listener for product selection
      const selectButton = document.getElementById(`selectProduct${suffix}`);
      if (selectButton) {
        selectButton.onclick = () => {
          debugUtils.info("Product", `Product ${suffix} selected`, {
            productDetails: {
              type: item?.heatPump?.productType,
              manufacturer: item?.heatPump?.manufactorer,
              price: item?.totalPrice,
              subsidy: item?.heatPump?.forderung,
              finalPrice: item?.totalSalesPrice,
            },
          });
        };
      }

      return true;
    },

    updatePrices(item, suffix) {
      const priceData = {
        totalPrice: helpers.safeGet(item, ["totalPrice"], 0),
        totalSalesPrice: helpers.safeGet(item, ["totalSalesPrice"], 0),
        subsidy: helpers.safeGet(item, ["heatPump", "forderung"], 0),
      };

      debugUtils.info("Product", `Price data for product ${suffix}`, priceData);

      // Update price displays with Swiss formatting
      helpers.updateElement(`totalPrice${suffix}`, priceData.totalPrice, {
        isPrice: true,
      });
      helpers.updateElement(`totalSalesPrice${suffix}`, priceData.totalPrice, {
        isPrice: true,
        prefix: "CHF ",
      });

      // Format and display subsidy
      const subsidyValue = priceData.subsidy;
      if (typeof subsidyValue === "number" && !isNaN(subsidyValue)) {
        helpers.updateElement(`subsidy${suffix}`, subsidyValue, {
          isPrice: true,
        });
      } else {
        debugUtils.warn(
          "Product",
          `Invalid subsidy value for product ${suffix}`,
          { subsidy: subsidyValue }
        );
        helpers.updateElement(`subsidy${suffix}`, 0, { isPrice: true });
      }
    },

    updateSpecs(item, suffix) {
      const specs = {
        slogan: helpers.safeGet(item, ["heatPump", "slogan"], ""),
        loudness: helpers.safeGet(item, ["heatPump", "loudness"], "No data"),
        maxOutput: helpers.safeGet(item, ["heatPump", "max_output"], "No data"),
        boilerSize: helpers.safeGet(item, ["boiler", "type"], "0"),
        scop: helpers.safeGet(item, ["heatPump", "scop"], "Not available"),
        manufactorer: helpers.safeGet(
          item,
          ["heatPump", "manufactorer"],
          "Not available"
        ),
        productType: helpers.safeGet(
          item,
          ["heatPump", "productType"],
          "Not available"
        ),
      };

      debugUtils.info("Product", `Specs for product ${suffix}`, specs);

      // Update spec displays
      Object.entries(specs).forEach(([key, value]) => {
        helpers.updateElement(`${key}${suffix}`, value);
      });

      // Handle slogan visibility
      const sloganElement = document.getElementById(`slogan${suffix}`);
      if (sloganElement) {
        sloganElement.style.display = specs.slogan ? "flex" : "none";
      }

      // Update image
      const imgElement = document.getElementById(`img${suffix}`);
      if (imgElement) {
        imgElement.src = helpers.safeGet(
          item,
          ["heatPump", "image"],
          "https://uploads-ssl.webflow.com/6627744b33c005540d1e47b7/667568899c1ab21871bb5bc0_Frame%201849.png"
        );
      }
    },

    updateCalculationNumbers(item, suffix) {
      const numbers = {
        serviceFee: helpers.safeGet(
          item,
          ["calculationNumbers", "serviceFee"],
          "0"
        ),
        maintenance: helpers.safeGet(
          item,
          ["calculationNumbers", "maintance"],
          "0"
        ),
        energyManagement: helpers.safeGet(
          item,
          ["calculationNumbers", "energyManagement"],
          "0"
        ),
        ratInsurance: helpers.safeGet(
          item,
          ["calculationNumbers", "ratInsurance"],
          "0"
        ),
        interestRate: helpers.safeGet(
          item,
          ["calculationNumbers", "interestRate"],
          "0"
        ),
        tax: helpers.safeGet(item, ["calculationNumbers", "tax"], "0"),
      };

      debugUtils.info(
        "Product",
        `Calculation numbers for product ${suffix}`,
        numbers
      );

      // Update calculation number displays
      Object.entries(numbers).forEach(([key, value]) => {
        helpers.updateElement(`${key}Value${suffix}`, value);
      });
    },
  };

  // Main display logic
  try {
    productManager.hideAllCards();

    data.forEach((item, index) => {
      const suffix = productManager.cards[index];
      if (!suffix) {
        debugUtils.warn("Product", `No card suffix for index ${index}`);
        return;
      }

      if (productManager.updateProductDisplay(item, suffix)) {
        productManager.updatePrices(item, suffix);
        productManager.updateSpecs(item, suffix);
        productManager.updateCalculationNumbers(item, suffix);

        // Update description
        const description = helpers.safeGet(
          item,
          ["heatPump", "description"],
          "No description available"
        );
        helpers.updateElement(`desc${suffix}`, description, { isHTML: true });
      }
    });

    // Recalculate and update UI
    calculateMonthlyPayment();
    calculateMonthlyCalc();

    debugUtils.info("Calculation", "Finished displaying calculation results");
  } catch (error) {
    debugUtils.error("Calculation", "Error displaying calculation results", {
      error,
    });
  }
}

// Function to update the anzahlung-no hidden input and trigger calculation
function updateAnzahlungInput(value) {
  document.getElementById("anzahlung-no").value = value;
  calculateMonthlyCalc();
}

// Core radio selection function
function selectRadioCore(div) {
  // Remove active class from all radio fields
  var allFields = document.querySelectorAll(".mutli_form_radio-field2");
  allFields.forEach((field) => field.classList.remove("is-active-inputactive"));

  // Get the associated radio input
  var radio = div.querySelector('input[type="radio"]');

  // Check the radio button and update the input value
  if (radio) {
    radio.checked = true;
    updateAnzahlungInput(radio.value);

    // Add active class to the selected radio field
    div.classList.add("is-active-inputactive");

    // Get and update the monthly price from the previous calculation
    const selectedProduct = radio.value;
    const monthlyCalcValue = document.getElementById("monthlyCalcValue");
    const previousMonthlyPrice =
      document.getElementById(`monthlyCalcValue`)?.textContent;

    if (monthlyCalcValue && previousMonthlyPrice) {
      // Keep the previous calculation
      console.log("Keeping previous monthly price:", previousMonthlyPrice);
    } else {
      // Fallback to moPrice if no previous calculation
      const monthlyPrice = document.getElementById(
        `moPrice${selectedProduct}`
      )?.textContent;
      if (monthlyCalcValue && monthlyPrice) {
        monthlyCalcValue.textContent = monthlyPrice;
        console.log("Updated monthly price from moPrice:", monthlyPrice);
      }
    }

    // Update calculations
    calculateMonthlyCalc();
  }
}

// Single wrapped version with logging
const selectRadio = function (div) {
  // Single log at the start
  debugUtils.info("Radio", "Selecting radio button", {
    radioValue: div.querySelector('input[type="radio"]')?.value,
  });

  try {
    // Call the core function
    selectRadioCore(div);
  } catch (error) {
    debugUtils.error("Radio", "Failed to select radio", error);
    throw error;
  }
};

// Assign to window
window.selectRadio = selectRadio;

// Function to calculate monthly payment
function calculateMonthlyPayment() {
  debugUtils.info("Payment", "Starting monthly payment calculation");

  //Setting DownPayment to Zero for the initial calculation
  const anzahlung = 0;
  const years = 60;

  // Helper function to safely parse numbers from elements
  const getNumberFromElement = (elementId, defaultValue = 0) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        debugUtils.warn("Payment", `Element not found: ${elementId}`);
        return defaultValue;
      }
      const rawValue = element.textContent.replace(/[^0-9.-]+/g, "");
      const value = parseFloat(rawValue);
      return isNaN(value) ? defaultValue : value;
    } catch (error) {
      debugUtils.error("Payment", `Error parsing value for ${elementId}`, {
        error,
      });
      return defaultValue;
    }
  };

  // Helper function to calculate monthly payment for a product
  const calculateProductMonthlyPayment = (suffix) => {
    try {
      // Get calculation values
      const serviceFee = getNumberFromElement(`serviceFeeValue${suffix}`) / 100;
      const maintenance = getNumberFromElement(`maintenanceValue${suffix}`);
      const energyManagement = getNumberFromElement(
        `energyManagementValue${suffix}`
      );
      const ratInsurance =
        getNumberFromElement(`ratInsuranceValue${suffix}`) / 100;
      const interestRate = getNumberFromElement(`interestRateValue${suffix}`); // Remove /100 here since it's already a percentage
      const tax = getNumberFromElement(`taxValue${suffix}`) / 100;
      const totalCost = getNumberFromElement(`totalPrice${suffix}`);

      debugUtils.info("Payment", `Calculation values for product ${suffix}`, {
        serviceFee,
        maintenance,
        energyManagement,
        ratInsurance,
        interestRate,
        tax,
        totalCost,
      });

      // Calculate monthly payment
      const downpayment = totalCost * anzahlung;
      const principalAfterDownPayment = totalCost - downpayment;
      const monthlyInterestRate =
        interestRate > 0 ? interestRate / 100 / 12 : 1e-9; // Divide by 100 here to convert percentage to decimal
      const numberOfPayments = years;

      const annuityFactor =
        (monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

      const monthlyPaymentBase = principalAfterDownPayment * annuityFactor;
      const additionalCosts =
        maintenance + energyManagement + monthlyPaymentBase * serviceFee;
      const subtotal = monthlyPaymentBase + additionalCosts;
      const insuranceCost = subtotal * ratInsurance;
      const totalNet = subtotal + insuranceCost;
      const totalWithTax = totalNet * (1 + tax);
      const monthlyPayment = Math.round(totalWithTax);

      debugUtils.info(
        "Payment",
        `Monthly payment calculation for product ${suffix}`,
        {
          downpayment,
          principalAfterDownPayment,
          monthlyPaymentBase,
          additionalCosts,
          totalNet,
          monthlyPayment,
        }
      );

      // Update the DOM
      const moPriceElement = document.getElementById(`moPrice${suffix}`);
      if (moPriceElement) {
        moPriceElement.textContent = `CHF ${monthlyPayment
          .toLocaleString("en-US")
          .replace(/,/g, "'")}`;
      } else {
        debugUtils.error(
          "Payment",
          `Monthly price element not found for product ${suffix}`
        );
      }

      return monthlyPayment;
    } catch (error) {
      debugUtils.error(
        "Payment",
        `Error calculating monthly payment for product ${suffix}`,
        { error }
      );
      return 0;
    }
  };

  // Calculate for all products
  try {
    const products = ["A", "B", "C"];
    const results = {};

    products.forEach((suffix) => {
      results[suffix] = calculateProductMonthlyPayment(suffix);
    });

    debugUtils.info(
      "Payment",
      "Monthly payment calculations completed",
      results
    );
  } catch (error) {
    debugUtils.error("Payment", "Error in monthly payment calculations", {
      error,
    });
  }
}

// Ensure calculations are updated when needed
document.addEventListener("DOMContentLoaded", function () {
  debugUtils.info("System", "Setting up payment calculation listeners");

  // Initial calculation
  calculateMonthlyPayment();

  // Set up listeners for recalculation
  const recalculationTriggers = ["anzahlung-no", "duration-value"];

  recalculationTriggers.forEach((triggerId) => {
    const element = document.getElementById(triggerId);
    if (element) {
      element.addEventListener("input", () => {
        debugUtils.info(
          "Payment",
          `Recalculating due to change in ${triggerId}`
        );
        calculateMonthlyPayment();
      });
    }
  });
});

// Function to calculate monthly payment
function calculateMonthlyCalc() {
  // Get required elements
  const anzahlungElement = document.getElementById("anzahlung-no");
  const durationElement = document.getElementById("duration-value");
  const monthlyCalcValueElement = document.getElementById("monthlyCalcValue");
  const productSelected = document.querySelector(
    'input[name="productSelection"]:checked'
  );

  if (
    !anzahlungElement ||
    !durationElement ||
    !monthlyCalcValueElement ||
    !productSelected
  ) {
    console.error("Required elements not found");
    return;
  }

  try {
    // Get base values
    const selectedProduct = productSelected.value; // A, B, or C
    const calcAnzahlung = parseFloat(anzahlungElement.value) / 100; // Convert percentage to decimal
    const calcYears = parseFloat(durationElement.value);

    // Get the total price for selected product
    const totalPriceElement = document.getElementById(
      `totalPrice${selectedProduct}`
    );
    if (!totalPriceElement) {
      console.error(`Price element not found for product ${selectedProduct}`);
      return;
    }

    // Parse the total price (remove all formatting)
    const totalPrice = parseFloat(
      totalPriceElement.textContent.replace(/[^0-9.-]/g, "")
    );

    if (isNaN(totalPrice)) {
      console.error("Invalid total price:", totalPriceElement.textContent);
      return;
    }

    // Get subsidy amount
    const subsidyElement = document.getElementById(`subsidy${selectedProduct}`);
    const subsidy = subsidyElement
      ? parseFloat(subsidyElement.textContent.replace(/[^0-9.-]/g, "")) || 0
      : 0;

    // Calculate down payment
    const downPayment = totalPrice * calcAnzahlung;
    document.getElementById("downpayment").textContent = Math.round(downPayment)
      .toLocaleString("en-US")
      .replace(/,/g, "'");

    // Calculate remaining amount (using price after subsidy)
    const remainingAmount = totalPrice - downPayment;

    // Get calculation parameters
    const serviceFee =
      parseFloat(
        document.getElementById(`serviceFeeValue${selectedProduct}`).textContent
      ) || 0;
    const maintenance =
      parseFloat(
        document.getElementById(`maintenanceValue${selectedProduct}`)
          .textContent
      ) || 0;
    const energyManagement =
      parseFloat(
        document.getElementById(`energyManagementValue${selectedProduct}`)
          .textContent
      ) || 0;
    const ratInsurance =
      parseFloat(
        document.getElementById(`ratInsuranceValue${selectedProduct}`)
          .textContent
      ) || 0;
    const interestRate =
      parseFloat(
        document.getElementById(`interestRateValue${selectedProduct}`)
          .textContent
      ) || 0; // Default to 3.5% if 0
    const tax =
      parseFloat(
        document.getElementById(`taxValue${selectedProduct}`).textContent
      ) || 0;

    // Calculate monthly base payment (using PMT formula)
    const monthlyInterestRate =
      interestRate > 0 ? interestRate / 100 / 12 : 1e-9; // Convert annual rate to monthly
    const numberOfPayments = calcYears; // Total monthly payments over the loan term

    let monthlyBasePayment;
    if (interestRate === 0) {
      // Simple division if no interest
      monthlyBasePayment = remainingAmount / numberOfPayments;
    } else {
      // Calculate annuity factor
      const annuityFactor =
        (monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
      monthlyBasePayment = remainingAmount * annuityFactor;
    }

    // Add additional costs
    const additionalMonthlyCosts = maintenance + energyManagement;
    const serviceFeeAmount = monthlyBasePayment * (serviceFee / 100);
    const subtotal =
      monthlyBasePayment + additionalMonthlyCosts + serviceFeeAmount;

    // Add insurance
    const insuranceAmount = subtotal * (ratInsurance / 100);
    const totalBeforeTax = subtotal + insuranceAmount;

    // Add tax
    const finalMonthlyPayment = totalBeforeTax * (1 + tax / 100);

    // Update display values
    const roundedPayment = Math.floor(finalMonthlyPayment); // Use Math.floor instead of Math.round
    monthlyCalcValueElement.textContent = `CHF ${roundedPayment
      .toLocaleString("en-US")
      .replace(/,/g, "'")}`;

    // Update selected product price and monthly payment
    document.getElementById(
      "selectedmoPrice"
    ).textContent = `CHF ${roundedPayment
      .toLocaleString("en-US")
      .replace(/,/g, "'")}`;
    document.querySelector('input[name="monthlyPayment"]').value =
      roundedPayment;

    // Fix: Update the code to use the correct reference price
    document.getElementById("selectedtotalPrice").textContent =
      document.getElementById(`totalPrice${selectedProduct}`).textContent;
    document.getElementById("totalSalesPriceSelected").textContent =
      document.getElementById(`totalPrice${selectedProduct}`).textContent;

    document.getElementById("selectedloudness").textContent =
      document.getElementById(`loudness${selectedProduct}`).textContent;
    document.getElementById("selectedboilerSize").textContent =
      document.getElementById(`boilerSize${selectedProduct}`).textContent;
    document.getElementById("selectedmaxOutput").textContent =
      document.getElementById(`maxOutput${selectedProduct}`).textContent;
    document.getElementById("selectedimg").src = document.getElementById(
      `img${selectedProduct}`
    ).src;
    document.getElementById("selectedscop").textContent =
      document.getElementById(`scop${selectedProduct}`).textContent;
    document.getElementById("selectedmanufactorer").textContent =
      document.getElementById(`manufactorer${selectedProduct}`).textContent;
    document.getElementById("selectedproductType").textContent =
      document.getElementById(`productType${selectedProduct}`).textContent;
    document.getElementById("selecteddesc").innerHTML = document.getElementById(
      `desc${selectedProduct}`
    ).innerHTML;

    // Copy Values over to Final input fields
    document.querySelector('input[name="totalSum"]').value = totalPrice;
    document.querySelector('input[name="initialPayment"]').value =
      anzahlungElement.value;
    document.querySelector('input[name="amountOfMonths"]').value =
      durationElement.value;

    // Log calculation details for debugging
    console.log("Monthly Payment Calculation:", {
      totalPrice,
      subsidy,
      downPayment,
      remainingAmount,
      monthlyBasePayment,
      additionalMonthlyCosts,
      serviceFeeAmount,
      insuranceAmount,
      finalMonthlyPayment,
      roundedPayment,
      parameters: {
        interestRate,
        serviceFee,
        maintenance,
        energyManagement,
        ratInsurance,
        tax,
      },
    });
  } catch (error) {
    console.error("Error in monthly calculation:", error);
  }
}

// Helper function to calculate monthly payment
function PMT(rate, nper, pv) {
  if (rate === 0) return -pv / nper;

  return (
    (rate * pv * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1)
  );
}

document.addEventListener("DOMContentLoaded", function () {
  // Function to recalculate whenever important inputs or selections change
  function setupEventListeners() {
    // Select all radio buttons for product selection
    const productSelectionRadios = document.querySelectorAll(
      'input[name="productSelection"]'
    );
    productSelectionRadios.forEach((radio) => {
      radio.addEventListener("change", calculateMonthlyCalc);
    });

    // Select duration and anzahlung inputs
    const durationInput = document.getElementById("duration-value");
    const anzahlungInput = document.getElementById("anzahlung-no");

    // Attach listeners to inputs for real-time update
    durationInput.addEventListener("input", calculateMonthlyCalc);
    anzahlungInput.addEventListener("input", calculateMonthlyCalc);

    // To handle any loss of focus that confirms input change
    durationInput.addEventListener("focusout", calculateMonthlyCalc);
    anzahlungInput.addEventListener("focusout", calculateMonthlyCalc);
  }

  // Call setup function to attach event listeners
  setupEventListeners();

  // Initial calculation to ensure values are correct on page load
  calculateMonthlyCalc();
});

// Ensure elements are recalculated correctly on load
document.addEventListener("DOMContentLoaded", function () {
  var firstRadioField = document.querySelector(".mutli_form_radio-field2");
  if (firstRadioField) {
    selectRadio(firstRadioField);
  }
});

//Submitting Data to getCalculation results

// Update the event listener to include validation
document
  .getElementById("submitBtn")
  .addEventListener("click", async function (event) {
    event.preventDefault();

    const params = {
      eingangId: document.querySelector('input[name="eingangId"]').value,
      newHeatingPlace: document.querySelector('select[name="newHeatingPlace"]')
        .value,
      genw1: document.querySelector('select[name="genw1"]').value,
      genh1: document.querySelector('select[name="genh1"]').value,
      gwaerzh1Name: document.querySelector('select[name="gwaerzh1Name"]').value,
      gwaerzw1Name: document.querySelector('select[name="gwaerzw1Name"]').value,
      warea: document.querySelector('input[name="warea"]').value,
      wazim: document.querySelector('input[name="wazim"]').value,
      wbauj: document.querySelector('input[name="wbauj"]').value,
      ruckbau: document.querySelector('input[name="ruckbau"]').value,
      energyManagement: document.querySelector(
        'input[name="energyManagement"]:checked'
      ).value,
      extraService: document.querySelector('input[name="extraService"]:checked')
        .value,
      waterBoiler: document.querySelector('select[name="waterBoiler"]').value,
      people: document.querySelector('select[name="people"]').value,
      distanceToHeatingPlace: document.querySelector(
        'select[name="distanceToHeatingPlace"]'
      ).value,
      kwhPerYear: document.querySelector('input[name="kwhPerYear"]').value,
      oilUsageLiters: document.querySelector('input[name="oilUsageLiters"]')
        .value,
    };

    // Validate parameters before sending
    if (!validateCalculationParams(params)) {
      updateUIWithError("Missing required fields");
      return;
    }

    try {
      await getCalculationResults(params);
    } catch (error) {
      console.error("Failed to get calculation results:", error);
    }
  });

// Function to update the display of the #dhp div based on #newHeatingPlace selection
function updateDhpDisplay() {
  var newHeatingPlace = document.getElementById("newHeatingPlace").value;
  var dhpDiv = document.getElementById("dhp");

  if (newHeatingPlace === "outside") {
    dhpDiv.style.display = "flex";
  } else if (newHeatingPlace === "inside") {
    dhpDiv.style.display = "none";
  }
}

// Add event listener to #newHeatingPlace
document
  .getElementById("newHeatingPlace")
  .addEventListener("change", updateDhpDisplay);

// Initial call to set the correct display on page load
updateDhpDisplay();

// Get Full Offer function
document
  .getElementById("offerForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);
    const urlParams = new URLSearchParams(formData);

    try {
      const response = await fetch(event.target.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlParams.toString(),
      });

      const result = await response.json();

      if (result.shortID) {
        // Log the URL with the shortID
        const url = `https://hexhex.webflow.io/dashboard?id=${result.shortID}`;

        // Display success message with URL
        document.getElementById("offerLink").href = url; // Set the href for the link
        document.getElementById("offerForm").style.display = "none";
        const successMessageElement = document.getElementById("successMessage");
        successMessageElement.style.display = "block"; // Show the success message

        // Scroll to the success message
        successMessageElement.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

window.addEventListener("DOMContentLoaded", function () {
  // Check if the URL has the 'showCalculator=true' query parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("showCalculator") === "true") {
    // Delay the display of the calculator element by 2 seconds
    setTimeout(() => {
      const calculatorElement = document.querySelector(".calculator");

      // Display the calculator if it exists
      if (calculatorElement) {
        calculatorElement.style.display = "block";
        calculatorElement.style.opacity = "1";
      }
    }, 500); // 2000 milliseconds = 2 seconds
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const chosenPayment = document.getElementById("chosenPayment");
  const monthlyTab = document.getElementById("monthlyTab");
  const yearlyTab = document.getElementById("yearlyTab");
  const vorsorgeTab = document.getElementById("Vorsorgeversicherung"); // Third tab
  const vorsorgeBlock = document.getElementById("VorsorgeversicherungBlock");
  const productCardSelected = document.getElementById("productCardSelected");

  // Set initial visibility on page load
  vorsorgeBlock.style.display = "none"; // Hide VorsorgeversicherungBlock
  productCardSelected.style.display = "flex"; // Display productCardSelected

  // Function to update payment method based on the active tab
  const updatePaymentMethod = (selectedTab) => {
    if (selectedTab === monthlyTab) {
      chosenPayment.value = "MONTHLY";
    } else if (selectedTab === yearlyTab) {
      chosenPayment.value = "ONETIME";
    } else if (selectedTab === vorsorgeTab) {
      chosenPayment.value = "INSURANCE";
    }
  };

  // Initially set chosenPayment based on the default active tab
  updatePaymentMethod(monthlyTab);

  // Add event listeners for tab clicks
  monthlyTab.addEventListener("click", function () {
    monthlyTab.classList.add("active");
    yearlyTab.classList.remove("active");
    vorsorgeTab.classList.remove("active");
    updatePaymentMethod(monthlyTab);

    // Show productCardSelected and hide VorsorgeversicherungBlock
    productCardSelected.style.display = "flex";
    vorsorgeBlock.style.display = "none";
  });

  yearlyTab.addEventListener("click", function () {
    yearlyTab.classList.add("active");
    monthlyTab.classList.remove("active");
    vorsorgeTab.classList.remove("active");
    updatePaymentMethod(yearlyTab);

    // Show productCardSelected and hide VorsorgeversicherungBlock
    productCardSelected.style.display = "flex";
    vorsorgeBlock.style.display = "none";
  });

  vorsorgeTab.addEventListener("click", function () {
    vorsorgeTab.classList.add("active");
    monthlyTab.classList.remove("active");
    yearlyTab.classList.remove("active");
    updatePaymentMethod(vorsorgeTab);

    // Show VorsorgeversicherungBlock and hide productCardSelected
    vorsorgeBlock.style.display = "flex";
    productCardSelected.style.display = "none";
  });
});

// Radio Button Active Class
$(".product-radio-wrap").click(function () {
  if ($(this).find("#radio_button").is(":checked")) {
    // Remove 'selected' class from all elements with the class 'product-radio-wrap'
    $(".product-radio-wrap").removeClass("selected");

    // Add 'selected' class to the clicked element
    $(this).addClass("selected");
  }
});

//Success Message display
$("#back-btn").on("click", function () {
  $("#successMessage").css("display", "none"); // Hides the element with the id `#successMessage`
  $("#offerForm").css("display", "grid"); // Displays the element with the id `#offerForm` using CSS grid
});

$("#calcBtn").on("click", function () {
  $("body").addClass("no-scroll");
});

$(".close-btn").on("click", function () {
  $("body").removeClass("no-scroll");
});

// Select all radio buttons in the productSelection group
const productSelectionRadios = document.querySelectorAll(
  'input[name="productSelection"]'
);

// Loop through each radio button and add an event listener
productSelectionRadios.forEach(function (radio) {
  radio.addEventListener("click", function () {
    // If any radio button is selected, trigger click on the button with id #step7
    document.getElementById("step7").click();
  });
});

///// Debugging Logic Starts here

// Debug utility with different log levels
const debugUtils = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",

  currentLevel: "DEBUG", // Default level

  log(level, category, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      data,
    };

    // Console output with styling
    const styles = {
      ERROR: "background: #ff0000; color: white; padding: 2px 5px;",
      WARN: "background: #ff9900; color: white; padding: 2px 5px;",
      INFO: "background: #0099ff; color: white; padding: 2px 5px;",
      DEBUG: "background: #999999; color: white; padding: 2px 5px;",
    };

    console.log(
      `%c${level}%c [${category}] ${message}`,
      styles[level],
      "color: inherit"
    );

    if (data) {
      console.log("Data:", data);
    }

    // Dispatch custom event for logging
    const event = new CustomEvent("debug-log", { detail: logEntry });
    window.dispatchEvent(event);
  },

  error(category, message, data = null) {
    this.log(this.ERROR, category, message, data);
  },

  warn(category, message, data = null) {
    this.log(this.WARN, category, message, data);
  },

  info(category, message, data = null) {
    this.log(this.INFO, category, message, data);
  },

  debug(category, message, data = null) {
    this.log(this.DEBUG, category, message, data);
  },
};

// Add logging to major functions
function addLogging() {
  // API Calls
  const originalFetchDataGet = window.fetchDataGet;
  window.fetchDataGet = async function (url) {
    debugUtils.info("API", `GET Request to: ${url}`);
    try {
      const response = await originalFetchDataGet.apply(this, arguments);
      debugUtils.debug("API", "GET Response received", response);
      return response;
    } catch (error) {
      debugUtils.error("API", "GET Request failed", { url, error });
      throw error;
    }
  };

  // Form Handling
  const originalHandleAddressInput = window.handleAddressInput;
  window.handleAddressInput = async function () {
    const address = document.getElementById("addressInput").value;
    debugUtils.info("Form", "Address input changed", { address });
    try {
      await originalHandleAddressInput.apply(this, arguments);
      debugUtils.debug("Form", "Address input handled successfully");
    } catch (error) {
      debugUtils.error("Form", "Address input handling failed", error);
      throw error;
    }
  };

  // Calculations
  const originalCalculateMonthlyCalc = window.calculateMonthlyCalc;
  window.calculateMonthlyCalc = function () {
    debugUtils.info("Calculation", "Starting monthly calculation");
    try {
      const formData = {
        anzahlung: document.getElementById("anzahlung-no")?.value,
        duration: document.getElementById("duration-value")?.value,
        selectedProduct: document.querySelector(
          'input[name="productSelection"]:checked'
        )?.value,
      };
      debugUtils.debug("Calculation", "Input values", formData);

      const result = originalCalculateMonthlyCalc.apply(this, arguments);

      const calculationResult = {
        monthlyPayment:
          document.getElementById("monthlyCalcValue")?.textContent,
        downPayment: document.getElementById("downpayment")?.textContent,
      };
      debugUtils.info(
        "Calculation",
        "Monthly calculation completed",
        calculationResult
      );

      return result;
    } catch (error) {
      debugUtils.error("Calculation", "Monthly calculation failed", error);
      throw error;
    }
  };
}

// Initialize debug UI if debug mode is enabled
function initializeDebugUI() {
  if (!window.location.search.includes("debug=true")) return;

  const debugContainer = document.createElement("div");
  debugContainer.id = "debug-container";
  debugContainer.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 400px;
    height: 300px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-family: monospace;
    padding: 10px;
    overflow-y: auto;
    z-index: 9999;
  `;

  const logList = document.createElement("div");
  logList.id = "debug-logs";

  debugContainer.appendChild(logList);
  document.body.appendChild(debugContainer);

  // Listen for debug events
  window.addEventListener("debug-log", (event) => {
    const { timestamp, level, category, message } = event.detail;
    const logEntry = document.createElement("div");
    logEntry.innerHTML = `
      <span style="color: #999;">${new Date(
        timestamp
      ).toLocaleTimeString()}</span>
      <span style="color: ${
        level === "ERROR" ? "#ff4444" : level === "WARN" ? "#ffaa44" : "#44ff44"
      };">
        [${level}]
      </span>
      <span style="color: #66aaff;">[${category}]</span>
      ${message}
    `;
    logList.appendChild(logEntry);
    logList.scrollTop = logList.scrollHeight;
  });
}

// Initialize debugging
document.addEventListener("DOMContentLoaded", () => {
  debugUtils.info("System", "Initializing debug system");
  addLogging();
  initializeDebugUI();
  debugUtils.info("System", "Debug system initialized");
});

// Address handling functions
const originalHandleAddressSelection = window.handleAddressSelection;
window.handleAddressSelection = async function (eingangId) {
  debugUtils.info("AddressSelection", "Starting address selection", {
    eingangId,
  });
  try {
    const result = await originalHandleAddressSelection.apply(this, arguments);
    debugUtils.debug("AddressSelection", "Address selection successful", {
      eingangId,
      houseInfo: document.querySelector('input[name="eingangId"]').value,
    });
    return result;
  } catch (error) {
    debugUtils.error("AddressSelection", "Address selection failed", {
      eingangId,
      error,
    });
    throw error;
  }
};

// Form handling and display functions
const originalUpdateDropdown = window.updateDropdown;
window.updateDropdown = function (possibleAddresses) {
  debugUtils.info("Dropdown", "Updating address dropdown", {
    addressCount: possibleAddresses.length,
  });
  try {
    const result = originalUpdateDropdown.apply(this, arguments);
    debugUtils.debug("Dropdown", "Dropdown updated successfully", {
      addresses: possibleAddresses.map((addr) => ({
        id: addr.eingang_id,
        address: `${addr.street_name} ${addr.house_number}`,
      })),
    });
    return result;
  } catch (error) {
    debugUtils.error("Dropdown", "Failed to update dropdown", error);
    throw error;
  }
};

const originalPrefillFormFields = window.prefillFormFields;
window.prefillFormFields = function (houseInfo) {
  debugUtils.info("FormPrefill", "Starting form prefill", {
    houseId: houseInfo.eingangId,
  });
  try {
    const beforeState = {
      genh1: document.getElementById("genh1")?.value,
      warea: document.querySelector('input[name="warea"]')?.value,
      wbauj: document.querySelector('input[name="wbauj"]')?.value,
    };

    const result = originalPrefillFormFields.apply(this, arguments);

    const afterState = {
      genh1: document.getElementById("genh1")?.value,
      warea: document.querySelector('input[name="warea"]')?.value,
      wbauj: document.querySelector('input[name="wbauj"]')?.value,
    };

    debugUtils.debug("FormPrefill", "Form prefill completed", {
      before: beforeState,
      after: afterState,
    });
    return result;
  } catch (error) {
    debugUtils.error("FormPrefill", "Form prefill failed", error);
    throw error;
  }
};

// Calculation and display functions
const originalShowOnMap = window.showOnMap;
window.showOnMap = function (lat, lng) {
  debugUtils.info("Map", "Updating map location", { lat, lng });
  try {
    const result = originalShowOnMap.apply(this, arguments);
    debugUtils.debug("Map", "Map updated successfully", {
      latitude: lat,
      longitude: lng,
      zoom: window.map?.getZoom(),
    });
    return result;
  } catch (error) {
    debugUtils.error("Map", "Failed to update map", { lat, lng, error });
    throw error;
  }
};

// Updated mapping of German labels to response keys with new fields
const labelToResponseKeyMap = {
  Hersteller: "manufactorer",
  Produkt: "productType",
  Typ: "type",
  "Energie-Effizienz": "energy_efficiency",
  Speicher: "accessory", // bufferMemory renamed to accessory
  Kältemittel: "pipping", // refrigerant renamed to pipping
  Masse: "pippingBoiler", // mass renamed to pippingBoiler
};

// Template HTML for the feature list - updated with new fields
const featureListTemplate = `
<div class="plan_product_tool vertical">
  <div class="div-block-11">
    <div class="plan_product_tool-item">
      <div class="text-size-tiny">Hersteller</div>
    </div>
    <div class="text-size-tiny">Inklusive</div>
  </div>
  <div class="div-block-11">
    <div class="plan_product_tool-item">
      <div class="text-size-tiny">Produkt</div>
    </div>
    <div class="text-size-tiny">Inklusive</div>
  </div>
  <div class="div-block-11">
    <div class="plan_product_tool-item">
      <div class="text-size-tiny">Typ</div>
    </div>
    <div class="text-size-tiny">Inklusive</div>
  </div>
  <div class="div-block-11">
    <div class="plan_product_tool-item">
      <div class="text-size-tiny">Energie-Effizienz</div>
    </div>
    <div class="text-size-tiny">Inklusive</div>
  </div>
  <div class="div-block-11">
    <div class="plan_product_tool-item">
      <div class="text-size-tiny">Speicher</div>
    </div>
    <div class="text-size-tiny">Inklusive</div>
  </div>
  <div class="div-block-11">
    <div class="plan_product_tool-item">
      <div class="text-size-tiny">Kältemittel</div>
    </div>
    <div class="text-size-tiny">Inklusive</div>
  </div>
  <div class="div-block-11 last">
    <div class="plan_product_tool-item">
      <div class="text-size-tiny">Masse</div>
    </div>
    <div class="text-size-tiny">Inklusive</div>
  </div>
</div>`;

function updateFeatureLists(responseData) {
  if (!Array.isArray(responseData) || responseData.length === 0) {
    debugUtils.error("FeatureList", "Invalid response data");
    return;
  }

  debugUtils.info("FeatureList", "Response data", responseData);

  responseData.forEach((productData, index) => {
    const cardLetter = String.fromCharCode(65 + index); // Convert 0,1,2 to A,B,C
    const cardId = `productCard${cardLetter}`;

    debugUtils.info("FeatureList", `Processing card ${cardLetter}`, {
      heatPumpData: productData.heatPump,
    });

    // Get the card container
    const cardContainer = document.getElementById(cardId);
    if (!cardContainer) {
      debugUtils.error("FeatureList", `Card container not found: ${cardId}`);
      return;
    }

    // Remove existing feature list if it exists
    const existingList = cardContainer.querySelector(
      ".plan_product_tool.vertical"
    );
    if (existingList) {
      existingList.remove();
    }

    // Create new feature list from template
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = featureListTemplate.trim();
    const newFeatureList = tempDiv.firstChild;

    // Find insertion point - before the accordion
    const accordion = cardContainer.querySelector(".plan_product-accordion");
    if (!accordion) {
      debugUtils.error(
        "FeatureList",
        `Accordion not found in card ${cardLetter}`
      );
      return;
    }

    // Insert the new feature list
    accordion.parentNode.insertBefore(newFeatureList, accordion);

    // Update feature values
    const features = newFeatureList.querySelectorAll(".div-block-11");
    features.forEach((featureBlock) => {
      const labelElement = featureBlock.querySelector(".text-size-tiny");
      if (!labelElement) return;

      const label = labelElement.textContent.trim();
      const responseKey = labelToResponseKeyMap[label];

      if (responseKey) {
        const value = productData.heatPump[responseKey];
        debugUtils.info("FeatureList", `Setting value for ${label}`, {
          card: cardLetter,
          key: responseKey,
          value: value,
        });

        if (value) {
          labelElement.textContent = `${label}: ${value}`;
        }
      }
    });
  });
}

// Hook into the existing displayCalculationResults function
const originalDisplayCalculationResults = window.displayCalculationResults;
window.displayCalculationResults = function (data) {
  debugUtils.info("Results", "Starting calculation results display", {
    dataLength: data?.length,
  });

  try {
    const result = originalDisplayCalculationResults.apply(this, arguments);
    updateFeatureLists(data);
    return result;
  } catch (error) {
    debugUtils.error("Results", "Error in display calculation results", {
      error,
      stack: error.stack,
    });
    throw error;
  }
};

const originalUpdateAnzahlungInput = window.updateAnzahlungInput;
window.updateAnzahlungInput = function (value) {
  debugUtils.info("Payment", "Updating down payment", { value });
  try {
    const beforeValue = document.getElementById("anzahlung-no").value;
    const result = originalUpdateAnzahlungInput.apply(this, arguments);
    const afterValue = document.getElementById("anzahlung-no").value;

    debugUtils.debug("Payment", "Down payment updated", {
      before: beforeValue,
      after: afterValue,
    });
    return result;
  } catch (error) {
    debugUtils.error("Payment", "Failed to update down payment", error);
    throw error;
  }
};

// Event handler wrappers
const originalSelectRadio = window.selectRadio;
window.selectRadio = debugSelectRadio;

// Add these wrapped functions to the window object
Object.assign(window, {
  handleAddressSelection,
  updateDropdown,
  prefillFormFields,
  showOnMap,
  displayCalculationResults,
  updateAnzahlungInput,
  selectRadio,
});
