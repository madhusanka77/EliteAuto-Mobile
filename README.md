Overview
EliteAuto Mobile is a mobile companion application for the EliteAuto AI-Powered Dealership Management System. Built with React Native, Expo, and TypeScript, it brings vehicle inventory, AI-assisted interactions, vehicle price predictions, and customer lead insights into a mobile interface.

The project explores how mobile development, artificial intelligence, and predictive analytics can support everyday dealership operations and data-driven decision-making.
Key Features
- Dashboard — Central entry point for dealership tools.
- Vehicle Inventory — Browse available vehicles.
- Vehicle Details — Access individual vehicle information.
- AI Chat — Interact with AI-assisted dealership tools through a conversational interface.
- Price Prediction — Access vehicle market price estimation functionality.
- Hot Leads — View potential customer leads to support sales prioritization.
Tech Stack
Category	Technologies
Mobile development	React Native, Expo
Programming language	TypeScript
Navigation	Expo Router
Styling configuration	CSS / Tailwind CSS configuration
Package management	npm
Version control	Git, GitHub


Related EliteAuto System
The broader EliteAuto dealership management system uses Java, Spring Boot, React, MySQL, Python, Flask, Pandas, Scikit-learn, Random Forest Regression, and Google Gemini. These technologies support its backend, predictive analytics, and generative AI capabilities; they are not all direct dependencies of this mobile repository.

Project Structure
EliteAutoMobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── two.tsx
│   ├── _layout.tsx
│   ├── +html.tsx
│   ├── +not-found.tsx
│   ├── ai-chat.tsx
│   ├── hot-leads.tsx
│   ├── modal.tsx
│   ├── price-prediction.tsx
│   ├── vehicle-details.tsx
│   └── vehicles.tsx
├── assets/
├── components/
├── constants/
├── app.json
├── babel.config.js
├── package.json
├── package-lock.json
├── tailwind.config.js
├── tsconfig.json
└── README.md

Getting Started
Prerequisites
- Node.js and npm
- Expo Go on a compatible mobile device, or an Android/iOS emulator
- Git
- Access to the relevant EliteAuto backend services for features that require them

Installation
1. Clone the repository:
git clone https://github.com/madhusanka77/EliteAuto-Mobile.git
cd EliteAuto-Mobile

Install the dependencies:
npm install

Configure the backend service URLs where required by the application. Keep private API keys and credentials on the server; do not embed them in the mobile app.

Start the Expo development server:

npx expo start

1. Scan the QR code with Expo Go if compatible, or use an emulator. If the project requires native modules unsupported by Expo Go, use an appropriate development build instead.
Project Objectives
- Make dealership tools accessible through a mobile interface.
- Explore AI-assisted interactions and predictive analytics in mobile applications.
- Support vehicle information management and customer lead prioritization.
- Apply React Native, TypeScript, and file-based navigation in a practical software project.
Author
S. Pathum Madhusanka

Information Technology Undergraduate at SLIIT
