# Locket Studio

Responsive Locket-style frontend starter. The API is intentionally separate from this repository.

## Included
- Vietnamese responsive login screen with license code + Locket account fields.
- Login adapter configured for `locket_license`.
- Dashboard navigation: Overview, Friends, Moments, Studio, Profile.
- Separate API client using HTTPS, `credentials: include`, no browser token persistence.
- No API secrets or Locket credentials are hardcoded.

## Configure the separate API
Edit `config.js`:
- Set `API_BASE_URL` to your deployed API origin.
- Set endpoint paths to match your actual API routes.

The current adapter expects:
- `POST /auth/locket_license` JSON: `{ licenseCode, email, password }`
- Successful login JSON: `{ success: true, user: { displayName } }` or `{ authenticated: true, user: {...} }`
- `POST /auth/logout`
- `GET /locket/friends`
- `GET /locket/moments`
- `GET /locket/profile`
- `POST /locket/upload` multipart fields `file` and `caption`

**These are adapter defaults, not claims about your existing API.** Change paths and payload/response mapping in `src/api.js` after supplying the actual API contract.

## Security requirements for the API server
1. Keep Locket credentials, license verification secrets, API keys and refresh tokens server-side only.
2. After login, issue an opaque session cookie with `HttpOnly; Secure; SameSite=Lax` (or stricter where compatible); rotate session IDs after authentication.
3. Validate `Origin` and implement CSRF protection for state-changing requests. Configure CORS to allow only the exact frontend origin; never combine credentialed requests with wildcard origins.
4. Rate-limit login, license checks and uploads. Add lockout/backoff and audit events without logging passwords, raw tokens or license secrets.
5. Validate authorization on every endpoint; a valid session alone must not bypass license expiry/revocation checks.
6. Enforce upload MIME/type/size limits on the server, inspect file signatures, generate storage names, and store uploads privately unless sharing is explicitly intended.
7. Return sanitized errors; do not expose upstream stack traces or secrets.
8. Use HTTPS, dependency updates, CSP, security headers and server-side input validation.

## Run locally
Serve this folder with any static HTTP server (ES modules require HTTP, not opening index.html as a file). Example:
```bash
python -m http.server 8080
```
Open `http://localhost:8080`. Configure your API's CORS and cookie domain for the local origin during development.

## Current status
The frontend scaffold is in place. The API integration cannot be considered functional until its real base URL, routes, request schema, response schema, cookie/session behavior and CORS policy are confirmed. The reference HeyLocket page could not be inspected in this environment; use screenshots if exact visual matching is required.
