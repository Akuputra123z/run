<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Support\RaceTiming;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    /**
     * List finishers whose certificates are available.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));

        $finishers = Registration::query()
            ->with('category')
            ->whereNotNull('finish_seconds')
            ->when($search, fn ($query, $search) => $query
                ->where(fn ($query) => $query
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('race_number', 'like', "%{$search}%")))
            ->orderBy('finish_seconds')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Registration $registration) => [
                'id' => $registration->id,
                'code' => $registration->code,
                'name' => $registration->name,
                'category' => $registration->category->distance,
                'race_number' => $registration->race_number,
                'finish_time' => RaceTiming::formatSeconds($registration->finish_seconds),
            ]);

        return Inertia::render('admin/certificates', [
            'finishers' => $finishers,
            'search' => $search,
        ]);
    }
}
