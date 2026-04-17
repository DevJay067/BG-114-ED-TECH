# 🧠 StudyPro Backend — Intelligent Full-Stack Engine

This is the high-performance backend infrastructure for **StudyPro**, architected for real-time progress tracking, automated study evaluation, and secure data persistence.

---

## 🚀 Built With
- **Node.js & Express**: High-concurrency REST framework.
- **Firebase Admin SDK**: For robust Identity Management and Firestore document scaling.
- **Middleware-First Architecture**: Secure-by-default routing with automated token verification.

## 🤖 Development & Credits
This system was developed with a collaborative AI workflow:
- **Claude**: Architectural guidance, algorithmic design, and logic optimization.
- **Antigravity**: Rapid execution, Firebase wiring, and end-to-end full-stack integration.

---

## 📡 API Reference

All protected endpoints require `Authorization: Bearer <ID_TOKEN>`.

### 🔐 Authentication (`/api/auth`)
- `POST /register`: Syncs new Firebase users with Firestore document models.
- `GET /me`: Retrieves the current authenticated user's full profile state.

### 🎯 Goals & Tasks (`/api/goals`)
- `GET /`: Lists all user goals.
- `POST /`: Creates a new goal.
- `PATCH /:id`: Toggles completion status.
- `DELETE /:id`: Removes a goal.

### 📅 Study Planner (`/api/sessions`)
- `GET /`: Retrieves study history.
- `POST /`: Logs a new session (auto-updates `totalHours` and `streak`).
- `DELETE /:id`: Removes a session and reverts profile metrics.

### 🧪 Practice Zone (`/api/practice`)
- **`POST /`**: Submits a study responsive for automated evaluation.
- **`GET /history`**: Returns the last 10 evaluation reports.
- *Heuristic Analysis*: Analyzes keywords, structure, and effort per subject to provide scores and growth feedback.

### 📊 Intelligence Dashboard (`/api/dashboard`)
- `GET /`: Aggregates stats from 5 different collections in parallel for a 0ms-latency feel.

---

## 🛠️ Setup & Deployment

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Configuration**:
   Create a `.env` file from the provided `.env.example`:
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=bg-114
   CLIENT_URL=http://localhost:5500
   ```
3. **Firebase Credentials**:
   Place your `serviceAccountKey.json` from the Firebase Console into the root of this folder.
4. **Launch**:
   ```bash
   npm start # or npm run dev for nodemon
   ```

---

## ⚠️ Troubleshooting Auth
If you receive `auth/invalid-credential`:
1. Ensure **Email/Password** is enabled in Firebase Console.
2. Check that the `FIREBASE_PROJECT_ID` in `.env` matches your `firebase-config.js`.
3. Verify the API Key is not restricted to specific domains.

---
*Developed for the ByteFordge ecosystem.*
