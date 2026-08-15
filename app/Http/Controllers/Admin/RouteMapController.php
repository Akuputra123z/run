<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RouteMap;
use App\Support\Thumbnailer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RouteMapController extends Controller
{
    /**
     * List route maps ordered by sort order.
     */
    public function index(): Response
    {
        $routeMaps = RouteMap::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (RouteMap $routeMap): array => $this->row($routeMap));

        return Inertia::render('admin/route-maps', ['routeMaps' => $routeMaps]);
    }

    /**
     * Store a new route map.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $photo = $validated['photo'] ?? null;
        $path = $photo?->store('route-maps', 'public');

        $detailPhoto = $validated['detail_photo'] ?? null;
        $detailPath = $detailPhoto?->store('route-maps/detail', 'public');

        RouteMap::create([
            'title' => $validated['title'],
            'description' => ($validated['description'] ?? null) ?: null,
            'photo_path' => $path,
            'photo_thumb_path' => $path ? Thumbnailer::create($photo, $path, 900) : null,
            'detail_photo_path' => $detailPath,
            'sort_order' => RouteMap::query()->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Rute '.$validated['title'].' ditambahkan.');
    }

    /**
     * Update a route map.
     */
    public function update(Request $request, RouteMap $routeMap): RedirectResponse
    {
        $validated = $this->validated($request);

        $photo = $validated['photo'] ?? null;
        $path = $photo?->store('route-maps', 'public');

        $detailPhoto = $validated['detail_photo'] ?? null;
        $detailPath = $detailPhoto?->store('route-maps/detail', 'public');

        if ($path) {
            Storage::disk('public')->delete(array_filter([$routeMap->photo_path, $routeMap->photo_thumb_path]));
            $routeMap->photo_path = $path;
            $routeMap->photo_thumb_path = Thumbnailer::create($photo, $path, 900);
        }

        if ($detailPath) {
            Storage::disk('public')->delete(array_filter([$routeMap->detail_photo_path]));
            $routeMap->detail_photo_path = $detailPath;
        }

        $routeMap->title = $validated['title'];
        $routeMap->description = ($validated['description'] ?? null) ?: null;
        $routeMap->sort_order = $validated['sort_order'];
        $routeMap->save();

        return back()->with('success', 'Rute '.$routeMap->title.' diperbarui.');
    }

    /**
     * Delete a route map and its photo files.
     */
    public function destroy(RouteMap $routeMap): RedirectResponse
    {
        Storage::disk('public')->delete(array_filter([$routeMap->photo_path, $routeMap->photo_thumb_path, $routeMap->detail_photo_path]));

        $routeMap->delete();

        return back()->with('success', 'Rute '.$routeMap->title.' dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'detail_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function row(RouteMap $routeMap): array
    {
        return [
            'id' => $routeMap->id,
            'title' => $routeMap->title,
            'description' => $routeMap->description,
            'photo_url' => $routeMap->photo_path ? $routeMap->photoThumbUrl() : null,
            'detail_photo_url' => $routeMap->detail_photo_path ? $routeMap->detailPhotoUrl() : null,
            'sort_order' => $routeMap->sort_order,
        ];
    }
}
