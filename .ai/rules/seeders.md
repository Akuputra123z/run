---
paths:
  - 'database/seeders/**'
---

# Seeders

## DatabaseSeeder harus idempotent
db:seed dijalankan ulang pada DB yang sudah ada (bukan hanya fresh install). Semua insert pakai updateOrCreate dengan key unik (email user, distance kategori, name guest star, photo_path galeri, key settings). Menambahkan data seed baru tanpa updateOrCreate akan menduplikasi baris di DB dev.
