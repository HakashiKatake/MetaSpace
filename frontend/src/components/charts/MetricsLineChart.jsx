import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
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
import api from '@/services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MetricsLineChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await api.get('/metrics?limit=15');
        const metrics = [...res.data.data].reverse(); // oldest first for chronological order

        const labels = metrics.map(m => {
          const date = new Date(m.recorded_at);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        });
        const cpuData = metrics.map(m => parseFloat(m.cpu_usage || 0));
        const memData = metrics.map(m => parseFloat(m.memory_usage || 0));

        setChartData({
          labels,
          datasets: [
            {
              label: 'CPU Usage (%)',
              data: cpuData,
              borderColor: '#3b82f6',
              backgroundColor: '#3b82f622',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 2,
            },
            {
              label: 'Memory Usage (%)',
              data: memData,
              borderColor: '#8b5cf6',
              backgroundColor: '#8b5cf622',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 2,
            }
          ]
        });
      } catch (err) {
        console.error('Error fetching metrics for chart:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { size: 11 } }
      },
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
        grid: { color: '#252b3b' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      height: '350px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        System Resource Telemetry
      </h3>
      <div style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Loading telemetry...
          </div>
        ) : chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            No metrics available
          </div>
        )}
      </div>
    </div>
  );
}
