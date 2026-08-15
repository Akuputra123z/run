<?php

namespace App\Models;

use App\Enums\RegistrationStatus;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $distance
 * @property int $price
 * @property int $quota
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'distance', 'price', 'quota'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    /**
     * @return HasMany<Registration, $this>
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function registeredCount(): int
    {
        return $this->registrations()
            ->whereNot('status', RegistrationStatus::Cancelled)
            ->count();
    }

    public function isFull(): bool
    {
        return $this->registeredCount() >= $this->quota;
    }

    /**
     * The race distance in kilometers, parsed from the distance label (e.g. "10K").
     */
    public function distanceKm(): int
    {
        return (int) preg_replace('/\D/', '', (string) $this->distance);
    }

    public function slotsLeft(): int
    {
        return max(0, $this->quota - $this->registeredCount());
    }
}
