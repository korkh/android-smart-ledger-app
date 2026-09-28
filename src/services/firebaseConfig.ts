import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// @ts-ignore - getReactNativePersistence доступен в React Native
import { getReactNativePersistence } from "firebase/auth";
import {
  initializeFirestore,
  memoryLocalCache,
  memoryLruGarbageCollector,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCya31UsogaPmeyHkDAXcA71fIwWApGapY",
  authDomain: "home-inventory-app-4ddb8.firebaseapp.com",
  projectId: "home-inventory-app-4ddb8",
  storageBucket: "home-inventory-app-4ddb8.firebasestorage.app",
  messagingSenderId: "852607424463",
  appId: "1:852607424463:web:51a16d2849340b1e9a24ba",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Authentication with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore with In-Memory cache for React Native environment
const db = initializeFirestore(app, {
  localCache: memoryLocalCache({
    garbageCollector: memoryLruGarbageCollector(),
  }),
});

// Initialize Cloud Storage
const storage = getStorage(app);

export { auth, db, storage };
