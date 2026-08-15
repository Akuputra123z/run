<?php

use App\Models\Category;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('all admin menus render their page', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);
    Registration::factory()->verified()->create(['category_id' => $category->id, 'finish_seconds' => 1800]);

    $routes = [
        'admin.registrations.index' => 'admin/registrations',
        'admin.categories.index' => 'admin/categories',
        'admin.payments.index' => 'admin/payments',
        'admin.runners.index' => 'admin/runners',
        'admin.bibs.index' => 'admin/bibs',
        'admin.events.index' => 'admin/events',
        'admin.timing.index' => 'admin/timing',
        'admin.results.index' => 'admin/results',
        'admin.certificates.index' => 'admin/certificates',
        'admin.reports.index' => 'admin/reports',
        'admin.race-pack' => 'admin/race-pack',
        'admin.check-in' => 'admin/check-in',
        'admin.photos.index' => 'admin/photos',
    ];

    foreach ($routes as $name => $uri) {
        $this->actingAs($admin)
            ->get(route($name))
            ->assertOk();
    }
});

test('non-admin cannot access any admin menu', function () {
    $user = User::factory()->create();

    foreach (['admin.registrations.index', 'admin.categories.index', 'admin.events.index', 'admin.reports.index'] as $name) {
        $this->actingAs($user)
            ->get(route($name))
            ->assertForbidden();
    }
});
