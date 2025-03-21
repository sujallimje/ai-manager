// manager/src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOTGIY0_rWmJbHIO1xjrEdykyoFA-zYf4",
  authDomain: "manager-548e4.firebaseapp.com",
  projectId: "manager-548e4",
  storageBucket: "manager-548e4.firebasestorage.app",
  messagingSenderId: "742493883629",
  appId: "1:742493883629:web:fdb764b3d910f89203d0e4",
  measurementId: "G-B2N7N78K1D"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    // Analytics might fail in some environments like SSR
    console.error("Analytics initialization error:", error);
  }
}

export { app, auth, analytics };