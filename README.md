# ManaBandhu

A production-ready cross-platform application built with React Native, Expo, and TypeScript.

## Features

- 🔐 **Authentication**: Email, Phone (OTP), Google Sign-In, Apple Sign-In
- 🎯 **Onboarding Flow**: Welcome, Goals Selection, Location & Notification Permissions
- 📱 **Cross-Platform**: iOS, Android, and Web support
- 🎨 **Modern UI**: NativeWind (Tailwind CSS) with dark mode support
- 🔒 **Secure Storage**: Expo SecureStore for sensitive data
- 📊 **State Management**: Zustand for global state
- ✅ **Form Validation**: React Hook Form + Zod

## Tech Stack

- **React Native** (latest stable)
- **Expo SDK** (~52.0.0)
- **TypeScript** (strict mode)
- **expo-router** (file-based routing)
- **NativeWind** (Tailwind CSS)
- **Zustand** (state management)
- **React Hook Form** + **Zod** (forms & validation)
- **Firebase Auth** (authentication)
- **Firebase Firestore** (database)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- Firebase project configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a `.env` file in the root directory
   - Add your Firebase configuration:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

   **Note**: For Google Sign-In on iOS, you may need to configure the `iosUrlScheme` in `app.config.ts` with your reversed Google OAuth client ID (format: `com.googleusercontent.apps.YOUR_CLIENT_ID`). This is typically auto-configured, but if you encounter errors, add it to the Google Sign-In plugin configuration.

3. Start the development server:
```bash
npm start
```

### Running on Platforms

- **iOS**: `npm run ios` or press `i` in Expo CLI
- **Android**: `npm run android` or press `a` in Expo CLI
- **Web**: `npm run web` or press `w` in Expo CLI

## Project Structure

```
manabandhu/
├── app/                    # File-based routing
│   ├── (auth)/            # Authentication screens
│   ├── (onboarding)/      # Onboarding flow
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── auth/             # Auth-specific components
├── store/                 # Zustand stores
├── lib/                   # Utilities & configs
├── hooks/                 # Custom hooks
├── types/                 # TypeScript types
└── constants/             # Constants (colors, spacing, etc.)
```

## Authentication Flow

1. **Splash/Entry**: Social login options + Email/Phone
2. **Login**: Email or Phone input with validation
3. **OTP Verification**: 6-digit code input with auto-focus
4. **Profile Setup**: Name, Country, City, Role

## Onboarding Flow

1. **Welcome**: Personalized greeting
2. **Goals**: Multi-select goal cards
3. **Location**: Request location permission
4. **Notifications**: Request notification permission
5. **Done**: Completion screen → Dashboard

## License

MIT
