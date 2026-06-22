import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Headphones, MessageCircle, Plus, Send, ShieldCheck, Sparkles, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import customerService from '../../services/customerService';

const statusLabel = {
  open: 'Open',
  pending: 'Menunggu Admin',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

const statusColor = {
  open: 'green',
  pending: 'amber',
  resolved: 'blue',
  closed: 'slate',
};

const statusDot = {
  open: '#34d399',
  pending: '#f59e0b',
  resolved: '#60a5fa',
  closed: '#64748b',
};

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatRelative(value) {
  if (!value) return '-';
  const diffMs = Date.now() - new Date(value).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Baru saja';
  if (min < 60) return `${min}m lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}j lalu`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}h lalu`;
  return formatDate(value);
}

function initials(name) {
  if (!name) return 'C';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function Avatar({ name, size = 38, active = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: active
          ? 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(245,158,11,0.12))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        border: active ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 800,
        color: active ? '#fbbf24' : '#94a3b8',
        flexShrink: 0,
        transition: 'all 0.2s ease',
      }}
    >
      {initials(name)}
    </div>
  );
}

function groupByDay(messages) {
  const groups = [];
  let currentKey = null;
  messages.forEach((msg) => {
    const d = new Date(msg.created_at);
    const key = d.toDateString();
    if (key !== currentKey) {
      currentKey = key;
      groups.push({
        key,
        label: new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(d),
        items: [],
      });
    }
    groups[groups.length - 1].items.push(msg);
  });
  return groups;
}

function DayDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 14px' }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(15,23,42,0.1)' }} />
      <span
        style={{
          fontSize: '10.5px',
          color: '#94a3b8',
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(15,23,42,0.1)' }} />
    </div>
  );
}

function MessageBubble({ item, currentUserId, prevItem }) {
  const mine = item.sender?.id === currentUserId || item.sender_role === 'customer';

  const showMeta =
    !prevItem ||
    prevItem.sender_role !== item.sender_role ||
    new Date(item.created_at) - new Date(prevItem.created_at) > 5 * 60 * 1000;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: mine ? 'flex-end' : 'flex-start',
        marginTop: showMeta ? '16px' : '4px',
        animation: 'csFadeIn 0.25s ease',
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: mine ? 'flex-end' : 'flex-start',
        }}
      >
        {showMeta && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              marginBottom: '6px',
              padding: mine ? '0 2px 0 0' : '0 0 0 2px',
            }}
          >
            <span style={{ fontSize: '11px', color: mine ? '#fbbf24' : '#64748b', fontWeight: 700 }}>
              {mine ? 'Saya' : 'Admin Siber'}
            </span>
            <span style={{ fontSize: '10px', color: '#475569' }}>{formatDate(item.created_at)}</span>
          </div>
        )}
        <div
          style={{
            padding: '10px 13px',
            borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
            background: mine ? 'rgba(245,158,11,0.18)' : '#ffffff',
            border: mine
              ? '1px solid rgba(245,158,11,0.35)'
              : '1px solid rgba(15,23,42,0.09)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          <p
            style={{
              fontSize: '13.5px',
              lineHeight: 1.65,
              color: mine ? '#78350f' : '#1e293b',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              margin: 0,
            }}
          >
            {item.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerServicePage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [reply, setReply] = useState('');
  const [isWide, setIsWide] = useState(window.innerWidth >= 900);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (location.state?.subject) setSubject(location.state.subject);
    if (location.state?.message) setNewMessage(location.state.message);
  }, [location.state]);

  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const selectedFromList = useMemo(
    () => conversations.find((item) => item.id === selectedId),
    [conversations, selectedId]
  );

  const messageGroups = useMemo(
    () => groupByDay(selectedConversation?.messages || []),
    [selectedConversation]
  );

  const activeStatus = selectedConversation?.status || selectedFromList?.status || 'open';
  const isClosed = ['resolved', 'closed'].includes(activeStatus);

  const fetchConversations = async () => {
    try {
      const response = await customerService.getConversations();
      const items = response.data || [];
      setConversations(items);
      if (!selectedId && items.length > 0) setSelectedId(items[0].id);
    } catch (_) {
      toast.error('Gagal memuat customer service');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    if (!id) {
      setSelectedConversation(null);
      return;
    }
    setDetailLoading(true);
    try {
      const response = await customerService.getConversation(id);
      setSelectedConversation(response.data);
    } catch (_) {
      toast.error('Gagal memuat detail chat');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    fetchDetail(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newMessage.trim()) {
      toast.error('Pesan awal wajib diisi');
      return;
    }
    setCreating(true);
    try {
      const response = await customerService.createConversation({
        subject: subject.trim() || 'Bantuan Siber Merch',
        message: newMessage.trim(),
        priority: 'normal',
      });
      toast.success('Chat berhasil dibuat');
      setSubject('');
      setNewMessage('');
      await fetchConversations();
      setSelectedId(response.data?.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat chat');
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!reply.trim() || !selectedId) return;
    setSending(true);
    try {
      await customerService.sendMessage(selectedId, reply.trim());
      setReply('');
      await Promise.all([fetchConversations(), fetchDetail(selectedId)]);
      toast.success('Pesan terkirim');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const handleSendKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  };

  if (loading) return <LoadingSpinner text="Memuat customer service..." />;

  return (
    <section style={{ padding: '34px 0 56px' }}>
      <style>{`
        @keyframes csFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes csPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @keyframes csSpin {
          to { transform: rotate(360deg); }
        }
        .cs-scroll::-webkit-scrollbar { width: 7px; }
        .cs-scroll::-webkit-scrollbar-track { background: transparent; }
        .cs-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .cs-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
        .cs-conv-row:hover { background: rgba(255,255,255,0.03); }
        .cs-conv-row.active:hover { background: rgba(245,158,11,0.13); }
        .cs-textarea:focus { border-color: rgba(245,158,11,0.45) !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.08); outline: none; }
        .cs-input:focus { border-color: rgba(245,158,11,0.4) !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.08); outline: none; }
        .cs-send-btn:not(:disabled):hover { transform: scale(1.06); box-shadow: 0 4px 14px rgba(245,158,11,0.42) !important; }
        .cs-send-btn:not(:disabled):active { transform: scale(0.94); }
        .cs-start-btn:not(:disabled):hover { opacity: 0.88; box-shadow: 0 6px 18px rgba(245,158,11,0.38) !important; }
        .cs-start-btn:not(:disabled):active { transform: scale(0.98); }
        .cs-refresh-btn:hover { background: rgba(255,255,255,0.06) !important; color: #e2e8f0 !important; }
      `}</style>

      <div className="container">
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '22px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.25)',
                background: 'rgba(245,158,11,0.08)',
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '12px',
              }}
            >
              <Headphones size={14} />
              Customer Service
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              Bantuan Siber Merch
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '620px', lineHeight: 1.6 }}>
              Kirim pertanyaan umum ke admin. Nanti bagian produk, pesanan, dan transaksi bisa disambungkan setelah modul tim lain siap.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={fetchConversations}
              className="cs-refresh-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              <RefreshCw size={13} />
              Refresh
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#121318',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}
            >
              <ShieldCheck size={18} style={{ color: '#34d399' }} />
              <div>
                <p style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }}>
                  {user.name || 'Customer'}
                </p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>Login aktif</p>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isWide ? '340px 1fr' : '1fr',
            gap: '18px',
            alignItems: 'start',
          }}
        >
          {/* LEFT PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Buat Chat Baru */}
            <div
              style={{
                background: '#121318',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={15} style={{ color: '#f59e0b' }} />
                </div>
                <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>
                  Buat Chat Baru
                </p>
              </div>

              <form onSubmit={handleCreate} style={{ padding: '16px' }}>
                <input
                  className="cs-input"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Judul pertanyaan"
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '9px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#0a0b0f',
                    color: '#e2e8f0',
                    padding: '0 12px',
                    fontSize: '13px',
                    marginBottom: '10px',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                />
                <textarea
                  className="cs-textarea"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Tulis pesan awal..."
                  rows={4}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    minHeight: '96px',
                    borderRadius: '9px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#0a0b0f',
                    color: '#e2e8f0',
                    padding: '12px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    marginBottom: '12px',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="cs-start-btn"
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '9px',
                    border: 'none',
                    background: creating
                      ? 'rgba(245,158,11,0.4)'
                      : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#0a0b0f',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: creating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: creating ? 'none' : '0 3px 10px rgba(245,158,11,0.3)',
                    transition: 'opacity 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease',
                  }}
                >
                  {creating ? (
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid rgba(10,11,15,0.3)',
                        borderTopColor: '#0a0b0f',
                        animation: 'csSpin 0.7s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                  ) : (
                    <MessageCircle size={15} />
                  )}
                  {creating ? 'Mengirim...' : 'Mulai Chat'}
                </button>
              </form>
            </div>

            {/* Riwayat Chat */}
            <div
              style={{
                background: '#121318',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: 'rgba(100,116,139,0.1)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={14} style={{ color: '#94a3b8' }} />
                  </div>
                  <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>
                    Riwayat Chat
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#64748b',
                  }}
                >
                  {conversations.length}
                </span>
              </div>

              {conversations.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}
                  >
                    <MessageCircle size={24} style={{ color: '#475569' }} />
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>Belum ada chat.</p>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    Buat chat baru untuk mulai bertanya.
                  </p>
                </div>
              ) : (
                <div className="cs-scroll" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {conversations.map((item) => {
                    const active = item.id === selectedId;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`cs-conv-row${active ? ' active' : ''}`}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '13px 16px',
                          border: 'none',
                          borderLeft: active ? '3px solid #f59e0b' : '3px solid transparent',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: active ? 'rgba(245,158,11,0.1)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '11px',
                          alignItems: 'flex-start',
                          transition: 'background 0.15s ease, border-color 0.15s ease',
                        }}
                      >
                        <Avatar name={user.name} active={active} size={36} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '8px',
                              marginBottom: '4px',
                              alignItems: 'center',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '13px',
                                color: '#ffffff',
                                fontWeight: 700,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                margin: 0,
                              }}
                            >
                              {item.subject || 'Bantuan Siber Merch'}
                            </p>
                            <Badge color={statusColor[item.status] || 'slate'}>
                              {statusLabel[item.status] || item.status}
                            </Badge>
                          </div>
                          <p
                            style={{
                              fontSize: '12px',
                              color: '#94a3b8',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              margin: 0,
                            }}
                          >
                            {item.last_message || 'Belum ada pesan'}
                          </p>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '6px',
                            }}
                          >
                            <Clock size={10} style={{ color: '#475569' }} />
                            <p style={{ fontSize: '10.5px', color: '#475569', margin: 0 }}>
                              {formatRelative(item.last_message_at || item.created_at)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Chat Detail Panel */}
          <div
            style={{
              minHeight: '620px',
              background: '#121318',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
            }}
          >
            {!selectedId ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '28px',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <MessageCircle size={30} style={{ color: '#475569' }} />
                  </div>
                  <p style={{ color: '#ffffff', fontWeight: 800, marginBottom: '6px', fontSize: '15px' }}>
                    Pilih atau buat chat
                  </p>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>
                    Percakapan dengan admin akan tampil di sini.
                  </p>
                </div>
              </div>
            ) : detailLoading ? (
              <LoadingSpinner text="Memuat pesan..." />
            ) : (
              <>
                {/* Chat Header */}
                <div
                  style={{
                    padding: '16px 18px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.015)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <Avatar
                      name={user.name}
                      size={42}
                      active={activeStatus === 'open'}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: 800,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {selectedConversation?.subject ||
                          selectedFromList?.subject ||
                          'Bantuan Siber Merch'}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '3px',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: statusDot[activeStatus] || '#64748b',
                            animation:
                              activeStatus === 'open'
                                ? 'csPulse 2s ease-in-out infinite'
                                : 'none',
                            flexShrink: 0,
                          }}
                        />
                        <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                          Admin:{' '}
                          {selectedConversation?.assigned_admin?.name || 'Belum ditugaskan'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge
                    color={
                      statusColor[selectedConversation?.status || selectedFromList?.status] ||
                      'slate'
                    }
                  >
                    {statusLabel[selectedConversation?.status || selectedFromList?.status] ||
                      'Open'}
                  </Badge>
                </div>

                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="cs-scroll"
                  style={{
                    flex: 1,
                    padding: '18px 20px',
                    overflowY: 'auto',
                    background: '#f0efe9',
                  }}
                >
                  {messageGroups.length === 0 ? (
                    <p
                      style={{
                        color: '#64748b',
                        fontSize: '13px',
                        textAlign: 'center',
                        marginTop: '30px',
                      }}
                    >
                      Belum ada pesan.
                    </p>
                  ) : (
                    messageGroups.map((group) => (
                      <div key={group.key}>
                        <DayDivider label={group.label} />
                        {group.items.map((item, idx) => (
                          <MessageBubble
                            key={item.id}
                            item={item}
                            currentUserId={user.id}
                            prevItem={group.items[idx - 1]}
                          />
                        ))}
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleSend}
                  style={{
                    padding: '14px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-end',
                    background: 'rgba(255,255,255,0.012)',
                  }}
                >
                  <textarea
                    className="cs-textarea"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    onKeyDown={handleSendKeyDown}
                    placeholder={
                      isClosed
                        ? 'Percakapan ini sudah ditutup'
                        : 'Tulis balasan... (Enter kirim, Shift+Enter baris baru)'
                    }
                    disabled={isClosed}
                    rows={2}
                    style={{
                      flex: 1,
                      resize: 'none',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: '#0a0b0f',
                      color: '#e2e8f0',
                      padding: '11px 13px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      opacity: isClosed ? 0.55 : 1,
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim() || isClosed || sending}
                    aria-label="Kirim pesan"
                    className="cs-send-btn"
                    style={{
                      width: '42px',
                      height: '42px',
                      minWidth: '42px',
                      borderRadius: '50%',
                      border: 'none',
                      background:
                        !reply.trim() || isClosed
                          ? 'rgba(255,255,255,0.06)'
                          : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: !reply.trim() || isClosed ? '#475569' : '#0a0b0f',
                      cursor:
                        !reply.trim() || isClosed || sending ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow:
                        !reply.trim() || isClosed
                          ? 'none'
                          : '0 3px 10px rgba(245,158,11,0.3)',
                      transition:
                        'transform 0.12s ease, box-shadow 0.15s ease, background 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    {sending ? (
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: '2px solid rgba(10,11,15,0.3)',
                          borderTopColor: '#0a0b0f',
                          animation: 'csSpin 0.7s linear infinite',
                          display: 'inline-block',
                        }}
                      />
                    ) : (
                      <Send size={17} style={{ marginLeft: '-2px', marginTop: '1px' }} />
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}