# Migration from Next.js to React Native with Expo

## Summary
The frontend has been successfully converted from Next.js 15 (web framework) to React Native with Expo (mobile framework).

## Changes Made

### Removed (Next.js specific)
- `next.config.ts`
- `postcss.config.mjs`
- `components.json`
- `eslint.config.mjs` (replaced with .eslintrc.js)
- `src/` directory with all web components
- `public/` directory with web assets
- All web-specific dependencies (react-dom, next, tailwind, radix-ui, etc.)

### Added (React Native/Expo specific)
- `App.tsx` - Main application component with React Native components
- `index.js` - Entry point for Expo
- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration for Expo
- `metro.config.js` - Metro bundler configuration
- `.eslintrc.js` - ESLint configuration for React Native
- `assets/` - Directory for images and other assets
- React Native dependencies (expo, react-native, expo-status-bar, expo-asset)

### Modified
- `package.json` - Updated scripts and dependencies for React Native
- `tsconfig.json` - Simplified for Expo
- `.gitignore` - Updated for React Native/Expo artifacts
- `Dockerfile.dev` - Updated ports for Expo (19000, 19001, 19002, 8081)
- `docker-compose.yml` - Updated frontend service for Expo ports
- `README.md` - Updated documentation for React Native stack
- `frontend/README.md` - Complete rewrite for React Native instructions

## Port Changes

### Before (Next.js)
- Frontend: http://localhost:3000

### After (React Native/Expo)
- Expo DevTools: http://localhost:19000
- Metro Bundler: http://localhost:8081
- Expo Web: http://localhost:19002

## Running the Application

```bash
cd frontend
npm install
npm start
```

Then:
- Scan QR code with Expo Go app on your phone
- Press `w` to open in browser
- Press `a` for Android emulator
- Press `i` for iOS simulator

## Backend Connection Notes

The backend URL differs by platform:
- iOS Simulator: `http://localhost:3001`
- Android Emulator: `http://10.0.2.2:3001`
- Physical Device: `http://<YOUR_IP>:3001`

Default in code is `http://localhost:3001` (works for iOS simulator and web).

## Technology Stack

### Before
- Next.js 15
- React 19
- Tailwind CSS v4
- shadcn/ui components
- react-dom

### After
- Expo ~52.0.0
- React Native 0.76.9
- React 18.3.1
- Native StyleSheet
- React Native built-in components

## What Stayed the Same
- TypeScript support
- Hot reload capability
- Backend API (NestJS) - unchanged
- Docker support
- Core functionality (backend connection test, displaying stack info)

## Future Improvements
- Add navigation library (e.g., React Navigation)
- Add more UI components
- Add proper icons and splash screens
- Configure for production builds
- Add platform-specific configurations
