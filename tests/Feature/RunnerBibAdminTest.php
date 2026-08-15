<?php

use App\Models\Category;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->category = Category::factory()->create(['distance' => '5K']);
});

test('runners page lists runners with stats', function () {
    Registration::factory()->verified()->create(['category_id' => $this->category->id]);
    Registration::factory()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->get(route('admin.runners.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/runners')
            ->has('runners.data', 2)
            ->where('stats.total', 2)
            ->where('stats.verified', 1));
});

test('runners page searches by name', function () {
    Registration::factory()->create(['category_id' => $this->category->id, 'name' => 'Budi Santoso']);
    Registration::factory()->create(['category_id' => $this->category->id, 'name' => 'Ani Lestari']);

    $this->actingAs($this->admin)
        ->get(route('admin.runners.index', ['search' => 'Ani']))
        ->assertInertia(fn ($page) => $page
            ->has('runners.data', 1)
            ->where('runners.data.0.name', 'Ani Lestari'));
});

test('bibs page lists only assigned race numbers', function () {
    $verified = Registration::factory()->verified()->create(['category_id' => $this->category->id, 'race_number' => 'KBR-5K-0001']);
    Registration::factory()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->get(route('admin.bibs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/bibs')
            ->has('bibs.data', 1)
            ->where('bibs.data.0.race_number', $verified->race_number)
            ->where('stats.total', 1));
});

test('bibs page searches by race number', function () {
    Registration::factory()->verified()->create(['category_id' => $this->category->id, 'race_number' => 'KBR-5K-0001']);

    $this->actingAs($this->admin)
        ->get(route('admin.bibs.index', ['search' => 'KBR-5K']))
        ->assertInertia(fn ($page) => $page->has('bibs.data', 1));
});
