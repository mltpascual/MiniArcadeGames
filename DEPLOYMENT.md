# Deployment Guide — Mini Games Arcade

This document covers deploying the Pixel Playground mini games arcade to Vercel via GitHub.

## Prerequisites

Before deploying, ensure you have the following ready:

- A GitHub account with a repository for this project
- A Vercel account linked to your GitHub
- A MySQL / TiDB database accessible from the internet (with SSL enabled)
- Manus OAuth credentials (if using authentication features)

## Architecture Overview

The application is a **fullstack monorepo** consisting of:

| Component | Technology | Build Output |
|-----------|-----------|-------------|
| Frontend | React 19 + Vite + Tailwind CSS 4 | `dist/public/` (static assets) |
| Backend | Express 4 + tRPC 11 | `dist/index.js` (Node.js serverless function) |
| Database | Drizzle ORM + MySQL/TiDB | Remote database via `DATABASE_URL` |

The build command (`pnpm run build`) produces both the frontend static assets and the bundled server entry point in the `dist/` directory.

## Environment Variables

All environment variables must be configured in the Vercel dashboard under **Settings > Environment Variables**. The following table lists every required and optional variable.

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL/TiDB connection string with SSL. Format: `mysql://user:pass@host:port/db?ssl={"rejectUnauthorized":true}` |
| `JWT_SECRET` | Secret key for signing JWT session cookies. Use a random 32+ character string. |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL (e.g., `https://api.manus.im`) |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL (e.g., `https://manus.im/login`) |
| `OWNER_OPEN_ID` | Owner's Manus open ID |
| `OWNER_NAME` | Owner's display name |
| `BUILT_IN_FORGE_API_URL` | Server-side Forge API URL |
| `BUILT_IN_FORGE_API_KEY` | Server-side Forge API bearer token |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend Forge API bearer token |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend Forge API URL |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `VITE_APP_TITLE` | Application title (defaults to "Mini Games Arcade") |
| `VITE_APP_LOGO` | URL to a custom logo image |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint URL |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID |
| `NODE_ENV` | Set to `production` automatically by Vercel |

## Step-by-Step Deployment

### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit — Pixel Playground mini games arcade"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/mini-games-arcade.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** and select your `mini-games-arcade` repo
3. Vercel will auto-detect the configuration from `vercel.json`

### 3. Configure Build Settings

The `vercel.json` file already configures the build, but verify these settings in the Vercel dashboard:

| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Build Command | `pnpm run build` |
| Install Command | `pnpm install` |
| Output Directory | `dist` |
| Node.js Version | 22.x |

### 4. Add Environment Variables

In the Vercel dashboard, go to **Settings > Environment Variables** and add all required variables listed above. Make sure to enable them for **Production**, **Preview**, and **Development** environments as needed.

### 5. Deploy

Click **Deploy**. Vercel will:
1. Install dependencies with `pnpm install`
2. Run `pnpm run build` which builds both the Vite frontend and esbuild server bundle
3. Deploy the Express server as a serverless function
4. Serve static assets from `dist/public/`

### 6. Run Database Migrations

After the first deployment, you need to push the database schema. You can do this locally:

```bash
# Set DATABASE_URL to your production database
export DATABASE_URL="mysql://..."

# Push schema
pnpm db:push
```

## Vercel Configuration Details

The `vercel.json` file configures two routing rules:

1. **Static assets** (`/assets/*`) are served directly from the Vite build output
2. **All other routes** are handled by the Express server (`dist/index.js`), which serves both the tRPC API (`/api/trpc/*`) and the SPA fallback for client-side routing

## Troubleshooting

### Build Fails with TypeScript Errors

Run `pnpm check` locally to identify and fix TypeScript errors before pushing.

### Database Connection Issues

Ensure your `DATABASE_URL` includes SSL parameters and that the database is accessible from Vercel's IP ranges. TiDB Cloud and PlanetScale work well with Vercel.

### OAuth Callback Not Working

The OAuth flow uses `window.location.origin` to construct redirect URLs dynamically. Ensure your Manus OAuth application has the Vercel deployment URL added as an allowed redirect origin.

### Cold Start Latency

The Express server runs as a Vercel serverless function. First requests after idle periods may experience cold start latency of 1-3 seconds. This is normal for serverless deployments.
