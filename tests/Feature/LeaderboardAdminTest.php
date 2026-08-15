<?php

use App\Models\Category;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);
});

test('leaderboard shows top finishers overall and per category', function () {
    $fast = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'finish_seconds' => 1800,
        'race_number' => 'KBR-5K-0001',
    ]);
    $slow = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'finish_seconds' => 2400,
        'race_number' => 'KBR-5K-0002',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.results.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/results')
            ->has('overall', 2)
            ->where('overall.0.id', $fast->id)
            ->where('overall.0.rank', 1)
            ->where('overall.1.id', $slow->id)
            ->where('overall.1.rank', 2)
            ->has('perCategory.0.finishers', 2)
            ->where('finisher_count', 2));
});

test('certificates page lists finishers only', function () {
    $finisher = Registration::factory()->verified()->create([
        'category_id' => $this->category->id,
        'finish_seconds' => 1800,
    ]);
    Registration::factory()->verified()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->get(route('admin.certificates.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/certificates')
            ->has('finishers.data', 1)
            ->where('finishers.data.0.id', $finisher->id)
            ->where('finishers.data.0.finish_time', '30:00'));
});

test('reports page shows summary numbers', function () {
    Registration::factory()->verified()->create(['category_id' => $this->category->id, 'total_amount' => 150000]);
    Registration::factory()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->get(route('admin.reports.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/reports')
            ->where('summary.total', 2)
            ->where('summary.verified', 1)
            ->where('summary.revenue', 150000)
            ->has('perCategory', 1)
            ->where('perCategory.0.revenue', 150000));
});
