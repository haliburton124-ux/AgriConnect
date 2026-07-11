# Agriri — Knowledge Center, Programs, Appointments, Messaging & Documents

This step completes the remaining backend modules from the original brief.
All routes below sit under `/api/v1` and require `auth:sanctum`.

## Knowledge Center
| Method | Endpoint | Access |
|---|---|---|
| GET | `/knowledge/categories` | All roles |
| GET | `/knowledge/articles` | All roles (filter: `category_id`, `type`, `search`) |
| GET | `/knowledge/articles/{article}` | All roles (increments `view_count`) |
| POST | `/knowledge/articles` | Municipal/Provincial Office, Admin |
| DELETE | `/knowledge/articles/{article}` | Municipal/Provincial Office, Admin |

Supports four content types (`article`, `video`, `faq`, `pdf_guide`) — video
articles store a `video_url`, PDF guides upload and store a file.

## Government Programs
| Method | Endpoint | Access |
|---|---|---|
| GET | `/programs`, `/programs/{program}` | All roles — browse subsidies, training, loans, seedlings, equipment, insurance |
| POST | `/farmer/programs/{program}/apply` | Farmer — submits with optional supporting documents |
| GET | `/farmer/program-applications` | Farmer — track their own applications |
| POST | `/ppo/programs`, `/admin/programs` | Provincial Office, Admin — publish a program |
| PUT | `/{mao\|ppo\|admin}/program-applications/{application}/status` | Review → `under_review` / `approved` / `rejected` |

Applying is blocked automatically once `application_end` has passed.

## Appointments (Visit Scheduling)
Shared between Farmer and Technician (`role:farmer,technician`):
- `GET /appointments` — each party only ever sees their own (scoped by `farmer_id`/`technician_id`).
- `POST /appointments` — a farmer specifies `technician_id`; a technician specifies `farmer_id`. Optionally linked to an `incident_id` or `farm_id`.
- `PUT /appointments/{appointment}/status` — either party can confirm/complete/cancel/mark no-show; ownership is checked before allowing the update.

## Messaging
Direct farmer ↔ technician messaging, optionally scoped to an incident:
- `GET /messages/threads` — one row per conversation partner, with last message preview and unread count (powers the inbox list).
- `GET /messages/{partnerId}` — full conversation history; marks incoming messages as read on fetch.
- `POST /messages` — send a message with an optional file attachment.

## Documents
Every role can manage their own uploaded files (land titles, certifications,
IDs, permits): `GET/POST /documents`, `DELETE /documents/{document}` —
ownership is enforced (`user_id` must match the requester) before deletion.

## Design notes

- Knowledge, Programs, Announcements, and Advisories all follow the same
  pattern: **read is shared, write is role-gated** — either via the route's
  `role:` middleware or the FormRequest's `authorize()` method (documented
  per-module above), so the same read endpoint doesn't need to be duplicated
  per role.
- Appointments and Messaging intentionally live outside any `/farmer`,
  `/technician` prefix since both roles use the exact same endpoints against
  their own scoped data — duplicating them per-prefix would just be dead code.

## Full module status

At this point every module from the original specification has a working
backend implementation: Authentication & RBAC, Farmer Module, Incident
Reporting, Agricultural Extension (recommendations), Technician Module, MAO,
PPO, GIS Dashboard, Reports, Notifications (events/listeners + FCM device
token table), Knowledge Center, Admin Module, and the supporting database
schema — 24 tables, 24 models, seeders for all of Ilocos Norte.

**Remaining work** is the presentation layer: the **React + TypeScript web
frontend** (dashboards, modals, maps, forms) and the **Flutter mobile app**
for farmers — plus Docker/deployment config and automated tests.
