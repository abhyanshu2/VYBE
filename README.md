VYBE — Developer Social Platform

VYBE is a developer-focused social platform concept where users can share posts, code snippets, and images, discover other developers, interact with content, and communicate through a modern social-style interface.

Project status: The repository includes the core React interface and Firebase integration. Complete setup and test the Firebase configuration before deploying. Some features may depend on backend configuration and the current implementation.

Features

Home feed to view posts from the community.

Posts and code snippets for sharing developer updates and code.

Image posts with image-upload integration.

Likes and comments on posts.

Save posts for later.

Explore page for discovering content.

User profiles and profile editing.

Follow system for connecting with other users.

Notifications for relevant activity.

Messaging UI for conversations.

Responsive interface with a modern indigo-themed design.

Firebase integration for authentication and Firestore-backed data.

Light/dark mode styling support where implemented.

Tech Stack

React 18 — UI components

Vite 5 — development server and build tooling

React Router 6 — client-side routing

Firebase 10 — Authentication and Cloud Firestore integration

Tailwind CSS 4 — styling utilities

JavaScript (ES Modules) — application logic

Getting Started

Prerequisites

Node.js (LTS recommended)

npm

A Firebase project for backend features

1. Install dependencies

Clone or download this repository, open a terminal in the project folder, then run:

npm install

2. Configure Firebase environment variables

Copy .env.example to .env in the project root and add your Firebase web-app configuration values:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

Use the actual values from your Firebase Console. Do not commit your real .env file or private credentials to GitHub.

See SETUP.md for the project-specific Firebase setup steps.

3. Enable Firebase services

In Firebase Console:

Create or select your Firebase project and register a web app.

Enable the sign-in methods required by the app (Email/Password and Google, if used by your build).

Create a Cloud Firestore database.

Review and publish appropriate Firestore security rules before using real accounts or deploying publicly.

The repository includes firestore.rules; review the rules and configure them for your intended access model before production use.

4. Start the development server

npm run dev

Open the local URL printed in the terminal (Vite commonly uses http://localhost:5173).

Available Scripts

Command

Description

npm run dev

Start the local development server

npm run build

Create an optimized production build

npm run preview

Preview the production build locally

Project Structure

vybe/
├── public/                 # Static assets, if present
├── src/
│   ├── components/         # Reusable UI components
│   ├── context/            # Authentication, posts, messages and app state
│   ├── pages/              # Main application pages
│   ├── App.jsx              # App layout and routes
│   ├── cloudinary.js        # Image-upload integration
│   ├── data.js              # App data and helper functions
│   ├── firebase.js          # Firebase initialization
│   ├── index.css            # Global styles
│   ├── main.jsx             # React entry point
│   ├── notify.js             # Notification helpers
│   └── time.js               # Time-formatting helpers
├── .env.example             # Environment-variable template
├── firestore.rules          # Firestore security rules
├── index.html
├── package.json
├── SETUP.md                 # Firebase setup guide
└── vite.config.js

Image Upload Configuration

The project contains a Cloudinary integration in src/cloudinary.js. If image uploads require Cloudinary credentials or upload-preset configuration, set those up in Cloudinary and follow the configuration expected by that file. Never place private API secrets in client-side code; use an appropriately restricted unsigned upload preset or a secure server-side upload flow.

Deployment

VYBE can be deployed to a static hosting provider that supports Vite builds, such as Vercel or Netlify.

Push the project to GitHub.

Import the repository into your hosting provider.

Set the build command to npm run build.

Set the output directory to dist.

Add the required VITE_FIREBASE_* environment variables in the hosting provider's project settings.

Deploy and test authentication, Firestore access, posts, uploads, and other enabled features.

Important Security Notes

Never upload .env or expose private credentials in your public repository.

Firebase web configuration values are used by client apps, but access must be protected with Firebase Authentication, correctly configured Firestore rules, and any required provider restrictions.

Do not use Firestore test mode for a production app.

Test all user-generated content and access rules before inviting real users.

Current Scope

The codebase includes UI and context modules for feed posts, likes, comments, saved posts, profiles, follows, notifications, and messages. Actual availability depends on Firebase setup, security rules, and whether each flow is fully connected in the current version. Verify each feature in a configured environment before presenting it as production-ready.

License

No project license was identified in the provided files. Add a LICENSE file if you want to specify how others may use, modify, or distribute this project.
