# Agriri — Knowledge Center, Programs, Appointments & Messaging

This step completes the backend's remaining farmer-support features. All
four are intentionally lightweight (no complex state machines like
Incidents) — they're content/coordination modules layered on the same
Auth + RBAC foundation.

## Knowledge Center (`/knowledge-articles`)

Browsable by every role (`GET /knowledge-articles`, filterable by
`category_id`, `type`, `search`; `GET /knowledge-articles/{article}`
auto-increments `view_count`). Write access (`POST`/`DELETE`) is granted to
Municipal Office, Provincial Office, and Admin under their respective
prefixes. Supports four content types in one table: `article`, `video`
(external `video_url`), `faq`, and `pdf_guide` (uploaded PDF).

## Government Programs (`/programs`)

- Browsable by everyone; office roles (`municipal_office`, `provincial_office`,
  `admin`) can publish/deactivate a program (soft-deactivate via `is_active`
  rather than hard delete, since applications must remain queryable).
- **Farmer applies**: `POST /farmer/programs/{program}/apply` — blocks
  duplicate applications to the same program, accepts up to 5 supporting
  documents.
- **Farmer views own applications**: `GET /farmer/programs/applications`.
- **Office reviews**: `GET /{role}/programs/{program}/applications` lists
  applicants; `PUT /{role}/programs/applications/{application}/review`
  moves status through `submitted → under_review → approved/rejected`.

## Appointments — Visit Scheduling (`/appointments`)

Shared between Farmer and Technician (no separate role prefix — the
controller resolves `farmer_id`/`technician_id` from whichever role is
calling, via a `counterpart_id` field on the request). Either party can
schedule; either party can update status (`confirmed`, `completed`,
`cancelled`, `no_show`) — the controller checks that the caller is actually
one of the two participants before allowing the update. Optionally scoped
to an `incident_id` and/or `farm_id`.

## Messaging — Farmer ⇄ Technician Consultation (`/messages`)

- `GET /messages/conversations` — one row per counterpart with their last
  message and unread count, for a chat-list UI.
- `GET /messages/thread/{user}?incident_id=` — full thread with one person,
  optionally scoped to a specific incident's conversation; marks incoming
  messages as read as a side effect of viewing.
- `POST /messages` — send a message, with an optional single attachment
  (image or PDF).

## Documents (`/documents`)

Personal document storage for farmers (land titles, certifications, IDs,
permits) — simple ownership-scoped CRUD, files stored per-user under
`documents/{user_id}/`.

## Backend module status

With this step, every module from the original brief now has a working API
surface: Auth, Farms, Incidents (full lifecycle), GIS, Dashboards, Reports,
Admin/User Management, Audit Logs, Announcements, Advisories, Knowledge
Center, Programs, Appointments, Messaging, Documents. The backend is
feature-complete relative to the spec.

**Not yet built:** the React web frontend and the Flutter mobile app, which
consume this API. Those are the next logical build steps.
