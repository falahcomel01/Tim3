<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\SlugGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Relasi yang selalu disertakan pada respons produk.
     */
    private array $relations = ['status', 'categories', 'images', 'variants'];

    /**
     * Daftar produk dengan filter, pencarian, dan paginasi.
     */
    public function index(Request $request)
    {
        $request->validate([
            'search'      => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'status_id'   => ['sometimes', 'integer', 'exists:statuses,id'],
            'min_price'   => ['sometimes', 'numeric', 'min:0'],
            'max_price'   => ['sometimes', 'numeric', 'min:0'],
            'per_page'    => ['sometimes', 'integer', 'between:1,100'],
        ], [], [
            'category_id' => 'kategori',
            'status_id'   => 'status',
            'min_price'   => 'harga minimum',
            'max_price'   => 'harga maksimum',
            'per_page'    => 'jumlah per halaman',
        ]);

        $query = Product::with($this->relations);

        $query->whereHas('categories', function ($q) {
            $q->where('categories.status_id', 1);
        });

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $categoryId = $request->input('category_id');
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId)
                  ->where('categories.status_id', 1);
            });
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->input('status_id'));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        $perPage = (int) $request->input('per_page', 10);
        $products = $query->orderByDesc('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => [
                'data'         => $products->items(),
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /**
     * Detail satu produk.
     */
    public function show(string $id)
    {
        $product = Product::with($this->relations)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $product,
        ]);
    }

    /**
     * Buat produk baru beserta data turunannya.
     */
    public function store(Request $request)
    {
        $validated = $request->validate(
            $this->rules(),
            $this->messages()
        );

        $product = DB::transaction(function () use ($validated, $request) {
            $slug = $this->resolveSlug(
                $validated['slug'] ?? null,
                $validated['name'],
                null
            );

            $product = Product::create([
                'name'        => $validated['name'],
                'slug'        => $slug,
                'description' => $validated['description'] ?? null,
                'price'       => $validated['price'],
                'stock'       => $validated['stock'],
                'status_id'   => $validated['status_id'],
            ]);

            if ($request->filled('categories')) {
                $product->categories()->sync($validated['categories']);
            }

            if (! empty($validated['variants'])) {
                foreach ($validated['variants'] as $variant) {
                    $product->variants()->create($variant);
                }
            }

            if ($request->hasFile('images')) {
                $this->createImages($product, $request->file('images'));
            }

            return $product;
        });

        return response()->json([
            'success' => true,
            'data'    => $product->load($this->relations),
        ], 201);
    }

    /**
     * Perbarui produk (partial update).
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate(
            $this->rules(true, $product->id),
            $this->messages()
        );

        $product = DB::transaction(function () use ($product, $validated, $request) {

            // ── Update field utama produk ──────────────────────────────────
            $data = collect($validated)->only([
                'name', 'description', 'price', 'stock', 'status_id',
            ])->toArray();

            if ($request->exists('slug') || $request->exists('name')) {
                $source   = $validated['slug'] ?? ($validated['name'] ?? $product->name);
                $explicit = $validated['slug'] ?? null;

                if ($explicit !== null || ($request->exists('name') && $source !== $product->name)) {
                    $data['slug'] = $this->resolveSlug($explicit, $source, $product->id);
                }
            }

            if (! empty($data)) {
                $product->update($data);
            }

            // ── Update kategori ────────────────────────────────────────────
            if ($request->exists('categories')) {
                $product->categories()->sync($validated['categories'] ?? []);
            }

            // ── Update variant ─────────────────────────────────────────────
            // FIX: variant sebelumnya tidak diproses sama sekali saat update.
            // Sekarang: jika request membawa variants, lakukan upsert berdasarkan id.
            // - Variant yang punya id → update stok, harga, status
            // - Variant tanpa id      → buat baru
            // - Variant lama yang tidak dikirim ulang → hapus
            if ($request->exists('variants')) {
                $incomingVariants = $validated['variants'] ?? [];

                // Kumpulkan id variant yang dikirim (untuk deteksi yang dihapus)
                $incomingIds = collect($incomingVariants)
                    ->pluck('id')
                    ->filter()
                    ->values()
                    ->toArray();

                // Hapus variant yang tidak ada di request (dihapus oleh admin)
                $product->variants()
                    ->whereNotIn('id', $incomingIds)
                    ->delete();

                foreach ($incomingVariants as $variantData) {
                    if (! empty($variantData['id'])) {
                        // Update variant yang sudah ada
                        $product->variants()
                            ->where('id', $variantData['id'])
                            ->update([
                                'name'      => $variantData['name'],
                                'price'     => $variantData['price'],
                                'stock'     => $variantData['stock'],
                                'status_id' => $variantData['status_id'],
                            ]);
                    } else {
                        // Buat variant baru
                        $product->variants()->create([
                            'name'      => $variantData['name'],
                            'price'     => $variantData['price'],
                            'stock'     => $variantData['stock'],
                            'status_id' => $variantData['status_id'],
                        ]);
                    }
                }
            }

            // ── Update gambar ──────────────────────────────────────────────
            // Hapus gambar lama yang tidak dipertahankan admin
            if ($request->exists('existing_image_ids')) {
                $keepIds = array_filter((array) $request->input('existing_image_ids'));
                $product->images()
                    ->whereNotIn('id', $keepIds)
                    ->each(function ($img) {
                        // Hapus file fisik dari storage jika perlu
                        // Storage::disk('public')->delete(ltrim($img->url, '/storage/'));
                        $img->delete();
                    });
            }

            // Tambah gambar baru jika ada
            if ($request->hasFile('images')) {
                // Cek apakah masih ada gambar yang tersisa (untuk menentukan is_primary)
                $hasExisting = $product->images()->exists();
                $this->createImages($product, $request->file('images'), !$hasExisting);
            }

            return $product;
        });

        return response()->json([
            'success' => true,
            'data'    => $product->load($this->relations),
        ]);
    }

    /**
     * Hapus produk beserta data turunannya.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);

        DB::transaction(function () use ($product) {
            $product->variants()->delete();
            $product->images()->delete();
            $product->categories()->detach();
            $product->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    /**
     * Sinkronkan asosiasi kategori produk.
     */
    public function syncCategories(Request $request, string $product)
    {
        $product = Product::findOrFail($product);

        $validated = $request->validate([
            'categories'   => ['present', 'array'],
            'categories.*' => ['integer', 'exists:categories,id'],
        ], [
            'categories.present'  => 'Daftar kategori wajib disertakan.',
            'categories.array'    => 'Daftar kategori harus berupa array.',
            'categories.*.exists' => 'Salah satu kategori yang dipilih tidak ditemukan.',
        ]);

        $product->categories()->sync($validated['categories']);

        return response()->json([
            'success' => true,
            'data'    => $product->load($this->relations),
        ]);
    }

    /**
     * Tentukan slug unik.
     */
    private function resolveSlug(?string $explicitSlug, string $source, ?int $ignoreId): string
    {
        $base = $explicitSlug !== null && $explicitSlug !== '' ? $explicitSlug : $source;

        return SlugGenerator::generate($base, 'products', $ignoreId, 255);
    }

    /**
     * Buat gambar produk sambil menjaga hanya satu gambar utama.
     * $resetPrimary = true berarti gambar pertama yang baru akan jadi primary.
     */
    private function createImages(Product $product, array $images, bool $resetPrimary = false): void
    {
        $startOrder = $product->images()->max('sort_order') + 1;

        foreach ($images as $index => $image) {
            $path = $image->store('products', 'public');

            $product->images()->create([
                'url'        => '/storage/' . $path,
                'is_primary' => $resetPrimary && $index === 0,
                'sort_order' => $startOrder + $index,
            ]);
        }
    }

    /**
     * Aturan validasi produk.
     */
    private function rules(bool $isUpdate = false, ?int $ignoreId = null): array
    {
        $required = $isUpdate ? 'sometimes' : 'required';

        return [
            'name'                 => [$required, 'string', 'max:255'],
            'slug'                 => ['sometimes', 'nullable', 'string', 'max:255', 'regex:/^[a-z0-9\-]+$/'],
            'description'          => ['sometimes', 'nullable', 'string'],
            'price'                => [$required, 'numeric', 'min:0'],
            'stock'                => [$required, 'integer', 'min:0'],
            'status_id'            => [$required, 'integer', 'exists:statuses,id'],

            'categories'           => ['sometimes', 'array'],
            'categories.*'         => ['integer', 'exists:categories,id'],

            'variants'             => ['sometimes', 'array'],
            'variants.*.id'        => ['sometimes', 'nullable', 'integer', 'exists:product_variants,id'],
            'variants.*.name'      => ['required_with:variants', 'string', 'max:255'],
            'variants.*.price'     => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.stock'     => ['required_with:variants', 'integer', 'min:0'],
            'variants.*.status_id' => ['required_with:variants', 'integer', 'exists:statuses,id'],

            'images'               => ['sometimes', 'array'],
            'images.*'             => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],

            'existing_image_ids'   => ['sometimes', 'array'],
            'existing_image_ids.*' => ['nullable', 'integer'],
        ];
    }

    /**
     * Pesan validasi dalam Bahasa Indonesia.
     */
    private function messages(): array
    {
        return [
            'name.required'        => 'Nama produk wajib diisi.',
            'name.max'             => 'Nama produk maksimal 255 karakter.',
            'slug.regex'           => 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.',
            'price.required'       => 'Harga produk wajib diisi.',
            'price.numeric'        => 'Harga harus berupa angka.',
            'price.min'            => 'Harga tidak boleh kurang dari 0.',
            'stock.required'       => 'Stok produk wajib diisi.',
            'stock.integer'        => 'Stok harus berupa bilangan bulat.',
            'stock.min'            => 'Stok tidak boleh kurang dari 0.',
            'status_id.required'   => 'Status produk wajib diisi.',
            'status_id.exists'     => 'Status yang dipilih tidak ditemukan.',

            'categories.*.exists'  => 'Salah satu kategori yang dipilih tidak ditemukan.',

            'variants.*.id.exists'               => 'Variant tidak ditemukan.',
            'variants.*.name.required_with'      => 'Nama varian wajib diisi.',
            'variants.*.price.required_with'     => 'Harga varian wajib diisi.',
            'variants.*.price.min'               => 'Harga varian tidak boleh kurang dari 0.',
            'variants.*.stock.required_with'     => 'Stok varian wajib diisi.',
            'variants.*.stock.min'               => 'Stok varian tidak boleh kurang dari 0.',
            'variants.*.status_id.required_with' => 'Status varian wajib diisi.',
            'variants.*.status_id.exists'        => 'Status varian yang dipilih tidak ditemukan.',

            'images.*.image' => 'File harus berupa gambar.',
            'images.*.mimes' => 'Format gambar harus JPG, PNG, atau WEBP.',
            'images.*.max'   => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}