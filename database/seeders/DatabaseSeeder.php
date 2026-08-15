<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\EventGalleryItem;
use App\Models\GuestStar;
use App\Models\RouteMap;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(['email' => 'test@example.com'], [
            'name' => 'Test User',
        ]);

        User::updateOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Admin Panitia',
            'password' => Hash::make('12345678'),
            'is_admin' => true,
        ]);

        $categories = [
            ['name' => 'Fun Run', 'distance' => '5K', 'price' => 150000, 'quota' => 500],
            ['name' => 'Coastal Run', 'distance' => '10K', 'price' => 225000, 'quota' => 500],
            ['name' => 'Half Marathon', 'distance' => '21K', 'price' => 350000, 'quota' => 300],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['distance' => $category['distance']], $category);
        }

        $guestStars = [
            ['name' => 'BAGAS ADITYA', 'role' => "DUTA LARI\nREMBANG", 'color' => '#C6242D'],
            ['name' => 'LARASATI WULAN', 'role' => "DUTA LARI\nREMBANG", 'color' => '#FFC93C'],
            ['name' => 'YUDHO PRASETYO', 'role' => "DUTA LARI\nREMBANG", 'color' => '#C6242D'],
            ['name' => 'MBAK NDARI', 'role' => 'HOST', 'color' => '#FFC93C'],
            ['name' => 'KANG RIFKI', 'role' => 'HOST', 'color' => '#C6242D'],
            ['name' => 'TIM PESISIR', 'role' => 'PERFORMER', 'color' => '#FFC93C'],
        ];

        foreach ($guestStars as $index => $guestStar) {
            GuestStar::updateOrCreate(['name' => $guestStar['name']], [...$guestStar, 'sort_order' => $index]);
        }

        $galleryItems = [
            'START LINE', 'GOODIE BAG', 'PODIUM', 'WATER STATION', 'RACE PACK',
            'FINISH AREA', 'KIDS ZONE', 'PHOTO BOOTH', 'UMKM PESISIR', 'AFTER PARTY',
        ];

        foreach ($galleryItems as $index => $label) {
            EventGalleryItem::updateOrCreate(['photo_path' => 'gallery/g'.($index + 1).'.jpg'], [
                'label' => $label,
                'sort_order' => $index,
            ]);
        }

        $routeMaps = [
            [
                'title' => '10 KM',
                'description' => "1. Start / Karang Jahe\n2. Water station\n3. Tambak Garam Sluke\n4. Water station\n5. U-turn\n6. Balik ke Sluke\n7. Water station\n8. Alun-alun Lasem\n9. Water station",
            ],
            [
                'title' => '5 KM',
                'description' => "1. Start / Karang Jahe\n2. Water station\n3. U-turn tambak garam\n4. Water station",
            ],
        ];

        foreach ($routeMaps as $index => $routeMap) {
            RouteMap::updateOrCreate(['title' => $routeMap['title']], [...$routeMap, 'sort_order' => $index]);
        }

        $settings = [
            'race_pack_dates' => ['13 November 2026', '14 November 2026'],
            'race_pack_location' => 'Pendopo Kabupaten Rembang',
            'start_date' => '15 November 2026',
            'start_times' => [
                ['distance' => '21K', 'time' => '05.00 WIB'],
                ['distance' => '10K', 'time' => '05.15 WIB'],
                ['distance' => '5K', 'time' => '05.30 WIB'],
            ],
            'doorprize_badge' => 'FINISH HAPPY, HADIAH MENANTI',
            'doorprize_event_name' => 'REMBANG CV WIYATA AMERTA BUSINESS RUN 2026',
            'doorprize_title' => 'DOORPRIZE',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => json_encode($value, JSON_UNESCAPED_UNICODE)]);
        }
    }
}
