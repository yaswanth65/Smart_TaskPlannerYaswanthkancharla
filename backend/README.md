# Goal Breakdown Backend

Lightweight Express + Mongoose backend for generating goal breakdown plans using Google Gemini.
Demonstration:
https://drive.google.com/file/d/1vzHM9ZXDJhVZp6mzfyPKbeUZjyKfBvUb/view
Quick start

1. Copy `.env.example` to `.env` and fill values. This backend uses Google Generative Language (Gemini).

- Set `GOOGLE_API_KEY` to your API key and optionally `GOOGLE_MODEL` (e.g. `models/gemini-2.5-flash`).

2. Install dependencies:

```bash
cd backend
npm install
```

3. Start the server (development):

```bash
npm run dev
```

API
The AI integration uses Google Generative Language (Gemini). Set `GOOGLE_API_KEY` in your `.env`.

If the `GOOGLE_API_KEY` is missing or an error occurs, a mock plan is returned to enable local development.

- POST /api/generate-plan
  - Body: { goal: string, save?: boolean }
  - Response: { status, message, data: { plan, saved } }

Example curl (replace API host and key as needed):

```bash
curl -X POST http://localhost:5000/api/generate-plan \
  -H "Content-Type: application/json" \
  -d '{"goal":"Launch a one-page marketing site in 3 days"}'
```

Notes

- The AI integration uses the Google Generative Language API (Gemini). If the API key is missing or an error occurs, a mock plan is returned to enable local development.

Docker & Deployment

This repository includes a multi-stage Dockerfile that builds the frontend and packages it together with the backend. It is suitable for deploying to Render or other container platforms.

Build locally:

```bash
docker build -t smart-taskplanner:latest .
```

Run the container (example):

```bash
docker run -e MONGODB_URI='mongodb://host:27017/goalplanner' -e GOOGLE_API_KEY='your_key' -p 5000:5000 smart-taskplanner:latest
```

Render notes:

- Create a new Web Service in Render and select "Docker" as the environment.
- Provide environment variables: `MONGODB_URI`, `GOOGLE_API_KEY`, `PORT` (optional).
- The Dockerfile exposes port 5000 by default.

If you prefer to build the frontend separately, set `FRONTEND_BUILD_DIR` environment variable to point to the frontend build directory inside the container.
