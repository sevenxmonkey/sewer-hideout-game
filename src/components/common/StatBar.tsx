import React from 'react';

export const StatBar: React.FC<{ label: string; value: number; max?: number }> = ({
  label,
  value,
  max = 100,
}) => {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div style={{ margin: '4px 0' }}>
      <div style={{ fontSize: 12 }}>{label}</div>
      <div style={{ background: '#333', height: 8, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#61dafb' }} />
      </div>
    </div>
  );
};
