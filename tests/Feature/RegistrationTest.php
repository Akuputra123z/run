<?php

use App\Enums\PaymentStatus;
use App\Enums\RegistrationStatus;
use App\Mail\RegistrationMail;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    Mail::fake();
});

test('registration form can be rendered', function () {
    $category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);

    $this->get(route('registration.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('daftar')
            ->has('categories', 1)
            ->where('categories.0.id', $category->id));
});

test('guest can register with valid data', function () {
    $category = Category::factory()->create(['distance' => '10K', 'price' => 225000, 'quota' => 100]);

    $response = $this->post(route('registration.store'), [
        'category_id' => $category->id,
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'phone' => '081234567890',
        'nik' => '3317000000000001',
        'gender' => 'men',
        'birth_date' => '1995-05-20',
        'city' => 'Rembang',
        'jersey_size' => 'L',
        'emergency_name' => 'Siti',
        'emergency_phone' => '081298765432',
        'community' => 'Runners Rembang',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('registrations', [
        'email' => 'budi@example.com',
        'category_id' => $category->id,
        'status' => RegistrationStatus::PendingPayment->value,
        'total_amount' => 225000,
        'race_number' => null,
    ]);

    $registration = Registration::where('email', 'budi@example.com')->first();

    expect($registration)->not->toBeNull();
    expect($registration->code)->toMatch('/^KBR-2026-[A-Z0-9]{4}$/');
    expect($registration->payment_due_at)->not->toBeNull();

    $this->assertDatabaseHas('payments', [
        'registration_id' => $registration->id,
        'amount' => 225000,
        'status' => PaymentStatus::Pending->value,
    ]);

    Mail::assertQueued(RegistrationMail::class);
});

test('registration validates required fields', function () {
    $this->post(route('registration.store'), [])
        ->assertSessionHasErrors(['category_id', 'name', 'email', 'phone', 'gender', 'birth_date', 'city', 'jersey_size', 'emergency_name', 'emergency_phone']);
});

test('registration rejects invalid jersey size and nik format', function () {
    $category = Category::factory()->create();

    $this->post(route('registration.store'), [
        'category_id' => $category->id,
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'phone' => '081234567890',
        'nik' => '123',
        'gender' => 'men',
        'birth_date' => '1995-05-20',
        'city' => 'Rembang',
        'jersey_size' => 'XXXL',
        'emergency_name' => 'Siti',
        'emergency_phone' => '081298765432',
    ])->assertSessionHasErrors(['nik', 'jersey_size']);
});

test('registration is rejected when category quota is full', function () {
    $category = Category::factory()->create(['quota' => 1]);

    Registration::factory()->create(['category_id' => $category->id]);

    $this->post(route('registration.store'), [
        'category_id' => $category->id,
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'phone' => '081234567890',
        'gender' => 'men',
        'birth_date' => '1995-05-20',
        'city' => 'Rembang',
        'jersey_size' => 'L',
        'emergency_name' => 'Siti',
        'emergency_phone' => '081298765432',
    ])->assertSessionHasErrors('category_id');

    $this->assertDatabaseCount('registrations', 1);
});

test('registration is rejected for duplicate email on same category', function () {
    $category = Category::factory()->create();

    Registration::factory()->create([
        'category_id' => $category->id,
        'email' => 'budi@example.com',
    ]);

    $this->post(route('registration.store'), [
        'category_id' => $category->id,
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'phone' => '081234567890',
        'gender' => 'men',
        'birth_date' => '1995-05-20',
        'city' => 'Rembang',
        'jersey_size' => 'L',
        'emergency_name' => 'Siti',
        'emergency_phone' => '081298765432',
    ])->assertSessionHasErrors('category_id');
});

test('registration is allowed again after expired pending payment', function () {
    $category = Category::factory()->create(['price' => 200000]);

    Registration::factory()->create([
        'category_id' => $category->id,
        'email' => 'budi@example.com',
        'status' => RegistrationStatus::PendingPayment,
        'payment_due_at' => now()->subHour(),
    ]);

    $this->post(route('registration.store'), [
        'category_id' => $category->id,
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'phone' => '081234567890',
        'gender' => 'men',
        'birth_date' => '1995-05-20',
        'city' => 'Rembang',
        'jersey_size' => 'L',
        'emergency_name' => 'Siti',
        'emergency_phone' => '081298765432',
    ])->assertRedirect();

    $this->assertDatabaseCount('registrations', 2);

    $old = Registration::where('email', 'budi@example.com')->oldest('id')->first();
    expect($old->status)->toBe(RegistrationStatus::Cancelled);

    $new = Registration::where('email', 'budi@example.com')->latest('id')->first();
    expect($new->status)->toBe(RegistrationStatus::PendingPayment);
    expect($new->code)->not->toBe($old->code);
});

test('registration status can be looked up by code', function () {
    $registration = Registration::factory()->verified()->create();

    $this->get(route('registration.status', $registration->code))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cek-status')
            ->where('registration.code', $registration->code)
            ->where('registration.status', RegistrationStatus::Verified->value)
            ->where('registration.race_number', $registration->race_number));
});

test('overdue pending payment is cancelled on lookup', function () {
    $registration = Registration::factory()->create([
        'payment_due_at' => now()->subHour(),
    ]);

    $this->get(route('registration.status', $registration->code));

    expect($registration->fresh()->status)->toBe(RegistrationStatus::Cancelled);
});

test('guest can recover registration code with matching email and name', function () {
    $registration = Registration::factory()->create([
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
    ]);

    $this->post(route('registration.recover'), [
        'email' => 'budi@example.com',
        'name' => 'Budi Santoso',
    ])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cek-status')
            ->where('registration', null)
            ->has('recovered', 1)
            ->where('recovered.0.code', $registration->code)
            ->where('recovered.0.category', $registration->category->distance.' · '.$registration->category->name)
            ->where('recovered.0.status', RegistrationStatus::PendingPayment->value)
            ->where('recovered.0.total_amount', $registration->total_amount));
});

