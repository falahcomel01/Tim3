<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\ProductImageController;
use App\Http\Controllers\API\ProductVariantController;
use App\Http\Controllers\API\CustomerServiceConversationController;
use App\Http\Controllers\API\RolePermissionController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DashboardController;
 use App\Http\Controllers\Dev\DummyDataController;
use Illuminate\Support\Facades\Route;

// ==================== PUBLIC ROUTES ====================

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ==================== PUBLIC PRODUCTS ====================

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// ==================== PUBLIC CATEGORIES ====================

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);


// ==================== PROTECTED ROUTES ====================

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    });

    // Customer Service
    Route::prefix('customer-service')->group(function () {
        Route::get('/conversations', [CustomerServiceConversationController::class, 'index']);
        Route::post('/conversations', [CustomerServiceConversationController::class, 'store']);
        Route::get('/conversations/{conversation}', [CustomerServiceConversationController::class, 'show']);
        Route::post('/conversations/{conversation}/messages', [CustomerServiceConversationController::class, 'sendMessage']);
    });

    // Admin only
    Route::middleware('role:admin')->prefix('admin')->group(function () {

        Route::get('/roles', [RolePermissionController::class, 'indexRoles']);
        Route::post('/roles', [RolePermissionController::class, 'storeRole']);
        Route::put('/roles/{id}', [RolePermissionController::class, 'updateRole']);
        Route::delete('/roles/{id}', [RolePermissionController::class, 'destroyRole']);

        Route::get('/permissions', [RolePermissionController::class, 'indexPermissions']);
        Route::post('/permissions', [RolePermissionController::class, 'storePermission']);
        Route::delete('/permissions/{id}', [RolePermissionController::class, 'destroyPermission']);

        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::post('/users/{id}/change-password', [UserController::class, 'changePassword']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Assign role ke user (tetap ada untuk keperluan admin)
        Route::post('/users/{userId}/assign-role',    [RolePermissionController::class, 'assignRole']);
        
        // ==================== DASHBOARD ====================
        Route::prefix('dashboard')->group(function () {
            Route::get('/summary', [DashboardController::class, 'summary']);
            Route::get('/revenue', [DashboardController::class, 'revenue']);
            Route::get('/order-status', [DashboardController::class, 'orderStatus']);
            Route::get('/top-products', [DashboardController::class, 'topProducts']);
            Route::get('/low-stock', [DashboardController::class, 'lowStock']);
            Route::get('/recent-orders', [DashboardController::class, 'recentOrders']);
        });
        
        Route::middleware('auth:sanctum')->prefix('customer-service')->group(function () {
            Route::get('/conversations',                        [CustomerServiceConversationController::class, 'index']);
            Route::post('/conversations',                       [CustomerServiceConversationController::class, 'store']);
            Route::get('/conversations/{conversation}',         [CustomerServiceConversationController::class, 'show']);
            Route::post('/conversations/{conversation}/messages', [CustomerServiceConversationController::class, 'sendMessage']);
            Route::patch('/conversations/{conversation}/status',  [CustomerServiceConversationController::class, 'updateStatus']);
        });
    });

    // ==================== MANAGE PRODUCTS ====================

    Route::middleware('permission:manage-products')->group(function () {

        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        Route::put('/products/{product}/categories', [ProductController::class, 'syncCategories']);

        Route::post('/products/{product}/variants', [ProductVariantController::class, 'store']);
        Route::put('/products/{product}/variants/{variant}', [ProductVariantController::class, 'update']);
        Route::delete('/products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy']);

        Route::post('/products/{product}/images', [ProductImageController::class, 'store']);
        Route::put('/products/{product}/images/{image}', [ProductImageController::class, 'update']);
        Route::delete('/products/{product}/images/{image}', [ProductImageController::class, 'destroy']);
    });

    // ==================== MANAGE CATEGORIES ====================

    Route::middleware('permission:manage-categories')->group(function () {

        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    });
});

Route::prefix('dev/dashboard')->group(function () {

    Route::get('/summary', [DummyDataController::class, 'summary']);
    Route::get('/revenue', [DummyDataController::class, 'revenue']);
    Route::get('/order-status', [DummyDataController::class, 'orderStatus']);
    Route::get('/top-products', [DummyDataController::class, 'topProducts']);
    Route::get('/low-stock', [DummyDataController::class, 'lowStock']);
    Route::get('/recent-orders', [DummyDataController::class, 'recentOrders']);

});