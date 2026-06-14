import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import api from '@/services/api';
import { assetService } from '@/services/assetService';
import { BarChart3, Clock, Cpu, HardDrive, Network } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        setLoadingAssets(true);
        const res = await assetService.getAll({ limit: 100 });
        setAssets(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedAssetId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load assets in analytics:', err);
      } finally {
        setLoadingAssets(false);
      }
    }
    loadAssets();
  }, []);

  useEffect(() => {
    if (!selectedAssetId) return;

    async function loadMetrics() {
      try {
        setLoadingMetrics(true);
        const res = await api.get(`/metrics?asset_id=${selectedAssetId}&limit=20`);
        setMetrics([...res.data.data].reverse() || []); // chronological
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoadingMetrics(false);
      }
    }
    loadMetrics();
    const interval = setInterval(loadMetrics, 20000);
    return () => clearInterval(interval);
  }, [selectedAssetId]);

  const selectedAsset = assets.find(a => a.id.toString() === selectedAssetId);

  // CPU & Memory Data
  const resourceChartData = {
    labels: metrics.map(m => new Date(m.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: metrics.map(m => parseFloat(m.cpu_usage || 0)),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f611',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: 'Memory Usage (%)',
        data: metrics.map(m => parseFloat(m.memory_usage || 0)),
        borderColor: '#8b5cf6',
        backgroundColor: '#8b5cf611',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      }
    ]
  };

  // Network Data
  const networkChartData = {
    labels: metrics.map(m => new Date(m.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
    datasets: [
      {
        label: 'Network In (KB/s)',
        data: metrics.map(m => parseFloat(m.network_in || 0)),
        borderColor: '#10b981',
        backgroundColor: '#10b98111',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: 'Network Out (KB/s)',
        data: metrics.map(m => parseFloat(m.network_out || 0)),
        borderColor: '#f43f5e',
        backgroundColor: '#f43f5e11',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      }
    ]
  };

  const chartOptions = (max = 100, labelY = 'Usage %') => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
      tooltip: {
        backgroundColor: '#1c2030',
        borderColor: '#252b3b',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
      }
    },
    scales: {
      x: {
        grid: { color: '#252b3b' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: {
        title: { display: true, text: labelY, color: '#94a3b8', font: { size: 10 } },
        grid: { color: '#252b3b' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
        min: 0,
        max: max
      }
    }
  });

  if (loadingAssets) return <div style={{ color: 'var(--text-secondary)' }}>Loading analytics layout...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 2 }}>Twin Device Telemetry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Time-series monitoring logs visualizer</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Twin Asset:</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--bg-base)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.85rem',
              minWidth: 200
            }}
          >
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.asset_type})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedAsset && (
        <>
          {/* Quick Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#3b82f622', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Cpu size={18} color="#3b82f6" style={{ alignSelf: 'center' }} /></div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CPU Average</p>
                <p className="mono" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  {metrics.length > 0 ? (metrics.reduce((acc, m) => acc + parseFloat(m.cpu_usage || 0), 0) / metrics.length).toFixed(1) : '0.0'}%
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#8b5cf622', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HardDrive size={18} color="#8b5cf6" /></div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mem Average</p>
                <p className="mono" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  {metrics.length > 0 ? (metrics.reduce((acc, m) => acc + parseFloat(m.memory_usage || 0), 0) / metrics.length).toFixed(1) : '0.0'}%
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#10b98122', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Network size={18} color="#10b981" /></div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Network Rate</p>
                <p className="mono" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  {metrics.length > 0 ? (metrics.reduce((acc, m) => acc + parseFloat(m.network_in || 0) + parseFloat(m.network_out || 0), 0) / metrics.length).toFixed(0) : '0'} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>KB/s</span>
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f59e0b22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={18} color="#f59e0b" /></div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Uptime</p>
                <p className="mono" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  {metrics.length > 0 ? (metrics.reduce((acc, m) => acc + parseFloat(m.uptime_pct || 0), 0) / metrics.length).toFixed(2) : '0.0'}%
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* CPU & Memory Chart */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              height: '380px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Resource Utilization (%)
              </h3>
              <div style={{ flex: 1, position: 'relative' }}>
                {loadingMetrics ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Updating metrics...</div>
                ) : metrics.length > 0 ? (
                  <Line data={resourceChartData} options={chartOptions(100, 'Utilization %')} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No historical metrics recorded.</div>
                )}
              </div>
            </div>

            {/* Network Chart */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              height: '380px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Network Throughput (KB/s)
              </h3>
              <div style={{ flex: 1, position: 'relative' }}>
                {loadingMetrics ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Updating metrics...</div>
                ) : metrics.length > 0 ? (
                  // We do not hardcode max network throughput, let chart.js dynamically scale
                  <Line data={networkChartData} options={chartOptions(undefined, 'Throughput KB/s')} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No historical metrics recorded.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
