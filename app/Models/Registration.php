<?php

namespace App\Models;

use App\Enums\RegistrationStatus;
use Database\Factories\RegistrationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $code
 * @property int $category_id
 * @property string $name
 * @property string $email
 * @property string $phone
 * @property string|null $nik
 * @property string $gender
 * @property string $birth_date
 * @property string $city
 * @property string $jersey_size
 * @property string $emergency_name
 * @property string $emergency_phone
 * @property string|null $community
 * @property RegistrationStatus $status
 * @property string|null $race_number
 * @property int $total_amount
 * @property int|null $finish_seconds
 * @property Carbon|null $payment_due_at
 * @property Carbon|null $paid_at
 * @property Carbon|null $pickup_at
 * @property Carbon|null $checked_in_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'code', 'category_id', 'name', 'email', 'phone', 'nik', 'gender', 'birth_date',
    'city', 'jersey_size', 'emergency_name', 'emergency_phone', 'community',
    'status', 'race_number', 'total_amount', 'finish_seconds',
    'payment_due_at', 'paid_at', 'pickup_at', 'checked_in_at',
])]
#[Hidden(['payment_due_at', 'paid_at', 'pickup_at', 'checked_in_at'])]
class Registration extends Model
{
    /** @use HasFactory<RegistrationFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * @return HasOne<Payment, $this>
     */
    public function latestPayment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    /**
     * @return HasMany<RacePhoto, $this>
     */
    public function racePhotos(): HasMany
    {
        return $this->hasMany(RacePhoto::class);
    }

    public function isActive(): bool
    {
        return $this->status !== RegistrationStatus::Cancelled;
    }

    protected function casts(): array
    {
        return [
            'status' => RegistrationStatus::class,
            'total_amount' => 'integer',
            'finish_seconds' => 'integer',
            'payment_due_at' => 'datetime',
            'paid_at' => 'datetime',
            'pickup_at' => 'datetime',
            'checked_in_at' => 'datetime',
        ];
    }
}
