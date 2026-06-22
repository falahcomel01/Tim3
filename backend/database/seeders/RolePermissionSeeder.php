<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ==================== PERMISSIONS ====================
        $permissions = [
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',
            'manage-roles',
            'manage-permissions',
            'view-products',
            'manage-products',
            'view-categories',
            'manage-categories',
            'view-orders',
            'manage-orders',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name'       => $permission,
                'guard_name' => 'sanctum',
            ]);
        }

        // ==================== ROLES ====================

        // Admin — semua permission
        $adminRole = Role::firstOrCreate([
            'name'       => 'admin',
            'guard_name' => 'sanctum',
        ]);
        $adminRole->syncPermissions($permissions);

        // User — permission minimal
        $userRole = Role::firstOrCreate([
            'name'       => 'user',
            'guard_name' => 'sanctum',
        ]);
        $userRole->syncPermissions([
            'view-products',
            'view-orders',
        ]);

        // ==================== DEFAULT USERS ====================
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Administrator',
                'password' => Hash::make('password123'),
            ]
        );
        $admin->syncRoles(['admin']);

        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name'     => 'Regular User',
                'password' => Hash::make('password123'),
            ]
        );
        $user->syncRoles(['user']);

        $this->command->info('✅ Roles, permissions, dan default users berhasil dibuat!');
        $this->command->table(
            ['Email', 'Password', 'Role'],
            [
                ['admin@example.com', 'password123', 'admin'],
                ['user@example.com',  'password123', 'user'],
            ]
        );
    }
}
