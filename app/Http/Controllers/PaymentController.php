<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Enums\RegistrationStatus;
use App\Http\Requests\UploadProofRequest;
use App\Mail\RegistrationMail;
use App\Models\Registration;
use App\Support\EventSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    /**
     * Upload a transfer proof for a registration.
     */
    public function storeProof(UploadProofRequest $request, Registration $registration): RedirectResponse
    {
        if ($registration->status === RegistrationStatus::Verified) {
            return back()->with('error', 'Pendaftaran ini sudah lunas.');
        }

        if ($registration->status === RegistrationStatus::Cancelled) {
            return back()->with('error', 'Pendaftaran sudah dibatalkan.');
        }

        $payment = $registration->latestPayment
            ?? $registration->payments()->create([
                'method' => 'transfer',
                'bank' => EventSettings::get('bank', (string) config('registration.bank')),
                'account_number' => EventSettings::get('account_number', (string) config('registration.account_number')),
                'account_name' => EventSettings::get('account_name', (string) config('registration.account_name')),
                'amount' => $registration->total_amount,
                'status' => PaymentStatus::Pending,
            ]);

        $path = $request->file('proof')->store('payments', 'public');

        $payment->update([
            'proof_path' => $path,
            'status' => PaymentStatus::Pending,
            'notes' => null,
        ]);

        $registration->update(['status' => RegistrationStatus::PendingVerification]);

        Mail::to($registration->email)->send(new RegistrationMail(
            $registration,
            'Bukti Pembayaran Diterima',
            ['Bukti transfer kamu sudah kami terima dan sedang diverifikasi oleh panitia.'],
        ));

        return back()->with('success', 'Bukti transfer terkirim. Status menunggu verifikasi panitia.');
    }
}
