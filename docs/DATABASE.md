# Agriri — Database Design

## Entity Overview & Relationships

```
provinces (1) ──< municipalities (1) ──< barangays
                        │                    │
                        │                    │
users (role: admin | provincial_office | municipal_office | technician | farmer)
   │  belongs to municipality / barangay (nullable — admin/PPO have none)
   │
   ├──< technician_profiles (1:1, for role=technician)
   ├──< farms (1:many, for role=farmer)
   │        └──< farm_boundaries (1:many — GeoJSON polygons drawn via Leaflet Draw)
   │
   ├──< incidents (as farmer_id, assigned_technician_id, validated_by)
   │        ├──< incident_media (photos/videos)
   │        ├──< incident_status_histories (audit trail of status transitions)
   │        ├──< incident_assignments (technician assignment history)
   │        └──< recommendations (technician inspection/treatment notes)
   │
   ├──< appointments (visit scheduling between farmer & technician)
   ├──< messages (farmer ↔ technician direct messaging, optionally scoped to an incident)
   ├──< announcements (posted by MAO/PPO/Admin)
   ├──< advisories (weather/pest/disease/market bulletins)
   ├──< programs ──< program_applications (farmer applies to a program)
   ├──< knowledge_articles (belongs to knowledge_categories)
   ├──< documents (farmer-uploaded certifications, IDs, permits)
   ├──< device_tokens (FCM push notification tokens)
   └──< audit_logs (polymorphic — tracks changes across all auditable models)

notifications — Laravel's native polymorphic notifications table (database channel)
personal_access_tokens — Sanctum API tokens
```

## Key Design Decisions

- **Geographic hierarchy** (`provinces` → `municipalities` → `barangays`) is normalized
  and seeded with all 23 LGUs of Ilocos Norte (Laoag City, Batac City, and 21
  municipalities), each with representative barangays. Every farm, incident, and
  office-level user is scoped to this hierarchy, which powers the GIS filters and
  province-wide analytics.
- **Single `users` table with a `role` enum** rather than separate tables per role.
  This keeps auth simple (one Sanctum-guarded table) while `technician_profiles`
  holds role-specific fields for technicians only. Policies enforce role-based
  access control (RBAC) at the application layer.
- **Incidents are the core transactional entity.** Every status change is
  recorded in `incident_status_histories` for full auditability (Pending →
  Validated → Assigned → Ongoing → Resolved/Rejected). `incident_assignments`
  is separate from the `assigned_technician_id` foreign key on `incidents` so
  reassignment history is preserved even when the "current" assignee changes.
- **Soft deletes** are used on `users`, `farms`, and `incidents` since these are
  records government offices need to retain for reporting/audit purposes even
  after a user requests removal.
- **GeoJSON storage**: `farm_boundaries.geojson` and `municipalities.boundary_geojson`
  store Leaflet Draw polygon output directly as JSON, avoiding a dependency on
  MySQL spatial extensions while remaining simple to query and render.
- **Audit logs are polymorphic** (`auditable_type` + `auditable_id`) so any model
  (incidents, users, programs, etc.) can be tracked without a dedicated table per
  entity.

## Running Migrations & Seeders

```bash
cd Agriri/backend
php artisan migrate
php artisan db:seed
```

This will seed:
- Ilocos Norte province, 23 municipalities/cities, sample barangays
- 9 incident categories (Crop Disease, Pest Infestation, Livestock, Irrigation,
  Flood, Typhoon, Drought, Fire, Others)
- 1 Admin, 1 Provincial Agriculture Office account, 1 Municipal Agriculture
  Office account per municipality, 3 sample Technicians, 5 sample Farmers
- Sample farms and incidents with realistic GPS coordinates around Laoag City

**All seeded accounts use the password:** `Password123!`

| Role | Email |
|---|---|
| Admin | admin@agriri.gov.ph |
| Provincial Office | ppo@agriri.gov.ph |
| Municipal Office (Laoag) | mao.laoagcity@agriri.gov.ph |
| Technician | technician1@agriri.gov.ph |
| Farmer | farmer1@agriri.gov.ph |
