<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Support\RaceTiming;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResultsController extends Controller
{
    /**
     * List verified registrations for finish time entry.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));

        $registrations = Registration::query()
            ->with('category')
            ->where('status', RegistrationStatus::Verified)
            ->when($search, fn ($query, $search) => $query
                ->where(fn ($query) => $query
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('race_number', 'like', "%{$search}%")))
            ->orderByDesc('finish_seconds')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Registration $registration) => [
                'id' => $registration->id,
                'code' => $registration->code,
                'name' => $registration->name,
                'category' => $registration->category->distance,
                'race_number' => $registration->race_number,
                'finish_time' => $registration->finish_seconds
                    ? RaceTiming::formatSeconds($registration->finish_seconds)
                    : null,
            ]);

        $imported = 0;
        $skipped = 0;

        if ($request->hasSession() && $request->session()->has('result_import')) {
            $summary = $request->session()->pull('result_import');
            $imported = $summary['imported'];
            $skipped = $summary['skipped'];
        }

        return Inertia::render('admin/timing', [
            'registrations' => $registrations,
            'search' => $search,
            'imported' => $imported,
            'skipped' => $skipped,
        ]);
    }

    /**
     * Set a single runner's finish time.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'registration_id' => ['required', 'integer', 'exists:registrations,id'],
            'finish_time' => ['nullable', 'string', 'max:20'],
        ]);

        $registration = Registration::findOrFail($validated['registration_id']);

        $seconds = $validated['finish_time'] ? RaceTiming::parseTime($validated['finish_time']) : null;

        if ($validated['finish_time'] && $seconds === null) {
            return back()->with('error', 'Format waktu salah. Gunakan H:MM:SS (contoh: 1:12:35).');
        }

        $registration->update(['finish_seconds' => $seconds]);

        $message = $seconds === null
            ? "Waktu finish {$registration->code} dihapus."
            : "Waktu finish {$registration->code}: ".RaceTiming::formatSeconds($seconds);

        return back()->with('success', $message);
    }

    /**
     * Import finish times from a CSV (code,time).
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'csv' => ['required', 'file', 'mimes:csv,txt', 'max:1024'],
        ]);

        $handle = fopen($request->file('csv')->getRealPath(), 'r');
        $imported = 0;
        $skipped = 0;
        $isHeader = true;

        while (($row = fgetcsv($handle)) !== false) {
            if ($isHeader) {
                $isHeader = false;

                if (strtolower((string) ($row[0] ?? '')) === 'code') {
                    continue;
                }
            }

            $code = strtoupper(trim((string) ($row[0] ?? '')));
            $seconds = RaceTiming::parseTime((string) ($row[1] ?? ''));

            if ($code === '' || $seconds === null) {
                $skipped++;

                continue;
            }

            $updated = Registration::query()
                ->where('code', $code)
                ->where('status', RegistrationStatus::Verified)
                ->update(['finish_seconds' => $seconds]);

            $updated > 0 ? $imported++ : $skipped++;
        }

        fclose($handle);

        return back()->with([
            'success' => "Import selesai: {$imported} peserta diperbarui, {$skipped} baris dilewati.",
            'result_import' => ['imported' => $imported, 'skipped' => $skipped],
        ]);
    }
}
