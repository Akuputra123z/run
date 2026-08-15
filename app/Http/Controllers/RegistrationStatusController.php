<?php

namespace App\Http\Controllers;

use App\Enums\RegistrationStatus;
use App\Models\RacePhoto;
use App\Models\Registration;
use App\Support\RaceTiming;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationStatusController extends Controller
{
    /**
     * Show the registration status page (guest lookup by code).
     */
    public function __invoke(?string $code = null): Response
    {
        $registration = null;

        if ($code) {
            $registration = Registration::with('category', 'latestPayment')
                ->where('code', $code)
                ->first();

            if ($registration) {
                $this->expireOverduePayment($registration);
            }
        }

        return Inertia::render('cek-status', [
            'registration' => $registration ? $this->payload($registration) : null,
        ]);
    }

    /**
     * Recover registration codes for a guest who forgot theirs (email + name).
     */
    public function recover(Request $request): Response|RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:100'],
            'name' => ['required', 'string', 'max:100'],
        ]);

        $recovered = Registration::with('category')
            ->where('email', $validated['email'])
            ->where('name', $validated['name'])
            ->orderByDesc('created_at')
            ->get();

        foreach ($recovered as $registration) {
            $this->expireOverduePayment($registration);
        }

        $recovered = $recovered->map(fn (Registration $registration) => [
            'code' => $registration->code,
            'category' => $registration->category->distance.' · '.$registration->category->name,
            'status' => $registration->status->value,
            'status_label' => $registration->status->label(),
            'total_amount' => $registration->total_amount,
            'payment_due_at' => $registration->payment_due_at?->format('d M Y H:i'),
        ]);

        if ($recovered->isEmpty()) {
            return back()->withErrors([
                'recover' => 'Tidak ditemukan pendaftaran dengan email dan nama tersebut.',
            ]);
        }

        return Inertia::render('cek-status', [
            'registration' => null,
            'recovered' => $recovered->all(),
        ]);
    }

    /**
     * Cancel registrations whose payment window has passed.
     */
    private function expireOverduePayment(Registration $registration): void
    {
        if ($registration->status === RegistrationStatus::PendingPayment
            && $registration->payment_due_at
            && $registration->payment_due_at->isPast()) {
            $registration->update(['status' => RegistrationStatus::Cancelled]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Registration $registration): array
    {
        $payment = $registration->latestPayment;
        $distanceKm = $registration->category->distanceKm();

        $photos = $registration->race_number
            ? RacePhoto::query()
                ->where('bib', $registration->race_number)
                ->latest()
                ->get()
                ->map(fn (RacePhoto $photo) => [
                    'url' => $photo->photoUrl(),
                    'thumb_url' => $photo->photoThumbUrl(),
                    'photographer' => $photo->photographer,
                ])
            : [];

        $result = $registration->finish_seconds !== null ? [
            'finish_time' => RaceTiming::formatSeconds($registration->finish_seconds),
            'pace' => RaceTiming::pacePerKm($registration->finish_seconds, $distanceKm),
            'overall_rank' => RaceTiming::rank($registration->finish_seconds),
            'category_rank' => RaceTiming::rank($registration->finish_seconds, $registration->category_id),
        ] : null;

        return [
            'id' => $registration->id,
            'code' => $registration->code,
            'name' => $registration->name,
            'email' => $registration->email,
            'category' => [
                'distance' => $registration->category->distance,
                'name' => $registration->category->name,
                'price' => $registration->category->price,
            ],
            'status' => $registration->status->value,
            'status_label' => $registration->status->label(),
            'race_number' => $registration->race_number,
            'total_amount' => $registration->total_amount,
            'payment_due_at' => $registration->payment_due_at?->format('d M Y H:i'),
            'paid_at' => $registration->paid_at?->format('d M Y H:i'),
            'pickup_at' => $registration->pickup_at?->format('d M Y H:i'),
            'checked_in_at' => $registration->checked_in_at?->format('d M Y H:i'),
            'payment' => $payment ? [
                'bank' => $payment->bank,
                'account_number' => $payment->account_number,
                'account_name' => $payment->account_name,
                'amount' => $payment->amount,
                'status' => $payment->status->value,
                'status_label' => $payment->status->label(),
                'proof_url' => $payment->proofUrl(),
                'notes' => $payment->notes,
            ] : null,
            'result' => $result,
            'photos' => $photos,
        ];
    }
}
