<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\Registration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RaceOpsController extends Controller
{
    /**
     * Show the race pack pickup desk.
     */
    public function racePackIndex(Request $request): Response
    {
        $registration = $this->findByLookup($request->query('q', ''));
        $search = trim((string) $request->query('search'));

        $registrations = Registration::query()
            ->with('category')
            ->when($search, fn ($query, $search) => $query
                ->where(fn ($query) => $query
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('race_number', 'like', "%{$search}%")))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Registration $registration) => [
                'id' => $registration->id,
                'code' => $registration->code,
                'name' => $registration->name,
                'category' => $registration->category->distance,
                'race_number' => $registration->race_number,
                'status' => $registration->status->value,
                'status_label' => $registration->status->label(),
                'pickup_at' => $registration->pickup_at?->format('d M Y H:i'),
                'ops_state' => $registration->checked_in_at
                    ? 'checked_in'
                    : ($registration->pickup_at ? 'picked_up' : 'pending'),
            ]);

        $stats = [
            'total' => Registration::count(),
            'picked_up' => Registration::whereNotNull('pickup_at')->count(),
        ];

        return Inertia::render('admin/race-pack', [
            'registration' => $registration ? $this->payload($registration) : null,
            'query' => trim((string) $request->query('q', '')),
            'registrations' => $registrations,
            'stats' => $stats,
            'search' => $search,
        ]);
    }

    /**
     * Show the race day check-in desk.
     */
    public function checkinIndex(Request $request): Response
    {
        $registration = $this->findByLookup($request->query('q', ''));

        return Inertia::render('admin/check-in', [
            'registration' => $registration ? $this->payload($registration) : null,
            'query' => trim((string) $request->query('q', '')),
        ]);
    }

    /**
     * Hand race pack to a verified runner.
     */
    public function pickup(Request $request): RedirectResponse
    {
        $registration = $this->findByCode($request);

        if (! $registration) {
            return back()->with('error', 'Kode pendaftaran tidak ditemukan.');
        }

        if ($registration->status !== RegistrationStatus::Verified) {
            return back()->with('error', 'Peserta belum lunas, race pack tidak dapat diserahkan.');
        }

        if ($registration->pickup_at) {
            return back()->with('error', 'Race pack sudah diambil pada '.$registration->pickup_at->format('d M Y H:i').'.');
        }

        $registration->update(['pickup_at' => now()]);

        return redirect()
            ->route('admin.race-pack', ['q' => $registration->code])
            ->with('success', 'Race pack '.$registration->code.' diserahkan.');
    }

    /**
     * Check a runner in on race day.
     */
    public function checkin(Request $request): RedirectResponse
    {
        $registration = $this->findByCode($request);

        if (! $registration) {
            return back()->with('error', 'Kode pendaftaran tidak ditemukan.');
        }

        if (! $registration->pickup_at) {
            return back()->with('error', 'Peserta belum mengambil race pack.');
        }

        if ($registration->checked_in_at) {
            return back()->with('error', 'Sudah check-in pada '.$registration->checked_in_at->format('d M Y H:i').'.');
        }

        $registration->update(['checked_in_at' => now()]);

        return redirect()
            ->route('admin.check-in', ['q' => $registration->code])
            ->with('success', 'Check-in berhasil untuk '.$registration->code.'. Selamat berlari!');
    }

    private function findByLookup(string $query): ?Registration
    {
        $code = strtoupper(trim($query));
        $name = trim($query);

        if ($code === '') {
            return null;
        }

        return Registration::with('category')
            ->where(fn ($builder) => $builder
                ->where('code', 'like', "%{$code}%")
                ->orWhere('race_number', 'like', "%{$code}%")
                ->orWhere('name', 'like', "%{$name}%"))
            ->first();
    }

    private function findByCode(Request $request): ?Registration
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20'],
        ]);

        return Registration::query()
            ->where('code', strtoupper(trim($validated['code'])))
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Registration $registration): array
    {
        return [
            'id' => $registration->id,
            'code' => $registration->code,
            'name' => $registration->name,
            'category' => $registration->category->distance,
            'race_number' => $registration->race_number,
            'status' => $registration->status->value,
            'status_label' => $registration->status->label(),
            'ops_state' => $registration->checked_in_at
                ? 'checked_in'
                : ($registration->pickup_at ? 'picked_up' : 'pending'),
            'pickup_at' => $registration->pickup_at?->format('d M Y H:i'),
            'checked_in_at' => $registration->checked_in_at?->format('d M Y H:i'),
        ];
    }
}
