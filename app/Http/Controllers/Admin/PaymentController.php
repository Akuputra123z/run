<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Mail\RegistrationMail;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Registration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * List payments with their registrations, filterable by status.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $payments = Payment::query()
            ->with('registration.category')
            ->when($status, fn ($query, $status) => $query->where('status', $status))
            ->when($search, fn ($query, $search) => $query
                ->whereHas('registration', fn ($query) => $query
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Payment $payment) => [
                'id' => $payment->id,
                'method' => $payment->method,
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
                'registration' => [
                    'id' => $payment->registration->id,
                    'code' => $payment->registration->code,
                    'name' => $payment->registration->name,
                    'email' => $payment->registration->email,
                    'status' => $payment->registration->status->value,
                    'status_label' => $payment->registration->status->label(),
                    'race_number' => $payment->registration->race_number,
                    'category' => $payment->registration->category->distance,
                ],
            ]);

        $stats = [
            'total' => Payment::count(),
            'pending' => Payment::where('status', PaymentStatus::Pending)->count(),
            'verified' => Payment::where('status', PaymentStatus::Verified)->count(),
            'rejected' => Payment::where('status', PaymentStatus::Rejected)->count(),
        ];

        return Inertia::render('admin/payments', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Verify a payment and assign a race number.
     */
    public function verifyPayment(Payment $payment): RedirectResponse
    {
        $registration = $payment->registration;

        $raceNumber = DB::transaction(function () use ($payment, $registration): string {
            $category = Category::query()->lockForUpdate()->findOrFail($registration->category_id);

            $sequence = Registration::where('category_id', $category->id)
                ->where('status', RegistrationStatus::Verified)
                ->count() + 1;

            $raceNumber = 'KBR-'.$category->distance.'-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);

            $payment->update([
                'status' => PaymentStatus::Verified,
                'verified_by' => auth()->id(),
                'verified_at' => now(),
            ]);

            $registration->update([
                'status' => RegistrationStatus::Verified,
                'race_number' => $raceNumber,
                'paid_at' => now(),
            ]);

            return $raceNumber;
        });

        Mail::to($registration->email)->send(new RegistrationMail(
            $registration,
            'Pembayaran Terverifikasi - CV WIYATA AMERTA BUSINESS RUN 2026',
            [
                "Pembayaran kamu sudah kami verifikasi. Nomor dada (race number) kamu: {$raceNumber}.",
                'Tunjukkan e-ticket saat pengambilan race pack.',
            ],
        ));

        return back()->with('success', "Pembayaran diverifikasi. Race number: {$raceNumber}");
    }

    /**
     * Reject a payment proof.
     */
    public function rejectPayment(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['required', 'string', 'max:255'],
        ]);

        $registration = $payment->registration;

        $payment->update([
            'status' => PaymentStatus::Rejected,
            'verified_by' => auth()->id(),
            'notes' => $validated['notes'],
        ]);

        $registration->update(['status' => RegistrationStatus::PendingPayment]);

        Mail::to($registration->email)->send(new RegistrationMail(
            $registration,
            'Bukti Pembayaran Ditolak',
            [
                'Bukti transfer kamu belum bisa kami verifikasi dengan alasan: '.$validated['notes'],
                'Silakan unggah ulang bukti transfer yang benar.',
            ],
        ));

        return back()->with('success', 'Pembayaran ditolak. Peserta dapat mengunggah ulang bukti.');
    }
}
