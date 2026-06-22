<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Status;
use App\Models\TransactionLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $customers = $this->ensureCustomers();
            $products  = $this->ensureProducts();

            $statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
            $paymentMethods = ['bca', 'mandiri', 'gopay', 'qris'];

            for ($i = 1; $i <= 20; $i++) {
                $customer = $customers->random();
                $status   = $statuses[$i % count($statuses)];
                $orderedAt = Carbon::now()->subDays(random_int(0, 59))->subHours(random_int(0, 23));

                $items = $products->random(random_int(1, 3));
                $subtotal = 0;
                $itemPayload = [];

                foreach ($items as $product) {
                    $qty   = random_int(1, 3);
                    $price = (float) $product->price;
                    $subtotal += $qty * $price;

                    $itemPayload[] = [
                        'product_id' => $product->id,
                        'name'       => $product->name,
                        'sku'        => 'SKU-' . str_pad((string) $product->id, 4, '0', STR_PAD_LEFT),
                        'quantity'   => $qty,
                        'unit_price' => $price,
                    ];
                }

                $discount     = round($subtotal * (random_int(0, 2) === 0 ? 0.1 : 0), 2);
                $shippingCost = random_int(10, 30) * 1000;
                $total        = max(0, $subtotal - $discount + $shippingCost);

                $order = Order::create([
                    'user_id'          => $customer->id,
                    'status'           => $status,
                    'subtotal'         => $subtotal,
                    'discount'         => $discount,
                    'shipping_cost'    => $shippingCost,
                    'total'            => $total,
                    'shipping_method'  => 'reguler',
                    'tracking_number'  => in_array($status, ['shipped', 'delivered']) ? 'TRK' . strtoupper(uniqid()) : null,
                    'recipient_name'   => $customer->name,
                    'recipient_phone'  => '0812' . random_int(10000000, 99999999),
                    'shipping_address' => 'Alamat contoh untuk ' . $customer->name,
                    'notes'            => null,
                    'created_at'       => $orderedAt,
                    'updated_at'       => $orderedAt,
                ]);

                foreach ($itemPayload as $item) {
                    $order->items()->create($item);
                }

                $paymentStatus = match ($status) {
                    'pending'              => 'pending',
                    'cancelled'            => 'expired',
                    'refunded'             => 'refunded',
                    default                => 'success',
                };

                $payment = Payment::create([
                    'order_id'       => $order->id,
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'status'         => $paymentStatus,
                    'amount'         => $total,
                    'ref_code'       => 'PAY-' . strtoupper(uniqid()),
                    'va_number'      => null,
                    'expired_at'     => $paymentStatus === 'pending' ? $orderedAt->copy()->addHours(24) : null,
                    'paid_at'        => $paymentStatus === 'success' ? $orderedAt->copy()->addMinutes(random_int(5, 120)) : null,
                    'created_at'     => $orderedAt,
                    'updated_at'     => $orderedAt,
                ]);

                TransactionLog::create([
                    'order_id'   => $order->id,
                    'user_id'    => $customer->id,
                    'event_type' => 'order_created',
                    'payload'    => ['status' => 'pending', 'total' => $total],
                    'logged_at'  => $orderedAt,
                ]);

                if ($status !== 'pending') {
                    TransactionLog::create([
                        'order_id'   => $order->id,
                        'user_id'    => $customer->id,
                        'event_type' => 'status_changed',
                        'payload'    => ['from' => 'pending', 'to' => $status],
                        'logged_at'  => $orderedAt->copy()->addMinutes(random_int(5, 180)),
                    ]);
                }
            }
        });

        $this->command->info('✅ Data dummy transaksi (orders, order_items, payments, transaction_logs) berhasil dibuat!');
    }

    /**
     * Pastikan tersedia minimal beberapa user customer untuk pemilik transaksi.
     */
    private function ensureCustomers()
    {
        $names = ['Budi Santoso', 'Andi Wijaya', 'Citra Lestari', 'Dewi Anggraini', 'Eka Putra'];

        $customers = collect();

        foreach ($names as $index => $name) {
            $email = 'customer' . ($index + 1) . '@example.com';

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'     => $name,
                    'password' => Hash::make('password123'),
                ]
            );

            if (! $user->hasRole('user')) {
                $user->assignRole('user');
            }

            $customers->push($user);
        }

        // Sertakan juga user default dari RolePermissionSeeder bila ada
        $defaultUser = User::where('email', 'user@example.com')->first();
        if ($defaultUser) {
            $customers->push($defaultUser);
        }

        return $customers->unique('id')->values();
    }

    /**
     * Pastikan tersedia minimal beberapa produk untuk dijadikan item transaksi.
     */
    private function ensureProducts()
    {
        $existing = Product::take(10)->get();

        if ($existing->count() >= 3) {
            return $existing;
        }

        $statusId = Status::where('type_status', 'product')
            ->where('name_status', 'Aktif')
            ->value('id');

        $sample = [
            ['name' => 'Kopi Arabika 250g', 'price' => 50000],
            ['name' => 'Teh Hijau Premium', 'price' => 30000],
            ['name' => 'Gula Aren Cair', 'price' => 25000],
            ['name' => 'Madu Hutan 500ml', 'price' => 85000],
            ['name' => 'Snack Keripik Singkong', 'price' => 15000],
        ];

        $created = collect();

        foreach ($sample as $item) {
            $product = Product::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($item['name'])],
                [
                    'name'        => $item['name'],
                    'description' => 'Produk contoh untuk data dummy transaksi.',
                    'price'       => $item['price'],
                    'stock'       => 100,
                    'status_id'   => $statusId,
                ]
            );

            $created->push($product);
        }

        return $created;
    }
}
