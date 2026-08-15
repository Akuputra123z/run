---
paths:
  - 'resources/js/pages/**'
  - resources/js/pages/landing.tsx
---

# Pages

## Hindari <Form> Inertia untuk input state-only
Jangan pakai komponen <Form> Inertia untuk form yang input-nya dikendalikan state React tanpa atribut name: komponen ini MENIMPA onSubmit sendiri dan membangun FormData dari DOM, sehingga input tanpa name tidak terkirim dan error 422 masuk ke state internal yang tidak dirender (gejala: klik submit 'tidak terjadi apa-apa'). Pakai <form> biasa + post() dari useForm.

## Landing page sections are DB-driven via LandingController
Landing (/) tidak boleh hardcode konten: semua bagian (guest star, kategori, galeri, jadwal, doorprize, rute) diisi dari props LandingController (categories, guestStars, routeMaps, gallery.row_1/row_2, event). Data dikelola di dashboard admin (guest-stars, route-maps, gallery, events, categories). Konten baru wajib ditambahkan di controller + seeder, bukan sebagai konstanta di landing.tsx. Kartu rute memakai foto upload (RouteCard) — tanpa foto tampil blok fallback judul.
