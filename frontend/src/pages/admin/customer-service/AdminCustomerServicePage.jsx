import { useEffect, useMemo, useRef, useState } from 'react';
import { Headphones, MessageCircle, RefreshCw, Search, Send, Clock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import adminCustomerService from '../../../services/adminCustomerService';

const statuses = ['all', 'open', 'pending', 'resolved', 'closed'];

const statusLabel = {
  all: 'Semua',
  open: 'Open',
  pending: 'Pending',
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

function MessageBubble({ item, prevItem }) {
  const admin = item.sender_role === 'admin';
  const showMeta =
    !prevItem ||
    prevItem.sender_role !== item.sender_role ||
    new Date(item.created_at) - new Date(prevItem.created_at) > 5 * 60 * 1000;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: admin ? 'flex-end' : 'flex-start',
        marginTop: showMeta ? '16px' : '4px',
        animation: 'csFadeIn 0.25s ease',
      }}
    >
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: admin ? 'flex-end' : 'flex-start' }}>
        {showMeta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px', padding: admin ? '0 2px 0 0' : '0 0 0 2px' }}>
            <span style={{ fontSize: '11px', color: admin ? '#b45309' : '#475569', fontWeight: 700 }}>
              {admin ? 'Admin' : item.sender?.name || 'Customer'}
            </span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>{formatDate(item.created_at)}</span>
          </div>
        )}
        <div
          style={{
            padding: '10px 13px',
            borderRadius: admin ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
            background: admin ? 'rgba(245,158,11,0.16)' : '#ffffff',
            border: admin ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}
        >
          <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: admin ? '#7c2d12' : '#1e293b', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: 0 }}>
            {item.message}
          </p>
        </div>
      </div>
    </div>
  );
}

function DayDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 14px' }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(15,23,42,0.08)' }} />
      <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(15,23,42,0.08)' }} />
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
        label: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(d),
        items: [],
      });
    }
    groups[groups.length - 1].items.push(msg);
  });
  return groups;
}

