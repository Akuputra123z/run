<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Registration;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Show registration, payment, and revenue summaries.
     */
    public function index(): Response
    {
        $summary = [
            'total' => Registration::count(),
            'verified' => Registration::where('status', RegistrationStatus::Verified)->count(),
            'pending_verification' => Registration::where('status', RegistrationStatus::PendingVerification)->count(),
            'pending_payment' => Registration::where('status', RegistrationStatus::PendingPayment)->count(),
            'cancelled' => Registration::where('status', RegistrationStatus::Cancelled)->count(),
            'finishers' => Registration::whereNotNull('finish_seconds')->count(),
            'revenue' => Registration::where('status', RegistrationStatus::Verified)->sum('total_amount'),
        ];

        $perCategory = Category::query()
            ->withCount(['registrations as active_count' => fn ($query) => $query->whereNot('status', RegistrationStatus::Cancelled)])
            ->orderBy('distance')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'distance' => $category->distance,
                'price' => $category->price,
                'quota' => $category->quota,
                'active_count' => $category->active_count,
                'verified_count' => $category->registrations()->where('status', RegistrationStatus::Verified)->count(),
                'revenue' => $category->registrations()->where('status', RegistrationStatus::Verified)->sum('total_amount'),
            ]);

        $paymentStatus = [
            'pending' => Payment::where('status', PaymentStatus::Pending)->count(),
            'verified' => Payment::where('status', PaymentStatus::Verified)->count(),
            'rejected' => Payment::where('status', PaymentStatus::Rejected)->count(),
        ];

        return Inertia::render('admin/reports', [
            'summary' => $summary,
            'perCategory' => $perCategory,
            'paymentStatus' => $paymentStatus,
        ]);
    }
}
