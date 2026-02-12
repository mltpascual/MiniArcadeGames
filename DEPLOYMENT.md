# Deployment Guide — Pixel Playground

Pixel Playground is a **fully client-side static SPA**. No server, database, or environment variables are required. All game data (scores, achievements, favorites, settings) is stored in the browser's localStorage.

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git add -A && git commit -m "deploy" && git push origin main
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. Vercel will auto-detect the Vite framework from `vercel.json`.
3. No environment variables are needed — click **Deploy**.

### 3. Configuration

The included `vercel.json` handles everything:

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

The `rewrites` rule ensures client-side routing works for all paths (SPA fallback).

---

## Other Static Hosts

### Netlify

Create a `_redirects` file in `client/public/`:

```
/*    /index.html   200
```

Then set:
- **Build command:** `pnpm run build`
- **Publish directory:** `dist`

### GitHub Pages

Use the [vite-plugin-gh-pages](https://www.npmjs.com/package/vite-plugin-gh-pages) or deploy the `dist/` folder manually.

### Any Static Host

1. Run `pnpm run build`
2. Upload the `dist/` folder
3. Configure SPA fallback (redirect all routes to `index.html`)

---

## Local Preview

```bash
pnpm install
pnpm run build
pnpm run preview
```

The preview server runs at `http://localhost:4173`.

---

## Notes

- **No server required** — This is a pure client-side app. No Node.js runtime needed in production.
- **No database** — All data is stored in localStorage. Clearing browser data will reset scores and achievements.
- **No API keys** — No external services or secrets are required.
- **SPA routing** — The app uses client-side routing (wouter). Your host must serve `index.html` for all paths.
