# AI-Powered Digital Asset Protection & Competitive Integrity Platform

Hackathon-ready prototype demonstrating dual protection: pre-publication sanitization and post-access monitoring using simple AI-assisted analysis (Gemini integration mocked if API key is missing) and Firestore for logs.

Structure:
- /backend: core handlers + Express dev server
- /api: Vercel-compatible serverless wrappers
- /frontend: React UI (Vite)

Quick start (dev):

1. Backend (local Express server)

```
cd backend
npm install
GEMINI_API_KEY=your_key FIREBASE_SERVICE_ACCOUNT='{}' npm start
```

2. Frontend

```
cd frontend
npm install
npm run dev
```

Notes:
- The project uses Firestore via `firebase-admin`. Provide service account JSON in the `FIREBASE_SERVICE_ACCOUNT` env var (stringified) or set `GOOGLE_APPLICATION_CREDENTIALS` to a credentials file path.
- Set `GEMINI_API_KEY` to enable real Gemini calls; otherwise the server returns mocked AI responses.
- Deploy frontend to Vercel and backend API files in `/api` are ready for Vercel serverless functions.

Goal: Demonstrate "We protect digital assets before sharing and monitor threats after access using AI-driven intelligence." Keep it simple and demo-ready.
# AI-Digital-Asset-Protection
AI-Powered Digital Asset Protection &amp; Competitive Integrity Platform for Sports Organizations
