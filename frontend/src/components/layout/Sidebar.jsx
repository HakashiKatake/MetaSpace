import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, BarChart2,
  Bell, Settings, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/assets',    label: 'Assets',     icon: Cpu },
  { to: '/analytics', label: 'Analytics',  icon: BarChart2 },
  { to: '/alerts',    label: 'Alerts',     icon: Bell },
  { to: '/settings',  label: 'Settings',   icon: Settings },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--bg-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--bg-border)',
        gap: 10,
      }}>
        <Zap size={20} color="var(--accent-primary)" />
        <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.03em' }}>
          MetaSpace<span style={{ color: 'var(--accent-primary)' }}>Cloud</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-elevated)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all var(--transition-fast)',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--bg-border)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        MetaSpace v1.0 · Case 145
      </div>
    </aside>
  );
}
