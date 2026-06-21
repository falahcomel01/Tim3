<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\TransactionLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    /**
     * Daftar status order yang valid.
     */
    private array $statuses = [
        'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
    ];

    /**
     * Relasi yang selalu disertakan pada respons transaksi (list).
     */
    private array $relations = ['user:id,name,email', 'payment'];

    // =============================================
    // RIWAYAT TRANSAKSI
    // =============================================

    /**
     * Riwayat transaksi.
     * - Admin: semua transaksi (dengan filter)
     * - Customer: hanya transaksi miliknya sendiri
     */
    public function index(Request $request)
    {
        $request->validate([
            'status'     => ['sometimes', Rule::in($this->statuses)],
            'user_id'    => ['sometimes', 'integer', 'exists:users,id'],
            'start_date' => ['sometimes', 'date'],
            'end_date'   => ['sometimes', 'date', 'after_or_equal:start_date'],
            'search'     => ['sometimes', 'string', 'max:255'],
            'per_page'   => ['sometimes', 'integer', 'between:1,100'],
        ], [], [
            'status'     => 'status',
            'user_id'    => 'pengguna',
            'start_date' => 'tanggal mulai',
            'end_date'   => 'tanggal akhir',
            'per_page'   => 'jumlah per halaman',
        ]);

        $isAdmin = $this->isAdmin($request);

        $query = Order::with($this->relations)->withCount('items');

        if ($isAdmin) {
            // Admin boleh melihat seluruh transaksi, opsional filter per pengguna
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->input('user_id'));
            }

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    if (is_numeric($search)) {
                        $q->orWhere('id', (int) $search);
                    }
                    $q->orWhere('tracking_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }
        } else {
            // Customer hanya boleh melihat transaksi miliknya sendiri
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        $perPage = (int) $request->input('per_page', 10);
        $orders = $query->orderByDesc('created_at')->paginate($perPage);

        $orders->getCollection()->transform(fn ($order) => $this->formatOrder($order));

        return response()->json([
            'success' => true,
            'data'    => [
                'data'         => $orders->items(),
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    /**
     * Detail transaksi.
     * - Admin: akses semua transaksi
     * - Customer: hanya transaksi miliknya sendiri
     */
    public function show(Request $request, Order $order)
    {
        if (! $this->isAdmin($request) && $order->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke transaksi ini',
            ], 403);
        }

        $order->load([
            'user:id,name,email',
            'items.product:id,name,slug',
            'items.variant:id,name,sku',
            'payment',
            'transactionLogs' => fn ($q) => $q->latest('logged_at'),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->formatOrder($order, true),
        ]);
    }

    // =============================================
    // LAPORAN TRANSAKSI (Admin only)
    // =============================================

    /**
     * Laporan transaksi: ringkasan, breakdown status,
     * breakdown metode pembayaran, dan tren transaksi per periode.
     */
    public function report(Request $request)
    {
        $request->validate([
            'start_date' => ['sometimes', 'date'],
            'end_date'   => ['sometimes', 'date', 'after_or_equal:start_date'],
            'status'     => ['sometimes', Rule::in($this->statuses)],
            'group_by'   => ['sometimes', Rule::in(['day', 'month'])],
        ], [], [
            'start_date' => 'tanggal mulai',
            'end_date'   => 'tanggal akhir',
            'group_by'   => 'pengelompokan',
        ]);

        $startDate = $request->filled('start_date')
            ? Carbon::parse($request->input('start_date'))->startOfDay()
            : Carbon::now()->subDays(29)->startOfDay();

        $endDate = $request->filled('end_date')
            ? Carbon::parse($request->input('end_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        $groupBy = $request->input('group_by', 'day');

        $baseQuery = Order::whereBetween('created_at', [$startDate, $endDate])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')));

        $orders = (clone $baseQuery)->get(['id', 'status', 'subtotal', 'discount', 'shipping_cost', 'total', 'created_at']);

        $validOrders = $orders->whereNotIn('status', ['cancelled', 'refunded']);

        // ── Ringkasan ───────────────────────────────────────────────
        $summary = [
            'total_transactions' => $orders->count(),
            'total_revenue'      => (float) $validOrders->sum('total'),
            'total_discount'     => (float) $validOrders->sum('discount'),
            'total_shipping'     => (float) $validOrders->sum('shipping_cost'),
            'average_order_value' => $validOrders->count() > 0
                ? round($validOrders->sum('total') / $validOrders->count(), 2)
                : 0,
            'cancelled_count' => $orders->where('status', 'cancelled')->count(),
            'refunded_count'  => $orders->where('status', 'refunded')->count(),
        ];

        // ── Breakdown per status ───────────────────────────────────
        $statusBreakdown = collect($this->statuses)->map(function ($status) use ($orders) {
            $filtered = $orders->where('status', $status);

            return [
                'status' => $status,
                'count'  => $filtered->count(),
                'total'  => (float) $filtered->sum('total'),
            ];
        })->values();

        // ── Breakdown metode pembayaran (pembayaran sukses) ────────
        $paymentBreakdown = Payment::whereBetween('paid_at', [$startDate, $endDate])
            ->where('status', 'success')
            ->get(['payment_method', 'amount'])
            ->groupBy('payment_method')
            ->map(function ($rows, $method) {
                return [
                    'payment_method' => $method,
                    'count'          => $rows->count(),
                    'total'          => (float) $rows->sum('amount'),
                ];
            })
            ->values();

        // ── Tren transaksi per periode ──────────────────────────────
        $format = $groupBy === 'month' ? 'Y-m' : 'Y-m-d';

        $timeline = $validOrders
            ->groupBy(fn ($order) => $order->created_at->format($format))
            ->map(function ($rows, $period) {
                return [
                    'period'      => $period,
                    'transactions' => $rows->count(),
                    'revenue'     => (float) $rows->sum('total'),
                ];
            })
            ->sortKeys()
            ->values();

        return response()->json([
            'success' => true,
            'data'    => [
                'period' => [
                    'start_date' => $startDate->toDateString(),
                    'end_date'   => $endDate->toDateString(),
                    'group_by'   => $groupBy,
                ],
                'summary'           => $summary,
                'status_breakdown'  => $statusBreakdown,
                'payment_breakdown' => $paymentBreakdown,
                'timeline'          => $timeline,
            ],
        ]);
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================

    private function isAdmin(Request $request): bool
    {
        return (bool) $request->user()?->hasRole('admin');
    }

    private function formatOrder(Order $order, bool $detail = false): array
    {
        $data = [
            'id'               => $order->id,
            'user'             => $order->relationLoaded('user') && $order->user ? [
                'id'    => $order->user->id,
                'name'  => $order->user->name,
                'email' => $order->user->email,
            ] : null,
            'status'           => $order->status,
            'subtotal'         => (float) $order->subtotal,
            'discount'         => (float) $order->discount,
            'shipping_cost'    => (float) $order->shipping_cost,
            'total'            => (float) $order->total,
            'shipping_method'  => $order->shipping_method,
            'tracking_number'  => $order->tracking_number,
            'items_count'      => $order->items_count ?? $order->items->count(),
            'created_at'       => $order->created_at,
            'updated_at'       => $order->updated_at,
        ];

        if ($order->relationLoaded('payment') && $order->payment) {
            $data['payment'] = [
                'id'             => $order->payment->id,
                'payment_method' => $order->payment->payment_method,
                'status'         => $order->payment->status,
                'amount'         => (float) $order->payment->amount,
                'paid_at'        => $order->payment->paid_at,
            ];
        }

        if ($detail) {
            $data['recipient_name']    = $order->recipient_name;
            $data['recipient_phone']   = $order->recipient_phone;
            $data['shipping_address']  = $order->shipping_address;
            $data['notes']             = $order->notes;

            $data['items'] = $order->items->map(function (OrderItem $item) {
                return [
                    'id'         => $item->id,
                    'product_id' => $item->product_id,
                    'product'    => $item->product ? [
                        'id'   => $item->product->id,
                        'name' => $item->product->name,
                        'slug' => $item->product->slug,
                    ] : null,
                    'variant'    => $item->variant ? [
                        'id'   => $item->variant->id,
                        'name' => $item->variant->name,
                        'sku'  => $item->variant->sku,
                    ] : null,
                    'name'       => $item->name,
                    'sku'        => $item->sku,
                    'quantity'   => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'line_total' => (float) ($item->unit_price * $item->quantity),
                ];
            });

            $data['logs'] = $order->transactionLogs->map(function (TransactionLog $log) {
                return [
                    'id'         => $log->id,
                    'event_type' => $log->event_type,
                    'payload'    => $log->payload,
                    'logged_at'  => $log->logged_at,
                ];
            });
        }

        return $data;
    }
}
