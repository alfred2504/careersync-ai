# CareerSync AI

CareerSync AI is a full-stack job board platform built with a React + Vite frontend and an Express + MongoDB backend. It supports job browsing, job details, applications, auth, admin job posting, and AI-powered CV analysis.

## Features

- Public job listings and job details
- Candidate and admin authentication
- Admin job posting and moderation
- CV analyzer / AI insights page
- Cover letter and job description AI helpers
- Responsive UI with light/dark mode

## Project Structure

- `client/` - React frontend
- `server/` - Express API and MongoDB models
- `api/` - Vercel serverless route handlers

## Local Development

### Prerequisites

- Node.js 24.x
- MongoDB connection string
- OpenAI API key for AI features

### Install Dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### Environment Variables

Create a `server/.env` file for the backend:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

Create a `client/.env` file for the frontend:

```env
VITE_API_URL=http://localhost:5000
```

If your frontend and backend are served from the same origin in production, you can omit `VITE_API_URL` and let the app fall back to `/api`.

### Run Locally

Start the backend:

```bash
npm run server
```

Start the frontend:

```bash
npm run client
```

Or run both together from the repo root:

```bash
npm run dev
```

## Build

```bash
npm run build
```

This builds the client and runs the server build step.

## Deployment

### Vercel

- Set the root project directory to the repository root.
- Add environment variables in Vercel Project Settings.
- Keep `MONGODB_URI`, `JWT_SECRET`, and `OPENAI_API_KEY` out of source control.

### Render or Docker

A `Dockerfile` is included for container-based deployment.

## API Overview

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `PUT /api/jobs/:id/status`
- `POST /api/ai/analyze-cv`

## Notes

- AI analysis uses OpenAI when configured, with a local fallback if the key is missing or quota is exceeded.
- Job and auth routes rely on MongoDB, so production deployments must have a valid `MONGODB_URI`.
