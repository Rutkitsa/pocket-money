# 🐷 קופת דמי הכיס — הוראות התקנה

## מה צריך?
- חשבון Google (בשביל Firebase)
- חשבון Netlify (בחינם)
- כ-15 דקות ⏱️

---

## שלב 1 — הגדרת Firebase (בסיס הנתונים)

1. היכנסי לכתובת: **https://console.firebase.google.com/**
2. לחצי על **"Add project"** (הוסף פרויקט)
3. שם הפרויקט: `pocket-money` (או כל שם אחר)
4. בטלי את Google Analytics → לחצי **Create project**

### יצירת בסיס הנתונים:
5. בתפריט השמאלי: **Build → Realtime Database**
6. לחצי **"Create Database"**
7. בחרי אזור: **United States (us-central1)**
8. בחרי **"Start in test mode"** → לחצי **Enable**

### קבלת פרטי ההתחברות:
9. לחצי על גלגל השיניים ⚙️ ליד "Project Overview"
10. לחצי **"Project settings"**
11. גללי למטה ל-**"Your apps"** → לחצי על סמל `</>`
12. שם האפליקציה: `pocket-money-web` → לחצי **Register app**
13. תראי קוד שנראה כך:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pocket-money-xxxxx.firebaseapp.com",
  databaseURL: "https://pocket-money-xxxxx-default-rtdb.firebaseio.com",
  projectId: "pocket-money-xxxxx",
  storageBucket: "pocket-money-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

14. **שמרי את הפרטים האלה** — תצטרכי אותם בשלב הבא!

---

## שלב 2 — עדכון קובץ הקוד

פתחי את הקובץ: `src/firebase.js`

החליפי את הערכים הבאים עם הפרטים שקיבלת מ-Firebase:

```js
const firebaseConfig = {
  apiKey:            "הכניסי את ה-apiKey שלך",
  authDomain:        "הכניסי את ה-authDomain שלך",
  databaseURL:       "הכניסי את ה-databaseURL שלך",   // ← חשוב במיוחד!
  projectId:         "הכניסי את ה-projectId שלך",
  storageBucket:     "הכניסי את ה-storageBucket שלך",
  messagingSenderId: "הכניסי את ה-messagingSenderId שלך",
  appId:             "הכניסי את ה-appId שלך",
};
```

---

## שלב 3 — העלאה ל-Netlify

### אפשרות א׳ — קלה יותר: Drag & Drop
1. בני את הפרויקט:
   ```
   npm install
   npm run build
   ```
   זה יצור תיקייה בשם `dist`

2. היכנסי לכתובת: **https://app.netlify.com/**
3. הירשמי עם חשבון Google שלך
4. גררי את תיקיית `dist` לתוך האתר

### אפשרות ב׳ — דרך GitHub (מומלץ לעדכונים עתידיים)
1. העלי את כל הקבצים ל-GitHub repository
2. ב-Netlify: **"Add new site" → "Import from Git"**
3. חברי ל-GitHub וסלקטי את ה-repository
4. הגדרות build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. לחצי **Deploy**

---

## שלב 4 — שמירה כקיצור דרך בטלפון

### אייפון (Safari):
1. פתחי את כתובת האתר ב-Safari
2. לחצי על כפתור השיתוף 📤
3. גללי ולחצי **"Add to Home Screen"**
4. שמרי כ-"קופת דמי הכיס"

### אנדרואיד (Chrome):
1. פתחי את כתובת האתר ב-Chrome
2. לחצי על שלוש הנקודות ⋮
3. לחצי **"Add to Home screen"**

---

## ✅ סיום!

האפליקציה תעבוד על כל מכשיר, תסתנכרן בזמן אמת, ותיראה כמו אפליקציה אמיתית על המסך הראשי!

---

## שאלות נפוצות

**שגיאה: "Firebase: Error (auth/..."**
ודאי שהעתקת את ה-databaseURL נכון (חייב להתחיל ב-`https://` ולהסתיים ב-`.firebaseio.com`)

**הנתונים לא מתעדכנים בין מכשירים**
בדקי ב-Firebase Console שה-Realtime Database פעיל ובמצב test mode

**שינוי שמות הילדים**
ערכי את הקובץ `src/App.jsx` ושני את USERS ו-KIDS בראש הקובץ
