<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GuestStar;
use App\Support\Thumbnailer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GuestStarController extends Controller
{
    private const COLORS = ['#C6242D', '#FFC93C'];

    /**
     * List guest stars ordered by sort order.
     */
    public function index(): Response
    {
        $guestStars = GuestStar::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (GuestStar $guestStar): array => $this->row($guestStar));

        return Inertia::render('admin/guest-stars', ['guestStars' => $guestStars]);
    }

    /**
     * Store a new guest star.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $photo = $validated['photo'] ?? null;
        $path = $photo?->store('guest-stars', 'public');

        GuestStar::create([
            'name' => $validated['name'],
            'role' => $validated['role'],
            'color' => $validated['color'] ?? $this->fallbackColor(),
            'photo_path' => $path,
            'photo_thumb_path' => $path ? Thumbnailer::create($photo, $path) : null,
            'sort_order' => GuestStar::query()->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Guest star '.$validated['name'].' ditambahkan.');
    }

    /**
     * Update a guest star.
     */
    public function update(Request $request, GuestStar $guestStar): RedirectResponse
    {
        $validated = $this->validated($request);

        $photo = $validated['photo'] ?? null;
        $path = $photo?->store('guest-stars', 'public');

        if ($path) {
            Storage::disk('public')->delete(array_filter([$guestStar->photo_path, $guestStar->photo_thumb_path]));
            $guestStar->photo_path = $path;
            $guestStar->photo_thumb_path = Thumbnailer::create($photo, $path);
        }

        $guestStar->name = $validated['name'];
        $guestStar->role = $validated['role'];
        $guestStar->color = $validated['color'] ?? $guestStar->color;
        $guestStar->save();

        return back()->with('success', 'Guest star '.$guestStar->name.' diperbarui.');
    }

    /**
     * Delete a guest star and its photo files.
     */
    public function destroy(GuestStar $guestStar): RedirectResponse
    {
        Storage::disk('public')->delete(array_filter([$guestStar->photo_path, $guestStar->photo_thumb_path]));

        $guestStar->delete();

        return back()->with('success', 'Guest star '.$guestStar->name.' dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'role' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:20', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
    }

    /**
     * Alternate between the brand colors for the initials fallback.
     */
    private function fallbackColor(): string
    {
        return self::COLORS[GuestStar::query()->count() % count(self::COLORS)];
    }

    /**
     * @return array<string, mixed>
     */
    private function row(GuestStar $guestStar): array
    {
        return [
            'id' => $guestStar->id,
            'name' => $guestStar->name,
            'role' => $guestStar->role,
            'color' => $guestStar->color,
            'photo_url' => $guestStar->photo_path ? $guestStar->photoThumbUrl() : null,
            'sort_order' => $guestStar->sort_order,
        ];
    }
}
