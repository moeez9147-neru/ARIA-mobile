# ARIA Mobile — AI Research & Intelligence Assistant

A React Native mobile app that generates AI-powered business intelligence reports in under 30 seconds.

## Screenshots
Login | Home | Report | Saved Reports

## Features
- AI-generated market research reports
- Market analysis, competitor landscape, target audience, content strategy
- Offline cache — last 5 reports available without internet
- JWT authentication with secure token storage
- Obsidian Intelligence dark theme

## Tech Stack
- React Native + Expo SDK 54
- Expo Router (file-based navigation)
- Expo SecureStore (JWT token storage)
- AsyncStorage (offline cache — last 5 reports)
- Playfair Display + Outfit (Google Fonts)

## Getting Started

### Prerequisites
- Node.js v18+
- Expo Go app on your phone

### Installation
```bash
git clone https://github.com/YOUR_USERNAME/ARIA-mobile
cd ARIA-mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## API
Backend: https://aria-backend-4l05.onrender.com

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/reports/generate | Generate AI report |
| GET | /api/reports | Get saved reports |

## Project Structure
```
ARIA-mobile/
├── app/
│   ├── login.tsx
│   ├── register.tsx
│   ├── home.tsx
│   ├── report.tsx
│   └── saved.tsx
├── config/
│   ├── api.js
│   └── theme.ts
└── hooks/
    └── useOfflineReports.ts
```

## Team
Built by Moeez — Mobile App Developer
Sprint: March 18–28, 2026 | ARIA — NeuraFlux

In the README find:
```
neurafluxx