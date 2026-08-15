<?php

namespace App\Models;

use Database\Factories\GuestStarFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $name
 * @property string $role
 * @property string $color
 * @property string|null $photo_path
 * @property string|null $photo_thumb_path
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'role', 'color', 'photo_path', 'photo_thumb_path', 'sort_order'])]
class GuestStar extends Model
{
    /** @use HasFactory<GuestStarFactory> */
    use HasFactory;

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
