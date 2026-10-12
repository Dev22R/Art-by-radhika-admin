import React from 'react';
import clsx from 'clsx';

export const StatusBadge = ({ status, className = '' }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'confirmed':
      case 'published':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'new':
      case 'in review':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'draft':
      case 'archived':
        return 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';
      case 'blocked':
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-stone-800 dark:text-stone-300';
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200',
        getStyles(),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
