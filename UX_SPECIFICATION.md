# UX Specification

This document outlines the user experience, user flows, interaction logic, and UI structure of the application.

## 1. Screens, Routes, and Layouts

### High-Level Navigation Structure

The application is divided into three primary navigation stacks, managed by `expo-router`:

- **Authentication Flow:** Handles user sign-up and login.
- **Onboarding Flow:** A sequence of screens shown to new users after their first login.
- **Main Application (Tabs):** The core of the application, featuring a tab-based navigation system.

### Screen Inventory

#### Authentication Flow (`/app/(auth)`)

- **Layout:** `(auth)/_layout.tsx` - Defines a stack navigator for the authentication screens.
- **Screens:**
  - `/` (`index.tsx`): The initial authentication screen, offering social login (Google, Apple), phone, and email sign-up options. Also links to the sign-in screen.
  - `/login` (`login.tsx`): Screen for existing users to sign in.
  - `/otp` (`otp.tsx`): Screen for one-time password verification, likely used for phone-based authentication.
  - `/profile` (`profile.tsx`): A screen for new users to set up their profile information after sign-up.

#### Onboarding Flow (`/app/(onboarding)`)

- **Layout:** `(onboarding)/_layout.tsx` - Defines a stack navigator for the onboarding sequence.
- **Screens:**
  - `/welcome` (`welcome.tsx`): A welcome screen for new users.
  - `/goals` (`goals.tsx`): A screen for users to select their goals or interests within the app.
  - `/location` (`location.tsx`): A screen to request and set the user's location.
  - `/notifications` (`notifications.tsx`): A screen to request push notification permissions.
  - `/done` (`done.tsx`): The final screen of the onboarding flow, which likely navigates the user to the main application.

#### Main Application (`/app/(tabs)`)

- **Layout:** `(tabs)/_layout.tsx` - Defines a tab navigator for the core application features.
- **Tabs:**
  - `/home` (`home.tsx`): The main landing screen or dashboard of the app.
  - `/chat` (`chat.tsx`): The main screen for chat and messaging features.
  - **Explore (Modal Trigger):** A central tab button that does not navigate to a screen but instead opens a modal with a grid of options.
  - `/community` (`community.tsx`): A screen for community-related features.
  - `/profile` (`profile.tsx`): The user's profile screen.

#### Explore Modal & Feature Screens

The "Explore" modal, triggered from the tab bar, provides navigation to various feature modules. Each of these modules is a stack of screens located in the `frontend/app/` directory:

- `/jobs`: Job-related features.
- `/rooms`: Room or housing-related features.
- `/rides`: Ride-sharing features.
- `/expenses`: Expense tracking features.
- `/splitly`: A feature for splitting expenses.
- `/qa`: A question-and-answer forum.
- `/uscis`: Features related to USCIS case tracking.
- `/immigration`: Immigration news and resources.
- `/utilities`: Utility-related features.
- `/admin`: Administrative features.

## 2. User Flows and Interaction Logic

### User Journeys

#### New User Onboarding Flow

1.  **Start:** User opens the app for the first time.
2.  **Authentication:**
    - User is presented with the auth screen (`/auth`).
    - User chooses a sign-up method (e.g., Google, Apple, Email, Phone).
    - Upon successful sign-up and verification (e.g., OTP), the user is redirected to the onboarding flow.
3.  **Onboarding Sequence:**
    - `welcome`: Displays a welcome message.
    - `goals`: User selects their interests.
    - `location`: User is prompted to grant location permissions.
    - `notifications`: User is prompted to grant notification permissions.
    - `done`: A confirmation screen is shown.
4.  **End:** User is navigated to the main application's home screen (`/tabs/home`).

#### Existing User Login Flow

1.  **Start:** User opens the app.
2.  **Authentication:**
    - User is on the auth screen (`/auth`).
    - User taps the "Sign in" link.
    - User is navigated to the login screen (`/auth/login`).
    - User enters their credentials and logs in.
3.  **End:** User is navigated to the main application's home screen (`/tabs/home`).

#### Accessing Features via Explore Modal

1.  **Start:** User is on any screen within the main tabbed interface.
2.  **Open Modal:** User taps the central "Explore" button in the tab bar.
3.  **Interaction:** A modal slides up from the bottom, displaying a grid of feature icons (e.g., Jobs, Rooms, Rides).
4.  **Navigate:** User taps on a feature icon.
5.  **End:** The modal closes, and the user is navigated to the corresponding feature's main screen (e.g., `/jobs`).

### Interaction Matrix

| Element                 | Action       | Response                                                                 | Notes                                    |
| ----------------------- | ------------ | ------------------------------------------------------------------------ | ---------------------------------------- |
| **Social Login Button** | Tap          | Initiates the respective social sign-in flow (Google/Apple).             | Haptic feedback is triggered.            |
| **Email Sign-up Button**| Tap          | Navigates to the email sign-up screen.                                   | Haptic feedback is triggered.            |
| **Tab Bar Icon**        | Tap          | Navigates to the corresponding tab screen.                               |                                          |
| **Explore Tab Button**  | Tap          | Opens the "Explore Services" modal.                                      | Prevents default tab navigation.         |
| **Explore Modal Item**  | Tap          | Closes the modal and navigates to the selected feature screen.           |                                          |
| **Modal Overlay**       | Tap          | Closes the "Explore Services" modal.                                     |                                          |
| **Modal Close Button**  | Tap          | Closes the "Explore Services" modal.                                     |                                          |

