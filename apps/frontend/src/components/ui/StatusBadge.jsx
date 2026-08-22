import React from 'react';

const VARIANTS = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  mars: 'badge-mars',
  neutral: 'badge-neutral',
  purple: 'badge-purple'
};

export function StatusBadge({ variant = 'info', children, pulse = false, icon = null }) {
  return (
    <span className={`badge ${VARIANTS[variant] || VARIANTS.info}`}>
      {pulse && (
        <span
          style={{
            width: 4, height: 8,
            backgroundColor: 'currentColor',
            flexShrink: 0
          }}
        />
      )}
      {icon && <span style={{ fontSize: '0.7rem' }}>{icon}</span>}
      {children}
    </span>
  );
}
