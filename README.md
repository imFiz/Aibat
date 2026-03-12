<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Solana-14F195?style=for-the-badge&logo=solana&logoColor=white" alt="Solana" />

  # X-Booster (Aibat)
  **A Web3 Social Engagement Platform**
</div>

---

## 🚀 Overview
**X-Booster (Aibat)** is a gamified SocialFi application designed to boost social presence and connect the Web3 community. By engaging with other users, tracking daily streaks, and participating in follow-exchanges, users earn points (PTS), climb the ranks, and build their ultimate social network.

The platform integrates secure Firebase authentication (via X/Twitter) and seamlessly connects to Solana wallets (Phantom, Solflare, Saga/Seeker native), making it fully Web3-ready.

## ✨ Features
- **User Authentication:** Login effortlessly via X (Twitter) through Firebase Auth.
- **Web3 Wallet Connectivity:** Native support for Solana wallets (Phantom, Solflare) and mobile deep linking for Solana dApp environments (Solana Seeker).
- **Gamified Engagement:** 
  - Follow Exchange: Earn PTS for following mutual network members.
  - Daily Check-ins: Maintain streaks for exponential PTS bonuses.
  - Boost Options: Spend earned PTS to amplify your profile visibility.
- **Real-Time Data Sync:** Securely syncs scores, streaks, and engagement history to a Firebase Cloud Firestore backend.
- **Responsive UI/UX:** Built with React and designed for frictionless mobile and desktop experiences using modern styling and smooth animations.

## 🛠️ Tech Stack
- **Frontend Framework:** React 19 + Vite
- **Styling:** CSS utility classes (Tailwind-inspired) & Lucide Icons
- **Backend/BaaS:** Firebase (Authentication, Cloud Firestore)
- **Web3:** Native `window.solana` / `window.solflare` integration & deep linking
- **Language:** TypeScript

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- A Firebase project with Twitter/X Auth provider and Firestore database set up.

### 1. Clone the repository
```bash
git clone https://github.com/imFiz/Aibat.git
cd Aibat
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally
Start the Vite development server:
```bash
npm run dev
```

## 🏗️ Build for Production
To build the project for deployment:
```bash
npm run build
```
The optimized production build will be generated in the `dist` folder.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/imFiz/Aibat/issues) if you want to contribute.

## 📝 License
This project is proprietary. All rights reserved.
