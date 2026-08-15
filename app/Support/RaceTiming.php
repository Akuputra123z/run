<?php

namespace App\Support;

use App\Models\Registration;

final class RaceTiming
{
    /**
     * Format seconds as H:MM:SS (or MM:SS when under an hour).
     */
    public static function formatSeconds(int $seconds): string
    {
        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);
        $remaining = $seconds % 60;

        return $hours > 0
            ? sprintf('%d:%02d:%02d', $hours, $minutes, $remaining)
            : sprintf('%02d:%02d', $minutes, $remaining);
    }

    /**
     * Parse a clock time (H:i:s or m:s) into seconds, or null when invalid.
     */
    public static function parseTime(?string $time): ?int
    {
        $time = trim((string) $time);

        if (preg_match('/^(?:(\d+):)?(\d{1,2}):(\d{2})$/', $time, $matches) === 1) {
            $hours = (int) ($matches[1] ?? 0);
            $minutes = (int) $matches[2];
            $seconds = (int) $matches[3];

            if ($minutes > 59 || $seconds > 59) {
                return null;
            }

            return $hours * 3600 + $minutes * 60 + $seconds;
        }

        return null;
    }

    /**
     * Compute pace (per km) from seconds and distance in kilometers.
     */
    public static function pacePerKm(int $seconds, int $distanceKm): ?string
    {
        if ($distanceKm <= 0) {
            return null;
        }

        $paceSeconds = intdiv($seconds, $distanceKm);

        return sprintf('%02d:%02d/km', intdiv($paceSeconds, 60), $paceSeconds % 60);
    }

    /**
     * Rank of a finish time (1 = fastest) among all finishers, optionally within a category.
     */
    public static function rank(int $finishSeconds, ?int $categoryId = null): int
    {
        $query = Registration::query()
            ->whereNotNull('finish_seconds')
            ->where('finish_seconds', '<', $finishSeconds);

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        return $query->count() + 1;
    }
}