test('recovery payload never exposes sensitive fields', function () {
    $registration = Registration::factory()->create([
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'phone' => '081234567890',
        'nik' => '3317000000000001',
    ]);

    $this->post(route('registration.recover'), [
        'email' => 'budi@example.com',
        'name' => 'Budi Santoso',
    ])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('recovered', 1)
            ->missing('recovered.0.email')
            ->missing('recovered.0.phone')
            ->missing('recovered.0.nik'));
});

test('recovery returns all registrations for the same email on different categories', function () {
    $categoryA = Category::factory()->create();
    $categoryB = Category::factory()->create();
    $first = Registration::factory()->create([
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'category_id' => $categoryA->id,
        'created_at' => now()->subDay(),
    ]);
    $second = Registration::factory()->create([
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'category_id' => $categoryB->id,
        'created_at' => now(),
    ]);

    $this->post(route('registration.recover'), [
        'email' => 'budi@example.com',
        'name' => 'Budi Santoso',
    ])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('recovered', 2)
            ->where('recovered.0.code', $second->code)
            ->where('recovered.1.code', $first->code));
});

test('recovery fails when name does not match', function () {
    Registration::factory()->create([
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
    ]);

    $this->post(route('registration.recover'), [
        'email' => 'budi@example.com',
        'name' => 'Orang Lain',
    ])
        ->assertRedirect()
        ->assertSessionHasErrors('recover');
});

test('recovery fails when email is not registered', function () {
    $this->post(route('registration.recover'), [
        'email' => 'tidak-ada@example.com',
        'name' => 'Budi Santoso',
    ])
        ->assertRedirect()
        ->assertSessionHasErrors('recover');
});

test('recovery validates email and name as required', function () {
    $this->post(route('registration.recover'), [])
        ->assertSessionHasErrors(['email', 'name']);
});

test('proof upload sets registration to pending verification', function () {
    $registration = Registration::factory()->create();
    $payment = Payment::factory()->create(['registration_id' => $registration->id]);

    Storage::fake('public');

    $response = $this->post(route('registration.proof', $registration), [
        'proof' => UploadedFile::fake()->image('bukti.jpg', 800, 600),
    ]);

    $response->assertRedirect();

    expect($registration->fresh()->status)->toBe(RegistrationStatus::PendingVerification);
    expect($payment->fresh()->status)->toBe(PaymentStatus::Pending);
    expect($payment->fresh()->proof_path)->not->toBeNull();
    Storage::disk('public')->assertExists($payment->fresh()->proof_path);

    Mail::assertQueued(RegistrationMail::class);
});

