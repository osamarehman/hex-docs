// Mock the global fetch
global.fetch = jest.fn();

// Mock Google Maps
global.google = {
    maps: {
        Map: jest.fn(),
        Marker: jest.fn(),
        Animation: {
            DROP: 1
        }
    }
};

// Setup DOM elements that our code expects
document.body.innerHTML = `
    <div id="map"></div>
    <div id="debugPanel"></div>
    <div id="addressInput"></div>
    <div id="myDropdown"></div>
    <div id="dhp"></div>
`;
