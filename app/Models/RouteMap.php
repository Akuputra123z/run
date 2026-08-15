<?php

namespace App\Models;

use Database\Factories\RouteMapFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property string|null $photo_path
 * @property string|null $photo_thumb_path
 * @property string|null $detail_photo_path
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'description', 'photo_path', 'photo_thumb_path', 'detail_photo_path', 'sort_order'])]
class RouteMap extends Model
{
    /** @use HasFactory<RouteMapFactory> */
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

    public function detailPhotoUrl(): string
    {
        return Storage::disk('public')->url($this->detail_photo_path);
    }
}
