import React from 'react';
import { ErrorIcon, SuccessIcon } from './icons';

interface BannerProps {
  message: string;
}

export function ApiErrorBanner({ message }: BannerProps): React.ReactElement {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-bg-error)',
        border: '1px solid var(--color-border-error)',
        color: 'var(--color-text-error)',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '14px',
        width: '400px',
        marginBottom: '8px',
      }}
    >
      <ErrorIcon />
      <span>{message}</span>
    </div>
  );
}

export function SuccessBanner({ message }: BannerProps): React.ReactElement {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-bg-success)',
        border: '1px solid var(--color-border-success)',
        color: 'var(--color-text-success)',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '14px',
        width: '400px',
        marginBottom: '8px',
      }}
    >
      <SuccessIcon />
      <span>{message}</span>
    </div>
  );
}