## 3. Information Architecture

### Sitemap

```
/ (Root)
├── /auth
│   ├── /
│   ├── /login
│   ├── /otp
│   └── /profile
├── /onboarding
│   ├── /welcome
│   ├── /goals
│   ├── /location
│   ├── /notifications
│   └── /done
└── /tabs
    ├── /home
    ├── /chat
    ├── /community
    ├── /profile
    └── (Explore Modal) ->
        ├── /jobs
        ├── /rooms
        ├── /rides
        ├── /expenses
        ├── /splitly
        ├── /qa
        ├── /uscis
        ├── /immigration
        ├── /utilities
        └── /admin
```

### Navigation Hierarchy

1.  **Primary Navigation (Tab Bar):**
    - **Home:** The main dashboard.
    - **Chat:** Core communication feature.
    - **Community:** Social and community hub.
    - **Profile:** User account and settings.

2.  **Secondary Navigation (Explore Modal):**
    - The "Explore" modal acts as a launchpad for a wide range of secondary features that are not part of the primary tab navigation. This keeps the main tab bar clean and focused on the most critical user tasks.

3.  **Tertiary Navigation:**
    - Within each feature module (e.g., `/jobs`, `/rooms`), there will be a stack-based navigation to handle detail screens, forms, and other nested views.

## 4. Stitch-Ready UX System

### Design Tokens

#### Colors

- **Primary:** `#6366F1`
- **Accent:** `#F59E0B`
- **Success:** `#22C55E`
- **Error:** `#EF4444`
- **Background (Light):** `#F2F2F2`
- **Background (Dark):** `#111827`
- **Text (Primary):** `#111827`
- **Text (Secondary):** `#4B5563`
- **White:** `#FFFFFF`
- **Gray Scale:** A full range of gray shades is available, from `50` (`#F9FAFB`) to `900` (`#111827`).

#### Typography

- **Font Family:** `Inter`, `system-ui`, `sans-serif`
- **Hierarchy:** (To be defined, but we can assume a standard hierarchy based on font sizes and weights from Tailwind's defaults)
  - H1, H2, H3, Body, Caption, etc.

#### Spacing

- A standard 8-point grid system is likely in use, facilitated by Tailwind's spacing scale (e.g., `p-2` for 8px, `p-4` for 16px).

### Reusable Components

Based on the codebase, the following reusable components have been identified:

- **Buttons:**
  - `GluestackButton`: A customizable button component.
  - `SocialLoginButtons`: A component for rendering Google, Apple, and phone login buttons.
- **Icons:** A comprehensive set of SVG icons is available in `frontend/components/ui/Icons`.
- **Forms:**
  - Inputs (Text, Password, etc.)
  - Validation Rules
- **Modals:** A customizable modal component is used for the "Explore" feature.
- **Lists:**
  - List Items
  - Grids (used in the "Explore" modal)
- **State Indicators:**
  - Loading Spinners
  - Empty State Placeholders
  - Error Messages
- **Layout:**
  - `SafeAreaView` for handling screen notches.
  - `LinearGradient` for background gradients.

## 5. UX Modernization and Cleanup

### Recommendations

- **Consolidate the "Explore" Modal:** The "Explore" modal contains a large number of options, which could be overwhelming for users. Consider grouping related items or creating a more organized layout, such as a searchable list or a categorized grid.
- **Streamline the Onboarding Flow:** The onboarding process could be made more engaging and interactive. Instead of separate screens for each step, consider a more fluid, single-screen experience with animated transitions.
- **Improve Visual Hierarchy:** While the app has a consistent color palette, the typography and spacing could be refined to create a clearer visual hierarchy. Establishing a strict type scale and spacing system will improve readability and scannability.
- **Enhance Mobile-First Experience:** Ensure that all interactive elements are easily tappable and that the layout is optimized for one-handed use. Pay attention to the placement of primary actions and navigation controls.
- **Introduce Micro-interactions:** Adding subtle animations and transitions can make the user experience more delightful and provide valuable feedback. For example, animating the appearance of the "Explore" modal or providing haptic feedback on button taps.
- **Dark Mode Refinements:** Ensure that the dark mode color palette provides sufficient contrast and is comfortable to view in low-light environments.

## 6. Final Deliverables

This document serves as the primary deliverable, providing a comprehensive UX specification that can be used to reconstruct the application in Stitch. In addition to this document, the following assets will be prepared:

- **Wireframes:** Low-fidelity wireframes for each screen, illustrating the layout and placement of UI elements.
- **UX Flow Diagrams:** Visual diagrams illustrating the user journeys for the core application flows.
- **Component Library:** A collection of the reusable UI components, documented with their states and variations.

### Mapping: Existing Code → Extracted UX

| UX Element              | Corresponding Code File(s)                                    |
| ----------------------- | ------------------------------------------------------------- |
| **Authentication Flow** | `frontend/app/(auth)/`                                        |
| **Onboarding Flow**     | `frontend/app/(onboarding)/`                                  |
| **Tab Navigation**      | `frontend/app/(tabs)/_layout.tsx`                             |
| **Explore Modal**       | `frontend/app/(tabs)/_layout.tsx`                             |
| **Color Palette**       | `frontend/constants/colors.ts`                                |
| **Typography**          | `frontend/tailwind.config.js`                                 |
| **Reusable Components** | `frontend/components/`                                        |
