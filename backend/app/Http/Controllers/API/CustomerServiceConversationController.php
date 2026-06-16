<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CustomerServiceConversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CustomerServiceConversationController extends Controller
{
    // =============================================
    // SHARED / CUSTOMER ENDPOINTS
    // =============================================

    /**
     * List conversation.
     * - Admin: semua conversation (dengan filter)
     * - Customer: hanya milik sendiri
     */
    public function index(Request $request)
    {
        if ($this->isAdmin($request)) {
            $request->validate([
                'status'   => ['sometimes', Rule::in(['open', 'pending', 'resolved', 'closed'])],
                'priority' => ['sometimes', Rule::in(['low', 'normal', 'high'])],
                'search'   => 'sometimes|string|max:255',
            ]);

            $conversations = CustomerServiceConversation::with(['customer:id,name,email', 'assignedAdmin:id,name,email'])
                ->when($request->filled('status'),   fn($q) => $q->where('status', $request->status))
                ->when($request->filled('priority'), fn($q) => $q->where('priority', $request->priority))
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where(function ($sub) use ($request) {
                        $sub->where('subject', 'like', "%{$request->search}%")
                            ->orWhere('last_message', 'like', "%{$request->search}%")
                            ->orWhereHas('customer', fn($cq) =>
                                $cq->where('name', 'like', "%{$request->search}%")
                                   ->orWhere('email', 'like', "%{$request->search}%")
                            );
                    });
                })
                ->latest('last_message_at')
                ->latest()
                ->get()
                ->map(fn($c) => $this->formatConversation($c));

            return response()->json(['success' => true, 'data' => $conversations]);
        }

        // Customer: hanya conversation milik sendiri
        $conversations = CustomerServiceConversation::with([
            'assignedAdmin:id,name,email',
            'messages' => fn($q) => $q->latest()->limit(1),
        ])
            ->where('customer_id', $request->user()->id)
            ->latest('last_message_at')
            ->latest()
            ->get()
            ->map(fn($c) => $this->formatConversation($c));

        return response()->json(['success' => true, 'data' => $conversations]);
    }

    /**
     * Buat conversation baru (Customer only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject'  => 'nullable|string|max:255',
            'message'  => 'required|string|max:5000',
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high'])],
        ]);

        $conversation = DB::transaction(function () use ($request, $validated) {
            $conversation = CustomerServiceConversation::create([
                'customer_id'     => $request->user()->id,
                'subject'         => $validated['subject'] ?? null,
                'status'          => 'open',
                'source'          => 'general',
                'priority'        => $validated['priority'] ?? 'normal',
                'last_message'    => $validated['message'],
                'last_message_at' => now(),
            ]);

            $conversation->messages()->create([
                'sender_id'    => $request->user()->id,
                'sender_role'  => 'customer',
                'message'      => $validated['message'],
                'message_type' => 'text',
                'is_read'      => false,
            ]);

            return $conversation;
        });

        return response()->json([
            'success' => true,
            'message' => 'Conversation customer service berhasil dibuat',
            'data'    => $this->formatConversation(
                $conversation->load(['customer:id,name,email', 'assignedAdmin:id,name,email', 'messages.sender:id,name,email'])
            ),
        ], 201);
    }

    /**
     * Detail conversation.
     * - Admin: akses semua conversation
     * - Customer: hanya milik sendiri
     */
    public function show(Request $request, CustomerServiceConversation $conversation)
    {
        if (! $this->isAdmin($request) && $conversation->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke conversation ini',
            ], 403);
        }

        // Mark unread messages as read
        $senderRole = $this->isAdmin($request) ? 'customer' : 'admin';
        $conversation->messages()
            ->where('sender_role', $senderRole)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        $conversation->load(['customer:id,name,email', 'assignedAdmin:id,name,email', 'messages.sender:id,name,email']);

        return response()->json(['success' => true, 'data' => $this->formatConversation($conversation, true)]);
    }

    /**
     * Kirim pesan ke conversation.
     * - Admin: bisa ke semua conversation (kecuali closed)
     * - Customer: hanya milik sendiri (kecuali resolved/closed)
     */
    public function sendMessage(Request $request, CustomerServiceConversation $conversation)
    {
        if (! $this->isAdmin($request) && $conversation->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke conversation ini',
            ], 403);
        }

        if ($this->isAdmin($request)) {
            if ($conversation->status === 'closed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation sudah ditutup',
                ], 422);
            }
        } else {
            if (in_array($conversation->status, ['resolved', 'closed'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation sudah selesai atau ditutup',
                ], 422);
            }
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $isAdmin    = $this->isAdmin($request);
        $senderRole = $isAdmin ? 'admin' : 'customer';

        $message = DB::transaction(function () use ($request, $conversation, $validated, $isAdmin, $senderRole) {
            $message = $conversation->messages()->create([
                'sender_id'    => $request->user()->id,
                'sender_role'  => $senderRole,
                'message'      => $validated['message'],
                'message_type' => 'text',
                'is_read'      => false,
            ]);

            $updateData = [
                'last_message'    => $validated['message'],
                'last_message_at' => now(),
            ];

            if ($isAdmin) {
                $updateData['assigned_admin_id'] = $conversation->assigned_admin_id ?? $request->user()->id;
                $updateData['status']            = 'pending';
            } else {
                $updateData['status'] = 'open';
            }

            $conversation->update($updateData);

            return $message;
        });

        return response()->json([
            'success' => true,
            'message' => $isAdmin ? 'Balasan berhasil dikirim' : 'Pesan berhasil dikirim',
            'data'    => $this->formatMessage($message->load('sender:id,name,email')),
        ], 201);
    }

    /**
     * Update status conversation (Admin only).
     */
    public function updateStatus(Request $request, CustomerServiceConversation $conversation)
    {
        if (! $this->isAdmin($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah status',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['open', 'pending', 'resolved', 'closed'])],
        ]);

        $conversation->update([
            'status'            => $validated['status'],
            'assigned_admin_id' => $conversation->assigned_admin_id ?? $request->user()->id,
            'closed_at'         => in_array($validated['status'], ['resolved', 'closed']) ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status conversation berhasil diupdate',
            'data'    => $this->formatConversation(
                $conversation->fresh(['customer:id,name,email', 'assignedAdmin:id,name,email'])
            ),
        ]);
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================

    private function isAdmin(Request $request): bool
    {
        return (bool) $request->user()?->hasRole('admin');
    }

    private function formatConversation(CustomerServiceConversation $conversation, bool $includeMessages = false): array
    {
        $data = [
            'id'             => $conversation->id,
            'customer'       => $conversation->relationLoaded('customer') && $conversation->customer ? [
                'id'    => $conversation->customer->id,
                'name'  => $conversation->customer->name,
                'email' => $conversation->customer->email,
            ] : null,
            'assigned_admin' => $conversation->assignedAdmin ? [
                'id'    => $conversation->assignedAdmin->id,
                'name'  => $conversation->assignedAdmin->name,
                'email' => $conversation->assignedAdmin->email,
            ] : null,
            'subject'         => $conversation->subject,
            'status'          => $conversation->status,
            'source'          => $conversation->source,
            'priority'        => $conversation->priority,
            'last_message'    => $conversation->last_message,
            'last_message_at' => $conversation->last_message_at,
            'closed_at'       => $conversation->closed_at,
            'created_at'      => $conversation->created_at,
            'updated_at'      => $conversation->updated_at,
        ];

        if ($includeMessages) {
            $data['messages'] = $conversation->messages
                ->sortBy('created_at')
                ->values()
                ->map(fn($msg) => $this->formatMessage($msg));
        }

        return $data;
    }

    private function formatMessage($message): array
    {
        return [
            'id'              => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender'          => $message->sender ? [
                'id'    => $message->sender->id,
                'name'  => $message->sender->name,
                'email' => $message->sender->email,
            ] : null,
            'sender_role'  => $message->sender_role,
            'message'      => $message->message,
            'message_type' => $message->message_type,
            'is_read'      => $message->is_read,
            'read_at'      => $message->read_at,
            'created_at'   => $message->created_at,
        ];
    }
}