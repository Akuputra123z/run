<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Enums\RegistrationStatus;
use App\Http\Requests\StoreRegistrationRequest;
use App\Mail\RegistrationMail;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Registration;
use App\Support\EventSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    /**
     * Show the registration form.
     */
    public function create(): Response
    {
        $categories = Category::query()
            ->orderBy('distance')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'distance' => $category->distance,
                'price' => $category->price,
                'quota' => $category->quota,
                'slots_left' => $category->slotsLeft(),
            ]);

        return Inertia::render('daftar', [
            'categories' => $categories,
            'bank' => [
                'bank' => EventSettings::get('bank', (string) config('registration.bank')),
                'account_number' => EventSettings::get('account_number', (string) config('registration.account_number')),
                'account_name' => EventSettings::get('account_name', (string) config('registration.account_name')),
            ],
        ]);
    }

    /**
     * Store a new registration.
     */
    public function store(StoreRegistrationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $registration = DB::transaction(function () use ($validated): Registration {
            $category = Category::query()->lockForUpdate()->findOrFail($validated['category_id']);

            if ($category->isFull()) {
                throw ValidationException::withMessages([
                    'category_id' => 'Kuota kategori '.$category->distance.' sudah penuh.',
                ]);
            }

            Registration::query()
                ->where('email', $validated['email'])
                ->where('category_id', $category->id)
                ->where('status', RegistrationStatus::PendingPayment)
                ->whereNotNull('payment_due_at')
                ->where('payment_due_at', '<', now())
                ->update(['status' => RegistrationStatus::Cancelled]);

            $alreadyRegistered = Registration::query()
                ->where('email', $validated['email'])
                ->where('category_id', $category->id)
                ->whereNot('status', RegistrationStatus::Cancelled)
                ->exists();

            if ($alreadyRegistered) {
                throw ValidationException::withMessages([
                    'category_id' => 'Email ini sudah terdaftar pada kategori '.$category->distance.'.',
                ]);
            }

            $registration = Registration::create([
                ...$validated,
                'code' => $this->generateCode(),
                'status' => RegistrationStatus::PendingPayment,
                'total_amount' => $category->price,
                'payment_due_at' => now()->addHours((int) EventSettings::get('payment_hours', (string) config('registration.payment_hours'))),
            ]);

            Payment::create([
                'registration_id' => $registration->id,
                'method' => 'transfer',
                'bank' => EventSettings::get('bank', (string) config('registration.bank')),
                'account_number' => EventSettings::get('account_number', (string) config('registration.account_number')),
                'account_name' => EventSettings::get('account_name', (string) config('registration.account_name')),
                'amount' => $category->price,
                'status' => PaymentStatus::Pending,
            ]);

            return $registration;
        });

        Mail::to($registration->email)->send(new RegistrationMail(
            $registration,
            'Pendaftaran CV WIYATA AMERTA BUSINESS RUN 2026 Berhasil',
            [
                'Silakan lakukan pembayaran maksimal '.EventSettings::get('payment_hours', (string) config('registration.payment_hours')).' jam ke rekening panitia:',
                EventSettings::get('bank', (string) config('registration.bank')).' '.EventSettings::get('account_number', (string) config('registration.account_number')).' a.n. '.EventSettings::get('account_name', (string) config('registration.account_name')),
            ],
        ));

        return redirect()
            ->route('registration.status', ['code' => $registration->code])
            ->with('success', 'Pendaftaran berhasil! Silakan selesaikan pembayaran.');
    }

    /**
     * Generate a unique registration code.
     */
    private function generateCode(): string
    {
        do {
            $code = 'KBR-2026-'.strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
        } while (Registration::where('code', $code)->exists());

        return $code;
    }
}
