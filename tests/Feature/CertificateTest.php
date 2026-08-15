<?php

use App\Models\Category;
use App\Models\Registration;

test('finisher receives certificate data', function () {
    $category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);
    $registration = Registration::factory()->verified()->create([
        'category_id' => $category->id,
        'race_number' => 'KBR-0101',
        'finish_seconds' => 1500,
    ]);

    $this->get(route('certificate', ['code' => $registration->code]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('sertifikat')
            ->where('certificate.name', $registration->name)
            ->where('certificate.finish_time', '25:00')
            ->where('certificate.overall_rank', 1)
            ->has('certificate.pace'));
});

test('certificate redirects when there is no finish time', function () {
    $registration = Registration::factory()->verified()->create();

    $this->get(route('certificate', ['code' => $registration->code]))
        ->assertRedirect(route('registration.status', ['code' => $registration->code]));
});

test('certificate redirects for unknown code', function () {
    $this->get(route('certificate', ['code' => 'KBR-2026-XXXX']))
        ->assertRedirect();
});
