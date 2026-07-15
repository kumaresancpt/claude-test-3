import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import SessionTimeoutModal from './SessionTimeoutModal';
import useSessionTimeout from '../hooks/useSessionTimeout';
import { logout } from '../services/authService';
import { ACCESS_TOKEN_KEY } from '../services/types';

/* ── Inline SVG icons ──────────────────────────────────────────── */

function SearchIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
      <path d="m16.5 16.5 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M12 2a7 7 0 0 0-7 7v3.17L3.5 14.5A1 1 0 0 0 4.5 16h15a1 1 0 0 0 .94-1.35L19 12.17V9a7 7 0 0 0-7-7Z"
        fill="#171717"
      />
      <path d="M10 18a2 2 0 0 0 4 0" fill="#171717" />
    </svg>
  );
}

function SunIcon(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4" fill="#f59e0b" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── DashboardLayout ───────────────────────────────────────────── */

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

function DashboardLayout({ children, userName = 'John' }: DashboardLayoutProps): React.ReactElement {
  const navigate = useNavigate();
  const { showWarning, extendSession } = useSessionTimeout();
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = async (): Promise<void> => {
    setApiError(null);
    try {
      await logout();
    } catch {
      setApiError('Unable to reach the server, but you have been signed out locally.');
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      void navigate('/login', { replace: true });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dash-bg-page)', fontFamily: 'var(--font-family-inter)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 'var(--dash-sidebar-width)',
          right: 0,
          height: 'var(--dash-header-height)',
          background: 'var(--dash-bg-page)',
          borderBottom: '1px solid var(--dash-color-border-header)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px 10px 24px',
          zIndex: 99,
          boxSizing: 'border-box',
        }}
      >
        {/* Welcome message */}
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-family-inter)',
            fontWeight: 500,
            fontSize: '22px',
            color: 'var(--dash-color-text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          Welcome back{' '}
          <span style={{ color: 'var(--color-primary)' }}>{userName}!</span>
        </p>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '320px',
              padding: '8px 8px 8px 16px',
              borderRadius: 'var(--dash-radius-search)',
              border: '0.862px solid var(--dash-color-border-search)',
              background: 'var(--dash-color-bg-search)',
              backdropFilter: 'blur(4px)',
              boxSizing: 'border-box',
            }}
          >
            <input
              type="search"
              value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); }}
              placeholder="Search Visitor, Passes"
              aria-label="Search Visitor, Passes"
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'var(--font-family-inter)',
                fontSize: '14px',
                color: 'var(--dash-color-text-secondary)',
                flex: 1,
                minWidth: 0,
              }}
            />
            <button
              type="button"
              aria-label="Search"
              style={{
                width: '35px',
                height: '35px',
                borderRadius: '24px',
                background: 'var(--color-primary)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <SearchIcon />
            </button>
          </div>

          {/* Light/Dark toggle (display only — light mode) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              aria-label="Theme toggle — Light mode"
              style={{
                width: '48px',
                height: '24px',
                borderRadius: '84px',
                background: 'rgba(231,231,231,0.6)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                boxShadow: '0 1.69px 3.375px rgba(0,0,0,0.04)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              >
                <SunIcon />
              </div>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-family-inter)',
                fontSize: '14px',
                color: 'var(--dash-color-text-muted)',
              }}
            >
              Light
            </span>
          </div>

          {/* Bell notification */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              aria-label="Notifications"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <BellIcon />
            </button>
            {/* Red badge dot */}
            <span
              aria-label="New notifications"
              style={{
                position: 'absolute',
                top: '-1px',
                right: '-3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '1.5px solid white',
              }}
            />
          </div>

          {/* Avatar + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '9999px',
                background: 'var(--dash-color-nav-active-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-family-inter)',
                fontWeight: 700,
                fontSize: '16px',
                color: 'var(--color-primary)',
                flexShrink: 0,
              }}
              aria-label={`${userName} profile`}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={() => { void handleLogout(); }}
              style={{
                background: 'transparent',
                border: '1.5px solid var(--color-primary)',
                borderRadius: '6px',
                padding: '6px 14px',
                fontFamily: 'var(--font-family-inter)',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--color-primary)',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* API error banner */}
      {apiError && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: 'var(--dash-header-height)',
            left: 'var(--dash-sidebar-width)',
            right: 0,
            background: 'var(--color-bg-error)',
            color: 'var(--color-text-error)',
            padding: '8px 24px',
            fontSize: '14px',
            zIndex: 98,
          }}
        >
          {apiError}
        </div>
      )}

      {/* Main content */}
      <main
        style={{
          marginLeft: 'var(--dash-sidebar-width)',
          marginTop: 'var(--dash-header-height)',
          paddingBottom: 'var(--dash-footer-height)',
          minHeight: 'calc(100vh - var(--dash-header-height))',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 'var(--dash-sidebar-width)',
          right: 0,
          height: 'var(--dash-footer-height)',
          background: '#ffffff',
          borderTop: '1px solid var(--dash-color-border-footer)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Poppins', 'Inter', sans-serif",
            fontSize: '12px',
            color: 'var(--dash-color-text-primary)',
            textAlign: 'center',
          }}
        >
          Copyright 2026 Changepond. All Rights Reserved.
        </p>
      </footer>

      <SessionTimeoutModal open={showWarning} onExtend={() => { void extendSession(); }} />
    </div>
  );
}

export default DashboardLayout;
