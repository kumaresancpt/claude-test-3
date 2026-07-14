import React from 'react';

interface SessionTimeoutModalProps {
  open: boolean;
  onExtend: () => void;
}

function SessionTimeoutModal({ open, onExtend }: SessionTimeoutModalProps): React.ReactElement | null {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          width: '360px',
          maxWidth: '90vw',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <h2
          id="session-timeout-title"
          style={{ color: 'var(--color-primary)', fontSize: '20px', marginTop: 0 }}
        >
          Session Expiring
        </h2>
        <p style={{ color: 'var(--color-secondary)', fontSize: '14px' }}>
          Your session will expire in 5 minutes. Click to extend.
        </p>
        <button
          type="button"
          onClick={onExtend}
          style={{
            background: 'var(--color-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: '14px',
            width: '100%',
          }}
        >
          Extend
        </button>
      </div>
    </div>
  );
}

export default SessionTimeoutModal;
