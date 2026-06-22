<?php

namespace Database\Seeders;

use App\Models\Status;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['name_status' => 'Aktif',    'type_status' => 'product'],
            ['name_status' => 'Nonaktif', 'type_status' => 'product'],
            ['name_status' => 'Habis',    'type_status' => 'product'],
            ['name_status' => 'Aktif',    'type_status' => 'categories'],
            ['name_status' => 'Nonaktif', 'type_status' => 'categories'],
        ];

        foreach ($statuses as $status) {
            Status::firstOrCreate(
                ['name_status' => $status['name_status'], 'type_status' => $status['type_status']],
            );
        }
    }
}
