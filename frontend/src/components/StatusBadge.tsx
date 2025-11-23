import React from 'react';

interface StatusBadgeProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ value, label, size = 'md' }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  let dotClass = 'bg-gray-400';

  if (value >= 0.8) {
    colorClass = 'bg-green-100 text-green-800 border-green-200';
    dotClass = 'bg-green-500';
  } else if (value >= 0.5) {
    colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    dotClass = 'bg-yellow-500';
  } else {
    colorClass = 'bg-red-100 text-red-800 border-red-200';
    dotClass = 'bg-red-500';
  }

  const percentage = Math.round(value * 100);
  const displayLabel = label || `${percentage}% Confidence`;

  return (
    <span className={`inline-flex items-center rounded-full border ${colorClass} px-2.5 py-0.5 text-xs font-medium`}>
      <span className={`mr-1.5 h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
      {displayLabel}
    </span>
  );
};
