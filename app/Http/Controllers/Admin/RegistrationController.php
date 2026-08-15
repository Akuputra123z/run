<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Registration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RegistrationController extends Controller
{
    /**
     * List registrations with filters and stats.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $categoryId = $request->query('category');
        $search = $request->query('search');

        $registrations = Registration::query()
            ->with('category', 'latestPayment')
            ->when($status, fn ($query, $status) => $query->where('status', $status))
            ->when($categoryId, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($search, fn ($query, $search) => $query
                ->where(fn ($query) => $query
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Registration $registration) => [
                ...$registration->toArray(),
                'category' => [
                    'distance' => $registration->category->distance,
                    'name' => $registration->category->name,
                ],
                'payment' => $registration->latestPayment ? [
                    'id' => $registration->latestPayment->id,
                    'bank' => $registration->latestPayment->bank,
                    'account_number' => $registration->latestPayment->account_number,
                    'account_name' => $registration->latestPayment->account_name,
                    'amount' => $registration->latestPayment->amount,
                    'status' => $registration->latestPayment->status->value,
                    'status_label' => $registration->latestPayment->status->label(),
                    'proof_url' => $registration->latestPayment->proofUrl(),
                    'notes' => $registration->latestPayment->notes,
                    'verified_at' => $registration->latestPayment->verified_at?->format('d M Y H:i'),
                    'created_at' => $registration->latestPayment->created_at->format('d M Y H:i'),
                ] : null,
            ]);

        $categories = Category::query()
            ->withCount(['registrations as active_count' => fn ($query) => $query->whereNot('status', RegistrationStatus::Cancelled)])
            ->orderBy('distance')
            ->get();

        $stats = [
            'total' => Registration::count(),
            'verified' => Registration::where('status', RegistrationStatus::Verified)->count(),
            'pending_verification' => Registration::where('status', RegistrationStatus::PendingVerification)->count(),
            'pending_payment' => Registration::where('status', RegistrationStatus::PendingPayment)->count(),
            'revenue' => Registration::where('status', RegistrationStatus::Verified)->sum('total_amount'),
        ];

        return Inertia::render('admin/registrations', [
            'registrations' => $registrations,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'category' => $categoryId ? (int) $categoryId : null,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show a single registration with its payments.
     */
    public function show(Registration $registration): Response
    {
        $registration->load('category', 'payments');

        return Inertia::render('admin/registration-detail', [
            'registration' => [
                'id' => $registration->id,
                'code' => $registration->code,
                'name' => $registration->name,
                'email' => $registration->email,
                'phone' => $registration->phone,
                'nik' => $registration->nik,
                'gender' => $registration->gender,
                'birth_date' => $registration->birth_date,
                'city' => $registration->city,
                'jersey_size' => $registration->jersey_size,
                'emergency_name' => $registration->emergency_name,
                'emergency_phone' => $registration->emergency_phone,
                'community' => $registration->community,
                'status' => $registration->status->value,
                'status_label' => $registration->status->label(),
                'race_number' => $registration->race_number,
                'total_amount' => $registration->total_amount,
                'created_at' => $registration->created_at->format('d M Y H:i'),
                'category' => [
                    'distance' => $registration->category->distance,
                    'name' => $registration->category->name,
                ],
                'payments' => $registration->payments->map(fn (Payment $payment) => [
                    'id' => $payment->id,
                    'bank' => $payment->bank,
                    'account_number' => $payment->account_number,
                    'account_name' => $payment->account_name,
                    'amount' => $payment->amount,
                    'status' => $payment->status->value,
                    'status_label' => $payment->status->label(),
                    'proof_url' => $payment->proofUrl(),
                    'notes' => $payment->notes,
                    'verified_at' => $payment->verified_at?->format('d M Y H:i'),
                    'created_at' => $payment->created_at->format('d M Y H:i'),
                ]),
            ],
        ]);
    }

    /**
     * Export registrations as CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $status = $request->query('status');

        $registrations = Registration::query()
            ->with('category')
            ->when($status, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->get();

        $filename = 'registrations-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($registrations): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Kode', 'Nama', 'Email', 'No HP', 'NIK', 'Gender', 'Tgl Lahir', 'Kota',
                'Kategori', 'Jarak', 'Ukuran Jersey', 'Komunitas', 'Kontak Darurat', 'No Kontak Darurat',
                'Status', 'Race Number', 'Total Bayar', 'Dibuat',
            ]);

            foreach ($registrations as $registration) {
                fputcsv($handle, [
                    $registration->code,
                    $registration->name,
                    $registration->email,
                    $registration->phone,
                    $registration->nik,
                    $registration->gender,
                    $registration->birth_date,
                    $registration->city,
                    $registration->category->name,
                    $registration->category->distance,
                    $registration->jersey_size,
                    $registration->community,
                    $registration->emergency_name,
                    $registration->emergency_phone,
                    $registration->status->value,
                    $registration->race_number,
                    $registration->total_amount,
                    $registration->created_at->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
