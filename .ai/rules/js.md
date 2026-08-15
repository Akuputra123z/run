---
paths:
  - 'resources/js/**'
---

# Js

## Wayfinder: --with-form + query param syntax
Always regenerate Wayfinder with `php artisan wayfinder:generate --with-form` — the plain command drops `.form` helpers used by auth/settings pages and breaks tsc. Query params go via `route({ query: { key: value } }).url`, never `route().url({ ... })` (url on RouteDefinition is a plain string).
