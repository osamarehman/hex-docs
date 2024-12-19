# Product Requirements Document (PRD)

## Overview
This document outlines the changes made from `main-old.js` to `main-new.js`. The goal is to provide a detailed breakdown of the modifications to facilitate the allocation of hours to each task.

## Key Changes

### 1. Coordinate Conversion Functions
- **Description**: Added functions to convert Swiss coordinates to WGS84 format.
- **Tasks**:
  - Implement `CHtoWGSlat` function.
  - Implement `CHtoWGSlng` function.
- **Estimated Hours**: 4 hours

### 2. Debounce Function
- **Description**: Implemented a debounce function to optimize address input handling.
- **Tasks**:
  - Implement debounce logic to delay function execution.
- **Estimated Hours**: 2 hours

### 3. API Endpoints
- **Description**: Defined API endpoints for fetching possible addresses.
- **Tasks**:
  - Set up endpoint URLs.
  - Implement functions to handle API requests.
- **Estimated Hours**: 3 hours

### 4. Address Handling
- **Description**: Enhanced functions for handling address input and selection.
- **Tasks**:
  - Implement `handleAddressInput` function with debounce.
  - Implement `handleAddressSelection` function.
- **Estimated Hours**: 5 hours

### 5. Map Initialization
- **Description**: Added functionality to initialize and display a Google Map.
- **Tasks**:
  - Implement `initMap` function.
  - Implement `showOnMap` function.
- **Estimated Hours**: 6 hours

### 6. Form Handling
- **Description**: Added functions for resetting form values and pre-filling fields with house information.
- **Tasks**:
  - Implement `resetFormValues` function.
  - Implement `prefillFormFields` function.
- **Estimated Hours**: 4 hours

### 7. Calculation Functions
- **Description**: Enhanced functions for calculating monthly payments and validating parameters.
- **Tasks**:
  - Implement `calculateMonthlyPayment` function.
  - Implement `validateCalculationParams` function.
- **Estimated Hours**: 6 hours

### 8. Logging
- **Description**: Added logging capabilities to major functions for debugging and tracking purposes.
- **Tasks**:
  - Implement logging in major functions.
- **Estimated Hours**: 3 hours

## Dependencies and APIs
- **API**: Utilizes an API endpoint for fetching possible addresses: `https://hex-api.climartis.ch/api/getPossibleAddress`.
- **Google Maps API**: Used for displaying maps and coordinates.

## Design Decisions
- **Debounce Function**: Used to improve performance by limiting the rate at which address input is processed.
- **Error Handling**: Enhanced error handling in calculation functions to ensure robustness.

## Security Preferences
- No specific security preferences were mentioned, but logging functions include error tracking which can help identify issues.

## Special User Requests and Preferences
- The USER emphasized the need for a detailed breakdown in the PRD to allocate hours effectively.

## Existing Blockers and Bugs
- No specific blockers or bugs were mentioned during this session.

## Next Steps
- Review the PRD to ensure all relevant features, dependencies, and design decisions are documented clearly for future reference.