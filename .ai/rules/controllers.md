---
paths:
  - 'app/Http/Controllers/**'
  - app/Http/Controllers/RegistrationStatusController.php
---

# Controllers

## Use RaceTiming::rank() for result rankings
Rank/pace/finish-time logic is centralized in App\Support\RaceTiming (formatSeconds, parseTime, pacePerKm, rank). Never re-inline rank queries in controllers — call RaceTiming::rank($finishSeconds, ?$categoryId) so dashboard, cek-status, hasil, and sertifikat stay consistent.

## Guest recovery by email+name, non-sensitive payload
Recovery kode pendaftaran: POST cek-status/recover, cocokkan email+nama (bukan email saja). Payload hanya non-sensitif (code, category, status, total, due). Tanpa hasil → back() + withErrors(['recover' => ...]); di frontend error itu dibaca dari usePage().props.errors, bukan errors useForm (kunci bukan field form).
