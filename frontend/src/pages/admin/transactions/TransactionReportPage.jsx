import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, FileBarChart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import transactionService from '../../../services/transactionService';
import ReportFilterBar from '../../../components/admin/transactions/ReportFilterBar';
import ReportSummaryCards from '../../../components/admin/transactions/ReportSummaryCards';
import RevenueTimelineChart from '../../../components/admin/transactions/RevenueTimelineChart';
import StatusBreakdownCard from '../../../components/admin/transactions/StatusBreakdownCard';
import PaymentBreakdownCard from '../../../components/admin/transactions/PaymentBreakdownCard';

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function defaultFilters() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);

  return {
    startDate: toISODate(start),
    endDate: toISODate(end),
    status: '',
    groupBy: 'day',
  };
}

function downloadCsv(filename, rows) {
  if (!rows.length) return;

  const header = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    header.join(','),
    ...rows.map((row) => header.map((key) => escape(row[key])).join(',')),
  ];

  // BOM agar Excel membaca karakter UTF-8 (Rp, dll) dengan benar
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function TransactionReportPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(true);
  const [report, setReport] = useState(null);

  const fetchReport = useCallback(async (currentFilters) => {
    setRefreshing(true);
    try {
      const res = await transactionService.getReport({
        start_date: currentFilters.startDate,
        end_date: currentFilters.endDate,
        status: currentFilters.status || undefined,
        group_by: currentFilters.groupBy,
      });
      setReport(res?.data || null);
    } catch (err) {
      if (err.response?.status !== 403) toast.error('Gagal memuat laporan transaksi');
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleReset = () => {
    setFilters(defaultFilters());
  };

  const handleExport = () => {
    if (!report?.timeline?.length) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const rows = report.timeline.map((row) => ({
      periode: row.period,
      jumlah_transaksi: row.transactions,
      pendapatan: row.revenue,
    }));

    downloadCsv(`laporan-transaksi_${filters.startDate}_${filters.endDate}.csv`, rows);
    toast.success('Laporan berhasil diekspor');
  };

  const summary = report?.summary || {};
  const statusBreakdown = report?.status_breakdown || [];
  const paymentBreakdown = report?.payment_breakdown || [];
  const timeline = report?.timeline || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-start gap-2">
          <FileBarChart size={20} style={{ color: '#fbbf24', marginTop: '3px' }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>Laporan Transaksi</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Ringkasan dan tren transaksi pada periode yang dipilih
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchReport(filters)}
          disabled={refreshing}
          title="Muat ulang"
          style={{
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8',
            cursor: refreshing ? 'default' : 'pointer',
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter */}
      <ReportFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        onExport={handleExport}
        exportDisabled={initialLoading || timeline.length === 0}
      />

      {/* Ringkasan */}
      <ReportSummaryCards summary={summary} loading={initialLoading} />

      {/* Tren transaksi */}
      <RevenueTimelineChart data={timeline} loading={initialLoading} groupBy={filters.groupBy} />

      {/* Status & metode pembayaran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StatusBreakdownCard data={statusBreakdown} loading={initialLoading} />
        <PaymentBreakdownCard data={paymentBreakdown} loading={initialLoading} />
      </div>
    </div>
  );
}
