<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BibController extends Controller
{
    /**
     * List assigned race numbers with their runners.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));

        $bibs = Registration::query()
            ->with('category')
            ->whereNotNull('race_number')
            ->when($search, fn ($query, $search) => $query
                ->where(fn ($query) => $query
                    ->where('race_number', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")))
            ->orderBy('race_number')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Registration $registration) => [
                'id' => $registration->id,
                'code' => $registration->code,
                'name' => $registration->name,
                'race_number' => $registration->race_number,
                'category' => $registration->category->distance,
                'status' => $registration->status->value,
                'status_label' => $registration->status->label(),
                'pickup_at' => $registration->pickup_at?->format('d M Y H:i'),
                'checked_in_at' => $registration->checked_in_at?->format('d M Y H:i'),
            ]);

        $stats = [
            'total' => Registration::whereNotNull('race_number')->count(),
            'picked_up' => Registration::whereNotNull('race_number')->whereNotNull('pickup_at')->count(),
            'checked_in' => Registration::whereNotNull('race_number')->whereNotNull('checked_in_at')->count(),
        ];

        return Inertia::render('admin/bibs', [
            'bibs' => $bibs,
            'stats' => $stats,
            'search' => $search,
        ]);
    }
}
