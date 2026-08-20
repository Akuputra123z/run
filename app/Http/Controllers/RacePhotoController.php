<?php

namespace App\Http\Controllers;

use App\Models\RacePhoto;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class RacePhotoController extends Controller
{
    /**
     * Cache payload per BIB so repeated lookups hit the cache, not the DB.
     * Only non-empty results are cached; a miss is re-queried on next visit.
     */
    private const CACHE_TTL_SECONDS = 600;

    /**
     * Show a public gallery of race photos matching a BIB number or registration code.
     */
    public function __invoke(?string $bib = null): Response
    {
        $bib = strtoupper(trim((string) $bib)) ?: null;

        return Inertia::render('foto', [
            'bib' => $bib,
            'photos' => $this->photosFor($bib),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function photosFor(?string $bib): array
    {
        if (! $bib) {
            return [];
        }

        $cacheKey = 'photos.lookup.'.$bib;

        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }

        $photos = RacePhoto::query()
            ->select(['id', 'photo_path', 'photo_thumb_path', 'photographer'])
            ->where('bib', $bib)
            ->orWhereHas('registration', fn ($query) => $query->where('code', $bib))
            ->latest()
            ->get()
            ->map(fn (RacePhoto $photo) => [
                'id' => $photo->id,
                'url' => $photo->photoUrl(),
                'thumb_url' => $photo->photoThumbUrl(),
                'photographer' => $photo->photographer,
            ])
            ->all();

        if ($photos !== []) {
            Cache::put($cacheKey, $photos, self::CACHE_TTL_SECONDS);
        }

        return $photos;
    }
}
