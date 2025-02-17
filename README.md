# Twight Chat App

A cross-platform chat application built with React Native and Expo, featuring real-time messaging and modern UI.

## Features

- User authentication (email/password)
- Real-time messaging
- Modern and responsive UI
- Cross-platform (iOS and Android)
- Profile management with avatar support
- Push notifications for new messages

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account and project
- iOS Simulator (for iOS testing) or Android Emulator (for Android testing)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd twight-app
```

2. Install dependencies:

```bash
npm install
```

3. Configure Firebase:

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage
   - Copy your Firebase configuration from Project Settings
   - Update the configuration in `src/config/firebase.ts`

4. Start the development server:

```bash
npm start
```

5. Run on your device:
   - Install the Expo Go app on your device
   - Scan the QR code from the terminal
   - Or press 'i' for iOS simulator or 'a' for Android emulator

## Development

The project uses:

- React Native with Expo
- TypeScript for type safety
- NativeWind (Tailwind CSS) for styling
- Firebase for backend services
- React Navigation for routing

## Folder Structure

```
src/
  ├── components/     # Reusable components
  ├── config/        # Configuration files
  ├── contexts/      # React Context providers
  ├── screens/       # Screen components
  ├── types/         # TypeScript type definitions
  └── utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
