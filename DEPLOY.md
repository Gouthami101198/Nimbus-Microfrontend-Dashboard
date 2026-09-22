# Deploying Nimbus to Vercel

## Why the 404 happened

This repo is **6 separate apps** (`host-shell` + 5 remotes) meant to run as 6
separate servers that fetch each other's `remoteEntry.js` at runtime — that's
the whole point of Module Federation. If you point Vercel at the repo root
as a single project, it has no single app to build: there's no `index.html`
or build output at the root, so every request 404s.

There are two honest ways to fix this — pick based on what you actually need.

---

## Option A — deploy the single-file version instead (recommended for a quick live demo)

If you just want a working, shareable link and don't specifically need to
demonstrate independently-deployed micro-frontends, use the standalone
`index.html` file from this project (real React, no build step) instead of
this repo. Drag that one file into a new Vercel project (or `vercel deploy`
in its folder) and it works immediately — no config, no env vars, no 404.
Everything in the UI behaves identically; it's just bundled as one file
instead of six.

---

## Option B — deploy the real micro-frontend architecture (6 Vercel projects)

This is the "true to the architecture" option: each app becomes its own
Vercel project with its own URL, exactly like 6 different teams would deploy
independently in a real org. It takes ~15 minutes and needs a GitHub repo
(Vercel's dashboard workflow needs git; the CLI can deploy from a folder
directly if you'd rather skip GitHub — see the note at the bottom).

The webpack configs in this repo already support this (`webpack.config.js`
in every app reads `VERCEL_URL` and, for `host-shell`, five `*_REMOTE_URL`
env vars — see the comments in those files). You just need to wire up the
Vercel projects.

### 1. Push this repo to GitHub

```bash
git init
git add .
git commit -m "Nimbus MFE"
gh repo create nimbus-mfe --private --source=. --push
# or push to a repo you created on github.com
```

### 2. Create 5 Vercel projects for the remotes — deploy these FIRST

For **each** of `remote-auth`, `remote-dashboard`, `remote-users`,
`remote-analytics`, `remote-notifications`:

1. Vercel dashboard → **Add New… → Project** → import the GitHub repo.
2. **Root Directory**: `apps/remote-auth` (etc. — pick the matching folder).
   Vercel auto-detects the npm workspace and installs from the repo root.
3. **Framework Preset**: Other.
4. **Build Command**: leave default (`npm run build`, defined in that app's
   `package.json` — already correct).
5. **Output Directory**: `dist` (default — leave it).
6. Deploy. Note the production URL Vercel gives you, e.g.
   `https://nimbus-remote-auth.vercel.app` (**no trailing slash**, and use
   `https://`, not `http://`).

Repeat for all 5. You'll end up with 5 URLs.

### 3. Create the 6th project for `host-shell`

1. Add New… → Project → same repo, **Root Directory**: `apps/host-shell`.
2. Before deploying, add **Environment Variables** (Project Settings →
   Environment Variables), one per remote, using the URLs from step 2:

   | Name                      | Value (example)                              |
   |---------------------------|-----------------------------------------------|
   | `AUTH_REMOTE_URL`         | `https://nimbus-remote-auth.vercel.app`        |
   | `DASHBOARD_REMOTE_URL`    | `https://nimbus-remote-dashboard.vercel.app`   |
   | `USERS_REMOTE_URL`        | `https://nimbus-remote-users.vercel.app`       |
   | `ANALYTICS_REMOTE_URL`    | `https://nimbus-remote-analytics.vercel.app`   |
   | `NOTIFICATIONS_REMOTE_URL`| `https://nimbus-remote-notifications.vercel.app`|

3. Deploy. Open the resulting URL — you should get the real federated Login
   page, and every page after sign-in should be fetched live from its own
   deployed remote (open devtools → Network and you'll see requests to all
   5 other `*.vercel.app` domains).

### If you change a remote later

Redeploy that one remote's project — its URL stays the same (Vercel keeps
the production domain stable across deploys), so `host-shell` picks up the
change automatically on its visitors' next page load. That's the actual
point of this architecture: you never have to touch or redeploy the other
5 apps.

### Deploying without GitHub (Vercel CLI)

If you'd rather not push to GitHub, `vercel` CLI can deploy a folder
directly:

```bash
npm i -g vercel
cd apps/remote-auth && vercel --prod   # repeat per app
```

You'll still need to set the 5 `*_REMOTE_URL` env vars on the `host-shell`
project afterward (`vercel env add AUTH_REMOTE_URL production`, etc.) and
redeploy it once you have all 5 URLs.
