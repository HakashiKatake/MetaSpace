import { useAuth } from '@/context/AuthContext';
import { Shield, Settings as SettingsIcon, User, RefreshCw, Database, Cloud } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const { user } = useAuth();
  const [refreshInterval, setRefreshInterval] = useState('30s');
  const [notifyOnCritical, setNotifyOnCritical] = useState(true);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'var(--status-critical)';
      case 'manager': return 'var(--status-degraded)';
      case 'operator': return 'var(--accent-primary)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 2 }}>System Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Configure preferences and check environment parameters</p>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Profile Card */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: 20,
          display: 'flex', flexDirection: 'column', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Operator Profile</h2>
          </div>
          <div style={{ width: '100%', height: 1, background: 'var(--bg-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Full Name:</span>
              <span style={{ fontWeight: 500 }}>{user?.name || 'Ops Member'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email Address:</span>
              <span className="mono" style={{ fontWeight: 500 }}>{user?.email || 'operator@metaspace.io'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Authorization Role:</span>
              <span>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4,
                  background: `${getRoleBadgeColor(user?.role)}22`, color: getRoleBadgeColor(user?.role),
                  border: `1px solid ${getRoleBadgeColor(user?.role)}33`
                }}>
                  {user?.role || 'operator'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Settings */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: 20,
          display: 'flex', flexDirection: 'column', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SettingsIcon size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Preferences</h2>
          </div>
          <div style={{ width: '100%', height: 1, background: 'var(--bg-border)' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 500 }}>Telemetry Sync Interval</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>How often dashboards refresh database metrics</p>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                style={{
                  padding: '6px 12px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem'
                }}
              >
                <option value="15s">15 Seconds</option>
                <option value="30s">30 Seconds</option>
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 500 }}>Critical Notifications</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Toggle alert panel flash on critical threshold breaches</p>
              </div>
              <input
                type="checkbox"
                checked={notifyOnCritical}
                onChange={(e) => setNotifyOnCritical(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Environment Parameters */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: 20,
          display: 'flex', flexDirection: 'column', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>System Environment Status</h2>
          </div>
          <div style={{ width: '100%', height: 1, background: 'var(--bg-border)' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Database size={16} color="var(--text-secondary)" />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Relational Database:</span>
                <span style={{ fontWeight: 600, color: 'var(--status-online)' }}>CONNECTED (MySQL)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Cloud size={16} color="var(--text-secondary)" />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Storage Bucket Sync:</span>
                <span style={{ fontWeight: 600, color: 'var(--status-online)' }}>ACTIVE (S3)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RefreshCw size={16} color="var(--text-secondary)" />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Environment Target:</span>
                <span className="mono" style={{ fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-primary)' }}>
                  {import.meta.env.MODE}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
