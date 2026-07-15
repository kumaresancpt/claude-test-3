import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/* ── SVG icons (inline, no external deps) ─────────────────────── */

function DashboardIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" />
    </svg>
  );
}

function AllVisitorIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="7" r="4" fill="currentColor" />
      <path d="M2 21c0-3.9 3.1-7 7-7h4c3.9 0 7 3.1 7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M17 3l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GateCheckInIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2Z" fill="currentColor" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M16 13l3 3-3 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 16h-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function GateCheckOutIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2Z" fill="currentColor" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M19 13l-3 3 3 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 16h5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ReportsIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="currentColor" opacity="0.85" />
      <path d="M14 2v6h6" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path
        d="M19.1 12c0-.3 0-.7-.1-1l2.1-1.6-2-3.5-2.5.9a7 7 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.5-.9-2 3.5L5.9 11A7 7 0 0 0 5.8 12c0 .3 0 .7.1 1L3.8 14.6l2 3.5 2.5-.9c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.5.9 2-3.5L19.2 13c.1-.3.1-.6 0-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

/* ── Nav item data ─────────────────────────────────────────────── */

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'All Visitor', path: '/all-visitors', icon: <AllVisitorIcon /> },
  { label: 'Gate Check-In', path: '/gate-entry', icon: <GateCheckInIcon /> },
  { label: 'Gate Check-Out', path: '/gate-checkout', icon: <GateCheckOutIcon /> },
  { label: 'Reports', path: '/reports', icon: <ReportsIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

/* ── Styles ────────────────────────────────────────────────────── */

const sidebarStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: 'var(--dash-sidebar-width)',
  height: '100vh',
  background: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  padding: '0 15px',
  boxSizing: 'border-box',
  zIndex: 100,
  overflowY: 'auto',
};

const logoWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '24px 4px 28px',
  flexShrink: 0,
};

const logoMarkStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  background: 'var(--color-primary)',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoTextWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  lineHeight: 1.2,
};

const logoWordmarkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family-satoshi)',
  fontWeight: 900,
  fontSize: '20px',
  color: 'var(--color-primary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const logoPoweredStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family-inter)',
  fontSize: '8px',
  color: 'var(--dash-color-text-primary)',
  fontWeight: 500,
  letterSpacing: '0.2px',
};

const navListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
};

function getNavItemStyle(isActive: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '13px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'var(--font-family-inter)',
    fontSize: '16px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--dash-color-nav-active-text)' : 'var(--dash-color-nav-inactive-text)',
    background: isActive ? 'var(--dash-color-nav-active-bg)' : 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.15s, color 0.15s',
  };
}

/* ── Component ─────────────────────────────────────────────────── */

function Sidebar(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside style={sidebarStyle} aria-label="Main navigation">
      {/* Logo */}
      <div style={logoWrapperStyle}>
        <div style={logoMarkStyle} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4Z" fill="white" />
            <path d="M9 12l2 2 4-4" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={logoTextWrapStyle}>
          <span style={logoWordmarkStyle}>Visitor</span>
          <span style={logoPoweredStyle}>Powered by Changepond</span>
        </div>
      </div>

      {/* Nav items */}
      <nav style={navListStyle} aria-label="Sidebar navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => { void navigate(item.path); }}
              style={getNavItemStyle(isActive)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: isActive ? 'var(--dash-color-nav-active-text)' : 'var(--dash-color-nav-inactive-text)',
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
