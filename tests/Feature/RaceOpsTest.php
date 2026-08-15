<?php

use App\Models\Category;
use App\Models\Registration;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->category = Category::factory()->create(['distance' => '10K', 'price' => 200000]);
});

test('race pack page shows lookup result by code', function () {
    $verified = Registration::factory()->verified()->create(['category_id' => $this->category->id, 'race_number' => 'KBR-0001']);

    $this->actingAs($this->admin)
        ->get(route('admin.race-pack'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/race-pack')
            ->where('registration', null)
            ->where('query', ''));

    $this->actingAs($this->admin)
        ->get(route('admin.race-pack', ['q' => $verified->code]))
        ->assertInertia(fn ($page) => $page
            ->where('registration.id', $verified->id)
            ->where('registration.ops_state', 'pending'));
});

test('race pack lookup matches partial code, name, or bib', function () {
    $registration = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'name' => 'Budi Santoso',
        'race_number' => 'KBR-0007',
    ]);

    foreach (['KBR-2026', substr($registration->code, -2), 'Budi', 'KBR-0007', strtolower($registration->code)] as $query) {
        $this->actingAs($this->admin)
            ->get(route('admin.race-pack', ['q' => $query]))
            ->assertInertia(fn ($page) => $page->where('registration.id', $registration->id));
    }
});

test('race pack lookup reports when nothing matches', function () {
    Registration::factory()->verified()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->get(route('admin.race-pack', ['q' => 'TIDAK-ADA']))
        ->assertInertia(fn ($page) => $page
            ->where('registration', null)
            ->where('query', 'TIDAK-ADA'));
});

test('race pack page lists registrations with pickup stats', function () {
    Registration::factory()->verified()->create(['category_id' => $this->category->id, 'pickup_at' => now()]);
    Registration::factory()->verified()->create(['category_id' => $this->category->id]);
    Registration::factory()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->get(route('admin.race-pack'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.total', 3)
            ->where('stats.picked_up', 1)
            ->has('registrations.data', 3)
            ->where('registrations.data', fn ($data) => $data->contains(
                fn (array $row) => $row['ops_state'] === 'picked_up',
            )));
});

test('race pack table filters registrations by search', function () {
    Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'name' => 'Andi Pratama',
        'race_number' => 'KBR-0101',
    ]);
    Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'name' => 'Budi Santoso',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.race-pack', ['search' => 'Andi']))
        ->assertInertia(fn ($page) => $page
            ->has('registrations.data', 1)
            ->where('registrations.data.0.name', 'Andi Pratama'));
});

test('check-in page shows lookup result by code', function () {
    $registration = Registration::factory()->verified()->create(['category_id' => $this->category->id, 'pickup_at' => now()]);

    $this->actingAs($this->admin)
        ->get(route('admin.check-in'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/check-in')
            ->where('registration', null)
            ->where('query', ''));

    $this->actingAs($this->admin)
        ->get(route('admin.check-in', ['q' => $registration->code]))
        ->assertInertia(fn ($page) => $page
            ->where('registration.id', $registration->id)
            ->where('registration.ops_state', 'picked_up'));
});

test('check-in lookup matches partial code, name, or bib', function () {
    $registration = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'name' => 'Sari Wulandari',
        'race_number' => 'KBR-0009',
        'pickup_at' => now(),
    ]);

    foreach (['KBR-2026', substr($registration->code, -2), 'Sari', 'KBR-0009', strtolower($registration->code)] as $query) {
        $this->actingAs($this->admin)
            ->get(route('admin.check-in', ['q' => $query]))
            ->assertInertia(fn ($page) => $page->where('registration.id', $registration->id));
    }
});

test('check-in lookup reports when nothing matches', function () {
    Registration::factory()->verified()->create(['category_id' => $this->category->id, 'pickup_at' => now()]);

    $this->actingAs($this->admin)
        ->get(route('admin.check-in', ['q' => 'TIDAK-ADA']))
        ->assertInertia(fn ($page) => $page
            ->where('registration', null)
            ->where('query', 'TIDAK-ADA'));
});

test('pickup marks registration as picked up', function () {
    $registration = Registration::factory()->verified()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->post(route('admin.race-pack.pickup'), ['code' => $registration->code])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertNotNull($registration->fresh()->pickup_at);
});

test('pickup is rejected for unverified registrations', function () {
    $registration = Registration::factory()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->post(route('admin.race-pack.pickup'), ['code' => $registration->code])
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertNull($registration->fresh()->pickup_at);
});

test('pickup is rejected twice and checkin requires pickup first', function () {
    $registration = Registration::factory()->verified()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)->post(route('admin.race-pack.pickup'), ['code' => $registration->code]);
    $this->actingAs($this->admin)
        ->post(route('admin.race-pack.pickup'), ['code' => $registration->code])
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->actingAs($this->admin)
        ->post(route('admin.check-in.checkin'), ['code' => $registration->code])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertNotNull($registration->fresh()->checked_in_at);

    $this->actingAs($this->admin)
        ->post(route('admin.check-in.checkin'), ['code' => $registration->code])
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('pickup and checkin require a code', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.race-pack.pickup'))
        ->assertSessionHasErrors('code');

    $this->actingAs($this->admin)
        ->post(route('admin.check-in.checkin'))
        ->assertSessionHasErrors('code');
});

test('non-admin cannot access race pack and check-in pages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.race-pack'))
        ->assertForbidden();

    $this->actingAs($user)
        ->get(route('admin.check-in'))
        ->assertForbidden();
});
