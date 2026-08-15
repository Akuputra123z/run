<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

final class Thumbnailer
{
    /**
     * Build a webp thumbnail (max $width px wide) next to the original photo,
     * under a "thumbs" subdirectory. Returns null when the image cannot be decoded.
     */
    public static function create(UploadedFile $photo, string $originalPath, int $width = 480): ?string
    {
        try {
            $image = (new ImageManager(GdDriver::class))->decode($photo);
            $image->scaleDown(width: $width);

            $thumbPath = dirname($originalPath).'/thumbs/'.pathinfo($originalPath, PATHINFO_FILENAME).'.webp';

            Storage::disk('public')->put($thumbPath, $image->encodeUsingFormat(Format::WEBP, quality: 80)->toString());

            return $thumbPath;
        } catch (\Throwable) {
            return null;
        }
    }
}
