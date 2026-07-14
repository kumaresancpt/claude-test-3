import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSessionTimeout from '../hooks/useSessionTimeout';
import SessionTimeoutModal from './SessionTimeoutModal';
import { logout } from '../services/authService';
import { ACCESS_TOKEN_KEY } from '../services/types';

interface AuthenticatedLayoutProps {
  title: string;
  children: React.ReactNode;
}

function AuthenticatedLayout({ title, children }: AuthenticatedLayoutProps): React.ReactElement {
  const navigate = useNavigate();
  const { showWarning, extendSession } = useSessionTimeout();
  const [apiError, setApiError] = useState<string | null>(null);

  const handleLogout = async (): Promise<void> => {
    setApiError(null);
    try {
      await logout();
    } catch {
      setApiError('Unable to reach the server while logging out, but you have been signed out locally.');
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid var(--color-border-input)',
        }}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '20px', color: 'var(--color-primary)' }}>
          {title}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: 'var(--color-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Logout
        </button>
      </nav>
      {apiError && (
        <div role="alert" style={{ color: 'var(--color-text-error)', padding: '8px 32px' }}>
          {apiError}
        </div>
      )}
      <main style={{ flex: 1, padding: '32px' }}>{children}</main>
      <SessionTimeoutModal open={showWarning} onExtend={() => void extendSession()} />
    </div>
  );
}

export default AuthenticatedLayout;
