<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    // ─────────────────────────────────────────────
    // Helper: interval dari period string
    // ─────────────────────────────────────────────
    private function toInterval(string $period): string
    {
        return match ($period) {
            'today' => '1 day',
            'week'  => '7 days',
            'year'  => '365 days',
            default => '30 days',   // month (default)
        };
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/summary
    // ?period=today|week|month|year
    // ─────────────────────────────────────────────
    public function summary(Request $request): JsonResponse
    {
        $interval = $this->toInterval($request->query('period', 'month'));

        $revenue = DB::selectOne("
            SELECT COALESCE(SUM(total), 0) AS total_revenue
            FROM orders
            WHERE status IN ('paid','processing','shipped','delivered')
              AND ordered_at >= NOW() - INTERVAL '{$interval}'
        ");

        $orders = DB::selectOne("
            SELECT
                COUNT(*)                                            AS total_orders,
                COUNT(*) FILTER (WHERE status = 'pending')         AS pending,
                COUNT(*) FILTER (WHERE status = 'paid')            AS paid,
                COUNT(*) FILTER (WHERE status = 'processing')      AS processing,
                COUNT(*) FILTER (WHERE status = 'shipped')         AS shipped,
                COUNT(*) FILTER (WHERE status = 'delivered')       AS delivered,
                COUNT(*) FILTER (WHERE status = 'cancelled')       AS cancelled,
                COUNT(*) FILTER (WHERE status = 'refunded')        AS refunded
            FROM orders
            WHERE ordered_at >= NOW() - INTERVAL '{$interval}'
        ");

        $newUsers = DB::selectOne("
            SELECT COUNT(*) AS new_users
            FROM users
            WHERE role = 'customer'
              AND created_at >= NOW() - INTERVAL '{$interval}'
        ");

        $products = DB::selectOne("
            SELECT
                COUNT(*) FILTER (WHERE is_active = true)                        AS active_products,
                COUNT(*) FILTER (WHERE is_active = true AND stock <= 5)         AS low_stock
            FROM products
        ");

        $tickets = DB::selectOne("
            SELECT COUNT(*) AS pending_tickets
            FROM tickets
            WHERE status IN ('open','in_progress')
        ");

        return response()->json([
            'success' => true,
            'period'  => $request->query('period', 'month'),
            'data'    => [
                'revenue'  => $revenue,
                'orders'   => $orders,
                'users'    => $newUsers,
                'products' => $products,
                'tickets'  => $tickets,
            ],
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/revenue-chart
    // ?days=30
    // ─────────────────────────────────────────────
    public function revenueChart(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 30);

        $rows = DB::select("
            SELECT
                DATE(ordered_at)            AS date,
                COUNT(*)                    AS total_orders,
                COALESCE(SUM(total), 0)     AS revenue
            FROM orders
            WHERE status IN ('paid','processing','shipped','delivered')
              AND ordered_at >= NOW() - INTERVAL '{$days} days'
            GROUP BY DATE(ordered_at)
            ORDER BY date ASC
        ");

        return response()->json(['success' => true, 'days' => $days, 'data' => $rows]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/order-status-breakdown
    // ?period=month
    // ─────────────────────────────────────────────
    public function orderStatusBreakdown(Request $request): JsonResponse
    {
        $interval = $this->toInterval($request->query('period', 'month'));

        $rows = DB::select("
            SELECT
                status,
                COUNT(*)                AS count,
                COALESCE(SUM(total), 0) AS total_value
            FROM orders
            WHERE ordered_at >= NOW() - INTERVAL '{$interval}'
            GROUP BY status
            ORDER BY count DESC
        ");

        return response()->json(['success' => true, 'data' => $rows]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/recent-orders
    // ?limit=20 &page=1
    // ─────────────────────────────────────────────
    public function recentOrders(Request $request): JsonResponse
    {
        $limit  = (int) $request->query('limit', 20);
        $page   = (int) $request->query('page', 1);
        $offset = ($page - 1) * $limit;

        $rows = DB::select("
            SELECT
                o.id, o.status, o.subtotal, o.discount,
                o.shipping_cost, o.total, o.shipping_method,
                o.tracking_number, o.ordered_at,
                u.id       AS user_id,
                u.username, u.email,
                p.status   AS payment_status,
                p.payment_method,
                pr.code    AS promo_code
            FROM orders o
            JOIN users u         ON u.id = o.user_id
            LEFT JOIN payments p ON p.order_id = o.id
            LEFT JOIN promos  pr ON pr.id = o.promo_id
            ORDER BY o.ordered_at DESC
            LIMIT {$limit} OFFSET {$offset}
        ");

        $total = DB::selectOne('SELECT COUNT(*) AS cnt FROM orders');

        return response()->json([
            'success'    => true,
            'data'       => $rows,
            'pagination' => [
                'total' => (int) $total->cnt,
                'page'  => $page,
                'limit' => $limit,
                'pages' => (int) ceil($total->cnt / $limit),
            ],
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/top-products
    // ?limit=10 &period=month
    // ─────────────────────────────────────────────
    public function topProducts(Request $request): JsonResponse
    {
        $limit    = (int) $request->query('limit', 10);
        $interval = $this->toInterval($request->query('period', 'month'));

        $rows = DB::select("
            SELECT
                p.id, p.name, p.slug, p.price, p.stock,
                COALESCE(pi.url, '')                 AS image_url,
                SUM(oi.quantity)                     AS total_sold,
                SUM(oi.quantity * oi.unit_price)     AS total_revenue
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            JOIN orders   o ON o.id = oi.order_id
            LEFT JOIN product_images pi
                ON pi.product_id = p.id AND pi.is_primary = true
            WHERE o.status IN ('paid','processing','shipped','delivered')
              AND o.ordered_at >= NOW() - INTERVAL '{$interval}'
            GROUP BY p.id, p.name, p.slug, p.price, p.stock, pi.url
            ORDER BY total_sold DESC
            LIMIT {$limit}
        ");

        return response()->json(['success' => true, 'data' => $rows]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/low-stock
    // ?threshold=10
    // ─────────────────────────────────────────────
    public function lowStock(Request $request): JsonResponse
    {
        $threshold = (int) $request->query('threshold', 10);

        $rows = DB::select("
            SELECT
                p.id, p.name, p.slug, p.price,
                p.stock                     AS product_stock,
                pv.id                       AS variant_id,
                pv.name                     AS variant_name,
                pv.sku,
                pv.stock                    AS variant_stock,
                COALESCE(pi.url, '')        AS image_url
            FROM products p
            LEFT JOIN product_variants pv
                ON pv.product_id = p.id AND pv.is_active = true
            LEFT JOIN product_images pi
                ON pi.product_id = p.id AND pi.is_primary = true
            WHERE p.is_active = true
              AND (
                    (pv.id IS NULL AND p.stock <= {$threshold})
                    OR pv.stock <= {$threshold}
                  )
            ORDER BY COALESCE(pv.stock, p.stock) ASC
        ");

        return response()->json(['success' => true, 'threshold' => $threshold, 'data' => $rows]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/top-categories
    // ?limit=5 &period=month
    // ─────────────────────────────────────────────
    public function topCategories(Request $request): JsonResponse
    {
        $limit    = (int) $request->query('limit', 5);
        $interval = $this->toInterval($request->query('period', 'month'));

        $rows = DB::select("
            SELECT
                c.id, c.name, c.slug,
                SUM(oi.quantity)                 AS total_sold,
                SUM(oi.quantity * oi.unit_price) AS total_revenue
            FROM order_items oi
            JOIN products           p  ON p.id  = oi.product_id
            JOIN product_categories pc ON pc.product_id = p.id
            JOIN categories         c  ON c.id  = pc.category_id
            JOIN orders             o  ON o.id  = oi.order_id
            WHERE o.status IN ('paid','processing','shipped','delivered')
              AND o.ordered_at >= NOW() - INTERVAL '{$interval}'
            GROUP BY c.id, c.name, c.slug
            ORDER BY total_sold DESC
            LIMIT {$limit}
        ");

        return response()->json(['success' => true, 'data' => $rows]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/new-users
    // ?days=30
    // ─────────────────────────────────────────────
    public function newUsersChart(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 30);

        $rows = DB::select("
            SELECT
                DATE(created_at) AS date,
                COUNT(*)         AS new_users
            FROM users
            WHERE role = 'customer'
              AND created_at >= NOW() - INTERVAL '{$days} days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ");

        return response()->json(['success' => true, 'days' => $days, 'data' => $rows]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/top-customers
    // ?limit=10 &period=month
    // ─────────────────────────────────────────────
    public function topCustomers(Request $request): JsonResponse
    {
        $limit    = (int) $request->query('limit', 10);
        $interval = $this->toInterval($request->query('period', 'month'));

        $rows = DB::select("
            SELECT
                u.id, u.username, u.email, u.created_at,
                COUNT(o.id)                       AS order_count,
                SUM(o.total)                      AS total_spent,
                AVG(o.total)::numeric(15,2)       AS avg_order_value
            FROM users u
            JOIN orders o ON o.user_id = u.id
            WHERE o.status IN ('paid','processing','shipped','delivered')
              AND o.ordered_at >= NOW() - INTERVAL '{$interval}'
            GROUP BY u.id, u.username, u.email, u.created_at
            ORDER BY total_spent DESC
            LIMIT {$limit}
        ");

        return response()->json(['success' => true, 'data' => $rows]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/promo-usage
    // ─────────────────────────────────────────────
    public function promoUsage(): JsonResponse
    {
        $rows = DB::select("
            SELECT
                pr.id, pr.code, pr.name, pr.type, pr.value,
                pr.max_usage, pr.used_count,
                pr.starts_at, pr.ends_at, pr.is_active,
                COALESCE(SUM(o.discount), 0)  AS total_discount_given,
                COUNT(o.id)                   AS order_count
            FROM promos pr
            LEFT JOIN orders o ON o.promo_id = pr.id
              AND o.status IN ('paid','processing','shipped','delivered')
            GROUP BY pr.id
            ORDER BY pr.used_count DESC
        ");

        return response()->json(['success' => true, 'data' => $rows]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/payment-methods
    // ?period=month
    // ─────────────────────────────────────────────
    public function paymentMethods(Request $request): JsonResponse
    {
        $interval = $this->toInterval($request->query('period', 'month'));

        $rows = DB::select("
            SELECT
                p.payment_method,
                COUNT(*)                    AS count,
                COALESCE(SUM(p.amount), 0)  AS total_amount
            FROM payments p
            JOIN orders o ON o.id = p.order_id
            WHERE p.status = 'success'
              AND o.ordered_at >= NOW() - INTERVAL '{$interval}'
            GROUP BY p.payment_method
            ORDER BY count DESC
        ");

        return response()->json(['success' => true, 'data' => $rows]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/review-stats
    // ?period=month
    // ─────────────────────────────────────────────
    public function reviewStats(Request $request): JsonResponse
    {
        $interval = $this->toInterval($request->query('period', 'month'));

        $overall = DB::selectOne("
            SELECT
                COUNT(*)                                        AS total_reviews,
                AVG(rating)::numeric(3,2)                       AS avg_rating,
                COUNT(*) FILTER (WHERE is_visible = false)      AS hidden_reviews
            FROM reviews
            WHERE created_at >= NOW() - INTERVAL '{$interval}'
        ");

        $distribution = DB::select("
            SELECT rating, COUNT(*) AS count
            FROM reviews
            WHERE is_visible = true
              AND created_at >= NOW() - INTERVAL '{$interval}'
            GROUP BY rating
            ORDER BY rating DESC
        ");

        $recent = DB::select("
            SELECT
                r.id, r.rating, r.comment, r.is_visible, r.created_at,
                u.username,
                p.name AS product_name
            FROM reviews r
            JOIN users    u ON u.id = r.user_id
            JOIN products p ON p.id = r.product_id
            ORDER BY r.created_at DESC
            LIMIT 5
        ");

        return response()->json([
            'success' => true,
            'data'    => [
                'overall'      => $overall,
                'distribution' => $distribution,
                'recent'       => $recent,
            ],
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/cs-summary
    // ─────────────────────────────────────────────
    public function csSummary(): JsonResponse
    {
        $ticketStats = DB::selectOne("
            SELECT
                COUNT(*)                                        AS total,
                COUNT(*) FILTER (WHERE status = 'open')        AS open,
                COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
                COUNT(*) FILTER (WHERE status = 'resolved')    AS resolved,
                COUNT(*) FILTER (WHERE status = 'closed')      AS closed
            FROM tickets
        ");

        $avgResolution = DB::selectOne("
            SELECT
                AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600)::numeric(10,2)
                    AS avg_resolution_hours
            FROM tickets
            WHERE status IN ('resolved','closed')
        ");

        $byPriority = DB::select("
            SELECT priority, COUNT(*) AS count
            FROM tickets
            WHERE status IN ('open','in_progress')
            GROUP BY priority
            ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END
        ");

        return response()->json([
            'success' => true,
            'data'    => [
                'ticket_stats'     => $ticketStats,
                'avg_resolution'   => $avgResolution,
                'open_by_priority' => $byPriority,
            ],
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/dashboard/transaction-logs
    // ?limit=50 &page=1 &event_type=payment_success
    // ─────────────────────────────────────────────
    public function transactionLogs(Request $request): JsonResponse
    {
        $limit     = (int) $request->query('limit', 50);
        $page      = (int) $request->query('page', 1);
        $offset    = ($page - 1) * $limit;
        $eventType = $request->query('event_type');

        $where = $eventType ? "WHERE tl.event_type = '{$eventType}'" : '';

        $rows = DB::select("
            SELECT
                tl.id, tl.event_type, tl.payload, tl.logged_at,
                u.username, u.email,
                o.status AS order_status,
                o.total  AS order_total
            FROM transaction_logs tl
            JOIN users  u ON u.id = tl.user_id
            JOIN orders o ON o.id = tl.order_id
            {$where}
            ORDER BY tl.logged_at DESC
            LIMIT {$limit} OFFSET {$offset}
        ");

        return response()->json(['success' => true, 'data' => $rows, 'page' => $page, 'limit' => $limit]);
    }
}