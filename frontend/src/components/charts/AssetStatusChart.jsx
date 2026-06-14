import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AssetStatusChart({ stats }) {
  const data = {
    labels: ['Online', 'Offline', 'Degraded', 'Maintenance'],
    datasets: [{
      data: [stats?.online ?? 0, stats?.offline ?? 0, stats?.degraded ?? 0, stats?.maintenance ?? 0],
      backgroundColor: [
        '#22c55e', // Online (green)
        '#6b7280', // Offline (grey)
        '#f59e0b', // Degraded (yellow)
        '#8b5cf6', // Maintenance (purple)
      ],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const options = {
    responsive: true,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { size: 12 }, padding: 16, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: '#1c2030',
        borderColor: '#252b3b',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
      },
    },
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
    }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Asset Status Distribution
      </h3>
      <Doughnut data={data} options={options} />
    </div>
  );
}
