---
paths:
  - 'app/Http/Controllers/Admin/**'
  - app/Http/Controllers/Admin/PhotosController.php
---

# Admin

## Admin index pages: search + paginate + constrained eager load
Admin list pages (bibs, photos, race-pack) pass `search` query param filtered over code/name/race_number, paginate(20-24) with `->withQueryString()`, `->through()` row mapping, and always constrain eager loads (`->with('registration:id,...')`) plus `select()` needed RacePhoto columns only. Keep this pattern for new admin lists.

## Race photo thumbnail generation (Intervention v4)
Race photo uploads always generate a webp thumbnail (max 480px, GD driver) via Intervention Image v4: `new ImageManager(GdDriver::class)` — the 'gd' shorthand string was removed in v4 and throws. Thumb path saved in `photo_thumb_path`; `photoThumbUrl()` falls back to the original URL for legacy photos without thumbs.
