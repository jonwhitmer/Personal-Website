# jonwhitmer.com

The source for [www.jonwhitmer.com](https://www.jonwhitmer.com) — a personal engineering
portfolio. Three services, one repository.

| Directory | What it is | Runs on | In production |
|---|---|---|---|
| `portfolio-frontend/` | React 18 + Vite + Tailwind. The site itself. | `:5173` | `www.jonwhitmer.com` (Render) |
| `portfolio-backend/` | Spring Boot 3.2 / Java 17. Contact form, resume delivery. | `:8080` | `api.jonwhitmer.com` (Render) |
| `python-service/` | A retrieval-augmented chat service. **Built, not deployed.** | — | not deployed |
| `qa/` | The browser test suite that gates every change. | — | runs in CI |

---

## Quick start

```bash
git clone https://github.com/jonwhitmer/Personal-Website.git
cd Personal-Website

npm ci                                   # the QA runner
npm --prefix portfolio-frontend ci       # the site

cp .env.example portfolio-frontend/.env  # then fill in VITE_API_URL
npm run dev                              # http://localhost:5173
```

The frontend runs on its own. The backend is only needed for the contact form and the
"email me the resume" flow.

### Running the backend too

```bash
cp .env.example portfolio-backend/.env   # then fill in GMAIL_APP_PASSWORD and MY_EMAIL
cd portfolio-backend
mvn spring-boot:run
```

> **The dev profile will not start without working mail credentials.**
> `application-dev.properties` sets `spring.mail.test-connection=true`, so Spring verifies
> the SMTP login *during startup* and aborts if it fails. This is deliberate — it is better
> to fail loudly at boot than to accept a contact form submission and silently drop it.
> Every variable is documented in [`.env.example`](.env.example).

---

## Testing

The whole suite runs with one command:

```bash
npm run qa                    # reuses a running site, or starts one
npm run qa -- --built         # test the production build instead of the dev server
npm run qa -- --only=theme    # a single suite
npm run qa:health             # repo hygiene only — no browser, no server
```

`npm run qa` never kills a server it did not start. If something is already answering on
`:5173` it is used as-is and left running.

| Suite | Proves |
|---|---|
| `repo-health` | Nothing is missing from git, no secrets, branches are sane, CI is wired |
| `site-content` | The header, the 2026 resume, and the current role are on the page |
| `theme` | Dark mode is the default and it persists |
| `projects-grid` | The grid and its detail panel behave |
| `project-videos` | The demo videos actually decode and advance — not black boxes |
| `console-clean` | No console errors and no failed requests |
| `responsive` | Layout holds at 320 / 390 / 768 / 1280 / 2560 |
| `width-sweep` | A fine-grained sweep for layout defects between breakpoints |
| `fullscreen-only-by-icon` | Fullscreen opens only from its own control |

Tests are written **before** the change they describe, and watched failing for the right
reason first. A test is never weakened to make it pass.

---

## Branches and deployment

```
dev  ──▶  stage  ──▶  master
 │          │            │
 │          │            └── production — www.jonwhitmer.com
 │          └── pre-production — verify against the real API before promoting
 └── integration — where day-to-day work lands
```

- **`dev`** — everyday work. CI runs on every push.
- **`stage`** — a release candidate. Merge `dev` here when it is ready to be looked at.
- **`master`** — production. **Only ever fast-forwarded from `stage`, and only when CI is green.**

Nothing reaches `master` without passing the `CI gate` check. That gate is the single
status to require in branch protection; it fails if any of `repo-health`, `frontend` or
`backend` failed, was skipped or was cancelled.

### Why this matters here

Between **2025-10-21 and 2026-08-04** the live site served a nine-month-old build while the
working tree carried a new role, an updated resume and five project demos. Nothing was
committed, nothing was pushed, and nothing checked — so nobody noticed. The branch structure
and CI exist to make that specific silence impossible.

### Promoting a change

```bash
git switch dev && git push                    # CI runs

git switch stage && git merge --ff-only dev
git push                                      # CI runs again

git switch master && git merge --ff-only stage
git push                                      # deploys
```

`--ff-only` is deliberate: it refuses rather than creating a merge commit, which means
`master` can never contain something `stage` has not already proven.

---

## Architecture notes

**The frontend is one page.** `App.jsx` renders `Portfolio.jsx`, which composes every
section. `react-router-dom` is installed and `BrowserRouter` is mounted, but no routes are
defined yet, so nothing on the site is currently a linkable URL.

**The backend has no database.** `pom.xml` declares no JPA and no datasource. Rate-limit
state lives in memory and is lost on restart; contact submissions exist only as the email
they generate.

**Health checks must request `/index.html`, never `/`.** Vite's dev server only falls back
to `index.html` when a request carries `Accept: text/html`. A bare monitoring probe sending
no `Accept` header gets a 404 from a perfectly healthy site. This once caused a supervisor
to kill the site every 90 seconds while every browser check said it was fine.

---

## Environment variables

All of them are documented in [`.env.example`](.env.example), including which ones block
startup and which ones are public.

> **Every `VITE_*` variable is compiled into the public JavaScript bundle.** Anyone can read
> them by viewing source. Never put a credential in one.

---

## License

All rights reserved. The content, images, resume and personal branding in this repository
are not licensed for reuse.
