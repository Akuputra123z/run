<?php

use App\Models\RouteMap;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin creates a route map with a photo and thumbnail', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.route-maps.store'), [
            'title' => '10 KM',
            'description' => "1. Start / Karang Jahe\n2. Water station",
            'sort_order' => 0,
            'photo' => UploadedFile::fake()->image('route.jpg', 800, 600),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $routeMap = RouteMap::where('title', '10 KM')->first();

    $this->assertNotNull($routeMap);
    $this->assertNotNull($routeMap->photo_path);
    $this->assertTrue(Storage::disk('public')->exists($routeMap->photo_path));
    $this->assertNotNull($routeMap->photo_thumb_path);
    $this->assertTrue(Storage::disk('public')->exists($routeMap->photo_thumb_path));
    $this->assertStringEndsWith('.webp', $routeMap->photo_thumb_path);
});

test('admin creates a route map with a detail photo', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.route-maps.store'), [
            'title' => '10 KM',
            'sort_order' => 0,
            'detail_photo' => UploadedFile::fake()->image('detail.jpg', 1200, 800),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $routeMap = RouteMap::where('title', '10 KM')->first();

    $this->assertNotNull($routeMap);
    $this->assertNotNull($routeMap->detail_photo_path);
    $this->assertTrue(Storage::disk('public')->exists($routeMap->detail_photo_path));
});

test('admin creates a route map without a photo', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.route-maps.store'), [
            'title' => '5 KM',
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('route_maps', ['title' => '5 KM', 'photo_path' => null, 'photo_thumb_path' => null]);
});

test('admin replaces a route map photo on update', function () {
    Storage::disk('public')->put('route-maps/old.jpg', 'old');
    Storage::disk('public')->put('route-maps/thumbs/old.webp', 'old-thumb');

    $routeMap = RouteMap::factory()->create([
        'photo_path' => 'route-maps/old.jpg',
        'photo_thumb_path' => 'route-maps/thumbs/old.webp',
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.route-maps.update', $routeMap), [
            'title' => '10 KM UPDATED',
            'description' => 'Poin baru',
            'sort_order' => 3,
            'photo' => UploadedFile::fake()->image('new.jpg', 800, 600),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $routeMap->refresh();

    $this->assertFalse(Storage::disk('public')->exists('route-maps/old.jpg'));
    $this->assertFalse(Storage::disk('public')->exists('route-maps/thumbs/old.webp'));
    $this->assertTrue(Storage::disk('public')->exists($routeMap->photo_path));
    $this->assertTrue(Storage::disk('public')->exists($routeMap->photo_thumb_path));
    $this->assertSame('10 KM UPDATED', $routeMap->title);
    $this->assertSame(3, $routeMap->sort_order);
});

test('admin replaces a route map detail photo on update', function () {
    Storage::disk('public')->put('route-maps/detail/old.jpg', 'old');

    $routeMap = RouteMap::factory()->create([
        'detail_photo_path' => 'route-maps/detail/old.jpg',
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.route-maps.update', $routeMap), [
            'title' => $routeMap->title,
            'sort_order' => 0,
            'detail_photo' => UploadedFile::fake()->image('new-detail.jpg', 1200, 800),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $routeMap->refresh();

    $this->assertFalse(Storage::disk('public')->exists('route-maps/detail/old.jpg'));
    $this->assertTrue(Storage::disk('public')->exists($routeMap->detail_photo_path));
});

test('admin adds a detail photo to a route map that had none', function () {
    $routeMap = RouteMap::factory()->create();

    $this->actingAs($this->admin)
        ->put(route('admin.route-maps.update', $routeMap), [
            'title' => $routeMap->title,
            'sort_order' => $routeMap->sort_order,
            'detail_photo' => UploadedFile::fake()->image('new-detail.jpg', 1200, 800),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $routeMap->refresh();

    $this->assertNotNull($routeMap->detail_photo_path);
    $this->assertTrue(Storage::disk('public')->exists($routeMap->detail_photo_path));
});

test('admin deletes a route map and its photo files', function () {
    Storage::disk('public')->put('route-maps/foto.jpg', 'photo');
    Storage::disk('public')->put('route-maps/thumbs/foto.webp', 'thumb');
    Storage::disk('public')->put('route-maps/detail/detail.jpg', 'detail');

    $routeMap = RouteMap::factory()->create([
        'photo_path' => 'route-maps/foto.jpg',
        'photo_thumb_path' => 'route-maps/thumbs/foto.webp',
        'detail_photo_path' => 'route-maps/detail/detail.jpg',
    ]);

    $this->actingAs($this->admin)
        ->delete(route('admin.route-maps.destroy', $routeMap))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('route_maps', ['id' => $routeMap->id]);
    $this->assertFalse(Storage::disk('public')->exists('route-maps/foto.jpg'));
    $this->assertFalse(Storage::disk('public')->exists('route-maps/thumbs/foto.webp'));
    $this->assertFalse(Storage::disk('public')->exists('route-maps/detail/detail.jpg'));
});

test('route map title is required', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.route-maps.store'), [
            'sort_order' => 0,
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('title');

    $this->assertDatabaseCount('route_maps', 0);
});

test('route map list is ordered by sort order', function () {
    RouteMap::factory()->create(['title' => 'PERTAMA', 'sort_order' => 1]);
    RouteMap::factory()->create(['title' => 'KEDUA', 'sort_order' => 0]);

    $this->actingAs($this->admin)
        ->get(route('admin.route-maps.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/route-maps')
            ->where('routeMaps.0.title', 'KEDUA')
            ->where('routeMaps.1.title', 'PERTAMA'));
});
