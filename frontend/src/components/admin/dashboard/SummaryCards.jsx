import { Wallet, ShoppingCart, Clock, PackageX } from 'lucide-react';
import StatsCard from './StatsCard';

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

export default function SummaryCards({ summary, loading = false }) {
  const s = summary || {};

  const cards = [
    {
      key: 'revenue',
      icon: Wallet,
      label: 'Total Pendapatan',
      value: formatRupiah(s.total_revenue?.value),
      trend: s.total_revenue?.change_percent,
      color: 'green',
    },
    {
      key: 'orders',
      icon: ShoppingCart,
      label: 'Total Pesanan',
      value: formatNumber(s.total_orders?.value),
      trend: s.total_orders?.change_percent,
      color: 'blue',
    },
    {
      key: 'pending',
      icon: Clock,
      label: 'Pesanan Tertunda',
      value: formatNumber(s.pending_orders?.value),
      trend: s.pending_orders?.change_percent,
      color: 'amber',
    },
    {
      key: 'low-stock',
      icon: PackageX,
      label: 'Produk Stok Menipis',
      value: formatNumber(s.low_stock_products?.value),
      trend: s.low_stock_products?.change_percent,
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c) => (
        <StatsCard
          key={c.key}
          icon={c.icon}
          label={c.label}
          value={c.value}
          color={c.color}
          trend={c.trend}
          loading={loading}
        />
      ))}
    </div>
  );
}
