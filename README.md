# Nimbus — a real micro-frontend platform

Six independently-buildable apps wired together with **Webpack 5 Module
Federation**. This is not a themed single-page app — each piece below is its
own project with its own `package.json`, its own dev server, and its own
production build. The Host Shell fetches the others **at runtime**, over
HTTP, from their own `remoteEntry.js` files.

```
apps/
  host-shell/            :5000  — sidebar, topbar, routing, the Mesh page.
                                   Federates in everything else, including
                                   the entire login screen when signed out.
  remote-auth/            :5001 — owns identity. Exposes TWO things from one
                                   remote: a full <Login/> page (page-level
                                   federation) and a small <AuthStatus/>
                                   widget for the topbar (widget-level
                                   federation) — proof this isn't just
                                   "swap the page".
  remote-dashboard/       :5002 — Executive Overview page
  remote-users/           :5003 — User Management page
  remote-analytics/       :5004 — Analytics page (traffic + load-time charts)
  remote-notifications/   :5005 — Notifications page

packages/
  shared-ui/                    — design tokens (CSS variables, light/dark),
                                   the icon set, and <StatCard/>. A workspace
                                   package standing in for what would be a
                                   versioned npm package in a real org.
```

## Run it

```bash
npm install                  # one install, hoisted across all 6 apps
npm run dev                  # starts all 6 dev servers together, labeled
```

Then open **http://localhost:5000**. You'll land on the **Login** page —
that screen is fetched whole from `remote-auth`, not part of the Host
Shell's own bundle. Sign in with any demo account shown on the form
(password `nimbus123` for all of them), or click a demo-account chip to
autofill it.

`npm run dev` uses `concurrently` purely as a convenience — in practice each
of these is a separate team, so `npm run start -w remote-users` (etc.)
starts just one, in its own terminal, same as it would in a real org.

Each remote is also independently visitable — e.g. **http://localhost:5003**
renders `<Users/>` on its own with no Host Shell chrome, for isolated
development.

`npm run build` production-builds all six (host last, since it references
the others' `remoteEntry.js` URLs).

## What's actually federated, and how to prove it to yourself

- **The login screen itself is a federated remote, not a Host Shell route.**
  Stop `remote-auth`'s dev server while signed out and reload `:5000` — you
  get the Host Shell's own `RemoteBoundary` fallback ("Auth (:5001) is
  unreachable"), not a broken page, because the Host Shell has no login UI
  of its own to fall back to. Restart it and the real form comes back.
- **Auth state crosses the federation boundary the same way notifications
  do: a `window` event, nothing shared at build time.** `remote-auth` writes
  the session to `localStorage` and dispatches
  `window.dispatchEvent(new CustomEvent("nimbus:session-changed", {...}))`
  (see `packages/shared-ui/src/session.js`, a tiny shared contract, not a
  shared store). The Host Shell, the Sidebar's footer, and the Topbar's
  `AuthStatus` widget each independently listen for that event and update
  themselves — three different bundles, one event.
- Sign in, then open the who-chip in the topbar and click **Sign out**. The
  Host Shell (which owns no auth logic) immediately swaps back to the
  federated Login page because it, too, is just listening.
- Stop `remote-users` (Ctrl+C its terminal, or comment out its line in
  `webpack.config.js` → `remotes`) and reload the host. Every other page
  keeps working; only User Management goes down.
- Open the **Mesh Topology** page and click a node (or its chip) to flip a
  `outaged` flag in the Host Shell's state. That doesn't hide the page with
  CSS — it makes the wrapped remote **throw a real error** inside its own
  `<Suspense>`/`<ErrorBoundary>` pair (`src/components/RemoteBoundary.jsx` in
  `host-shell`). Navigate to that remote's page (or glance at the Auth chip
  in the topbar for the `auth` remote) and you'll see the isolated recovery
  panel, with a **Retry** button that force-remounts just that subtree.
- **Notifications is the interesting one.** It owns its own unread count and
  has no shared store with the Host Shell. It broadcasts
  `window.dispatchEvent(new CustomEvent("nimbus:unread-count", {...}))`
  whenever that count changes; the Host Shell just listens
  (`window.addEventListener`) and updates its sidebar dot / topbar badge.
  Two apps, built and deployed separately, talking through nothing but the
  browser's own event system — no Redux, no context bridging a federation
  boundary.
- `shared: { react: { singleton: true }, "react-dom": { singleton: true } }`
  in every `webpack.config.js` is what stops six copies of React from
  loading — whichever app boots first "wins" and the rest consume that
  instance.

## Honest limitations of this scaffold

- Mock data lives in each remote's own `src/data.js` — a real Users remote
  would call its own API.
- **Auth is real *federation*, not real *security*.** `remote-auth` checks
  the email/password against a hardcoded in-memory list
  (`apps/remote-auth/src/data.js`) after a simulated 650ms round trip —
  there's no backend, no password hashing, no tokens, and the "session" is
  a plain JSON blob in `localStorage` that anyone with devtools could edit
  or forge. What's genuine is the architecture around it: the login UI is
  fetched at runtime from an independently-deployed app, and every other
  remote finds out you're signed in only via the same `window` event a real
  SSO callback would use — swap `session.js`'s two functions for real
  `fetch()` calls to an auth provider and nothing else in this repo has to
  change.
- No CI/deploy pipeline per app, no versioned `@nimbus/shared-ui` on a real
  registry (it's an npm workspace here so the whole thing runs with one
  `npm install`) — both are the next things a real org would add.
