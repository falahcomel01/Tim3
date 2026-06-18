<?php

namespace App\Http\Controllers\Dev;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DummyDataController extends Controller
{
    /**
     * Daftar status order yang dipakai konsisten di semua method.
     */
    private array $statuses = [
        'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
    ];

    /**
     * Mengubah parameter range ('7d' | '30d' | '90d' | '12m') menjadi
     * jumlah hari (atau bulan untuk '12m'), dengan default '30d'.
     */
    private function resolveRange(?string $range): array
    {
        return match ($range) {
            '7d'  => ['unit' => 'day', 'amount' => 7],
            '90d' => ['unit' => 'day', 'amount' => 90],
            '12m' => ['unit' => 'month', 'amount' => 12],
            default => ['unit' => 'day', 'amount' => 30], // '30d' & fallback
        };
    }

    /**
     * Generator angka pseudo-random tapi deterministik berdasarkan seed,
     * supaya data tidak berubah-ubah acak tiap request, namun tetap
     * bervariasi secara natural antar tanggal/bulan/range.
     */
    private function seededValue(string $seed, int $min, int $max): int
    {
        $hash = crc32($seed);
        return $min + ($hash % max(1, ($max - $min + 1)));
    }

    /**
     * Ringkasan dashboard
     * Sesuai kontrak dashboardService.getSummary()
     */
    public function summary(Request $request)
    {
        $range = $this->resolveRange($request->query('range'));
        $scale = $range['unit'] === 'month' ? $range['amount'] : ($range['amount'] / 30);

        $totalRevenue = (int) round(35000000 * $scale);
        $totalOrders  = (int) round(45 * $scale);

        return response()->json([
            'data' => [
                'total_revenue' => [
                    'value' => $totalRevenue,
                    'change_percent' => $this->seededValue('revenue-' . $range['amount'], -15, 25),
                ],
                'total_orders' => [
                    'value' => $totalOrders,
                    'change_percent' => $this->seededValue('orders-' . $range['amount'], -10, 30),
                ],
                'pending_orders' => [
                    'value' => 27,
                    'change_percent' => null,
                ],
                'low_stock_products' => [
                    'value' => 8,
                    'change_percent' => null,
                ],
            ]
        ]);
    }

    /**
     * Pendapatan
     * Sesuai kontrak dashboardService.getRevenue()
     * Granularitas harian untuk 7d/30d/90d, bulanan untuk 12m
     */
    public function revenue(Request $request)
    {
        $range = $this->resolveRange($request->query('range'));
        $data = [];

        if ($range['unit'] === 'month') {
            // 12 bulan terakhir
            for ($i = $range['amount'] - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $key = $date->format('Y-m');
                $base = 15000000 + (($range['amount'] - $i) * 2500000);
                $variance = $this->seededValue('rev-month-' . $key, -2000000, 2000000);

                $data[] = [
                    'date' => $key,
                    'revenue' => max(0, $base + $variance),
                ];
            }
        } else {
            // harian, sebanyak $range['amount'] hari terakhir
            for ($i = $range['amount'] - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $key = $date->format('Y-m-d');
                $base = 1200000;
                $variance = $this->seededValue('rev-day-' . $key, -400000, 900000);

                $data[] = [
                    'date' => $key,
                    'revenue' => max(0, $base + $variance),
                ];
            }
        }

        return response()->json([
            'data' => $data
        ]);
    }

    /**
     * Status pesanan
     * Sesuai kontrak dashboardService.getOrderStatus()
     * Total count menyesuaikan besar range yang dipilih
     */
    public function orderStatus(Request $request)
    {
        $range = $this->resolveRange($request->query('range'));
        $scale = $range['unit'] === 'month' ? $range['amount'] : ($range['amount'] / 30);

        // Proporsi dasar (mirip distribusi 30 hari), lalu diskalakan
        $baseCounts = [
            'pending'    => 20,
            'paid'       => 75,
            'processing' => 40,
            'shipped'    => 55,
            'delivered'  => 120,
            'cancelled'  => 8,
            'refunded'   => 3,
        ];

        $data = [];
        foreach ($this->statuses as $status) {
            $data[] = [
                'status' => $status,
                'count' => (int) round($baseCounts[$status] * $scale),
            ];
        }

        return response()->json([
            'data' => $data
        ]);
    }

