# Agriri — Backend Core: Authentication & RBAC

## Architecture

```
Request → Route (role: middleware) → FormRequest (validation)
        → Controller → Service (business logic) → Repository (data access)
        → Model → Resource (JSON shaping) → Response
```

This layered structure (Controller → Service → Repository → Model) keeps
controllers thin, business rules testable in isolation, and data access
swappable (e.g. Eloquent → a different ORM) without touching Services.

## Auth Flow

1. **Register** (`POST /api/v1/auth/register`) — public registration is
   restricted to the **Farmer** role only. Staff accounts (Technician,
   Municipal Office, Provincial Office, Admin) are provisioned internally
   by an Admin through the User Management module — this prevents anyone
   from self-registering as a government office account.
2. **OTP Verification** (`POST /api/v1/auth/verify-otp`) — a 6-digit OTP is
   emailed on registration (hashed at rest, expires in 10 minutes). Verifying
   activates the account and returns a Sanctum token immediately.
3. **Login** (`POST /api/v1/auth/login`) — rejects suspended/pending accounts
   with a clear message before issuing a token.
4. **Forgot / Reset Password** — standard Laravel password broker (emailed
   reset link + token).
5. **Change Password** — requires current password, revokes all existing
   tokens on success (forces re-login on every device).
6. **Two-factor ready** — `users.two_factor_enabled` / `two_factor_secret`
   columns are in place; TOTP challenge step can be added to the login flow
   without a schema change.

## RBAC

- Roles live directly on `users.role` (enum): `admin`, `provincial_office`,
  `municipal_office`, `technician`, `farmer`.
- The `role:` route middleware (`EnsureUserHasRole`) guards entire route
  groups (see `routes/api.php` — `/farmer`, `/technician`, `/mao`, `/ppo`,
  `/admin` prefixes) and also rejects any non-`active` account.
- **Policies** (e.g. `UserPolicy`) handle object-level authorization — e.g. a
  Municipal Office can only view technicians/farmers within its own
  municipality, never another LGU's data. More policies (`IncidentPolicy`,
  `FarmPolicy`) are added alongside their respective modules.
- Sanctum issues personal access tokens (bearer tokens) for both the React
  web app and the Flutter mobile app — no cookies/CSRF required for the
  mobile client; the web SPA can optionally use Sanctum's stateful-domain
  cookie mode (already configured in `config/sanctum.php`).

## Rate Limiting

- `auth` limiter: 6 requests/minute per IP — throttles register/login/OTP
  endpoints against brute-force and OTP-spam abuse.
- `api` limiter: 120 requests/minute per authenticated user (or IP for
  guests) — applied globally to all `/api/*` routes.

## What's stubbed for the next module

`routes/api.php` already defines the five role-scoped route groups
(`/farmer`, `/technician`, `/mao`, `/ppo`, `/admin`) with the middleware
wiring in place — the Incident Reporting module (next step) fills these in
with real controllers rather than introducing new routing scaffolding.
