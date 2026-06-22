import { Download, RotateCcw, Filter, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '',           label: 'Semua Status' },
  { value: 'pending',    label: 'Menunggu' },
  { value: 'paid',       label: 'Dibayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped',    label: 'Dikirim' },
  { value: 'delivered',  label: 'Selesai' },
  { value: 'cancelled',  label: 'Dibatalkan' },
  { value: 'refunded',   label: 'Refund' },
];

const GROUP_OPTIONS = [
  { value: 'day',   label: 'Harian' },
  { value: 'month', label: 'Bulanan' },
];

const inputStyle = {
  padding: '9px 12px',
  background: '#0a0b0f',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '13px',
  outline: 'none',
  colorScheme: 'dark',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  marginBottom: '6px',
  display: 'block',
};

export default function ReportFilterBar({ filters, onChange, onReset, onExport, exportDisabled }) {
  const { startDate, endDate, status, groupBy } = filters;

  return (
    <div
      className="rounded-xl"
      style={{ backgroundColor: '#121318', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter size={14} style={{ color: '#fbbf24' }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Filter Laporan</span>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label style={labelStyle}>Tanggal Mulai</label>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            style={inputStyle}
            onChange={(e) => onChange({ startDate: e.target.value })}
          />
        </div>

        <div>
          <label style={labelStyle}>Tanggal Akhir</label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            style={inputStyle}
            onChange={(e) => onChange({ endDate: e.target.value })}
          />
        </div>

        <div>
  <label style={labelStyle}>Status</label>

  <div style={{ position: 'relative' }}>
    <select
      value={status}
      style={{
        ...inputStyle,
        cursor: 'pointer',
        minWidth: '140px',
        paddingRight: '40px',

        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
      }}
      onChange={(e) => onChange({ status: e.target.value })}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>

    <ChevronDown
      size={16}
      style={{
        position: 'absolute',
        right: '14px', // atur posisi icon di sini
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#94a3b8',
        pointerEvents: 'none',
      }}
    />
  </div>
</div>
        <div>
          <label style={labelStyle}>Pengelompokan</label>
          <div
            className="flex gap-1 p-1 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {GROUP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ groupBy: opt.value })}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: groupBy === opt.value ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: groupBy === opt.value ? '#fbbf24' : '#64748b',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onReset}
            title="Reset filter"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            onClick={onExport}
            disabled={exportDisabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              background: exportDisabled ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#1a0f00',
              fontWeight: 700,
              fontSize: '13px',
              cursor: exportDisabled ? 'default' : 'pointer',
              opacity: exportDisabled ? 0.6 : 1,
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
