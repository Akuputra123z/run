<?php

use App\Models\Category;
use App\Models\User;
use App\Support\EventSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin updates event settings', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.events.update'), [
            'event_name' => 'CV WIYATA AMERTA BUSINESS RUN 2026',
            'event_date' => '14 Agustus 2026',
            'event_location' => 'Pantai Ancol, Jakarta',
            'bank' => 'Mandiri',
            'account_number' => '8888888888',
            'account_name' => 'Panitia CV WIYATA AMERTA',
            'payment_hours' => 48,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('settings', ['key' => 'bank', 'value' => 'Mandiri']);
    $this->assertDatabaseHas('settings', ['key' => 'payment_hours', 'value' => '48']);
    $this->assertDatabaseHas('settings', ['key' => 'event_date', 'value' => '14 Agustus 2026']);
});

test('event settings page shows stored values', function () {
    EventSettings::set(['event_name' => 'RUN 2026', 'bank' => 'BNI', 'payment_hours' => '12']);

    $this->actingAs($this->admin)
        ->get(route('admin.events.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/event')
            ->where('settings.event_name', 'RUN 2026')
            ->where('settings.bank', 'BNI')
            ->where('settings.payment_hours', '12'));
});

test('admin updates schedule and doorprize settings', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.events.update'), [
            'event_name' => 'CV WIYATA AMERTA BUSINESS RUN 2026',
            'event_date' => null,
            'event_location' => null,
            'bank' => 'Mandiri',
            'account_number' => '8888888888',
            'account_name' => 'Panitia CV WIYATA AMERTA',
            'payment_hours' => 48,
            'race_pack_dates' => ['13 November 2026', '14 November 2026'],
            'race_pack_location' => 'Pendopo Kabupaten Rembang',
            'start_date' => '15 November 2026',
            'start_times' => [
                ['distance' => '21K', 'time' => '05.00 WIB'],
                ['distance' => '5K', 'time' => '05.30 WIB'],
            ],
            'doorprize_badge' => 'FINISH HAPPY, HADIAH MENANTI',
            'doorprize_event_name' => 'REMBANG CV WIYATA AMERTA BUSINESS RUN 2026',
            'doorprize_title' => 'DOORPRIZE',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertSame(
        ['13 November 2026', '14 November 2026'],
        EventSettings::json('race_pack_dates'),
    );
    $this->assertSame(
        [['distance' => '21K', 'time' => '05.00 WIB'], ['distance' => '5K', 'time' => '05.30 WIB']],
        EventSettings::json('start_times'),
    );
    $this->assertSame('Pendopo Kabupaten Rembang', EventSettings::get('race_pack_location'));
    $this->assertSame('DOORPRIZE', EventSettings::get('doorprize_title'));
});

test('registration uses bank account from event settings', function () {
    EventSettings::set(['bank' => 'Mandiri', 'account_number' => '999999', 'account_name' => 'Panitia']);

    $category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);

    $this->post(route('registration.store'), [
        'category_id' => $category->id,
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'phone' => '081234567890',
        'nik' => '1234567890123456',
        'gender' => 'men',
        'birth_date' => '1990-01-01',
        'city' => 'Jakarta',
        'jersey_size' => 'L',
        'emergency_name' => 'Ani',
        'emergency_phone' => '081298765432',
    ])->assertRedirect();

    $this->assertDatabaseHas('payments', ['bank' => 'Mandiri', 'account_number' => '999999']);
});
