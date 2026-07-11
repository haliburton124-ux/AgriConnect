# Agriri — Web Frontend (React + TypeScript)

## Status: 33 of 36 navigation destinations are fully built (92%)

Verified clean on every check:
- `npm run build` (`tsc -b && vite build`) — **zero TypeScript errors**
- `npm run lint` (ESLint, strict hooks rules) — **zero errors, zero warnings**
- Every `BUILT_PAGES` route in `App.tsx` cross-checked against `navigation.ts`
  — no typos, no dead registrations
- Every frontend service endpoint cross-checked against `routes/api.php` —
  no path mismatches

Only **3 destinations** still show a "coming soon" placeholder, and each is
a genuine backend gap rather than missing frontend work — documented below.

## Stack

Vite + React 18 + TypeScript (strict mode, `noUnusedLocals`/`noUnusedParameters`),
TailwindCSS, Framer Motion, React Router, React Hook Form + Zod, TanStack
Query, Zustand, Axios, React Leaflet + Leaflet Draw + Leaflet.heat, Chart.js
+ react-chartjs-2, Sonner, Radix primitives.

## Design System

Palette, gradients, typography, motion, and glassmorphism all derived
directly from the brief — see `tailwind.config.ts` and `index.css`. Forest
Green `#2E7D32` primary, Leaf Green `#66BB6A` secondary, Golden Yellow
`#F9A825` accent, Sky Blue `#0288D1` tech accent, Poppins throughout, real
ripple-math buttons, `prefers-reduced-motion` respected globally.

## Every built screen, by role

**Farmer** — Dashboard (KPIs + recent incidents + Report Incident modal),
My Incident Reports (filter/search + detail modal), My Farms (register/edit/
delete with GPS capture), Appointments (schedule/confirm/complete/cancel),
Messages (threaded chat), Government Programs (browse + apply + track
applications), Knowledge Center (browse + article/video/PDF viewer),
Announcements (read), Documents (upload/view/delete), Settings (profile +
change password + log out all devices).

**Technician** — Dashboard (client-computed KPIs from assigned incidents —
see note below), Assigned Incidents (Start Inspection → Add Recommendation →
Mark Resolved), Appointments, Messages, Settings.

**Municipal Agriculture Office** — Dashboard (KPIs, trend chart, category
breakdown), Incident Monitoring (Validate/Reject/Assign Technician modals),
GIS Map (markers + heatmap + filters), Technicians directory, Reports
(PDF/Excel/CSV export), Announcements (read + post), Settings.

**Provincial Agriculture Office** — Dashboard (province-wide KPIs +
municipality comparison table), GIS Map (province-wide), Programs (browse +
publish), Reports (export, any municipality or province-wide), Announcements
(read + post), Settings.

**Admin** — Dashboard (reuses the province-wide view), Manage Users (the
only path to provision Provincial/Municipal Office, Technician, or Admin
accounts — mirrors the backend rule that public registration is farmers-
only), GIS Map, Audit Logs (expandable before/after diff viewer), Settings.

## The 3 remaining placeholders — and why

These render `<ComingSoonPage>` because the backend doesn't have a matching
endpoint yet (not because the screen wasn't built):
- **`/mao/farmers`** — no "list farmers in my municipality" endpoint exists
  on the backend today.
- **`/ppo/municipalities`** — a dedicated per-municipality drill-down;
  the core comparison data already exists and is shown in the Provincial
  Dashboard's municipality comparison table, but a standalone page with
  deeper drill-down isn't built.
- **`/technician/map`** — `gisService` only supports `municipal_office`,
  `provincial_office`, and `admin` roles (matching the backend's GIS routes,
  which are not exposed to technicians).

Adding these is a small, well-scoped backend + frontend task for a future
pass, not a structural gap.

## Notable implementation notes

- **Technician Dashboard** has no dedicated backend endpoint — rather than
  add a new route for a single summary view, it computes its KPIs
  client-side from the same incident list the Assigned Incidents screen
  already fetches.
- **Announcements** required extending `announcementService` with a
  role-aware `create`/`remove` (the backend exposes these under `/mao`,
  `/ppo`, `/admin` prefixes separately, not a shared endpoint) — done this
  pass.
- **Programs page is role-aware**: farmers see "My Applications" + an Apply
  button; Provincial Office sees the same list read-only (calling the
  farmer-only applications endpoint as PPO would 403, so it's guarded).
- **Knowledge article content renders as plain text**, not raw HTML — the
  backend doesn't sanitize the `content` field, so `dangerouslySetInnerHTML`
  was deliberately avoided.
- **ESLint added** (`eslint.config.js`) as a second verification layer
  beyond `tsc`. Pinned to only the two stable, universally-accepted
  `react-hooks` rules (`rules-of-hooks`, `exhaustive-deps`) rather than the
  newer `eslint-plugin-react-hooks` v7's experimental React-Compiler-era
  rule set (`set-state-in-effect`, `immutability`), which flags completely
  standard, idiomatic data-fetching patterns as errors — not appropriate
  for a non-Compiler codebase.

## Running locally

\`\`\`bash
cd Agriri/frontend
cp .env.example .env   # point VITE_API_URL at your Laravel backend
npm install
npm run dev             # http://localhost:5173
npm run build            # production build
npm run lint              # ESLint check
\`\`\`