test('proof upload rejects non-image files', function () {
    $registration = Registration::factory()->create();

    $this->post(route('registration.proof', $registration), [
        'proof' => UploadedFile::fake()->create('bukti.txt', 100),
    ])->assertSessionHasErrors('proof');
});

test('admin can list registrations', function () {
    $admin = User::factory()->admin()->create();

    Registration::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('admin.registrations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/registrations')
            ->has('registrations.data', 3)
            ->where('stats.total', 3));
});

test('admin list includes payment info for row actions', function () {
    $admin = User::factory()->admin()->create();
    $registration = Registration::factory()->create(['status' => RegistrationStatus::PendingVerification]);
    $payment = Payment::factory()->create([
        'registration_id' => $registration->id,
        'status' => PaymentStatus::Pending,
        'proof_path' => 'payments/bukti.jpg',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.registrations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/registrations')
            ->has('registrations.data.0.payment')
            ->where('registrations.data.0.payment.id', $payment->id)
            ->where('registrations.data.0.payment.status', 'pending')
            ->where('registrations.data.0.payment.proof_url', Storage::disk('public')->url('payments/bukti.jpg')));
});

test('admin can approve a registration without uploaded proof', function () {
    $admin = User::factory()->admin()->create();
    $registration = Registration::factory()->create(['status' => RegistrationStatus::PendingPayment]);
    $payment = Payment::factory()->create(['registration_id' => $registration->id]);

    $this->actingAs($admin)
        ->post(route('admin.payments.verify', $payment))
        ->assertRedirect();

    expect($registration->fresh()->status)->toBe(RegistrationStatus::Verified);
    expect($registration->fresh()->race_number)->toMatch('/^KBR-\d+K-\d{4}$/');
});

test('non-admin cannot access admin pages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.registrations.index'))
        ->assertForbidden();
});

test('admin verification issues race number and marks registration verified', function () {
    $admin = User::factory()->admin()->create();
    $registration = Registration::factory()->create(['status' => RegistrationStatus::PendingVerification]);
    $payment = Payment::factory()->create([
        'registration_id' => $registration->id,
        'status' => PaymentStatus::Pending,
        'proof_path' => 'payments/bukti.jpg',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.payments.verify', $payment))
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Verified);
    expect($payment->fresh()->verified_by)->toBe($admin->id);
    expect($registration->fresh()->status)->toBe(RegistrationStatus::Verified);
    expect($registration->fresh()->race_number)->toMatch('/^KBR-\d+K-\d{4}$/');
    expect($registration->fresh()->paid_at)->not->toBeNull();

    Mail::assertQueued(RegistrationMail::class);
});

test('race numbers are sequential per category', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['distance' => '5K']);

    $first = Registration::factory()->create([
        'category_id' => $category->id,
        'status' => RegistrationStatus::PendingVerification,
    ]);
    $second = Registration::factory()->create([
        'category_id' => $category->id,
        'status' => RegistrationStatus::PendingVerification,
    ]);

    $this->actingAs($admin)->post(route('admin.payments.verify', Payment::factory()->create(['registration_id' => $first->id])));
    $this->actingAs($admin)->post(route('admin.payments.verify', Payment::factory()->create(['registration_id' => $second->id])));

    expect($first->fresh()->race_number)->toBe('KBR-5K-0001');
    expect($second->fresh()->race_number)->toBe('KBR-5K-0002');
});

test('admin rejection returns registration to pending payment', function () {
    $admin = User::factory()->admin()->create();
    $registration = Registration::factory()->create(['status' => RegistrationStatus::PendingVerification]);
    $payment = Payment::factory()->create(['registration_id' => $registration->id]);

    $this->actingAs($admin)
        ->post(route('admin.payments.reject', $payment), ['notes' => 'Jumlah tidak sesuai'])
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Rejected);
    expect($payment->fresh()->notes)->toBe('Jumlah tidak sesuai');
    expect($registration->fresh()->status)->toBe(RegistrationStatus::PendingPayment);

    Mail::assertQueued(RegistrationMail::class);
});

test('admin can export registrations as csv', function () {
    $admin = User::factory()->admin()->create();

    Registration::factory()->count(2)->create();

    $this->actingAs($admin)
        ->get(route('admin.registrations.export'))
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});
