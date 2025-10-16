# Multi-stage Dockerfile
# 1) Build the frontend
# 2) Install backend deps and copy frontend build

FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json frontend/
COPY frontend/ .
RUN npm ci --prefix ./ && npm run build --prefix ./

FROM node:18-alpine AS backend-build
WORKDIR /app
# Install backend deps
COPY backend/package*.json backend/
RUN npm ci --prefix ./backend

# Copy backend source
COPY backend/ ./backend
# Copy frontend build into backend for static serving
COPY --from=frontend-build /app/dist ./frontend/dist

WORKDIR /app/backend
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "src/index.js"]
