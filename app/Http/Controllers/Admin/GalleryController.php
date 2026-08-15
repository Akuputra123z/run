<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventGalleryItem;
use App\Support\Thumbnailer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    /**
     * List event gallery items ordered by sort order.
     */
    public function index(): Response
    {
        $items = EventGalleryItem::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (EventGalleryItem $item): array => $this->row($item));

        return Inertia::render('admin/gallery', ['items' => $items]);
    }

    /**
     * Upload a new event gallery photo.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'label' => ['nullable', 'string', 'max:100'],
        ]);

        $path = $validated['photo']->store('gallery', 'public');

        EventGalleryItem::create([
            'photo_path' => $path,
            'photo_thumb_path' => Thumbnailer::create($validated['photo'], $path),
            'label' => $validated['label'] ?: null,
            'sort_order' => EventGalleryItem::query()->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Foto galeri ditambahkan.');
    }

    /**
     * Update a gallery item's label and sort order.
     */
    public function update(Request $request, EventGalleryItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['required', 'integer', 'min:0'],
        ]);

        $item->update($validated);

        return back()->with('success', 'Foto galeri diperbarui.');
    }

    /**
     * Delete a gallery item and its files.
     */
    public function destroy(EventGalleryItem $item): RedirectResponse
    {
        Storage::disk('public')->delete(array_filter([$item->photo_path, $item->photo_thumb_path]));

        $item->delete();

        return back()->with('success', 'Foto galeri dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function row(EventGalleryItem $item): array
    {
        return [
            'id' => $item->id,
            'url' => $item->photoUrl(),
            'thumb_url' => $item->photoThumbUrl(),
            'label' => $item->label,
            'sort_order' => $item->sort_order,
        ];
    }
}
