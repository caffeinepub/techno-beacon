import React from 'react';

interface SourceBadgeProps {
  source: string;
  className?: string;
}

const SOURCE_COLORS: Record<string, string> = {
  'Resident Advisor': 'bg-neon-amber/20 text-neon-amber border-neon-amber/40',
  'Bandsintown': 'bg-neon-green/20 text-neon-green border-neon-green/40',
  'Festicket': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
};

export default function SourceBadge({ source, className = '' }: SourceBadgeProps) {
  const colorClass = SOURCE_COLORS[source] || 'bg-neon-amber/20 text-neon-amber border-neon-amber/40';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border rounded-sm ${colorClass} ${className}`}
    >
      {source === 'Resident Advisor' ? 'RA' : source}
    </span>
  );
}
