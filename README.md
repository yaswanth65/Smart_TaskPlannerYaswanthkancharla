# Goal Breakdown — Fullstack repository

This repository contains a small fullstack app for breaking down goals into plans.
Demo: https://drive.google.com/file/d/1vzHM9ZXDJhVZp6mzfyPKbeUZjyKfBvUb/view
Structure

- backend/: Express + MongoDB backend
- frontend/: Vite + React frontend

Prerequisites

- Node.js (16+ recommended)
- npm or yarn
- MongoDB if you want to run persistence (or set MONGODB_URI)

Run the backend

1. Open a terminal and change to the backend folder:

```bash
cd backend
```

2. Install dependencies and start the server:

```bash
npm install
npm run dev   # uses nodemon for development
# or
npm start     # runs node src/index.js
```

The backend listens on PORT (default 5000) and exposes endpoints under /api.

Run the frontend

1. Open a terminal and change to the frontend folder:

```bash
cd frontend
```

2. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

By default Vite starts on http://localhost:5173 (or another free port). Configure the frontend to talk to the backend by setting the appropriate API base URL in the client code or using a proxy in Vite config.

Create a new GitHub repository and push

1. At the repository root (this folder), initialize git, add files, and commit:

```bash
git init
git add .
git commit -m "Initial commit: add frontend and backend"
```

2. Create a remote repository on GitHub (via website or gh cli), then push:

```bash
git remote add origin <git-remote-url>
git branch -M main
git push -u origin main
```

Notes

- The repository includes a root `.gitignore` which ignores node_modules, .env files, build artifacts, and common OS/IDE files. Modify it if you need to track additional files.
- For production deployment, build the frontend (`npm run build`) and serve the static output with a static host or from the backend.

Questions or help
If you want, I can also:

- Add a GitHub Actions workflow to run lint/tests and build the frontend
- Add a one-command root script to install both frontend/backend deps
- Configure CORS or a Vite proxy for local development
