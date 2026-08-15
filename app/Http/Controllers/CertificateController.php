<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Support\RaceTiming;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    /**
     * Show the printable finisher certificate.
     */
    public function __invoke(string $code): Response|RedirectResponse
    {
        $registration = Registration::with('category')
            ->where('code', strtoupper($code))
            ->first();

        if (! $registration || $registration->finish_seconds === null) {
            return redirect()->route('registration.status', ['code' => $code])
                ->with('error', 'Sertifikat tersedia setelah hasil finish tercatat.');
        }

        $distanceKm = $registration->category->distanceKm();

        return Inertia::render('sertifikat', [
            'certificate' => [
                'name' => $registration->name,
                'code' => $registration->code,
                'category' => $registration->category->distance,
                'race_number' => $registration->race_number,
                'finish_time' => RaceTiming::formatSeconds($registration->finish_seconds),
                'pace' => RaceTiming::pacePerKm($registration->finish_seconds, $distanceKm),
                'overall_rank' => RaceTiming::rank($registration->finish_seconds),
            ],
        ]);
    }
}
