<?php

namespace App\Support;

use App\Models\Setting;

final class EventSettings
{
    /**
     * Read an event setting, falling back to the given default when unset.
     */
    public static function get(string $key, ?string $default = null): ?string
    {
        return Setting::query()->where('key', $key)->value('value') ?? $default;
    }

    /**
     * Read an event setting stored as JSON, falling back to the given default.
     *
     * @template T
     *
     * @param  T  $default
     * @return T|array<mixed>
     */
    public static function json(string $key, mixed $default = []): mixed
    {
        $value = self::get($key);

        if ($value === null) {
            return $default;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $default;
    }

    /**
     * @param  array<string, string|null>  $values
     */
    public static function set(array $values): void
    {
        foreach ($values as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
