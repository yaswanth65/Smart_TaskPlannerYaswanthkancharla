# Deployment helpers

Quick steps to commit, push and deploy the application.

1. Commit changes locally

```bash
git checkout -b feature/containerize
git add .
git commit -m "chore: add ideas/templates API, Dockerfile and deploy helpers"
git push --set-upstream origin feature/containerize
```

2. Merge to main (pull request)

Open a PR on GitHub and merge into `main` when ready. The GitHub Actions workflow will build and push a Docker image to GitHub Container Registry (GHCR) for each push to `main`.

3. Deploy to Render using Docker

- Create a new Web Service in Render and choose "Docker" as the service type.
- Connect your GitHub repo and provide the `render.yaml` or set Dockerfile path to the repo root.
- Set the environment variables in Render: `MONGODB_URI`, `GOOGLE_API_KEY`, (optionally `PORT` = 5000).

Alternative: Push image from your machine

```bash
docker build -t smart-taskplanner:latest .
docker tag smart-taskplanner:latest ghcr.io/<your-org>/<repo>:latest
docker push ghcr.io/<your-org>/<repo>:latest
```

Then use that image in any container platform (Render, ECS, etc.).