    /**
     * Produk terlaris
     * Sesuai kontrak dashboardService.getTopProducts()
     * qty_sold & revenue menyesuaikan range, urutan tetap konsisten
     */
    public function topProducts(Request $request)
    {
        $range = $this->resolveRange($request->query('range'));
        $scale = $range['unit'] === 'month' ? $range['amount'] : ($range['amount'] / 30);
        $limit = (int) ($request->query('limit') ?? 5);

        $baseProducts = [
            ['id' => 1, 'name' => 'Laptop ASUS',         'qty_sold' => 125, 'revenue' => 125000000],
            ['id' => 2, 'name' => 'Mouse Logitech',       'qty_sold' => 110, 'revenue' => 22000000],
            ['id' => 3, 'name' => 'Keyboard Mechanical',  'qty_sold' => 98,  'revenue' => 49000000],
            ['id' => 4, 'name' => 'Monitor LG',           'qty_sold' => 80,  'revenue' => 96000000],
            ['id' => 5, 'name' => 'SSD Samsung',          'qty_sold' => 75,  'revenue' => 60000000],
            ['id' => 6, 'name' => 'Webcam Logitech',      'qty_sold' => 60,  'revenue' => 18000000],
            ['id' => 7, 'name' => 'Headset HyperX',       'qty_sold' => 50,  'revenue' => 15000000],
        ];

        $data = array_map(function ($product) use ($scale) {
            return [
                'id' => $product['id'],
                'name' => $product['name'],
                'qty_sold' => (int) round($product['qty_sold'] * $scale),
                'revenue' => (int) round($product['revenue'] * $scale),
            ];
        }, $baseProducts);

        // Tetap urut dari qty_sold terbesar
        usort($data, fn ($a, $b) => $b['qty_sold'] <=> $a['qty_sold']);

        return response()->json([
            'data' => array_slice($data, 0, $limit)
        ]);
    }

    /**
     * Produk stok menipis
     * Sesuai kontrak dashboardService.getLowStock()
     * Tidak terpengaruh range, tapi mendukung limit & threshold
     */
    public function lowStock(Request $request)
    {
        $limit = (int) ($request->query('limit') ?? 10);
        $threshold = (int) ($request->query('threshold') ?? 10);

        $allProducts = [
            ['id' => 1, 'name' => 'RAM Kingston',      'sku' => 'RAM001', 'stock' => 2],
            ['id' => 2, 'name' => 'SSD Kingston',      'sku' => 'SSD001', 'stock' => 3],
            ['id' => 3, 'name' => 'Keyboard Logitech', 'sku' => 'KEY001', 'stock' => 4],
            ['id' => 4, 'name' => 'Mouse Pad Anti Slip', 'sku' => 'MPD001', 'stock' => 6],
            ['id' => 5, 'name' => 'Cable HDMI 2m',     'sku' => 'CBL001', 'stock' => 9],
        ];

        $filtered = array_values(array_filter($allProducts, fn ($p) => $p['stock'] <= $threshold));

        $data = array_map(function ($product) use ($threshold) {
            return [
                'id' => $product['id'],
                'name' => $product['name'],
                'sku' => $product['sku'],
                'stock' => $product['stock'],
                'threshold' => $threshold,
            ];
        }, $filtered);

        usort($data, fn ($a, $b) => $a['stock'] <=> $b['stock']);

        return response()->json([
            'data' => array_slice($data, 0, $limit)
        ]);
    }

    /**
     * Pesanan terbaru
     * Sesuai kontrak dashboardService.getRecentOrders()
     * Tidak terpengaruh range (selalu order terbaru)
     */
    public function recentOrders(Request $request)
    {
        $limit = (int) ($request->query('limit') ?? 10);

        $allOrders = [
            [
                'id' => 1001,
                'customer_name' => 'Budi',
                'customer_email' => 'budi@gmail.com',
                'items_count' => 3,
                'total' => 3500000,
                'status' => 'paid',
                'ordered_at' => Carbon::now()->subHours(2)->toIso8601String(),
            ],
            [
                'id' => 1002,
                'customer_name' => 'Andi',
                'customer_email' => 'andi@gmail.com',
                'items_count' => 1,
                'total' => 1250000,
                'status' => 'processing',
                'ordered_at' => Carbon::now()->subHours(5)->toIso8601String(),
            ],
            [
                'id' => 1003,
                'customer_name' => 'Citra',
                'customer_email' => 'citra@gmail.com',
                'items_count' => 5,
                'total' => 7800000,
                'status' => 'shipped',
                'ordered_at' => Carbon::now()->subHours(9)->toIso8601String(),
            ],
            [
                'id' => 1004,
                'customer_name' => 'Dewi',
                'customer_email' => 'dewi@gmail.com',
                'items_count' => 2,
                'total' => 920000,
                'status' => 'pending',
                'ordered_at' => Carbon::now()->subDay()->toIso8601String(),
            ],
            [
                'id' => 1005,
                'customer_name' => 'Eka',
                'customer_email' => 'eka@gmail.com',
                'items_count' => 4,
                'total' => 4100000,
                'status' => 'delivered',
                'ordered_at' => Carbon::now()->subDays(2)->toIso8601String(),
            ],
        ];

        return response()->json([
            'data' => array_slice($allOrders, 0, $limit)
        ]);
    }
}