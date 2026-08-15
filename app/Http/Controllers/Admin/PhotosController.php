<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRacePhotosRequest;
use App\Models\RacePhoto;
use App\Models\Registration;
use App\Support\Thumbnailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PhotosController extends Controller
{
    /**
     * List all uploaded race photos.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));

        $photos = RacePhoto::query()
            ->select(['id', 'registration_id', 'bib', 'photo_path', 'photographer', 'created_at'])
            ->with('registration:id,code,name,race_number')
            ->when($search, fn ($query, $search) => $query
                ->where(fn ($query) => $query
                    ->where('bib', 'like', "%{$search}%")
                    ->orWhereHas('registration', fn ($query) => $query
                        ->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%"))))
            ->latest()
            ->paginate(24)
            ->withQueryString()
            ->through(fn (RacePhoto $photo) => $this->row($photo));

        return Inertia::render('admin/photos', [
            'photos' => $photos,
            'search' => $search,
        ]);
    }

    /**
     * Suggest registered bib numbers matching a search term.
     */
    public function bibSuggestions(Request $request): JsonResponse
    {
        $q = strtoupper(trim((string) $request->query('q')));

        $bibs = Registration::query()
            ->whereNotNull('race_number')
            ->when($q, fn ($query, $q) => $query
                ->where(fn ($query) => $query
                    ->where('race_number', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%")
                    ->orWhere('name', 'like', "%{$q}%")))
            ->orderBy('race_number')
            ->limit(8)
            ->get(['race_number', 'code', 'name'])
            ->map(fn (Registration $registration) => [
                'race_number' => $registration->race_number,
                'code' => $registration->code,
                'name' => $registration->name,
            ]);

        return response()->json($bibs);
    }

    /**
     * Upload race photos tagged with a bib number.
     */
    public function store(StoreRacePhotosRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $bib = $validated['bib'];

        $registration = Registration::query()
            ->where('race_number', $bib)
            ->first();

        if (! $registration) {
            return back()
                ->withInput()
                ->withErrors(['bib' => "BIB {$bib} tidak ditemukan di daftar peserta. Gunakan saran yang muncul saat mengetik."]);
        }

        foreach ($validated['photos'] as $photo) {
            $path = $photo->store('race-photos', 'public');

            RacePhoto::create([
                'registration_id' => $registration->id,
                'bib' => $bib,
                'photo_path' => $path,
                'photo_thumb_path' => Thumbnailer::create($photo, $path),
                'photographer' => $validated['photographer'] ?: null,
            ]);
        }

        return back()->with(
            'success',
            count($validated['photos']).' foto untuk BIB '.$bib.' diunggah, terhubung ke '.$registration->name.' ('.$registration->code.').',
        );
    }

    /**
     * Delete a race photo and its thumbnail.
     */
    public function destroy(RacePhoto $photo): RedirectResponse
    {
        Storage::disk('public')->delete(array_filter([$photo->photo_path, $photo->photo_thumb_path]));

        $photo->delete();

        return back()->with('success', 'Foto untuk BIB '.$photo->bib.' dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function row(RacePhoto $photo): array
    {
        return [
            'id' => $photo->id,
            'url' => $photo->photoUrl(),
            'thumb_url' => $photo->photoThumbUrl(),
            'bib' => $photo->bib,
            'photographer' => $photo->photographer,
            'registration' => $photo->registration ? [
                'code' => $photo->registration->code,
                'name' => $photo->registration->name,
                'race_number' => $photo->registration->race_number,
            ] : null,
            'created_at' => $photo->created_at->format('d M Y H:i'),
        ];
    }
}
