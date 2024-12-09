// import { debugUtils } from './debug-utils.js';

let map = null;
let marker = null;

window.initMap = function () {
    debugUtils.info("Map", "Initializing Google Map");

    try {
        const defaultLocation = { lat: 46.8182, lng: 8.2275 }; // Coordinates of Switzerland
        const mapOptions = {
            zoom: 8,
            center: defaultLocation,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        };

        const mapElement = document.getElementById("map");
        if (!mapElement) {
            debugUtils.error("Map", "Map element not found");
            return;
        }

        map = new google.maps.Map(mapElement, mapOptions);
        debugUtils.info("Map", "Map initialized successfully", { defaultLocation });
    } catch (error) {
        debugUtils.error("Map", "Error initializing map", { error });
    }
}

window.showOnMap = function(lat, lng) {
    try {
        debugUtils.info("Map", "Showing location on map", { lat, lng });
        
        if (!map) {
            debugUtils.error("Map", "Map not initialized");
            return;
        }

        const location = { lat: parseFloat(lat), lng: parseFloat(lng) };
        
        // Update map center
        map.setCenter(location);
        map.setZoom(15);

        // Update or create marker
        if (marker) {
            marker.setPosition(location);
        } else {
            marker = new google.maps.Marker({
                position: location,
                map: map,
                animation: google.maps.Animation.DROP
            });
        }

        debugUtils.info("Map", "Location shown successfully", { location });
    } catch (error) {
        debugUtils.error("Map", "Error showing location on map", { 
            error: error.message,
            stack: error.stack,
            coordinates: { lat, lng }
        });
    }
}
