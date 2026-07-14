import React from 'react';
import { Role } from '../services/types';

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
}

const ROLES: Role[] = ['Admin', 'Receptionist', 'Security Guard'];

function RoleSelector({ value, onChange }: RoleSelectorProps): React.ReactElement {
  return (
    <div
      role="radiogroup"
      aria-label="Select login role"
      style={{
        display: 'flex',
        width: 'var(--field-width)',
        background: 'var(--color-bg-pill-track)',
        borderRadius: 'var(--radius-pill-track)',
        padding: '4px',
        gap: '4px',
      }}
    >
      {ROLES.map((role) => {
        const isActive = role === value;
        return (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(role)}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: 'var(--radius-pill-active)',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              background: isActive ? 'var(--color-primary)' : 'transparent',
              color: isActive ? '#ffffff' : '#3C3C3C',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.15s ease',
            }}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
}

export default RoleSelector;
