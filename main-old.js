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
    try {
      resetFormValues(); // Reset form values before fetching house info
  
      const houseInfo = await fetchDataGet(
        `${houseInfoEndpoint}?eingangId=${eingangId}`
      );
      prefillFormFields(houseInfo); // Prefill form fields with house info
  
      // Set the eingangId in the hidden input field
      document.querySelector('input[name="eingangId"]').value = eingangId;
  
      // Convert Swiss coordinates to WGS84 and show on Google Maps
      if (houseInfo.dkodeE && houseInfo.dkodeN) {
        const lat = CHtoWGSlat(houseInfo.dkodeE, houseInfo.dkodeN);
        const lng = CHtoWGSlng(houseInfo.dkodeE, houseInfo.dkodeN);
        showOnMap(lat, lng);
      }
    } catch (error) {
      console.error("Error fetching house info:", error);
    }
  }
  
  // Function to initialize and display Google Map
  function initMap() {
    const defaultLocation = { lat: 46.8182, lng: 8.2275 }; // Coordinates of Switzerland
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 8,
      center: defaultLocation,
    });
  
    // Store the map instance globally
    window.map = map;
  
    // Store the marker instance globally
    window.marker = null;
  }
  
  // Function to show coordinates on Google Map
  function showOnMap(lat, lng) {
    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
  
    // Update the map center and zoom
    window.map.setCenter(position);
    window.map.setZoom(18); // Zoom in to the location
  
    // If a marker already exists, update its position
    if (window.marker) {
      window.marker.setPosition(position);
    } else {
      // Create a new marker if one does not exist
      window.marker = new google.maps.Marker({
        position: position,
        map: window.map,
      });
    }
  }
  
  // Function to reset form values
  function resetFormValues() {
    const ruckbauInput = document.querySelector('input[name="ruckbau"]');
    if (ruckbauInput) ruckbauInput.value = "true";
  
    const distanceInput = document.querySelector(
      'select[name="distanceToHeatingPlace"]'
    );
    if (distanceInput) distanceInput.value = "0";
  
    document.getElementById("newHeatingPlace").value = "outside";
    document.getElementById("dhp").style.display = "flex";
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
  
  // Function to fetch calculation results and display them
  async function getCalculationResults(params) {
    const endpoint = "https://hex-api.climartis.ch/api/getCalculation";
    const formData = new FormData();
  
    // Append parameters as form data
    Object.keys(params).forEach((key) => {
      formData.append(key, params[key] || ""); // Use empty string for falsy values
    });
  
    try {
      console.log("Sending the following data to the server:");
      for (var pair of formData.entries()) {
      }
  
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }
  
      // Store the response data globally
      calculationResults = await response.json();
  
      // Check if the response is null or empty
      if (!calculationResults || calculationResults.length === 0) {
        // Hide the full offer form and show the error form
        document.getElementById("fullOfferForm").style.display = "none";
        document.getElementById("errorForm").style.display = "block";
      } else {
        // Display the results
        displayCalculationResults(calculationResults);
      }
    } catch (error) {
      console.error("Error fetching calculation results:", error);
      updateUIWithError(error.message);
  
      // In case of error, hide the full offer form and show the error form
      document.getElementById("fullOfferForm").style.display = "none";
      document.getElementById("errorForm").style.display = "block";
    }
  }
  
  function displayCalculationResults(data) {
    // Function to safely retrieve nested data with a default fallback
    function safeGet(data, path, defaultValue) {
      return path.reduce(
        (xs, x) => (xs && xs[x] != null ? xs[x] : defaultValue),
        data
      );
    }
  
    // Hide all cards initially
    const cardIDs = ["A", "B", "C"];
    cardIDs.forEach((suffix) => {
      const card = document.getElementById(`productCard${suffix}`);
      if (card) card.style.display = "none"; // Make sure cards are hidden initially
    });
  
    // Display cards based on data available
    data.forEach((item, index) => {
      const suffix = cardIDs[index];
      const card = document.getElementById(`productCard${suffix}`);
      if (card) {
        card.style.display = "grid"; // Use 'grid' to display the card
        // Update card content
        document.getElementById(`totalPrice${suffix}`).textContent = Math.round(
          item.totalPrice || 0
        );
        document.getElementById(`totalSalesPrice${suffix}`).textContent =
          Math.round(item.totalSalesPrice || 0)
            .toLocaleString("en-US")
            .replace(/,/g, "'");
  
        const value = safeGet(item, ["heatPump", "forderung"], "No data");
  
        let formattedValue;
  
        if (typeof value === "number" && value > 100) {
          formattedValue = Math.round(value)
            .toLocaleString("en-US")
            .replace(/,/g, "'");
        } else {
          formattedValue = value; // Retains "No data" or any other non-number value
        }
  
        document.getElementById(`subsidy${suffix}`).textContent = formattedValue;
  
        const sloganElement = document.getElementById(`slogan${suffix}`);
        const sloganText = safeGet(item, ["heatPump", "slogan"], null);
  
        if (sloganText) {
          sloganElement.textContent = sloganText;
          sloganElement.style.display = "flex"; // Ensure the element is visible if data is present
        } else {
          sloganElement.style.display = "none"; // Hide the element if no data
        }
  
        document.getElementById(`loudness${suffix}`).textContent = safeGet(
          item,
          ["heatPump", "loudness"],
          "No data"
        );
        document.getElementById(`maxOutput${suffix}`).textContent = safeGet(
          item,
          ["heatPump", "max_output"],
          "No data"
        );
        document.getElementById(`boilerSize${suffix}`).textContent = safeGet(
          item,
          ["boiler", "type"],
          "0"
        );
        document.getElementById(`img${suffix}`).src = safeGet(
          item,
          ["heatPump", "image"],
          "https://uploads-ssl.webflow.com/6627744b33c005540d1e47b7/667568899c1ab21871bb5bc0_Frame%201849.png"
        );
        document.getElementById(`scop${suffix}`).textContent = safeGet(
          item,
          ["heatPump", "scop"],
          "Not available"
        );
        document.getElementById(`manufactorer${suffix}`).textContent = safeGet(
          item,
          ["heatPump", "manufactorer"],
          "Not available"
        );
        document.getElementById(`productType${suffix}`).textContent = safeGet(
          item,
          ["heatPump", "productType"],
          "Not available"
        );
        document.getElementById(`serviceFeeValue${suffix}`).textContent = safeGet(
          item,
          ["calculationNumbers", "serviceFee"],
          "0"
        );
        document.getElementById(`maintenanceValue${suffix}`).textContent =
          safeGet(item, ["calculationNumbers", "maintance"], "0");
        document.getElementById(`energyManagementValue${suffix}`).textContent =
          safeGet(item, ["calculationNumbers", "energyManagement"], "0");
        document.getElementById(`ratInsuranceValue${suffix}`).textContent =
          safeGet(item, ["calculationNumbers", "ratInsurance"], "0");
        document.getElementById(`interestRateValue${suffix}`).textContent =
          safeGet(item, ["calculationNumbers", "interestRate"], "0");
        document.getElementById(`taxValue${suffix}`).textContent = safeGet(
          item,
          ["calculationNumbers", "tax"],
          "0"
        );
        // Description
        const description = safeGet(
          item,
          ["heatPump", "description"],
          "No description available"
        );
        document.getElementById(`desc${suffix}`).innerHTML =
          DOMPurify.sanitize(description);
      }
    });
  
    // Recalculate and update any necessary UI elements
    calculateMonthlyPayment();
    calculateMonthlyCalc();
  }
  
  // Function to update the anzahlung-no hidden input and trigger calculation
  function updateAnzahlungInput(value) {
    document.getElementById("anzahlung-no").value = value;
    calculateMonthlyCalc();
  }
  
  // Function to select a radio button and update the value
  function selectRadio(div) {
    // Remove active class from all radio fields
    var allFields = document.querySelectorAll(".mutli_form_radio-field2");
    allFields.forEach((field) => field.classList.remove("is-active-inputactive"));
  
    // Get the associated radio input
    var radio = div.querySelector('input[type="radio"]');
  
    // Check the radio button and update the input value
    radio.checked = true;
    updateAnzahlungInput(radio.value);
  
    // Add active class to the selected radio field
    div.classList.add("is-active-inputactive");
  }
  
  // Function to calculate the monthly payment based on user inputs
  function calculateMonthlyCalc() {
    // Ensure elements exist
    const anzahlungElement = document.getElementById("anzahlung-no");
    const durationElement = document.getElementById("duration-value");
    const monthlyCalcValueElement = document.getElementById("monthlyCalcValue");
    const totalPriceSelectedElement =
      document.getElementById("totalPriceSelected");
    const totalSalesPriceSelectedElement = document.getElementById(
      "totalSalesPriceSelected"
    );
    const totalSalesPriceSelectedElement2 =
      document.getElementById("selectedtotalPrice");
    const productSelected = document.querySelector(
      'input[name="productSelection"]:checked'
    );
  
    if (
      anzahlungElement &&
      durationElement &&
      monthlyCalcValueElement &&
      totalPriceSelectedElement &&
      productSelected
    ) {
      let calcAnzahlung = parseFloat(anzahlungElement.value) / 100;
      let calcYears = parseFloat(durationElement.value);
      let selectedProduct = productSelected.value;
  
      // Fetch the calculation numbers based on product
      let serviceFeeElement =
        parseFloat(
          document.getElementById(`serviceFeeValue${selectedProduct}`).textContent
        ) || 0;
      let maintenanceElement =
        parseFloat(
          document.getElementById(`maintenanceValue${selectedProduct}`)
            .textContent
        ) || 0;
      let energyManagementElement =
        parseFloat(
          document.getElementById(`energyManagementValue${selectedProduct}`)
            .textContent
        ) || 0;
      let ratInsuranceElement =
        parseFloat(
          document.getElementById(`ratInsuranceValue${selectedProduct}`)
            .textContent
        ) || 0;
      let interestRateElement =
        parseFloat(
          document.getElementById(`interestRateValue${selectedProduct}`)
            .textContent
        ) || 0;
      let taxElement =
        parseFloat(
          document.getElementById(`taxValue${selectedProduct}`).textContent
        ) || 0;
      // Copy the selected product card values and append to the placeholder
      const selectedProductPriceElement = document.getElementById(
        `totalPrice${selectedProduct}`
      );
      const selectedProductPriceValue = selectedProductPriceElement
        ? parseFloat(selectedProductPriceElement.textContent.replace(/'/g, "")) // Remove existing formatting if any
        : 0;
  
      document.getElementById("selectedtotalPrice").textContent =
        selectedProductPriceValue.toLocaleString("en-US").replace(/,/g, "'");
  
      document.getElementById("selectedmoPrice").textContent =
        document.getElementById(`moPrice${selectedProduct}`).textContent;
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
  
      //Copy Values over to Final input fields
      document.querySelector('input[name="totalSum"]').value =
        parseFloat(
          document
            .getElementById("selectedtotalPrice")
            .textContent.replace(/'/g, "")
        ) || 0;
      document.querySelector('input[name="monthlyPayment"]').value =
        document.getElementById("selectedmoPrice").textContent;
      document.querySelector('input[name="initialPayment"]').value =
        document.getElementById("anzahlung-no").value;
      document.querySelector('input[name="amountOfMonths"]').value =
        document.getElementById("duration-value").value;
  
      // Define a mapping from product identifier to array index
      const productMapping = {
        A: 0,
        B: 1,
        C: 2,
      };
  
      // Use the mapping to convert the selectedProduct (e.g., 'B') into an array index
      const selectedProductIndex = productMapping[selectedProduct];
  
      // Update the input field with the selected product's data as a JSON string
      const selectedProductData = calculationResults[selectedProductIndex];
  
      if (selectedProductData) {
        document.getElementById("data").value =
          JSON.stringify(selectedProductData);
      } else {
        console.error("Selected product data is undefined or not found.");
      }
  
      // Fetch the total cost based on selected product
      let totalCostCalcElement = document.getElementById(
        `totalPrice${selectedProduct}`
      );
      if (totalCostCalcElement) {
        let totalCostCalc = parseFloat(totalCostCalcElement.textContent) || 0;
        totalPriceSelectedElement.textContent = totalCostCalc;
        totalSalesPriceSelectedElement.textContent =
          document.getElementById(`totalSalesPrice${selectedProduct}`)
            ?.textContent || "";
        totalSalesPriceSelectedElement2.textContent =
          document.getElementById(`totalSalesPrice${selectedProduct}`)
            ?.textContent || "";
        // Update the displayed price
  
        // Perform the calculation if all inputs are valid
        if (!isNaN(calcAnzahlung) && calcYears > 0 && totalCostCalc > 0) {
          // Step 1: Calculate the principal after down payment
          let downpayment = totalCostCalc * calcAnzahlung;
          document.getElementById("downpayment").textContent = Math.round(
            downpayment
          )
            .toLocaleString("en-US")
            .replace(/,/g, "'");
          let principalAfterDownPayment = totalCostCalc - downpayment;
          // Handle case where interest rate is 0
          let monthlyInterestRate =
            interestRateElement > 0 ? interestRateElement / 100 / 12 : 1e-9; // Convert annual rate to monthly
          let numberOfPayments = calcYears; // Total monthly payments over the loan term
          let annuityFactor =
            (monthlyInterestRate *
              Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
            (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
          let monthlyPaymentBase = principalAfterDownPayment * annuityFactor;
          let additionalCosts =
            maintenanceElement +
            energyManagementElement +
            monthlyPaymentBase * (serviceFeeElement / 100);
          let subtotal = monthlyPaymentBase + additionalCosts;
          let insuranceCost = subtotal * (ratInsuranceElement / 100);
          let totalNet = subtotal + insuranceCost;
          let totalWithTax = totalNet * (1 + taxElement / 100);
          monthlyCalcValueElement.textContent = Math.round(totalWithTax)
            .toLocaleString("en-US")
            .replace(/,/g, "'");
          document.getElementById("selectedmoPrice").textContent =
            Math.floor(totalWithTax);
          document.querySelector('input[name="monthlyPayment"]').value =
            Math.floor(totalWithTax);
        } else {
          monthlyCalcValueElement.textContent = "0";
        }
      }
    } else {
      console.error("One or more required elements are missing.");
    }
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
  
  // Function to calculate the monthly payment with fixed values of anzahlung & years
  function calculateMonthlyPayment() {
    const anzahlung = 0.1;
    const years = 60;
  
    // Retrieve calculationNumbers Values of A
    const serviceFeeA =
      parseFloat(document.getElementById("serviceFeeValueA").textContent) / 100; // Assuming percentage
    const maintenanceA = parseFloat(
      document.getElementById("maintenanceValueA").textContent
    );
    const energyManagementA = parseFloat(
      document.getElementById("energyManagementValueA").textContent
    );
    const ratInsuranceA =
      parseFloat(document.getElementById("ratInsuranceValueA").textContent) / 100; // Assuming percentage
    const interestRateA =
      parseFloat(document.getElementById("interestRateValueA").textContent) / 100; // Annual interest as decimal
    const taxA =
      parseFloat(document.getElementById("taxValueA").textContent) / 100; // Tax rate as decimal
    let totalCostA = parseFloat(
      document.getElementById("totalPriceA").textContent
    );
  
    // Calculate monthly payments for Product A
    let downpaymentA = totalCostA * anzahlung;
    let principalAfterDownPaymentA = totalCostA - downpaymentA;
    let monthlyInterestRateA =
      interestRateA > 0 ? interestRateA / 100 / 12 : 1e-9; // Use a near-zero fallback if interestRateA is 0
    let numberOfPaymentsA = years;
    let annuityFactorA =
      (monthlyInterestRateA *
        Math.pow(1 + monthlyInterestRateA, numberOfPaymentsA)) /
      (Math.pow(1 + monthlyInterestRateA, numberOfPaymentsA) - 1);
    let monthlyPaymentBaseA = principalAfterDownPaymentA * annuityFactorA;
    let additionalCostsA =
      maintenanceA +
      energyManagementA +
      monthlyPaymentBaseA * (serviceFeeA / 100); // Verify serviceFee logic
    let subtotalA = monthlyPaymentBaseA + additionalCostsA; // Total monthly payment before insurance and taxes
    let insuranceCostA = subtotalA * (ratInsuranceA / 100);
    let totalNetA = subtotalA + insuranceCostA; // Add insurance
    let totalWithTaxA = totalNetA * (1 + taxA / 100); // Add tax
    let monthlyPaymentA = Math.round(totalWithTaxA); // Round to two decimal places
  
    // Retrieve calculationNumbers Values of B
    const serviceFeeB =
      parseFloat(document.getElementById("serviceFeeValueB").textContent) / 100; // Assuming percentage
    const maintenanceB = parseFloat(
      document.getElementById("maintenanceValueB").textContent
    );
    const energyManagementB = parseFloat(
      document.getElementById("energyManagementValueB").textContent
    );
    const ratInsuranceB =
      parseFloat(document.getElementById("ratInsuranceValueB").textContent) / 100; // Assuming percentage
    const interestRateB =
      parseFloat(document.getElementById("interestRateValueB").textContent) / 100; // Annual interest as decimal
    const taxB =
      parseFloat(document.getElementById("taxValueB").textContent) / 100; // Tax rate as decimal
    let totalCostB = parseFloat(
      document.getElementById("totalPriceB").textContent
    );
  
    // Calculate monthly payments for Product B
    let downpaymentB = totalCostB * anzahlung;
    let principalAfterDownPaymentB = totalCostB - downpaymentB;
    let monthlyInterestRateB =
      interestRateB > 0 ? interestRateB / 100 / 12 : 1e-9; // Use a near-zero fallback if interestRateA is 0
    let numberOfPaymentsB = years;
    let annuityFactorB =
      (monthlyInterestRateB *
        Math.pow(1 + monthlyInterestRateB, numberOfPaymentsB)) /
      (Math.pow(1 + monthlyInterestRateB, numberOfPaymentsB) - 1);
    let monthlyPaymentBaseB = principalAfterDownPaymentB * annuityFactorB;
    let additionalCostsB =
      maintenanceB +
      energyManagementB +
      monthlyPaymentBaseB * (serviceFeeB / 100); // Verify serviceFee logic
    let subtotalB = monthlyPaymentBaseB + additionalCostsB; // Total monthly payment before insurance and taxes
    let insuranceCostB = subtotalB * (ratInsuranceB / 100);
    let totalNetB = subtotalB + insuranceCostB; // Add insurance
    let totalWithTaxB = totalNetB * (1 + taxB / 100); // Add tax
    let monthlyPaymentB = Math.round(totalWithTaxB); // Round to two decimal places
  
    // Retrieve calculationNumbers Values of C
    const serviceFeeC =
      parseFloat(document.getElementById("serviceFeeValueC").textContent) / 100; // Assuming percentage
    const maintenanceC = parseFloat(
      document.getElementById("maintenanceValueC").textContent
    );
    const energyManagementC = parseFloat(
      document.getElementById("energyManagementValueC").textContent
    );
    const ratInsuranceC =
      parseFloat(document.getElementById("ratInsuranceValueC").textContent) / 100; // Assuming percentage
    const interestRateC =
      parseFloat(document.getElementById("interestRateValueC").textContent) / 100; // Annual interest as decimal
    const taxC =
      parseFloat(document.getElementById("taxValueC").textContent) / 100; // Tax rate as decimal
    let totalCostC = parseFloat(
      document.getElementById("totalPriceC").textContent
    );
  
    // Calculate monthly payments for Product C
    let downpaymentC = totalCostC * anzahlung;
    let principalAfterDownPaymentC = totalCostC - downpaymentC;
    let monthlyInterestRateC =
      interestRateC > 0 ? interestRateC / 100 / 12 : 1e-9; // Use a near-zero fallback if interestRateA is 0
    let numberOfPaymentsC = years;
    let annuityFactorC =
      (monthlyInterestRateC *
        Math.pow(1 + monthlyInterestRateC, numberOfPaymentsC)) /
      (Math.pow(1 + monthlyInterestRateC, numberOfPaymentsC) - 1);
    let monthlyPaymentBaseC = principalAfterDownPaymentC * annuityFactorC;
    let additionalCostsC =
      maintenanceC +
      energyManagementC +
      monthlyPaymentBaseC * (serviceFeeC / 100); // Verify serviceFee logic
    let subtotalC = monthlyPaymentBaseC + additionalCostsC; // Total monthly payment before insurance and taxes
    let insuranceCostC = subtotalC * (ratInsuranceC / 100);
    let totalNetC = subtotalC + insuranceCostC; // Add insurance
    let totalWithTaxC = totalNetC * (1 + taxC / 100); // Add tax
    let monthlyPaymentC = Math.round(totalWithTaxC); // Round to two decimal places
  
    // Update the DOM elements with the calculated values
    document.getElementById("moPriceA").textContent = monthlyPaymentA;
    document.getElementById("moPriceB").textContent = monthlyPaymentB;
    document.getElementById("moPriceC").textContent = monthlyPaymentC;
  }
  
  // Add event listeners to recalculate when inputs change
  document
    .getElementById("anzahlung-no")
    .addEventListener("input", calculateMonthlyCalc);
  document
    .getElementById("anzahlung-no")
    .addEventListener("focusout", calculateMonthlyCalc);
  document
    .getElementById("duration-value")
    .addEventListener("input", calculateMonthlyCalc);
  document
    .getElementById("duration-value")
    .addEventListener("focusout", calculateMonthlyCalc);
  
  // Initial calculation to ensure values are correct on page load
  calculateMonthlyCalc();
  
  //Submitting Data to getCalculation results
  
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
      await getCalculationResults(params);
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
  