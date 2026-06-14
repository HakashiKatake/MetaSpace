import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { AlertTriangle, CheckCircle, ShieldAlert, Clock, AlertCircle } from 'lucide-react';

export default function Alerts() {
  const { hasRole } = useAuth();
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Pagination
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        page,
        limit: 10
      };
      const res = await api.get('/alerts', { params });
      setAlerts(res.data.data || []);
      setTotalPages(res.data.meta?.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch alerts log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, severityFilter, page]);

  const handleAcknowledge = async (id) => {
    try {
      setError('');
      await api.put(`/alerts/${id}/acknowledge`);
      loadAlerts();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to acknowledge alert.');
    }
  };

  const handleResolve = async (id) => {
    try {
      setError('');
      await api.put(`/alerts/${id}/resolve`);
      loadAlerts();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to resolve alert.');
    }
  };

  const getSeverityBadgeStyle = (sev) => {
    let color = 'var(--text-muted)';
    switch (sev) {
      case 'critical': color = 'var(--status-critical)'; break;
      case 'warning': color = 'var(--status-degraded)'; break;
      case 'info': color = 'var(--accent-primary)'; break;
    }
    return {
      fontSize: '0.72rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      padding: '3px 8px',
      borderRadius: 4,
      background: `${color}20`,
      color: color,
      border: `1px solid ${color}33`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    };
  };

  const getStatusBadgeStyle = (st) => {
    let color = 'var(--text-muted)';
    switch (st) {
      case 'active': color = 'var(--status-critical)'; break;
      case 'acknowledged': color = 'var(--status-degraded)'; break;
      case 'resolved': color = 'var(--status-online)'; break;
    }
    return {
      fontSize: '0.72rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      padding: '3px 8px',
      borderRadius: 4,
      background: `${color}10`,
      color: color,
      border: `1px solid ${color}22`
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 2 }}>System Alerts Log</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Review and manage digital twin thresholds and alarms</p>
      </div>

      {/* Error Panel */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          color: 'var(--status-critical)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        gap: 12,
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', minWidth: 150
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Severity</label>
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', minWidth: 150
            }}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading alerts log...</div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No alerts recorded. All systems green.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bg-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Asset</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Severity</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Alarm</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Message</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Triggered At</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Resolved Details</th>
                {hasRole(['admin', 'manager']) && (
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{alert.Asset?.name || `ID ${alert.asset_id}`}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={getSeverityBadgeStyle(alert.severity)}>
                      {alert.severity === 'critical' ? <ShieldAlert size={12} /> : alert.severity === 'warning' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                      {alert.severity}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{alert.type}</td>
                  <td style={{ padding: '16px', color: 'var(--text-primary)', maxWidth: '300px' }}>{alert.message}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={getStatusBadgeStyle(alert.status)}>{alert.status}</span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }} className="mono">
                    {new Date(alert.triggered_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {alert.status === 'resolved' ? (
                      <div>
                        <div>By: {alert.resolver?.name || 'System'}</div>
                        <div className="mono" style={{ fontSize: '0.72rem' }}>
                          {new Date(alert.resolved_at).toLocaleString()}
                        </div>
                      </div>
                    ) : '—'}
                  </td>
                  {hasRole(['admin', 'manager']) && (
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {alert.status === 'active' && (
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            style={{
                              background: 'transparent', border: '1px solid var(--status-degraded)',
                              color: 'var(--status-degraded)', padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500, transition: 'all var(--transition-fast)'
                            }}
                            onMouseEnter={e => { e.target.style.background = 'rgba(245,158,11,0.1)'; }}
                            onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => handleResolve(alert.id)}
                            style={{
                              background: 'var(--status-online)', border: 'none',
                              color: 'white', padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, transition: 'all var(--transition-fast)'
                            }}
                            onMouseEnter={e => { e.target.style.filter = 'brightness(1.1)'; }}
                            onMouseLeave={e => { e.target.style.filter = 'none'; }}
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                      {alert.status === 'acknowledged' && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          style={{
                            background: 'var(--status-online)', border: 'none',
                            color: 'white', padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, transition: 'all var(--transition-fast)'
                          }}
                          onMouseEnter={e => { e.target.style.filter = 'brightness(1.1)'; }}
                          onMouseLeave={e => { e.target.style.filter = 'none'; }}
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-sm)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
            }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-sm)', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
