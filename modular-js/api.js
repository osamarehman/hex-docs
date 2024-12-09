// API endpoints
window.API_ENDPOINTS = {
    possibleAddress: "https://hex-api.climartis.ch/api/getPossibleAddress",
    houseInfo: "https://hex-api.climartis.ch/api/getHouseInfo",
    calculation: "https://hex-api.climartis.ch/api/getCalculation"
};

// API fetch functions
window.fetchDataGet = async function (url) {
    try {
        debugUtils.info("API", "Making GET request", { url });
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        debugUtils.info("API", "Received response", { 
            status: response.status,
            dataLength: JSON.stringify(data).length 
        });
        return data;
    } catch (error) {
        debugUtils.error("API", "Error in fetchDataGet", {
            url,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

window.fetchDataPost = async function (url, params) {
    try {
        debugUtils.info("API", "Making POST request", { url, params });
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        debugUtils.info("API", "Received response", { 
            status: response.status,
            dataLength: JSON.stringify(data).length 
        });
        return data;
    } catch (error) {
        debugUtils.error("API", "Error in fetchDataPost", {
            url,
            params,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}
