<?php

use App\Models\Category;
use App\Models\EventGalleryItem;
use App\Models\GuestStar;
use App\Models\RouteMap;
use App\Support\EventSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('landing page shows data managed from the dashboard', function () {
    $category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);
    $guestStar = GuestStar::factory()->create(['name' => 'BAGAS ADITYA', 'role' => 'HOST', 'color' => '#C6242D']);
    $gallery = EventGalleryItem::factory()->create(['photo_path' => 'gallery/g1.jpg', 'label' => 'START LINE', 'sort_order' => 0]);
    EventSettings::set([
        'race_pack_dates' => json_encode(['13 November 2026'], JSON_UNESCAPED_UNICODE),
        'race_pack_location' => 'Pendopo Kabupaten Rembang',
        'start_date' => '15 November 2026',
        'start_times' => json_encode([['distance' => '5K', 'time' => '05.30 WIB']], JSON_UNESCAPED_UNICODE),
        'doorprize_badge' => 'FINISH HAPPY, HADIAH MENANTI',
        'doorprize_event_name' => 'REMBANG CV WIYATA AMERTA BUSINESS RUN 2026',
        'doorprize_title' => 'DOORPRIZE',
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('landing')
            ->has('categories', 1)
            ->where('categories.0.distance', $category->distance)
            ->where('categories.0.price', $category->price)
            ->has('guestStars', 1)
            ->where('guestStars.0.name', $guestStar->name)
            ->where('guestStars.0.color', $guestStar->color)
            ->has('gallery.row_1', 1)
            ->where('gallery.row_1.0.label', $gallery->label)
            ->where('gallery.row_2', [])
            ->where('event.race_pack_dates.0', '13 November 2026')
            ->where('event.race_pack_location', 'Pendopo Kabupaten Rembang')
            ->where('event.start_date', '15 November 2026')
            ->where('event.start_times.0.time', '05.30 WIB')
            ->where('event.doorprize.title', 'DOORPRIZE'));
});

test('landing page splits gallery into two marquee rows', function () {
    EventGalleryItem::factory()->create(['sort_order' => 0]);
    EventGalleryItem::factory()->create(['sort_order' => 1]);
    EventGalleryItem::factory()->create(['sort_order' => 2]);
    EventGalleryItem::factory()->create(['sort_order' => 3]);
    EventGalleryItem::factory()->create(['sort_order' => 4]);
    EventGalleryItem::factory()->create(['sort_order' => 5]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('landing')
            ->has('gallery.row_1', 5)
            ->has('gallery.row_2', 1));
});

test('landing page renders guest star photos', function () {
    Storage::disk('public')->put('guest-stars/ndari.jpg', 'photo');
    Storage::disk('public')->put('guest-stars/thumbs/ndari.webp', 'thumb');

    GuestStar::factory()->create([
        'name' => 'MBAK NDARI',
        'role' => 'HOST',
        'photo_path' => 'guest-stars/ndari.jpg',
        'photo_thumb_path' => 'guest-stars/thumbs/ndari.webp',
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('landing')
            ->where('guestStars.0.name', 'MBAK NDARI')
            ->where('guestStars.0.photo_url', Storage::disk('public')->url('guest-stars/thumbs/ndari.webp')));
});

test('landing page renders route maps from the dashboard', function () {
    $routeMap = RouteMap::factory()->create(['title' => '10 KM', 'description' => "1. Start / Karang Jahe\n2. Water station", 'sort_order' => 0]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('landing')
            ->has('routeMaps', 1)
            ->where('routeMaps.0.title', $routeMap->title)
            ->where('routeMaps.0.description', $routeMap->description)
            ->where('routeMaps.0.photo_url', null)
            ->where('routeMaps.0.detail_photo_url', null));
});

test('landing page renders route map photos', function () {
    Storage::disk('public')->put('route-maps/rute.jpg', 'photo');
    Storage::disk('public')->put('route-maps/thumbs/rute.webp', 'thumb');
    Storage::disk('public')->put('route-maps/detail/detail.jpg', 'detail');

    RouteMap::factory()->create([
        'title' => '5 KM',
        'photo_path' => 'route-maps/rute.jpg',
        'photo_thumb_path' => 'route-maps/thumbs/rute.webp',
        'detail_photo_path' => 'route-maps/detail/detail.jpg',
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('landing')
            ->where('routeMaps.0.title', '5 KM')
            ->where('routeMaps.0.photo_url', Storage::disk('public')->url('route-maps/thumbs/rute.webp'))
            ->where('routeMaps.0.detail_photo_url', Storage::disk('public')->url('route-maps/detail/detail.jpg')));
});

test('landing page renders empty sections gracefully', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('landing')
            ->where('categories', [])
            ->where('guestStars', [])
            ->where('routeMaps', [])
            ->where('gallery.row_1', [])
            ->where('gallery.row_2', []));
});
