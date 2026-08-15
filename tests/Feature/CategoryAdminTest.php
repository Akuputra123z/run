<?php

use App\Models\Category;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin creates a category', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.categories.store'), [
            'name' => 'Coastal Run',
            'distance' => '10K',
            'price' => 225000,
            'quota' => 500,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('categories', ['distance' => '10K', 'price' => 225000, 'quota' => 500]);
});

test('admin updates a category', function () {
    $category = Category::factory()->create(['distance' => '5K', 'price' => 150000, 'quota' => 500]);

    $this->actingAs($this->admin)
        ->put(route('admin.categories.update', $category), [
            'name' => 'Fun Run Plus',
            'distance' => '5K',
            'price' => 175000,
            'quota' => 600,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Fun Run Plus',
        'price' => 175000,
        'quota' => 600,
    ]);
});

test('category quota cannot be lowered below registered count', function () {
    $category = Category::factory()->create(['distance' => '5K', 'quota' => 500]);
    Registration::factory()->create(['category_id' => $category->id]);

    $this->actingAs($this->admin)
        ->put(route('admin.categories.update', $category), [
            'name' => $category->name,
            'distance' => $category->distance,
            'price' => $category->price,
            'quota' => 0,
        ])
        ->assertSessionHasErrors('quota');
});

test('category with registrations cannot be deleted', function () {
    $category = Category::factory()->create(['distance' => '5K']);
    Registration::factory()->create(['category_id' => $category->id]);

    $this->actingAs($this->admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

test('category without registrations can be deleted', function () {
    $category = Category::factory()->create(['distance' => '5K']);

    $this->actingAs($this->admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('categories page lists counts', function () {
    $category = Category::factory()->create(['distance' => '5K', 'quota' => 500]);
    Registration::factory()->verified()->create(['category_id' => $category->id]);

    $this->actingAs($this->admin)
        ->get(route('admin.categories.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/categories')
            ->has('categories', 1)
            ->where('categories.0.active_count', 1));
});
