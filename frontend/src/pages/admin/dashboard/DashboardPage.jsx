import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import dashboardService from '../../../services/dashboardService';
import SummaryCards from '../../../components/admin/dashboard/SummaryCards';
import RevenueChart from '../../../components/admin/dashboard/RevenueChart';
import OrderStatusChart from '../../../components/admin/dashboard/OrderStatusChart';
import TopProductsChart from '../../../components/admin/dashboard/TopProductsChart';
import LowStockTable from '../../../components/admin/dashboard/LowStockTable';
import RecentOrdersTable from '../../../components/admin/dashboard/RecentOrdersTable';

const RANGE_OPTIONS = [
  { value: '7d',  label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
  { value: '90d', label: '90 Hari' },
  { value: '12m', label: '12 Bulan' },
];

export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [range, setRange] = useState('30d');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(true);

  const [summary, setSummary] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchAll = useCallback(async (currentRange) => {
    setRefreshing(true);
    try {
      const [summaryRes, revenueRes, statusRes, topRes, lowRes, recentRes] = await Promise.all([
        dashboardService.getSummary({ range: currentRange }),
        dashboardService.getRevenue({ range: currentRange }),
        dashboardService.getOrderStatus({ range: currentRange }),
        dashboardService.getTopProducts({ range: currentRange, limit: 7 }),
        dashboardService.getLowStock({ limit: 8 }),
        dashboardService.getRecentOrders({ limit: 8 }),
      ]);

      setSummary(summaryRes?.data || {});
      setRevenue(revenueRes?.data || []);
      setOrderStatus(statusRes?.data || []);
      setTopProducts(topRes?.data || []);
      setLowStock(lowRes?.data || []);
      setRecentOrders(recentRes?.data || []);
    } catch (err) {
      if (err.response?.status !== 403) toast.error('Gagal memuat data dashboard');
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(range);
  }, [range, fetchAll]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Selamat datang kembali,{' '}
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>{user.name || user.username || 'Admin'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: range === opt.value ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: range === opt.value ? '#fbbf24' : '#64748b',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchAll(range)}
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
      </div>

      {/* Stat cards */}
      <SummaryCards summary={summary} loading={initialLoading} />

      {/* Revenue + Order status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenue}
            loading={initialLoading}
            subtitle={`Tren pendapatan — ${RANGE_OPTIONS.find((o) => o.value === range)?.label.toLowerCase()} terakhir`}
          />
        </div>
        <OrderStatusChart data={orderStatus} loading={initialLoading} />
      </div>

      {/* Top products + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TopProductsChart data={topProducts} loading={initialLoading} />
        <LowStockTable data={lowStock} loading={initialLoading} />
      </div>

      {/* Recent orders */}
      <RecentOrdersTable data={recentOrders} loading={initialLoading} />
    </div>
  );
}
