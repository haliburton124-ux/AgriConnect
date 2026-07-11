# Agriri — GIS, Reports, Provincial & Admin Modules

## GIS Dashboard

`GET /api/v1/{mao|ppo|admin}/gis/map-points` and `.../gis/heatmap` both reuse
`IncidentRepository::mapPoints()` from the Incident module — no duplicated
query logic. Filters: `status`, `severity`, `category_id`, `barangay_id`,
`date_from`, `date_to`, plus `municipality_id` (Provincial Office/Admin only —
a Municipal Office's `municipality_id` is always forced server-side to their
own LGU, regardless of what's in the query string, so GIS filters can never
be used to peek at another municipality's incidents).

- `map-points` → cluster-marker-ready GeoJSON-ish points with category icon/color.
- `heatmap` → `[lat, lng, intensity]` triples weighted by severity
  (low 0.3 → critical 1.0), ready for Leaflet.heat.

## Dashboards

`DashboardRepository` powers three views from one place:
- **MAO dashboard** (`GET /mao/dashboard`) — KPI cards scoped to the
  officer's municipality: today's reports, pending/assigned/ongoing/resolved
  counts, critical-and-still-open count, incident trend line, category
  breakdown (for the pie/bar chart), and the 10 most recent incidents.
- **PPO / Admin dashboard** (`GET /ppo/dashboard`, `GET /admin/dashboard`) —
  same KPI shape but province-wide, **plus** `municipality_comparison`
  (per-LGU incident counts for the bar-chart comparison view) and total
  farmer/technician/municipality counts.
- `group_by=day|month|year` query param controls the trend granularity.

## Reports (CSV / Excel / PDF)

`POST /{mao|ppo|admin}/reports/incidents/export` with `format=csv|xlsx|pdf`
and optional `date_from`, `date_to` (+ `municipality_id` for PPO/Admin).

- **CSV** — streamed directly, no extra dependency (`fputcsv`).
- **Excel** — built with `phpoffice/phpspreadsheet`; header row styled in
  Forest Green (`#2E7D32`) with auto-sized columns.
- **PDF** — rendered via `barryvdh/laravel-dompdf` from
  `resources/views/reports/incident-report.blade.php`, a branded A4-landscape
  layout with status badges colored to match the palette (resolved = green,
  pending = gold, rejected = red, everything else = sky blue).

A Municipal Office always gets their own municipality's data; Provincial
Office/Admin get province-wide data unless they pass `municipality_id`.

## Admin Module

- **User management** (`/admin/users`) — list/filter by role, municipality,
  status, search; `POST /admin/users` provisions **any** non-farmer role
  (Provincial Office, Municipal Office, Technician, Admin) — this is the
  *only* way those accounts get created, since public registration
  (`/auth/register`) is farmer-only by design. Creating a technician also
  auto-creates their `technician_profiles` row in the same transaction.
- **Status management** (`PUT /admin/users/{user}/status`) — active /
  inactive / suspended. Suspending or deactivating immediately revokes all
  of that user's Sanctum tokens, logging them out everywhere.
- **Audit logs** (`GET /admin/audit-logs`) — every create/update/delete on
  `User`, `Incident`, and `Farm` is captured automatically by
  `AuditableObserver` (registered on those models in `AppServiceProvider`).
  Sensitive fields (`password`, tokens, OTP, 2FA secret) are redacted before
  the row is written. Filterable by action, user, and date range.

## Announcements & Advisories

Shared read endpoints (`GET /announcements`, `GET /advisories`) — farmers
and technicians see anything targeted at `all` + their own role, scoped to
their municipality or province-wide (`municipality_id = null`) posts.
Write endpoints are duplicated under `/mao`, `/ppo`, and `/admin` prefixes
(same controller, `role:` middleware differs) — a Municipal Office's posts
are automatically scoped to their own LGU; Provincial Office/Admin posts are
province-wide.

## What's next

The remaining pieces from the original brief — **Knowledge Center CRUD**,
**Government Programs + applications**, **Appointments/messaging UI wiring**,
the **React frontend**, and the **Flutter mobile app** — are the natural
next build steps.
