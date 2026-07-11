# Agriri — Incident Reporting Module

## Lifecycle

```
Farmer reports          MAO validates        MAO assigns          Technician         Technician
incident (Pending) ───▶ or rejects  ───────▶ a technician ──────▶ starts work ─────▶ resolves
                        (Validated/Rejected)  (Assigned)          (Ongoing)          (Resolved)
```

Every transition is enforced server-side in `IncidentService::assertTransition()`
— e.g. a technician cannot mark an incident "resolved" unless it's currently
"ongoing", and MAO cannot assign a technician until the incident has been
validated. Every transition is recorded in `incident_status_histories` and
fires an `IncidentStatusChanged` (or `IncidentAssigned`) event, which queues
an email + in-app notification to the relevant party — the farmer gets
notified on every status change; the technician gets notified on assignment.

## Endpoints

### Farmer (`/api/v1/farmer`, requires `role:farmer`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/farms` | List the farmer's own registered farms |
| POST | `/farms` | Register a new farm (GPS + optional GeoJSON boundary) |
| GET | `/farms/{farm}` | View a farm |
| PUT | `/farms/{farm}` | Update a farm |
| DELETE | `/farms/{farm}` | Remove a farm |
| POST | `/farms/{farm}/boundary` | Attach/redraw a Leaflet Draw polygon boundary |
| GET | `/incidents` | List own incidents (filterable: status, severity, category, date range, search) |
| POST | `/incidents` | Report a new incident (multipart: photos[], videos[], GPS, category, severity) |
| GET | `/incidents/{incident}` | View incident detail incl. status history & recommendations |

### Technician (`/api/v1/technician`, requires `role:technician`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/incidents` | List incidents assigned to this technician |
| GET | `/incidents/{incident}` | View incident detail |
| PUT | `/incidents/{incident}/status` | Move to `ongoing` or `resolved` |
| POST | `/incidents/{incident}/recommendations` | Submit inspection notes, treatment recommendation, follow-up |

### Municipal Agriculture Office (`/api/v1/mao`, requires `role:municipal_office`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/incidents` | List all incidents in the officer's municipality |
| GET | `/incidents/{incident}` | View incident detail |
| PUT | `/incidents/{incident}/validate` | Pending → Validated |
| PUT | `/incidents/{incident}/reject` | Pending/Validated → Rejected (reason required) |
| POST | `/incidents/{incident}/assign` | Validated → Assigned (technician_id required) |
| GET | `/technicians` | List active technicians in this municipality (for the Assign modal) |

### Shared lookups (`/api/v1/locations`, any authenticated role)
`GET /municipalities`, `GET /barangays?municipality_id=`, `GET /incident-categories`
— power every dropdown/filter across the app (registration form, incident
report form, GIS filters) from a single source of truth.

## Security & Scoping

- **Route-level RBAC** (`role:` middleware) blocks entire route groups by role.
- **Policy-level scoping** (`IncidentPolicy`, `FarmPolicy`) additionally
  ensures a Municipal Office can only touch incidents inside its own
  municipality, and a technician can only update incidents assigned to them
  — even if they guess a valid incident ID belonging to another LGU.
- File uploads (`photos`, `videos`, recommendation `attachments`) are
  validated by MIME type and size before being stored via `Storage::disk('public')`,
  namespaced per incident (`incidents/{id}/photos`, `incidents/{id}/videos`,
  `incidents/{id}/recommendations`).
- Reference codes (`AGC-2026-000123`) are generated sequentially per year
  inside a DB transaction to avoid collisions under concurrent submissions.

## What's next

The **GIS Dashboard, Reports, and Provincial/Admin modules** will reuse
`IncidentRepository::mapPoints()` (already built — returns lightweight
lat/lng + status + severity + category for map rendering) and
`paginateProvinceWide()` for the next build step.