export default function AdminCustomerServicePage() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isWide, setIsWide] = useState(window.innerWidth >= 1100);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 1100);
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

  const counts = useMemo(() => {
    const result = { all: conversations.length, open: 0, pending: 0, resolved: 0, closed: 0 };
    conversations.forEach((item) => {
      if (result[item.status] !== undefined) result[item.status] += 1;
    });
    return result;
  }, [conversations]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== 'all') params.status = status;
      if (search.trim()) params.search = search.trim();
      const response = await adminCustomerService.getConversations(params);
      const items = response.data || [];
      setConversations(items);
      if (!selectedId && items.length > 0) setSelectedId(items[0].id);
      if (selectedId && !items.some((item) => item.id === selectedId)) setSelectedId(items[0]?.id || null);
    } catch (_) {
      toast.error('Gagal memuat conversation CS');
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
      const response = await adminCustomerService.getConversation(id);
      setSelectedConversation(response.data);
    } catch (_) {
      toast.error('Gagal memuat detail chat');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [status]);

  useEffect(() => {
    fetchDetail(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchConversations();
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!reply.trim() || !selectedId) return;

    setSending(true);
    try {
      await adminCustomerService.sendMessage(selectedId, reply.trim());
      setReply('');
      await Promise.all([fetchConversations(), fetchDetail(selectedId)]);
      toast.success('Balasan terkirim');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim balasan');
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

  const handleUpdateStatus = async (nextStatus) => {
    if (!selectedId) return;
    setUpdating(true);
    try {
      await adminCustomerService.updateStatus(selectedId, nextStatus);
      await Promise.all([fetchConversations(), fetchDetail(selectedId)]);
      toast.success('Status diperbarui');
    } catch (_) {
      toast.error('Gagal memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  const activeStatus = selectedConversation?.status || selectedFromList?.status || 'open';
  const isClosed = activeStatus === 'closed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
        .cs-search-btn:hover { background: rgba(245,158,11,0.2) !important; border-color: rgba(245,158,11,0.5) !important; }
        .cs-search-btn:active { transform: scale(0.94); }
        .cs-search-wrap:focus-within .cs-search-icon { color: #f59e0b; }
        .cs-send-btn:not(:disabled):hover { transform: scale(1.06); box-shadow: 0 4px 14px rgba(245,158,11,0.42) !important; }
        .cs-send-btn:not(:disabled):active { transform: scale(0.94); }
        .cs-conv-row:hover { background: rgba(255,255,255,0.03); }
        .cs-conv-row.active:hover { background: rgba(245,158,11,0.13); }
        .cs-scroll::-webkit-scrollbar { width: 7px; }
        .cs-scroll::-webkit-scrollbar-track { background: transparent; }
        .cs-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .cs-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
        .cs-chat-area::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.14) !important; }
        .cs-chat-area::-webkit-scrollbar-thumb:hover { background: rgba(15,23,42,0.24) !important; }
        .cs-status-pill { transition: all 0.15s ease; }
        .cs-status-pill:hover { transform: translateY(-1px); }
        .cs-textarea:focus { border-color: rgba(245,158,11,0.45) !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }
        .cs-search-input:focus { border-color: rgba(245,158,11,0.4) !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <span
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Headphones size={19} style={{ color: '#f59e0b' }} />
            </span>
            Customer Service
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', marginLeft: '2px' }}>
            Kelola chat bantuan customer Siber Merch.
          </p>
        </div>
        <Button variant="ghost" onClick={fetchConversations} loading={loading}>
          <RefreshCw size={15} />
          Refresh
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isWide ? '380px 1fr' : '1fr',
          gap: '18px',
          alignItems: 'start',
        }}
      >
        {/* LEFT: Conversation list */}
        <div
          style={{
            background: '#121318',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <div className="cs-search-wrap" style={{ position: 'relative', flex: 1 }}>
                <Search size={16} className="cs-search-icon" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', transition: 'color 0.15s ease', pointerEvents: 'none' }} />
                <input
                  className="cs-search-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari customer atau pesan..."
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '9px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#0a0b0f',
                    color: '#e2e8f0',
                    padding: search ? '0 36px 0 38px' : '0 14px 0 38px',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, padding 0.1s ease',
                  }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Hapus pencarian"
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(255,255,255,0.07)',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      lineHeight: 1,
                      transition: 'background 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="submit"
                aria-label="Cari"
                style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  borderRadius: '9px',
                  border: '1px solid rgba(245,158,11,0.3)',
                  background: 'rgba(245,158,11,0.12)',
                  color: '#f59e0b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                className="cs-search-btn"
              >
                <Search size={16} />
              </button>
            </form>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
              {statuses.map((item) => (
                <button
                  key={item}
                  className="cs-status-pill"
                  onClick={() => setStatus(item)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '999px',
                    border: status === item ? '1px solid rgba(245,158,11,0.45)' : '1px solid rgba(255,255,255,0.08)',
                    background: status === item ? 'rgba(245,158,11,0.12)' : 'transparent',
                    color: status === item ? '#f59e0b' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {statusLabel[item]}
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '999px',
                      background: status === item ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.06)',
                      color: status === item ? '#fbbf24' : '#64748b',
                    }}
                  >
                    {counts[item] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Memuat conversation..." />
          ) : conversations.length === 0 ? (
            <div style={{ padding: '52px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <MessageCircle size={26} style={{ color: '#475569' }} />
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Belum ada conversation</p>
              <p style={{ color: '#64748b', fontSize: '12.5px' }}>Percakapan baru akan muncul di sini.</p>
            </div>
          ) : (
            <div className="cs-scroll" style={{ maxHeight: '650px', overflowY: 'auto' }}>
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
                      padding: '14px 16px',
                      border: 'none',
                      borderLeft: active ? '3px solid #f59e0b' : '3px solid transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: active ? 'rgba(245,158,11,0.1)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      transition: 'background 0.15s ease, border-color 0.15s ease',
                    }}
                  >
                    <Avatar name={item.customer?.name} active={active} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '5px', alignItems: 'center' }}>
                        <p
                          style={{
                            fontSize: '13.5px',
                            color: '#ffffff',
                            fontWeight: 800,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            margin: 0,
                          }}
                        >
                          {item.customer?.name || 'Customer'}
                        </p>
                        <Badge color={statusColor[item.status] || 'slate'}>{statusLabel[item.status] || item.status}</Badge>
                      </div>
                      <p
                        style={{
                          fontSize: '11.5px',
                          color: '#64748b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: '5px',
                        }}
                      >
                        {item.subject || 'Bantuan Siber Merch'}
                      </p>
                      <p
                        style={{
                          fontSize: '12.5px',
                          color: '#94a3b8',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          margin: 0,
                        }}
                      >
                        {item.last_message || 'Belum ada pesan'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '7px' }}>
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

        {/* RIGHT: Detail / chat panel */}
        <div
          style={{
            minHeight: '720px',
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
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '28px' }}>
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
                <p style={{ color: '#ffffff', fontWeight: 800, marginBottom: '6px', fontSize: '15px' }}>Pilih conversation</p>
                <p style={{ color: '#64748b', fontSize: '13px' }}>Detail percakapan customer akan tampil di sini.</p>
              </div>
            </div>
          ) : detailLoading ? (
            <LoadingSpinner text="Memuat detail chat..." />
          ) : (
            <>
              <div
                style={{
                  padding: '16px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  background: 'rgba(255,255,255,0.015)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <Avatar name={selectedConversation?.customer?.name || selectedFromList?.customer?.name} size={42} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedConversation?.customer?.name || selectedFromList?.customer?.name || 'Customer'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: statusDot[activeStatus] || '#64748b',
                          animation: activeStatus === 'open' ? 'csPulse 2s ease-in-out infinite' : 'none',
                          flexShrink: 0,
                        }}
                      />
                      <p style={{ color: '#64748b', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedConversation?.subject || selectedFromList?.subject || 'Bantuan Siber Merch'}
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    value={activeStatus}
                    disabled={updating}
                    onChange={(event) => handleUpdateStatus(event.target.value)}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: '#0a0b0f',
                      color: '#e2e8f0',
                      padding: '0 10px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: updating ? 'wait' : 'pointer',
                      opacity: updating ? 0.6 : 1,
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Selesai</option>
                    <option value="closed">Ditutup</option>
                  </select>
                </div>
              </div>

              <div ref={scrollRef} className="cs-scroll cs-chat-area" style={{ flex: 1, padding: '18px 20px', overflowY: 'auto', background: '#f7f6f3' }}>
                {messageGroups.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <User size={26} style={{ color: '#cbd5e1' }} />
                    <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>Belum ada pesan.</p>
                  </div>
                ) : (
                  messageGroups.map((group) => (
                    <div key={group.key}>
                      <DayDivider label={group.label} />
                      {group.items.map((item, idx) => (
                        <MessageBubble key={item.id} item={item} prevItem={group.items[idx - 1]} />
                      ))}
                    </div>
                  ))
                )}
              </div>

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
                  placeholder={isClosed ? 'Conversation ini sudah ditutup' : 'Tulis balasan admin... (Enter untuk kirim, Shift+Enter baris baru)'}
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
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    opacity: isClosed ? 0.55 : 1,
                  }}
                />
                <button
                  type="submit"
                  disabled={!reply.trim() || isClosed || sending}
                  aria-label="Kirim balasan"
                  className="cs-send-btn"
                  style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    borderRadius: '50%',
                    border: 'none',
                    background: !reply.trim() || isClosed
                      ? 'rgba(255,255,255,0.06)'
                      : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: !reply.trim() || isClosed ? '#475569' : '#0a0b0f',
                    cursor: !reply.trim() || isClosed || sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: !reply.trim() || isClosed ? 'none' : '0 3px 10px rgba(245,158,11,0.3)',
                    transition: 'transform 0.12s ease, box-shadow 0.15s ease, background 0.15s ease',
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
  );
}