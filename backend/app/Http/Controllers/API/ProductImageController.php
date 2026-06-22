<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductImageController extends Controller
{
    /**
     * Tambah gambar untuk produk.
     */
    public function store(Request $request, string $product)
    {
        $product = Product::findOrFail($product);

        $validated = $request->validate([
            'url'        => ['required', 'string', 'max:2048'],
            'is_primary' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ], $this->messages());

        $isPrimary = (bool) ($validated['is_primary'] ?? false);

        $image = DB::transaction(function () use ($product, $validated, $isPrimary) {
            if ($isPrimary) {
                $product->images()->update(['is_primary' => false]);
            }

            return $product->images()->create([
                'url'        => $validated['url'],
                'is_primary' => $isPrimary,
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);
        });

        return response()->json([
            'success' => true,
            'data'    => $image,
        ], 201);
    }

    /**
     * Perbarui gambar milik produk.
     */
    public function update(Request $request, string $product, string $image)
    {
        $product = Product::findOrFail($product);
        $image   = $product->images()->findOrFail($image);

        $validated = $request->validate([
            'url'        => ['sometimes', 'string', 'max:2048'],
            'is_primary' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ], $this->messages());

        $image = DB::transaction(function () use ($product, $image, $validated) {
            if (array_key_exists('is_primary', $validated) && (bool) $validated['is_primary'] === true) {
                // Nonaktifkan primary pada gambar lain milik produk.
                $product->images()->where('id', '!=', $image->id)->update(['is_primary' => false]);
            }

            $image->update($validated);

            return $image;
        });

        return response()->json([
            'success' => true,
            'data'    => $image,
        ]);
    }

    /**
     * Hapus gambar milik produk.
     */
    public function destroy(string $product, string $image)
    {
        $product = Product::findOrFail($product);
        $image   = $product->images()->findOrFail($image);

        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Gambar produk berhasil dihapus.',
        ]);
    }

    private function messages(): array
    {
        return [
            'url.required'     => 'URL gambar wajib diisi.',
            'url.max'          => 'URL gambar maksimal 2048 karakter.',
            'is_primary.boolean' => 'Nilai gambar utama harus berupa boolean.',
            'sort_order.integer' => 'Urutan harus berupa bilangan bulat.',
            'sort_order.min'   => 'Urutan tidak boleh kurang dari 0.',
        ];
    }
}
