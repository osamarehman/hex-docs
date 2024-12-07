# Hex Calculator JavaScript Bundle

This package contains the JavaScript code for the Hex Calculator application.

## Development

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm test
```

3. Build the bundle:
```bash
npm run build
```

The built bundle will be in the `dist` directory as `bundle.min.js`.

## Webflow Integration

To integrate this JavaScript bundle with your Webflow site:

1. Build the bundle using `npm run build`
2. Upload the generated `dist/bundle.min.js` file to Webflow's Assets
3. Add the following code to your Webflow page's custom code section:

```html
<!-- In the Head section -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap" async defer></script>

<!-- Before the closing Body tag -->
<script src="path/to/your/bundle.min.js"></script>
```

Make sure to:
1. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API key
2. Update the bundle.min.js path to match where you uploaded it in Webflow

## Testing

The project includes Jest tests for all major components. Run tests with:

```bash
npm test
```

## Modules

- `api.js`: Handles all API calls
- `validation.js`: Form and data validation
- `display-handler.js`: UI updates and display logic
- `debug-utils.js`: Debugging utilities
- `coordinates.js`: Coordinate conversion utilities
- `map-handler.js`: Google Maps integration
- `form-handler.js`: Form management
- `event-listeners.js`: Event handling
- `payment-calculator.js`: Payment calculations
- `product-manager.js`: Product management
- `utils.js`: General utilities
