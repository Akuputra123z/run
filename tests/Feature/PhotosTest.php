<?php

use App\Models\Category;
use App\Models\RacePhoto;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);
});

test('admin uploads race photos and they link to the bib', function () {
    $registration = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'race_number' => 'KBR-0421',
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.photos.store'), [
            'bib' => 'KBR-0421',
            'photographer' => 'Foto Kreatif',
            'photos' => [UploadedFile::fake()->image('shot1.jpg', 800, 800)],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $photo = $registration->racePhotos()->first();

    $this->assertNotNull($photo);
    $this->assertSame('Foto Kreatif', $photo->photographer);
    $this->assertTrue(Storage::disk('public')->exists($photo->photo_path));
    $this->assertNotNull($photo->photo_thumb_path);
    $this->assertTrue(Storage::disk('public')->exists($photo->photo_thumb_path));
    $this->assertStringEndsWith('.webp', $photo->photo_thumb_path);
});

test('photo upload with unknown bib is rejected', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.photos.store'), [
            'bib' => 'KBR-9999',
            'photographer' => null,
            'photos' => [UploadedFile::fake()->image('shot2.jpg')],
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('bib');

    $this->assertDatabaseCount('race_photos', 0);
});

test('bib suggestions endpoint returns registered runners', function () {
    $registration = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'name' => 'Andi Pratama',
        'race_number' => 'KBR-0101',
    ]);

    $this->actingAs($this->admin)
        ->getJson(route('admin.photos.bibs', ['q' => '0101']))
        ->assertOk()
        ->assertJson([[
            'race_number' => 'KBR-0101',
            'code' => $registration->code,
            'name' => 'Andi Pratama',
        ]]);

    $this->actingAs($this->admin)
        ->getJson(route('admin.photos.bibs', ['q' => 'TIDAK-ADA']))
        ->assertOk()
        ->assertJson([]);
});

test('photo upload validates file count and type', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.photos.store'), [
            'bib' => 'KBR-0001',
            'photographer' => null,
            'photos' => [UploadedFile::fake()->create('notes.txt')],
        ])
        ->assertSessionHasErrors('photos.0');
});

test('photo admin page filters photos by bib, code, or name', function () {
    $registration = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'name' => 'Andi Pratama',
        'race_number' => 'KBR-0077',
    ]);
    RacePhoto::factory()->create(['registration_id' => $registration->id, 'bib' => 'KBR-0077']);
    RacePhoto::factory()->create(['bib' => 'KBR-9999']);

    foreach (['KBR-0077', 'Andi', $registration->code] as $search) {
        $this->actingAs($this->admin)
            ->get(route('admin.photos.index', ['search' => $search]))
            ->assertInertia(fn ($page) => $page
                ->has('photos.data', 1)
                ->where('photos.data.0.bib', 'KBR-0077')
                ->has('photos.data.0.thumb_url'));
    }

    $this->actingAs($this->admin)
        ->get(route('admin.photos.index', ['search' => 'TIDAK-ADA']))
        ->assertInertia(fn ($page) => $page->has('photos.data', 0));
});

test('photo admin page paginates results', function () {
    RacePhoto::factory()->count(25)->create();

    $this->actingAs($this->admin)
        ->get(route('admin.photos.index'))
        ->assertInertia(fn ($page) => $page
            ->has('photos.data', 24)
            ->has('photos.links', 4));

    $this->actingAs($this->admin)
        ->get(route('admin.photos.index', ['page' => 2]))
        ->assertInertia(fn ($page) => $page->has('photos.data', 1));
});

test('public status page returns photo thumbnails', function () {
    $registration = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'race_number' => 'KBR-0202',
    ]);
    RacePhoto::factory()->create(['registration_id' => $registration->id, 'bib' => 'KBR-0202']);

    $this->get(route('registration.status', $registration->code))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('registration.photos', 1)
            ->has('registration.photos.0.thumb_url')
            ->has('registration.photos.0.url'));
});

test('admin deletes a race photo with its files', function () {
    Storage::fake('public');

    $registration = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'race_number' => 'KBR-0330',
    ]);
    $photo = RacePhoto::create([
        'registration_id' => $registration->id,
        'bib' => 'KBR-0330',
        'photo_path' => 'race-photos/delete-me.jpg',
        'photo_thumb_path' => 'race-photos/thumbs/delete-me.webp',
    ]);
    Storage::disk('public')->put($photo->photo_path, 'original');
    Storage::disk('public')->put($photo->photo_thumb_path, 'thumb');

    $this->actingAs($this->admin)
        ->delete(route('admin.photos.destroy', $photo))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('race_photos', ['id' => $photo->id]);
    $this->assertFalse(Storage::disk('public')->exists($photo->photo_path));
    $this->assertFalse(Storage::disk('public')->exists($photo->photo_thumb_path));
});

test('admin deletes a legacy photo without a thumbnail', function () {
    Storage::fake('public');

    $photo = RacePhoto::factory()->create([
        'bib' => 'KBR-0331',
        'photo_thumb_path' => null,
    ]);
    Storage::disk('public')->put($photo->photo_path, 'original');

    $this->actingAs($this->admin)
        ->delete(route('admin.photos.destroy', $photo))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('race_photos', ['id' => $photo->id]);
    $this->assertFalse(Storage::disk('public')->exists($photo->photo_path));
});

test('non-admin cannot access photos endpoints', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.photos.index'))
        ->assertForbidden();
});
