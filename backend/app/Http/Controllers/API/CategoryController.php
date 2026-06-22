<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\SlugGenerator;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Daftar kategori.
     */
    public function index(Request $request)
    {
        $request->validate([
            'search'    => ['sometimes', 'string', 'max:100'],
            'status_id' => ['sometimes', 'integer', 'exists:statuses,id'],
            'per_page'  => ['sometimes', 'integer', 'between:1,100'],
        ], [
            'status_id.exists' => 'Status yang dipilih tidak ditemukan.',
        ]);

        $query = Category::with('status');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->input('status_id'));
        }

        $perPage = (int) $request->input('per_page', 10);

        $categories = $query->orderBy('name')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => [
                'data'         => $categories->items(),
                'current_page' => $categories->currentPage(),
                'last_page'    => $categories->lastPage(),
                'per_page'     => $categories->perPage(),
                'total'        => $categories->total(),
            ],
        ]);
    }

    /**
     * Detail kategori.
     */
    public function show(string $id)
    {
        $category = Category::with('status')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $category,
        ]);
    }

    /**
     * Buat kategori baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'slug'      => ['sometimes', 'nullable', 'string', 'max:100', 'regex:/^[a-z0-9\-]+$/'],
            'status_id' => ['required', 'integer', 'exists:statuses,id'],
        ], $this->messages());

        $slug = SlugGenerator::generate(
            $validated['slug'] ?? $validated['name'],
            'categories',
            null,
            100
        );

        $category = Category::create([
            'name'      => $validated['name'],
            'slug'      => $slug,
            'status_id' => $validated['status_id'],
        ]);

        return response()->json([
            'success' => true,
            'data'    => $category->load('status'),
        ], 201);
    }

    /**
     * Perbarui kategori (partial update).
     */
    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'      => ['sometimes', 'string', 'max:100'],
            'slug'      => ['sometimes', 'nullable', 'string', 'max:100', 'regex:/^[a-z0-9\-]+$/'],
            'status_id' => ['sometimes', 'integer', 'exists:statuses,id'],
        ], $this->messages());

        $data = collect($validated)->only(['name', 'status_id'])->toArray();

        if ($request->exists('slug') || $request->exists('name')) {
            $explicit = $validated['slug'] ?? null;
            $source   = $explicit ?? ($validated['name'] ?? $category->name);

            if ($explicit !== null || ($request->exists('name') && $source !== $category->name)) {
                $data['slug'] = SlugGenerator::generate($source, 'categories', $category->id, 100);
            }
        }

        if (! empty($data)) {
            $category->update($data);
        }

        return response()->json([
            'success' => true,
            'data'    => $category->load('status'),
        ]);
    }

    /**
     * Hapus kategori.
     */
    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);

        $category->products()->detach();
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }

    private function messages(): array
    {
        return [
            'name.required'      => 'Nama kategori wajib diisi.',
            'name.max'           => 'Nama kategori maksimal 100 karakter.',
            'slug.regex'         => 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.',
            'slug.max'           => 'Slug kategori maksimal 100 karakter.',
            'status_id.required' => 'Status kategori wajib diisi.',
            'status_id.exists'   => 'Status yang dipilih tidak ditemukan.',
        ];
    }
}
