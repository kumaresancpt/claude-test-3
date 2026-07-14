import React from 'react';

export function UserIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12Zm0 2.5c-3.3 0-9.8 1.6-9.8 4.9v2.4h19.6v-2.4c0-3.3-6.5-4.9-9.8-4.9Z"
        fill="#8390A2"
      />
    </svg>
  );
}

export function EyeIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M12 5c-5.5 0-9.8 4.4-10.8 7 1 2.6 5.3 7 10.8 7s9.8-4.4 10.8-7c-1-2.6-5.3-7-10.8-7Zm0 11.7A4.7 4.7 0 1 1 12 7.3a4.7 4.7 0 0 1 0 9.4Zm0-7.5a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
        fill="#8390A2"
      />
    </svg>
  );
}

export function EyeOffIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3.3 2.5 2 3.8l3.2 3.2C3.5 8.4 2.2 10 1.2 12c1 2.6 5.3 7 10.8 7 1.8 0 3.4-.5 4.9-1.2l3.1 3.1 1.3-1.3L3.3 2.5ZM12 16.7c-.7 0-1.4-.2-2-.5l1.4-1.4a2.8 2.8 0 0 0 3.4-3.4l1.4-1.4c.4.7.7 1.5.7 2.4a4.7 4.7 0 0 1-4.9 4.3Zm0-9.4c.4 0 .7 0 1 .1L11 9.3a2.8 2.8 0 0 0-1.7 1.7l-1.9 1.9a4.7 4.7 0 0 1 4.6-6.6Zm9.7 4.7c-.6 1.4-1.9 3-3.7 4.3l-1.4-1.4A9.9 9.9 0 0 0 19.5 12a13.1 13.1 0 0 0-8.3-6.4l-1.6-1.6c.8-.1 1.6-.2 2.4-.2 5.5 0 9.8 4.4 10.8 7Z"
        fill="#8390A2"
      />
    </svg>
  );
}

export function ErrorIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ marginRight: '4px', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" fill="#B00020" />
      <rect x="11" y="6" width="2" height="7" fill="#fff" />
      <rect x="11" y="15" width="2" height="2" fill="#fff" />
    </svg>
  );
}

export function SuccessIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ marginRight: '4px', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" fill="#1E7E34" />
      <path d="M7 12.5l3 3 7-7" stroke="#fff" strokeWidth="2" fill="none" />
    </svg>
  );
}
