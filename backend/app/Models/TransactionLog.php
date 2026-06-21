<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionLog extends Model
{
    /**
     * Tabel ini hanya mencatat (append-only), tidak punya updated_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'user_id',
        'event_type',
        'payload',
        'logged_at',
    ];

    protected $casts = [
        'payload'   => 'array',
        'logged_at' => 'datetime',
];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
