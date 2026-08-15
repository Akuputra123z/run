<?php

use App\Models\Category;
use App\Models\Registration;
use App\Support\RaceTiming;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('rank counts faster finishers overall', function () {
    $category = Category::factory()->create(['distance' => '5K']);

    Registration::factory()->create(['category_id' => $category->id, 'finish_seconds' => 2400]);
    Registration::factory()->create(['category_id' => $category->id, 'finish_seconds' => 1800]);
    Registration::factory()->create(['category_id' => $category->id, 'finish_seconds' => null]);

    expect(RaceTiming::rank(1800))->toBe(1)
        ->and(RaceTiming::rank(2400))->toBe(2);
});

test('rank filters by category when category id is given', function () {
    $fiveK = Category::factory()->create(['distance' => '5K']);
    $tenK = Category::factory()->create(['distance' => '10K']);

    Registration::factory()->create(['category_id' => $fiveK->id, 'finish_seconds' => 2400]);
    Registration::factory()->create(['category_id' => $fiveK->id, 'finish_seconds' => 3600]);
    Registration::factory()->create(['category_id' => $tenK->id, 'finish_seconds' => 1800]);

    expect(RaceTiming::rank(3600, $fiveK->id))->toBe(2)
        ->and(RaceTiming::rank(1800, $tenK->id))->toBe(1);
});
