<?php

use App\Models\EventGalleryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin uploads a gallery photo with thumbnail', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.gallery.store'), [
            'label' => 'START LINE',
            'photo' => UploadedFile::fake()->image('event.jpg', 1200, 800),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $item = EventGalleryItem::first();

    $this->assertNotNull($item);
    $this->assertSame('START LINE', $item->label);
    $this->assertTrue(Storage::disk('public')->exists($item->photo_path));
    $this->assertNotNull($item->photo_thumb_path);
    $this->assertTrue(Storage::disk('public')->exists($item->photo_thumb_path));
    $this->assertStringEndsWith('.webp', $item->photo_thumb_path);
});

test('gallery upload with invalid file is rejected', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.gallery.store'), [
            'photo' => UploadedFile::fake()->create('doc.pdf', 100),
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('photo');

    $this->assertDatabaseCount('event_gallery_items', 0);
});

test('admin updates a gallery item label and sort order', function () {
    $item = EventGalleryItem::factory()->create(['label' => 'START LINE', 'sort_order' => 0]);

    $this->actingAs($this->admin)
        ->put(route('admin.gallery.update', $item), [
            'label' => 'PODIUM',
            'sort_order' => 3,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('event_gallery_items', ['id' => $item->id, 'label' => 'PODIUM', 'sort_order' => 3]);
});

test('admin deletes a gallery item and its files', function () {
    Storage::disk('public')->put('gallery/g1.jpg', 'original');
    Storage::disk('public')->put('gallery/thumbs/g1.webp', 'thumb');

    $item = EventGalleryItem::factory()->create(['photo_path' => 'gallery/g1.jpg', 'photo_thumb_path' => 'gallery/thumbs/g1.webp']);

    $this->actingAs($this->admin)
        ->delete(route('admin.gallery.destroy', $item))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('event_gallery_items', ['id' => $item->id]);
    $this->assertFalse(Storage::disk('public')->exists('gallery/g1.jpg'));
    $this->assertFalse(Storage::disk('public')->exists('gallery/thumbs/g1.webp'));
});

test('gallery list is ordered by sort order', function () {
    EventGalleryItem::factory()->create(['label' => 'PODIUM', 'sort_order' => 1]);
    EventGalleryItem::factory()->create(['label' => 'START LINE', 'sort_order' => 0]);

    $this->actingAs($this->admin)
        ->get(route('admin.gallery.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/gallery')
            ->where('items.0.label', 'START LINE')
            ->where('items.1.label', 'PODIUM'));
});
