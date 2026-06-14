import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Bell, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/services/api';

export default function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  // Determine page title
  const path = location.pathname.substring(1);
  const pageTitle = path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard';

  useEffect(() => {
    async function fetchAlertCount() {
      try {
        const res = await api.get('/alerts?status=active&limit=1');
        if (res.data && res.data.meta) {
          setActiveAlertCount(res.data.meta.total || 0);
        }
      } catch (err) {
        console.error('Error fetching alerts count:', err);
      }
    }
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--bg-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      {/* Title */}
      <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {pageTitle}
      </h2>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Notification Bell */}
        <Link to="/alerts" style={{ position: 'relative', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
          <Bell size={18} />
          {activeAlertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: 'var(--status-critical)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: '50%',
              width: 14,
              height: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {activeAlertCount > 9 ? '9+' : activeAlertCount}
            </span>
          )}
        </Link>

        {/* Vertical Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--bg-border)' }} />

        {/* User profile info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--bg-border)',
          }}>
            <User size={14} color="var(--text-secondary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{user?.name || 'User'}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user?.role || 'operator'}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--bg-border)' }} />

        {/* Logout Button */}
        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8rem',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--status-critical)';
            e.currentTarget.style.background = '#ef444411';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}
