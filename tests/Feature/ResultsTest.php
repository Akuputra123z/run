<?php

use App\Models\Category;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->category = Category::factory()->create(['distance' => '5K', 'price' => 150000]);
});

test('admin updates a single finish time', function () {
    $registration = Registration::factory()->verified()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->post(route('admin.timing.update'), [
            'registration_id' => $registration->id,
            'finish_time' => '00:31:25',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertSame(1885, $registration->fresh()->finish_seconds);
});

test('admin imports finish times from csv text', function () {
    $a = Registration::factory()->verified()->create(['category_id' => $this->category->id, 'code' => 'KBR-2026-AAAA']);
    $b = Registration::factory()->verified()->create(['category_id' => $this->category->id, 'code' => 'KBR-2026-BBBB']);
    $unverified = Registration::factory()->create(['category_id' => $this->category->id, 'code' => 'KBR-2026-CCCC']);

    $csv = "code,time\nKBR-2026-AAAA,29:50\nKBR-2026-BBBB,0:32:10\nKBR-2026-CCCC,30:00\nKBR-2026-XXXX,31:00";
    $file = UploadedFile::fake()->createWithContent('results.csv', $csv);

    $this->actingAs($this->admin)
        ->post(route('admin.timing.import'), ['csv' => $file])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertSame(1790, $a->fresh()->finish_seconds);
    $this->assertSame(1930, $b->fresh()->finish_seconds);
    $this->assertNull($unverified->fresh()->finish_seconds);
});

test('public results page shows rankings and search', function () {
    $slow = Registration::factory()->verified()->create(['category_id' => $this->category->id, 'finish_seconds' => 2400, 'name' => 'Budi Santoso']);
    $fast = Registration::factory()->verified()->create(['category_id' => $this->category->id, 'finish_seconds' => 1800, 'name' => 'Ani Lestari']);

    $this->get(route('results.public'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('hasil')
            ->has('results.data', 2)
            ->where('results.data.0.id', $fast->id)
            ->where('results.data.1.id', $slow->id));

    $this->get(route('results.public', ['search' => 'Ani']))
        ->assertInertia(fn ($page) => $page
            ->has('results.data', 1)
            ->where('results.data.0.name', 'Ani Lestari'));
});

test('public results page ignores unverified registrations', function () {
    Registration::factory()->create(['category_id' => $this->category->id, 'finish_seconds' => 1800]);

    $this->get(route('results.public'))
        ->assertInertia(fn ($page) => $page->has('results.data', 0));
});
