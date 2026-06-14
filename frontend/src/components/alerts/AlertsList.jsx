export default function AlertsList({ alerts }) {
  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'critical': return 'var(--status-critical)';
      case 'warning': return 'var(--status-degraded)';
      case 'info': return 'var(--accent-primary)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
    }}>
      <h3 style={{
        fontSize: '0.85rem',
        fontWeight: 600,
        marginBottom: 16,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Recent Active Alerts
      </h3>
      {alerts.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No active alerts. All systems operational.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-base)',
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Severity Badge */}
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: `${getSeverityColor(alert.severity)}22`,
                  color: getSeverityColor(alert.severity),
                  border: `1px solid ${getSeverityColor(alert.severity)}44`
                }}>
                  {alert.severity}
                </span>
                
                {/* Alert details */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{alert.message}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Asset: {alert.Asset?.name || `Asset ID ${alert.asset_id}`} · Type: {alert.type}
                  </span>
                </div>
              </div>
              
              {/* Triggered Time */}
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(alert.triggered_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
