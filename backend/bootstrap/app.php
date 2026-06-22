<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: ['api/*']);

        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Daftarkan alias middleware Spatie Permission
        $middleware->alias([
            'role'       => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            // Validasi gagal => 422
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => $e->validator->errors()->first(),
                    'errors'  => $e->errors(),
                ], 422);
            }

            // Tidak terotentikasi => 401
            if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak terotentikasi.',
                ], 401);
            }

            // Model tidak ditemukan => 404
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan.',
                ], 404);
            }

            // Tidak berwenang (Spatie permission/role) => 403
            if ($e instanceof \Spatie\Permission\Exceptions\UnauthorizedException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki izin untuk tindakan ini.',
                ], 403);
            }

            // HTTP exception lain (404, 403, 405, dll.)
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                $status  = $e->getStatusCode();
                $message = $e->getMessage();

                if ($status === 404) {
                    $message = 'Data tidak ditemukan.';
                } elseif ($status === 403) {
                    $message = $message ?: 'Anda tidak memiliki izin untuk tindakan ini.';
                } elseif ($status === 405) {
                    $message = 'Metode tidak diizinkan.';
                }

                return response()->json([
                    'success' => false,
                    'message' => $message ?: 'Terjadi kesalahan.',
                ], $status);
            }

            // Fallback => 500
            $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Terjadi kesalahan pada server.',
            ], $status);
        });
    })->create();
