import { debugUtils } from './debug-utils.js';

let map = null;
let marker = null;

export function initMap() {
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

export function showOnMap(lat, lng) {
    debugUtils.info("Map", "Updating map position", { lat, lng });

    try {
        if (!map) {
            debugUtils.error("Map", "Map instance not found");
            return;
        }

        const position = { 
            lat: parseFloat(lat), 
            lng: parseFloat(lng) 
        };

        if (isNaN(position.lat) || isNaN(position.lng)) {
            debugUtils.error("Map", "Invalid coordinates", position);
            return;
        }

        map.setCenter(position);
        map.setZoom(18);

        if (marker) {
            marker.setPosition(position);
            debugUtils.info("Map", "Updated existing marker position");
        } else {
            marker = new google.maps.Marker({
                position: position,
                map: map,
                animation: google.maps.Animation.DROP
            });
            debugUtils.info("Map", "Created new marker");
        }
    } catch (error) {
        debugUtils.error("Map", "Error updating map", { error });
    }
}
