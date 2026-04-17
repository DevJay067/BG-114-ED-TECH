# 📚 StudyPro Backend — Setup Guide

## Prerequisites
- Node.js 18+
- A Firebase project (free Spark plan works)

---

## Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `studypro`)
3. Disable Google Analytics (optional) → **Create project**

---

## Step 2 — Enable Firebase Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** provider → **Save**
4. *(Optional)* Enable **Google** provider for OAuth

---

## Step 3 — Enable Firestore Database

1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select a region (e.g. `asia-south1` for India) → **Done**

---

## Step 4 — Create Required Firestore Indexes

Some queries use compound filters (`where` + `orderBy`) which require composite indexes.

Go to **Firestore Database** → **Indexes** → **Add index** for each:

| Collection    | Field 1  | Field 2     | Query scope |
|---------------|----------|-------------|-------------|
| `goals`       | `userId` (Asc) | `createdAt` (Desc) | Collection |
| `sessions`    | `userId` (Asc) | `date` (Desc)      | Collection |
| `notifications` | `userId` (Asc) | `createdAt` (Desc) | Collection |
| `notifications` | `userId` (Asc) | `read` (Asc) + `createdAt` (Asc) | Collection |

> **Tip**: When you first run the server and make a request, Firebase will log a URL to auto-create each missing index. Click those URLs for one-click index creation.

---

## Step 5 — Get Backend Credentials (Service Account)

1. Firebase Console → **Project Settings** (gear icon) → **Service accounts** tab
2. Click **Generate new private key** → **Generate key**
3. Copy the downloaded `serviceAccountKey.json` file into the `server/` folder

> ⚠️ **NEVER commit `serviceAccountKey.json` to git** — it's already in `.gitignore`

---

## Step 6 — Configure Backend Environment

```bash
cd server
copy .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
CLIENT_URL=http://localhost:5500
```

---

## Step 7 — Get Frontend Firebase Config

1. Firebase Console → **Project Settings** → **Your apps** section
2. Click **Add app** → Choose **Web** (`</>`)
3. Register app (name: `StudyPro Web`) → copy the `firebaseConfig` object

Edit `firebase-config.js` in the project root and paste your config:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};
```

---

## Step 8 — Start the Backend

```bash
cd server
npm run dev
```

You should see:
```
┌─────────────────────────────────────────────┐
│           📚 StudyPro Backend                │
├─────────────────────────────────────────────┤
│  Server running on  → http://localhost:5000  │
│  Health check       → /api/health           │
└─────────────────────────────────────────────┘
```

Verify it's running:
```
http://localhost:5000/api/health
```

---

## Step 9 — Open the Frontend

Open `index.html` directly in a browser (or use Live Server extension in VS Code on port 5500).

1. **Register** a new account → check Firebase Auth console for the new user
2. **Add a goal** → check Firestore `goals` collection
3. **Log a study session** → check Firestore `sessions` collection
4. **Refresh the page** → all data should persist 🎉

---

## Project Structure

```
ByteFordge/
├── index.html              ← Frontend entry
├── script.js               ← Frontend logic + API client
├── style.css               ← Styles
├── firebase-config.js      ← Firebase client config (fill this in)
└── server/
    ├── .env                ← Backend env vars (create from .env.example)
    ├── .env.example        ← Template
    ├── serviceAccountKey.json  ← Firebase admin key (download from console)
    ├── package.json
    └── src/
        ├── server.js       ← Entry point
        ├── app.js          ← Express app
        ├── firebase.js     ← Firebase Admin SDK
        ├── middleware/
        │   └── auth.js     ← Token verification
        ├── controllers/    ← Business logic (7 modules)
        └── routes/         ← API route definitions (7 modules)
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✅ | Sync Firebase user to Firestore |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| GET | `/api/dashboard` | ✅ | Aggregated stats + weekly chart data |
| GET | `/api/goals` | ✅ | List all goals |
| POST | `/api/goals` | ✅ | Create goal |
| PATCH | `/api/goals/:id` | ✅ | Toggle done / update text |
| DELETE | `/api/goals/:id` | ✅ | Delete goal |
| GET | `/api/sessions` | ✅ | List study sessions |
| POST | `/api/sessions` | ✅ | Log a session |
| DELETE | `/api/sessions/:id` | ✅ | Remove session |
| GET | `/api/progress` | ✅ | Get subject scores |
| PATCH | `/api/progress/:subject` | ✅ | Update subject score |
| PUT | `/api/progress` | ✅ | Replace all scores |
| GET | `/api/notifications` | ✅ | Get notifications |
| PATCH | `/api/notifications/read-all` | ✅ | Mark all read |
| PATCH | `/api/notifications/:id` | ✅ | Mark one read |
| PATCH | `/api/profile` | ✅ | Update profile |
| PATCH | `/api/profile/streak` | ✅ | Increment/reset streak |

All protected endpoints require: `Authorization: Bearer <Firebase ID Token>`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Firebase: No valid credentials found` | Place `serviceAccountKey.json` in `server/` folder |
| `CORS error` in browser | Check `CLIENT_URL` in `.env` matches your frontend URL |
| `Firestore index required` error | Click the URL in the error message to auto-create the index |
| `auth/user-not-found` on login | User doesn't exist — register first |
| Backend not connecting | Make sure server is running on port 5000 |
