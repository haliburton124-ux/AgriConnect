# Agriri — Farmer UI Redesign (Premium Public Landing Experience)

## What changed

The Farmer role no longer uses the admin-style sidebar dashboard shared by
Technician/MAO/PPO/Admin. It now has its own **public-facing marketing
landing page** at `/farmer` — accessible to guests and authenticated
farmers alike — plus a lightweight top-nav shell (`FarmerLayout`, no
sidebar) for authenticated sub-pages (My Farms, My Reports, Appointments,
Messages, Documents, Programs, Knowledge Center, Announcements, Settings).

This required one real backend change, not just frontend work.

## Backend change: read-only content is now public

The original routing put **every** API call behind `auth:sanctum`,
including read-only content (Programs, Knowledge Articles, Advisories,
Announcements, location lookups). That's incompatible with a public
marketing site guests can browse before signing up. Fixed by:

- Moving `GET locations/*`, `GET announcements`, `GET advisories`,
  `GET knowledge/*` (browse), and `GET programs*` into a new public,
  rate-limited route group in `routes/api.php` — no `auth:sanctum` required.
  Write access to all of these (`POST`/`DELETE`) is untouched and still
  requires the relevant office role.
- Patched `AnnouncementController::index()` and `AdvisoryController::index()`,
  which both called `$request->user()->hasRole(...)` unconditionally — a
  fatal error for a guest with no authenticated user. Guests now see only
  general/province-wide (municipality-agnostic) announcements and
  advisories; authenticated farmers/technicians still see their own
  municipality's content on top of that, exactly as before.

## The hero image

Your uploaded photo is used exactly as provided — no stock substitute, no
AI placeholder. It was 11MB at 6000×4000, far too large for a web hero, so
it was optimized (not replaced): resized to a 2560px desktop version
(~900KB) and a 1280px mobile version (~235KB) via Lanczos-resampled,
progressive JPEG compression, served through a `<picture>` element so
mobile visitors don't download the full desktop asset. Both live in
`frontend/public/`.

## New structure

```
components/landing/
  FarmerNavbar.tsx       — transparent-over-hero → glass-on-scroll, mobile menu, auth-aware
  HeroSection.tsx         — 100vh, Ken Burns zoom, gradient overlay, left-aligned copy
  StatsStrip.tsx           — floating count-up stat card bridging hero → content
  QuickActionsSection.tsx  — 6 gradient action cards (glow + lift on hover)
  ExtensionProcessSection.tsx — animated 5-step alternating timeline
  FeaturedProgramsSection.tsx — top 3 live programs from the public API
  AdvisoriesSection.tsx    — horizontal-scroll carousel, live from /advisories
  KnowledgeMasonrySection.tsx — staggered-height article grid, live data
  GisTeaserSection.tsx     — honest "coming soon" preview (see note below)
  TestimonialsSection.tsx  — auto-advancing farmer story slider
  Footer.tsx                — sitemap + contact section (`#contact`)
  TerraceDivider.tsx        — signature SVG motif (see below)
  CountUp.tsx                — scroll-triggered number animation
  SectionHeading.tsx         — shared eyebrow/title/description header

layouts/FarmerLayout.tsx   — top-nav shell for authenticated sub-pages (no sidebar)
pages/farmer/FarmerHomePage.tsx — assembles all sections into the full page
```

## The signature element

Every section boundary uses a **terraced-contour divider** (`TerraceDivider.tsx`)
instead of a straight edge or a generic wave — three layered curved paths
that echo the rhythm of the actual terraced fields in your hero photo. It's
a small thing, but it ties the page's structure back to the photograph
rather than using a decorative shape that could belong to any SaaS site.

## Honesty notes — what's illustrative vs. live

- **Featured Programs, Advisories, Knowledge Center** sections fetch real
  data from the now-public API endpoints. If your database has no
  published programs/advisories/articles yet, these sections show a clean
  empty state rather than fake content.
- **Testimonials** are clearly composite/illustrative farmer stories (not
  real individuals) — there's no testimonials table or endpoint in the
  backend. Treat this as placeholder content to swap for real farmer
  quotes once you have them.
- **GIS Teaser** is an honest "coming soon" preview, not a live map. The
  backend's GIS endpoints are currently scoped to Municipal/Provincial
  Office and Admin only — there's no farmer-safe (anonymized) incident-map
  endpoint yet. Rather than fake live pins, the section is upfront that
  this is on the way.
- **Stats strip** (23 municipalities, 12,400+ farmers, etc.) uses
  illustrative numbers with count-up animation. Swap these for real
  aggregate counts once you're comfortable exposing a public stats
  endpoint (the province/municipality/farmer counts already exist in the
  PPO dashboard data — just not on a public route yet).

## Verified

- `npm run build` — zero TypeScript errors
- `npm run lint` — zero errors, zero warnings
- Hero image confirmed present in the production build output
- Grepped for stale references to the retired `/farmer/dashboard` route —
  none found; the old `FarmerDashboardPage.tsx` was removed entirely
- Cross-checked every new public API call against the updated
  `routes/api.php`

## What I couldn't verify

I don't have a running Laravel server + MySQL instance in this environment,
so I could not click through the live site end-to-end. Verification here is
static: a clean strict-TypeScript build, a clean lint pass, and a careful
manual cross-check of every route and prop signature — the same standard
applied throughout this project, but it's not a substitute for opening the
page in a browser. I'd recommend running `php artisan serve` +
`npm run dev` locally and clicking through before shipping.
