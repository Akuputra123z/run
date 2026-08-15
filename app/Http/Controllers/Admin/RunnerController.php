<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Registration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RunnerController extends Controller
{
    /**
     * List runners (registrations) with search and category filters.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));
        $categoryId = $request->query('category');

        $runners = Registration::query()
            ->with('category')
            ->when($search, fn ($query, $search) => $query
                ->where(fn ($query) => $query
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")))
            ->when($categoryId, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Registration $registration) => [
                'id' => $registration->id,
                'code' => $registration->code,
                'name' => $registration->name,
                'email' => $registration->email,
                'phone' => $registration->phone,
                'city' => $registration->city,
                'community' => $registration->community,
                'category' => $registration->category->distance,
                'race_number' => $registration->race_number,
                'status' => $registration->status->value,
                'status_label' => $registration->status->label(),
                'created_at' => $registration->created_at->format('d M Y H:i'),
            ]);

        $categories = Category::query()
            ->orderBy('distance')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'distance' => $category->distance,
                'name' => $category->name,
            ]);

        $stats = [
            'total' => Registration::whereNot('status', RegistrationStatus::Cancelled)->count(),
            'verified' => Registration::where('status', RegistrationStatus::Verified)->count(),
            'pending' => Registration::whereIn('status', [RegistrationStatus::PendingPayment, RegistrationStatus::PendingVerification])->count(),
        ];

        return Inertia::render('admin/runners', [
            'runners' => $runners,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'category' => $categoryId ? (int) $categoryId : null,
            ],
        ]);
    }
}
