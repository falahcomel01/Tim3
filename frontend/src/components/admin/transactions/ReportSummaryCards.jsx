import { Receipt, Wallet, TrendingUp, Tag, Truck } from 'lucide-react';
import StatsCard from '../dashboard/StatsCard';

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value) {
  return (value ?? 0).toLocaleString('id-ID');
}

export default function ReportSummaryCards({ summary, loading = false }) {
  const s = summary || {};

  const cards = [
    {
      key: 'total',
      icon: Receipt,
      label: 'Total Transaksi',
      value: formatNumber(s.total_transactions),
      color: 'blue',
    },
    {
      key: 'revenue',
      icon: Wallet,
      label: 'Total Pendapatan',
      value: formatRupiah(s.total_revenue),
      color: 'green',
    },
    {
      key: 'aov',
      icon: TrendingUp,
      label: 'Rata-rata Nilai Transaksi',
      value: formatRupiah(s.average_order_value),
      color: 'amber',
    },
    {
      key: 'discount',
      icon: Tag,
      label: 'Total Diskon',
      value: formatRupiah(s.total_discount),
      color: 'purple',
    },
    {
      key: 'shipping',
      icon: Truck,
      label: 'Total Ongkos Kirim',
      value: formatRupiah(s.total_shipping),
      color: 'blue',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {cards.map((c) => (
        <StatsCard
          key={c.key}
          icon={c.icon}
          label={c.label}
          value={c.value}
          color={c.color}
          loading={loading}
        />
      ))}
    </div>
  );
}
