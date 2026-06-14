import { useEffect, useState } from 'react';
import { Cpu, Wifi, AlertTriangle, Activity } from 'lucide-react';
import KpiCard from '@/components/ui/KpiCard';
import AssetStatusChart from '@/components/charts/AssetStatusChart';
import MetricsLineChart from '@/components/charts/MetricsLineChart';
import AlertsList from '@/components/alerts/AlertsList';
import api from '@/services/api';

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          api.get('/assets/stats'),
          api.get('/alerts?status=active&limit=5'),
        ]);
        setStats(statsRes.data.data);
        setAlerts(alertsRes.data.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 2 }}>
          Operations Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Digital Twin Infrastructure · Real-time status
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard
          label="Total Assets"
          value={stats?.total ?? '—'}
          icon={Cpu}
          accentColor="var(--accent-primary)"
          trend="up"
          trendValue="+5 overall"
        />
        <KpiCard
          label="Online"
          value={stats?.online ?? '—'}
          icon={Wifi}
          accentColor="var(--status-online)"
          trend="up"
          trendValue="Uptime optimized"
        />
        <KpiCard
          label="Active Alerts"
          value={alerts.length}
          icon={AlertTriangle}
          accentColor="var(--status-critical)"
          trend={alerts.length > 3 ? 'up' : 'down'}
          trendValue={alerts.length > 0 ? `${alerts.filter(a => a.severity === 'critical').length} critical` : 'All clear'}
        />
        <KpiCard
          label="Avg Health"
          value={stats?.avg_health ?? '—'}
          unit="%"
          icon={Activity}
          accentColor="var(--status-degraded)"
          trend={stats?.avg_health > 80 ? 'up' : 'down'}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <AssetStatusChart stats={stats} />
        <MetricsLineChart />
      </div>

      {/* Alerts panel */}
      <AlertsList alerts={alerts} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ height: 40, background: 'var(--bg-surface)', borderRadius: 8, width: 200 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 110, background: 'var(--bg-surface)', borderRadius: 10,
            animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ height: 350, background: 'var(--bg-surface)', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 350, background: 'var(--bg-surface)', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
      </div>
    </div>
  );
}
