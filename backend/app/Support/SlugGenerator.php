<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SlugGenerator
{
    /**
     * Hasilkan slug unik untuk sebuah tabel.
     *
     * - Mengubah sumber menjadi format huruf kecil, angka, dan tanda hubung.
     * - Membatasi panjang maksimum.
     * - Menjamin keunikan pada kolom `slug` tabel (mengabaikan baris $ignoreId).
     * - Menambahkan akhiran numerik (-1, -2, ...) bila terjadi bentrok.
     */
    public static function generate(
        string $source,
        string $table,
        ?int $ignoreId = null,
        int $maxLength = 255
    ): string {
        $base = Str::slug($source);

        // Jika kosong setelah slugify (mis. sumber hanya simbol), beri fallback.
        if ($base === '') {
            $base = 'item';
        }

        $base = Str::limit($base, $maxLength, '');
        $base = trim($base, '-');

        $slug = $base;
        $suffix = 1;

        while (self::exists($table, $slug, $ignoreId)) {
            $suffixStr = '-' . $suffix;
            // Pastikan slug + akhiran tetap dalam batas panjang.
            $trimmed = Str::limit($base, $maxLength - strlen($suffixStr), '');
            $trimmed = trim($trimmed, '-');
            $slug = $trimmed . $suffixStr;
            $suffix++;
        }

        return $slug;
    }

    /**
     * Periksa apakah slug sudah dipakai pada tabel (selain baris $ignoreId).
     */
    protected static function exists(string $table, string $slug, ?int $ignoreId): bool
    {
        $query = DB::table($table)->where('slug', $slug);

        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->exists();
    }
}
