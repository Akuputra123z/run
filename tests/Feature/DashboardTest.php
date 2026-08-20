<?php

use App\Models\Category;
use App\Models\Registration;
use App\Models\User;
use App\Support\EventSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin sees dashboard stats and recent registrations', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);

    EventSettings::set(['event_name' => 'CV WIYATA AMERTA BUSINESS RUN 2026', 'event_location' => 'Pantai Karang Jahe, Rembang']);

    Registration::factory()->verified()->create(['category_id' => $category->id, 'total_amount' => 150000]);
    Registration::factory()->create(['category_id' => $category->id]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('is_admin', true)
            ->where('stats.total', 2)
            ->where('stats.verified', 1)
            ->where('stats.pending_payment', 1)
            ->where('stats.revenue', 150000)
            ->where('event.event_name', 'CV WIYATA AMERTA BUSINESS RUN 2026')
            ->where('event.event_location', 'Pantai Karang Jahe, Rembang')
            ->has('recent', 2));
});

test('non-admin dashboard shows welcome without stats', function () {
    $user = User::factory()->create();

    Registration::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('is_admin', false)
            ->where('stats', null));
});

test('runner dashboard shows the runner registration matched by email', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['distance' => '10K', 'price' => 225000]);

    $registration = Registration::factory()->verified()->create([
        'email' => $user->email,
        'category_id' => $category->id,
        'total_amount' => 225000,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('is_admin', false)
            ->where('registration.code', $registration->code)
            ->where('registration.status', 'verified')
            ->where('registration.category', '10K')
            ->where('registration.total_amount', 225000)
            ->where('registration.race_number', $registration->race_number));
});

test('dashboard requires authentication', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('admin dashboard carries analytics aggregated from the database', function () {
    $admin = User::factory()->admin()->create();
    $category5k = Category::factory()->create(['distance' => '5K', 'price' => 150000]);
    $category10k = Category::factory()->create(['distance' => '10K', 'price' => 225000]);

    Registration::factory()->verified()->create(['category_id' => $category5k->id, 'total_amount' => 150000, 'created_at' => now()]);
    Registration::factory()->create(['category_id' => $category10k->id, 'total_amount' => 225000, 'created_at' => now()]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('analytics.overview.revenue', 150000)
            ->where('analytics.overview.verified', 1)
            ->where('analytics.overview.total', 2)
            ->where('analytics.overview.week_count', 2)
            ->where('analytics.overview.month_revenue', 150000)
            ->has('analytics.revenue_weekly', 12)
            ->has('analytics.monthly', 6)
            ->has('analytics.category_share', 1)
            ->where('analytics.category_share.0.name', '5K')
            ->where('analytics.category_share.0.value', 150000)
            ->has('analytics.weekly_trend', 7)
            ->has('analytics.weekly_area', 7)
            ->where('analytics.weekly_trend.6.verified', 1)
            ->where('analytics.weekly_trend.6.pending', 1)
            ->where('analytics.top_stats.0.title', 'Kategori Terpopuler')
            ->has('analytics.transactions', 2));
});

test('non-admin dashboard does not expose analytics', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('analytics', null));
});
