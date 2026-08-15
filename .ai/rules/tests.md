---
paths:
  - 'tests/**'
---

# Tests

## curl smoke test on Inertia pages
To curl an Inertia app: fetch /login with -c jar, read the CSRF token from the `csrf-token` META tag (not a hidden _token input — it doesn't exist), POST with -d "_token=...&email=...&password=...". NEVER use -L after POST (curl replays POST to the redirect target → 405). Inertia page JSON lives inside `<div data-page="app" type="application/json">` as TEXT content (not an attribute); parse with json.JSONDecoder().raw_decode. Seeded users: test@example.com/password, admin@example.com/12345678.
