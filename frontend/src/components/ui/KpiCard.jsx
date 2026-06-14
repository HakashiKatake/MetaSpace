import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ label, value, unit = '', trend, trendValue, icon: Icon, accentColor }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--status-online)' : trend === 'down' ? 'var(--status-critical)' : 'var(--text-muted)';

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color var(--transition-base)',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-border)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${accentColor || 'var(--accent-primary)'}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} color={accentColor || 'var(--accent-primary)'} />
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: '1.85rem', fontWeight: 700, lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{unit}</span>}
      </div>

      {/* Trend */}
      {trendValue !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendIcon size={12} color={trendColor} />
          <span style={{ fontSize: '0.75rem', color: trendColor }}>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
