<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('order_items')->insert([
            [
                'id' => Str::uuid(),
                'order_id' => 'UUID_ORDER_1',
                'product_id' => 'UUID_PRODUCT_1',
                'variant_id' => 'UUID_VARIANT_1',
                'name' => 'Kopi Arabika',
                'sku' => 'KOPI-001',
                'quantity' => 2,
                'unit_price' => 50000.00,
            ],
            [
                'id' => Str::uuid(),
                'order_id' => 'UUID_ORDER_1',
                'product_id' => 'UUID_PRODUCT_2',
                'variant_id' => null,
                'name' => 'Teh Hijau',
                'sku' => 'TEH-001',
                'quantity' => 1,
                'unit_price' => 30000.00,
            ],
        ]);
    }
}