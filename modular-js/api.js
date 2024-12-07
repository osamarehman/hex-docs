// API endpoints
export const API_ENDPOINTS = {
    possibleAddress: "https://hex-api.climartis.ch/api/getPossibleAddress",
    houseInfo: "https://hex-api.climartis.ch/api/getHouseInfo",
    calculation: "https://hex-api.climartis.ch/api/getCalculation"
};

// API fetch functions
export async function fetchDataGet(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error, status = ${response.status}`);
    return await response.json();
}

export async function fetchDataPost(url, params) {
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
