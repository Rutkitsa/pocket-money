// 🔧 הכנס כאן את פרטי ה-Firebase שלך
// ראה הוראות בקובץ README.md

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey:            "AIzaSyBMNDG8zdy1VMCn6ARHf2hp4xrEIWO5uD8",
  authDomain:        "pocket-money-d754e.firebaseapp.com",
  databaseURL:       "https://pocket-money-d754e-default-rtdb.firebaseio.com",
  projectId:         "pocket-money-d754e",
  storageBucket:     "pocket-money-d754e.firebasestorage.app",
  messagingSenderId: "164163551777",
  appId:             "1:164163551777:web:f609ae1fe4b0911cf61960",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
