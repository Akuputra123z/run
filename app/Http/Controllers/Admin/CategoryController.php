<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * List categories with registration counts.
     */
    public function index(): Response
    {
        $categories = Category::query()
            ->withCount(['registrations as active_count' => fn ($query) => $query->whereNot('status', RegistrationStatus::Cancelled)])
            ->orderBy('distance')
            ->get();

        return Inertia::render('admin/categories', ['categories' => $categories]);
    }

    /**
     * Store a new category.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        Category::create($validated);

        return back()->with('success', 'Kategori '.$validated['distance'].' ditambahkan.');
    }

    /**
     * Update a category.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $this->validated($request, $category);

        $category->update($validated);

        return back()->with('success', 'Kategori '.$validated['distance'].' diperbarui.');
    }

    /**
     * Delete a category that has no registrations yet.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->registrations()->exists()) {
            return back()->with('error', 'Kategori '.$category->distance.' memiliki pendaftaran dan tidak dapat dihapus.');
        }

        $category->delete();

        return back()->with('success', 'Kategori '.$category->distance.' dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Category $category = null): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:100'],
            'distance' => ['required', 'string', 'max:5'],
            'price' => ['required', 'integer', 'min:1000'],
            'quota' => ['required', 'integer', 'min:1', 'max:100000'],
        ];

        if ($category) {
            $rules['quota'] = ['required', 'integer', 'min:'.$category->registeredCount(), 'max:100000'];
        }

        return $request->validate($rules);
    }
}
