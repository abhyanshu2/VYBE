# Firebase Setup (sirf ye 4 kaam tumhe karne hain)

Code, `firebase.js`, `.gitignore`, `vercel.json` aur `firestore.rules` pehle se bane hue hain.

## 1. Firebase project
1. https://console.firebase.google.com par jao, **Create a project**, naam `vybe`.
2. Project home par **</> (Web)** icon dabao, nickname `vybe-web`, **Hosting mat chuno**, Register app.
3. Jo `firebaseConfig` dikhe use copy karo.

## 2. .env file
1. `.env.example` ko copy karke `.env` naam do (project root mein).
2. Config ki values bharo:

   apiKey -> VITE_FIREBASE_API_KEY
   authDomain -> VITE_FIREBASE_AUTH_DOMAIN
   projectId -> VITE_FIREBASE_PROJECT_ID
   storageBucket -> VITE_FIREBASE_STORAGE_BUCKET
   messagingSenderId -> VITE_FIREBASE_MESSAGING_SENDER_ID
   appId -> VITE_FIREBASE_APP_ID

   Quotes ya spaces mat lagana.

## 3. Console mein enable karo
- Build > Authentication > Get started > Sign-in method: **Email/Password** aur **Google** Enable.
- Build > Firestore Database > Create database > location `asia-south1 (Mumbai)`, **test mode**.
- Phase 3 ke baad Firestore > Rules mein `firestore.rules` ka content paste karke Publish karna.

## 4. Chalao aur check karo
    npm install
    npm run dev

Browser mein F12 > Console. `Firebase connected: [DEFAULT] firestore` dikhe to Phase 2 pass.
`.env` badalne ke baad `npm run dev` restart karo.

## Deploy (baad mein)
GitHub pe push karo, Vercel mein import karo, aur Vercel > Settings > Environment Variables mein
wahi 6 VITE_FIREBASE_* values daalo. `.env` GitHub par kabhi mat daalna (.gitignore ne block kar rakha hai).
