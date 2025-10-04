This is a React Native [Expo](https://expo.dev) project.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm start
```

This will open Expo DevTools in your browser. From there you can:

- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your physical device

You can start editing the app by modifying `App.tsx`. The app will automatically reload as you save changes.

## Connecting to Backend

The app connects to the backend API at `http://localhost:3001`. 

**Important:** The localhost URL works differently on different platforms:
- **iOS Simulator**: Use `http://localhost:3001` ✓
- **Android Emulator**: Use `http://10.0.2.2:3001`
- **Physical Device**: Use your computer's local IP (e.g., `http://192.168.1.x:3001`)

You may need to update the URL in `App.tsx` depending on your platform.

## Learn More

To learn more about React Native and Expo:

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Learn React Native](https://reactnative.dev/docs/tutorial)

## Running on Different Platforms

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```
