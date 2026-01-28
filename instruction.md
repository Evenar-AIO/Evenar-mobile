# Mobile Project Instructions

## Project Structure

The project is a React Native application built with Expo and uses Expo Router for navigation. The main directories are:

- **app/**: Contains the screens of the application. Expo Router uses a file-based routing system within this directory.
- **assets/**: Stores static assets like images, fonts, and icons.
- **components/**: Holds reusable React Native components.
- **config/**: Stores configuration files for the application.
- **constants/**: Defines constant values used across the app, such as colors, styles, or API endpoints.
- **hooks/**: Contains custom React hooks for shared logic.

## Usage

### Prerequisites

- Node.js and npm installed.
- Expo CLI installed (`npm install -g expo-cli`).
- Expo Go app on your mobile device or an Android/iOS emulator.

### Installation

1. Navigate to the project directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the application

To start the development server, run:

```bash
npm start
```

This will open the Expo developer tools in your browser. You can then:
- Scan the QR code with the Expo Go app on your phone.
- Press `a` to run on an Android emulator.
- Press `i` to run on an iOS simulator.

## Data Flow

1. **User Interaction**: A user interacts with a component on a screen (e.g., taps a button).
2. **Component Logic**: The component's event handler is triggered. It may call a custom hook or a function to handle the logic.
3. **API Call**: If data is needed from a server, a function will make an API request.
4. **State Management**: The application state is updated with the new data. This could be local component state or managed through a global state management solution.
5. **UI Re-render**: React Native re-renders the necessary components on the screen to reflect the new state.

### Data Flow Diagram

```plaintext
[User Interaction] -> [Screen/Component] -> [Hook/Service] -> [API Layer] -> [Backend Server]
       ^                                                                       |
       |                                                                       v
 [UI Re-renders]  <- [State Management] <-------------------------------- [API Response]
```
