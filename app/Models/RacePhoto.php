<?php

namespace App\Models;

use Database\Factories\RacePhotoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int|null $registration_id
 * @property string|null $bib
 * @property string $photo_path
 * @property string|null $photo_thumb_path
 * @property string|null $photographer
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['registration_id', 'bib', 'photo_path', 'photo_thumb_path', 'photographer'])]
class RacePhoto extends Model
{
    /** @use HasFactory<RacePhotoFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Registration, $this>
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function photoUrl(): string
    {
        return Storage::disk('public')->url($this->photo_path);
    }

    public function photoThumbUrl(): string
    {
        return $this->photo_thumb_path
            ? Storage::disk('public')->url($this->photo_thumb_path)
            : $this->photoUrl();
    }
}
