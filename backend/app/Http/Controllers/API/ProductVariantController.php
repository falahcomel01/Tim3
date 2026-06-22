<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductVariantController extends Controller
{
    /**
     * Tambah varian untuk produk.
     */
    public function store(Request $request, string $product)
    {
        $product = Product::findOrFail($product);

        $validated = $request->validate(
            $this->rules(),
            $this->messages()
        );

        $variant = $product->variants()->create($validated);

        return response()->json([
            'success' => true,
            'data'    => $variant->load('status'),
        ], 201);
    }

    /**
     * Perbarui varian milik produk.
     */
    public function update(Request $request, string $product, string $variant)
    {
        $product = Product::findOrFail($product);
        $variant = $product->variants()->findOrFail($variant);

        $validated = $request->validate(
            $this->rules(true),
            $this->messages()
        );

        $variant->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $variant->load('status'),
        ]);
    }

    /**
     * Hapus varian milik produk.
     */
    public function destroy(string $product, string $variant)
    {
        $product = Product::findOrFail($product);
        $variant = $product->variants()->findOrFail($variant);

        $variant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Varian produk berhasil dihapus.',
        ]);
    }

    private function rules(bool $isUpdate = false): array
    {
        $required = $isUpdate ? 'sometimes' : 'required';

        return [
            'name'      => [$required, 'string', 'max:255'],
            'price'     => [$required, 'numeric', 'min:0'],
            'stock'     => [$required, 'integer', 'min:0'],
            'status_id' => [$required, 'integer', 'exists:statuses,id'],
        ];
    }

    private function messages(): array
    {
        return [
            'name.required'      => 'Nama varian wajib diisi.',
            'name.max'           => 'Nama varian maksimal 255 karakter.',
            'price.required'     => 'Harga varian wajib diisi.',
            'price.numeric'      => 'Harga varian harus berupa angka.',
            'price.min'          => 'Harga varian tidak boleh kurang dari 0.',
            'stock.required'     => 'Stok varian wajib diisi.',
            'stock.integer'      => 'Stok varian harus berupa bilangan bulat.',
            'stock.min'          => 'Stok varian tidak boleh kurang dari 0.',
            'status_id.required' => 'Status varian wajib diisi.',
            'status_id.exists'   => 'Status varian yang dipilih tidak ditemukan.',
        ];
    }
}
