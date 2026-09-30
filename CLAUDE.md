# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A Secret Santa web app: users belong to groups; a group admin drafts santa→child pairs for the **next** year, users reveal their pair, and past years become visible in history once the admin "reveals" them. Node.js (ESM, `"type": "module"`) + Express, MongoDB, MinIO for images, vanilla jQuery/Bootstrap frontend. Deployed to Google App Engine.

## Commands

```bash
docker compose up -d          # start MongoDB + MinIO (and create the bucket); reads creds from .env
npm run start                 # run app on http://localhost:8080
npm run test:ci               # run all Playwright tests headless (auto-starts the app via webServer)
npm test                      # Playwright UI mode
npx playwright test tests/home.spec.js            # single file
npx playwright test -g "user can reveal his santa pair"   # single test by name
npm run lint / npm run lint:fix
npm run prettier:fix
npm run format                # lint + prettier check (what CI runs); note the prettier script uses `sudo`
```

- Local config comes from `.env` (loaded by `utils/environment.js` only when `profile !== 'production'`). Keys: `profile`, `adminElevatedPrivileges`, `sessionKey`, `mongodbUri`, `database`, `sendgridApi`, `minio*`. In production these are injected into `app.yaml` by `cloudbuild.yaml` placeholder substitution — adding a new env var means updating `app.yaml`, `cloudbuild.yaml`, and `.env`.
- Tests are end-to-end only and need MongoDB and MinIO running. CI (`.github/workflows/ci.yml`) runs `docker compose`, `npm run format`, then Playwright on Node 18.
- `tests/email.spec.js` uses screenshot snapshots with per-platform files (`-win32.png`, `-linux.png`). Linux snapshots are regenerated via Docker with `tests/generateSnapshots.sh`.

## Architecture

**Layering:** `app.js` mounts routers → `routers/*-router.js` (HTTP handlers, auth checks) → `utils/*Pipeline.js` (MongoDB queries, mostly aggregation pipelines). `utils/database.js` is a lazily created singleton `Db`; always get it with `await getClient()`. Collections: `users`, `groups`, `history`, `forbiddenPairs`, `chat`.

**Routing convention:** each router serves both an HTML page (`res.sendFile('public/<area>/…html')` or `res.render`) and JSON endpoints under `/<area>/api/...`. Handlers check `req.user` themselves (return `401 { error }`). JSON responses follow a `{ success | warning | error: message }` shape, which the frontend's `showAlert()` displays directly.

**Sessions & groups:** Passport local strategy + `cookie-session` (see `routers/session-router.js`; the regenerate/save shim in `app.js` works around passport 0.6+). A user may belong to several groups, each with a role (`utils/roles.js`: `admin`/`user`). The currently selected group is stored in `req.session.activeGroup` (set by `/api/setActiveGroup`) and almost every query is scoped by `req.session.activeGroup._id`. Admin routes check `req.session.activeGroup?.role === ROLES.admin`.

**Drafting / history model:** each `history` document is one `{ groupId, year, revealed, gifts: [{ santaId, childId, ... }] }`. Drafting (`PUT /admin/api/draft`) creates the doc for `currentYear + 1` using `utils/drafter.js`, which builds a single chain/cycle through all users while avoiding `forbiddenPairs` in both directions; it returns `null` on failure (the caller asks the admin to retry). The home page shows the pair only for `currentYear + 1`; history endpoints filter to `revealed` years.

**Templating:** no real template engine. `utils/renderer.js` is a custom Express view engine over `public/`: it strips `<!--adminStart-->…<!--adminEnd-->` blocks for non-admins, fills `<!--groupOptions-->`/`<!--groupName-->` in `modules/menu.html`, and `{{isHidden}}`-style placeholders in `santaProfile.html` (governed by `adminElevatedPrivileges`). Email templates in `templates/` are HTML files with placeholders filled in by the routers.

**Frontend:** each page is `public/<area>/<page>.html` + a same-named `.js`. Page scripts load `/santa.js` via `$.getScript`, which provides globals `pageLoaded` (promise resolved after the menu fragment `/modules/menu` loads) and `showAlert()`; these globals are declared in `eslint.config.js`. Small HTML fragments (e.g. `public/friends/friend.html`, `public/history/year/gift.html`) are fetched and cloned client-side. Tests locate elements by ids/`data-id` attributes, so keep them stable when editing markup. Vendored libs live in `public/utils/` (ignored by lint/prettier).

**Email & images:** `sendEmail()` in `utils/environment.js` uses SendGrid in production and a nodemailer Ethereal sandbox account otherwise (`utils/mail-local.js`). User images are stored in MinIO as `<userId>.png` (`utils/minio.js`); `user.imageUploaded` indicates whether one exists.

**Tests:** Playwright specs drive both the UI and the API via `page.request`. `tests/helpers/setup.js` creates fresh isolated data per test using faker (`createNewGroup`, `createDraftedGroup`, `createRevealedGroup`), so tests don't depend on seeded DB state.
