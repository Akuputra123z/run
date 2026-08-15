<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Registration;
use App\Support\RaceTiming;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    /**
     * Show the race leaderboard (admin view).
     */
    public function __invoke(): Response
    {
        $categories = Category::query()
            ->orderBy('distance')
            ->get();

        $overall = Registration::query()
            ->with('category')
            ->where('status', RegistrationStatus::Verified)
            ->whereNotNull('finish_seconds')
            ->orderBy('finish_seconds')
            ->limit(10)
            ->get()
            ->map(fn (Registration $registration) => $this->row($registration, RaceTiming::rank($registration->finish_seconds)));

        $perCategory = $categories->map(fn (Category $category) => [
            'id' => $category->id,
            'name' => $category->name,
            'distance' => $category->distance,
            'finishers' => Registration::query()
                ->with('category')
                ->where('category_id', $category->id)
                ->whereNotNull('finish_seconds')
                ->orderBy('finish_seconds')
                ->limit(5)
                ->get()
                ->map(fn (Registration $registration) => $this->row(
                    $registration,
                    RaceTiming::rank($registration->finish_seconds, $category->id),
                )),
        ]);

        return Inertia::render('admin/results', [
            'overall' => $overall,
            'perCategory' => $perCategory,
            'finisher_count' => Registration::whereNotNull('finish_seconds')->count(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Registration $registration, int $rank): array
    {
        return [
            'id' => $registration->id,
            'code' => $registration->code,
            'name' => $registration->name,
            'category' => $registration->category->distance,
            'race_number' => $registration->race_number,
            'finish_time' => RaceTiming::formatSeconds($registration->finish_seconds),
            'rank' => $rank,
        ];
    }
}
