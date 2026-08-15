---
paths:
  - 'resources/js/components/**'
---

# Components

## Admin menu conventions: all menus functional, EventSettings for config
All admin menus are functional and grouped by flow in the sidebar (Pendaftaran / Race Day / Pasca Race). No placeholder pages remain. New admin pages must be added to resources/js/pages/admin/ with layout breadcrumbs and wired into app-sidebar.tsx + routes/web.php (admin group); use wayfinder route helpers (@/routes/admin/...). Event settings (bank, payment_hours, event info) live in the settings table, read via App\Support\EventSettings with config fallback — never read config('registration.*') directly.
