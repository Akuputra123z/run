<?php

namespace App\Http\Controllers;

use App\Enums\RegistrationStatus;
use App\Models\Registration;
use App\Support\RaceTiming;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RaceResultController extends Controller
{
    /**
     * Show the public results leaderboard.
     */
    public function __invoke(Request $request): Response
    {
        $search = trim((string) $request->query('search'));

        $results = Registration::query()
            ->with('category')
            ->where('status', RegistrationStatus::Verified)
            ->whereNotNull('finish_seconds')
            ->when($search, fn ($query, $search) => $query
                ->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('race_number', 'like', "%{$search}%")))
            ->orderBy('finish_seconds')
            ->paginate(20)
            ->withQueryString()
            ->through(function (Registration $registration) {
                $distanceKm = $registration->category->distanceKm();

                return [
                    'id' => $registration->id,
                    'code' => $registration->code,
                    'name' => $registration->name,
                    'category' => $registration->category->distance,
                    'race_number' => $registration->race_number,
                    'finish_time' => RaceTiming::formatSeconds($registration->finish_seconds),
                    'pace' => RaceTiming::pacePerKm($registration->finish_seconds, $distanceKm),
                    'overall_rank' => RaceTiming::rank($registration->finish_seconds),
                    'category_rank' => RaceTiming::rank($registration->finish_seconds, $registration->category_id),
                ];
            });

        return Inertia::render('hasil', [
            'results' => $results,
            'search' => $search,
        ]);
    }
}
