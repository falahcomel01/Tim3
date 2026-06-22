<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;

class DashboardController extends Controller
{
    /**
     * Ringkasan dashboard
     */
    public function summary(Request $request)
    {
        return response()->json([
            'data' => [
                'total_products' => Product::count(),
                'total_categories' => Category::count(),
                'total_users' => User::count(),
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'low_stock_products' => ProductVariant::where('stock', '<=', 10)->count(),
            ]
        ]);
    }

    /**
     * Pendapatan
     */
    public function revenue(Request $request)
    {
        $orders = Order::whereNotIn('status', ['cancelled', 'refunded'])
            ->orderBy('created_at')
            ->get();

        $data = $orders->groupBy(function ($order) {
            return $order->created_at->format('Y-m');
        })->map(function ($items, $month) {
            return [
                'date' => $month,
                'revenue' => $items->sum('total')
            ];
        })->values();

        return response()->json([
            'data' => $data
        ]);
    }

    /**
     * Status pesanan
     */
    public function orderStatus(Request $request)
    {
        $statuses = [
            'pending',
            'paid',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded'
        ];

        $data = [];

        foreach ($statuses as $status) {
            $data[] = [
                'status' => $status,
                'count' => Order::where('status', $status)->count()
            ];
        }

        return response()->json([
            'data' => $data
        ]);
    }

    /**
     * Produk terlaris
     */
    public function topProducts(Request $request)
    {
        $limit = $request->limit ?? 5;

        $items = OrderItem::with('product')
            ->get()
            ->groupBy('product_id')
            ->map(function ($rows) {

                $product = $rows->first()->product;

                return [
                    'id' => $product?->id,
                    'name' => $product?->name,
                    'qty_sold' => $rows->sum('quantity'),
                    'revenue' => $rows->sum(function ($item) {
                        return $item->quantity * $item->unit_price;
                    })
                ];
            })
            ->sortByDesc('qty_sold')
            ->take($limit)
            ->values();

        return response()->json([
            'data' => $items
        ]);
    }

    /**
     * Produk stok menipis
     */
    public function lowStock(Request $request)
    {
        $limit = $request->limit ?? 10;

        $products = ProductVariant::with('product')
            ->where('stock', '<=', 10)
            ->orderBy('stock')
            ->limit($limit)
            ->get()
            ->map(function ($variant) {
                return [
                    'id' => $variant->id,
                    'name' => $variant->product?->name,
                    'sku' => $variant->sku,
                    'stock' => $variant->stock,
                ];
            });

        return response()->json([
            'data' => $products
        ]);
    }

    /**
     * Pesanan terbaru
     */
    public function recentOrders(Request $request)
    {
        $limit = $request->limit ?? 10;

        $orders = Order::with('user')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($order) {

                return [
                    'id' => $order->id,
                    'customer_name' => $order->user?->name,
                    'customer_email' => $order->user?->email,
                    'total' => $order->total,
                    'status' => $order->status,
                    'ordered_at' => $order->created_at,
                ];
            });

        return response()->json([
            'data' => $orders
        ]);
    }
}