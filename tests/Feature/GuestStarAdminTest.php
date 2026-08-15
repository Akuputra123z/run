<?php

use App\Models\GuestStar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin creates a guest star', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.guest-stars.store'), [
            'name' => 'BAGAS ADITYA',
            'role' => 'HOST',
            'color' => '#C6242D',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('guest_stars', ['name' => 'BAGAS ADITYA', 'role' => 'HOST', 'color' => '#C6242D']);
});

test('admin creates a guest star with a photo and thumbnail', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.guest-stars.store'), [
            'name' => 'MBAK NDARI',
            'role' => 'HOST',
            'photo' => UploadedFile::fake()->image('ndari.jpg', 800, 600),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $guestStar = GuestStar::where('name', 'MBAK NDARI')->first();

    $this->assertNotNull($guestStar);
    $this->assertNotNull($guestStar->photo_path);
    $this->assertTrue(Storage::disk('public')->exists($guestStar->photo_path));
    $this->assertNotNull($guestStar->photo_thumb_path);
    $this->assertTrue(Storage::disk('public')->exists($guestStar->photo_thumb_path));
    $this->assertStringEndsWith('.webp', $guestStar->photo_thumb_path);
    $this->assertSame('#C6242D', $guestStar->color);
});

test('admin replaces a guest star photo on update', function () {
    Storage::disk('public')->put('guest-stars/old.jpg', 'old');
    Storage::disk('public')->put('guest-stars/thumbs/old.webp', 'old-thumb');

    $guestStar = GuestStar::factory()->create([
        'photo_path' => 'guest-stars/old.jpg',
        'photo_thumb_path' => 'guest-stars/thumbs/old.webp',
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.guest-stars.update', $guestStar), [
            'name' => $guestStar->name,
            'role' => 'PERFORMER',
            'photo' => UploadedFile::fake()->image('new.jpg', 800, 600),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $guestStar->refresh();

    $this->assertFalse(Storage::disk('public')->exists('guest-stars/old.jpg'));
    $this->assertFalse(Storage::disk('public')->exists('guest-stars/thumbs/old.webp'));
    $this->assertTrue(Storage::disk('public')->exists($guestStar->photo_path));
    $this->assertTrue(Storage::disk('public')->exists($guestStar->photo_thumb_path));
});

test('admin updates a guest star', function () {
    $guestStar = GuestStar::factory()->create(['name' => 'BAGAS ADITYA']);

    $this->actingAs($this->admin)
        ->put(route('admin.guest-stars.update', $guestStar), [
            'name' => 'KANG RIFKI',
            'role' => 'PERFORMER',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('guest_stars', ['id' => $guestStar->id, 'name' => 'KANG RIFKI', 'role' => 'PERFORMER']);
});

test('admin deletes a guest star and its photo files', function () {
    Storage::disk('public')->put('guest-stars/foto.jpg', 'photo');
    Storage::disk('public')->put('guest-stars/thumbs/foto.webp', 'thumb');

    $guestStar = GuestStar::factory()->create([
        'photo_path' => 'guest-stars/foto.jpg',
        'photo_thumb_path' => 'guest-stars/thumbs/foto.webp',
    ]);

    $this->actingAs($this->admin)
        ->delete(route('admin.guest-stars.destroy', $guestStar))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('guest_stars', ['id' => $guestStar->id]);
    $this->assertFalse(Storage::disk('public')->exists('guest-stars/foto.jpg'));
    $this->assertFalse(Storage::disk('public')->exists('guest-stars/thumbs/foto.webp'));
});

test('guest star color must be a valid hex code', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.guest-stars.store'), [
            'name' => 'TIM PESISIR',
            'role' => 'PERFORMER',
            'color' => 'merah',
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('color');

    $this->assertDatabaseCount('guest_stars', 0);
});

test('guest star list is ordered by sort order', function () {
    GuestStar::factory()->create(['name' => 'PERTAMA', 'sort_order' => 1]);
    GuestStar::factory()->create(['name' => 'KEDUA', 'sort_order' => 0]);

    $this->actingAs($this->admin)
        ->get(route('admin.guest-stars.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/guest-stars')
            ->where('guestStars.0.name', 'KEDUA')
            ->where('guestStars.1.name', 'PERTAMA'));
});
