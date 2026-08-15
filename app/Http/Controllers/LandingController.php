<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\EventGalleryItem;
use App\Models\GuestStar;
use App\Models\RouteMap;
use App\Support\EventSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Show the public landing page with data managed from the admin dashboard.
     */
    public function __invoke(Request $request): Response
    {
        $categories = Category::query()
            ->orderBy('distance')
            ->get(['id', 'name', 'distance', 'price']);

        $galleryItems = EventGalleryItem::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (EventGalleryItem $item): array => [
                'url' => $item->photoUrl(),
                'label' => $item->label,
            ]);

        $guestStars = GuestStar::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (GuestStar $guestStar): array => [
                'name' => $guestStar->name,
                'role' => $guestStar->role,
                'color' => $guestStar->color,
                'photo_url' => $guestStar->photo_path ? $guestStar->photoThumbUrl() : null,
            ]);

        $routeMaps = RouteMap::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (RouteMap $routeMap): array => [
                'id' => $routeMap->id,
                'title' => $routeMap->title,
                'description' => $routeMap->description,
                'photo_url' => $routeMap->photo_path ? $routeMap->photoThumbUrl() : null,
                'detail_photo_url' => $routeMap->detail_photo_path ? $routeMap->detailPhotoUrl() : null,
            ]);

        return Inertia::render('landing', [
            'categories' => $categories,
            'guestStars' => $guestStars,
            'routeMaps' => $routeMaps,
            'gallery' => [
                'row_1' => $galleryItems->take(5)->values(),
                'row_2' => $galleryItems->slice(5)->values(),
            ],
            'event' => [
                'name' => EventSettings::get('event_name', (string) config('app.name')),
                'date' => EventSettings::get('event_date'),
                'location' => EventSettings::get('event_location'),
                'race_pack_dates' => EventSettings::json('race_pack_dates'),
                'race_pack_location' => EventSettings::get('race_pack_location', 'Pendopo Kabupaten Rembang'),
                'start_date' => EventSettings::get('start_date'),
                'start_times' => EventSettings::json('start_times'),
                'doorprize' => [
                    'badge' => EventSettings::get('doorprize_badge', 'FINISH HAPPY, HADIAH MENANTI'),
                    'event_name' => EventSettings::get('doorprize_event_name', 'REMBANG CV WIYATA AMERTA BUSINESS RUN 2026'),
                    'title' => EventSettings::get('doorprize_title', 'DOORPRIZE'),
                ],
            ],
        ]);
    }
}
