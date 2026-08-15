<?php

use App\Enums\PaymentStatus;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);
});

test('admin sees payments with registration info', function () {
    $registration = Registration::factory()->create(['category_id' => $this->category->id]);
    $payment = Payment::factory()->create([
        'registration_id' => $registration->id,
        'status' => PaymentStatus::Pending,
        'amount' => 150000,
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.payments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/payments')
            ->has('payments.data', 1)
            ->where('payments.data.0.id', $payment->id)
            ->where('payments.data.0.registration.code', $registration->code)
            ->where('stats.pending', 1));
});

test('admin can filter payments by status', function () {
    $registration = Registration::factory()->create(['category_id' => $this->category->id]);
    Payment::factory()->create(['registration_id' => $registration->id, 'status' => PaymentStatus::Verified]);
    Payment::factory()->create(['registration_id' => $registration->id, 'status' => PaymentStatus::Pending]);

    $this->actingAs($this->admin)
        ->get(route('admin.payments.index', ['status' => 'verified']))
        ->assertInertia(fn ($page) => $page
            ->has('payments.data', 1)
            ->where('payments.data.0.status', 'verified'));
});

test('admin verifies payment and issues race number', function () {
    $registration = Registration::factory()->create(['category_id' => $this->category->id]);
    $payment = Payment::factory()->create([
        'registration_id' => $registration->id,
        'status' => PaymentStatus::Pending,
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.payments.verify', $payment))
        ->assertRedirect()
        ->assertSessionHas('success');

    $registration->refresh();

    $this->assertSame(PaymentStatus::Verified, $payment->fresh()->status);
    $this->assertSame('verified', $registration->status->value);
    $this->assertNotNull($registration->race_number);
    $this->assertNotNull($registration->paid_at);
});

test('admin rejects payment and returns registration to pending payment', function () {
    $registration = Registration::factory()->create(['category_id' => $this->category->id]);
    $payment = Payment::factory()->create([
        'registration_id' => $registration->id,
        'status' => PaymentStatus::Pending,
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.payments.reject', $payment), ['notes' => 'Bukti tidak terbaca'])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertSame(PaymentStatus::Rejected, $payment->fresh()->status);
    $this->assertSame('pending_payment', $registration->fresh()->status->value);
    $this->assertSame('Bukti tidak terbaca', $payment->fresh()->notes);
});
