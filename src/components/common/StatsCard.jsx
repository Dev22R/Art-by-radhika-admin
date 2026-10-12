import React from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';

export const StatsCard = ({ title, value, change, isPositive, icon: Icon, color = 'amber' }) => {
  const colorMap = {
    amber: {
      bg: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/30',
      highlight: 'text-amber-700 dark:text-amber-400'
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30',
      highlight: 'text-emerald-700 dark:text-emerald-400'
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-600/5',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/30',
      highlight: 'text-rose-700 dark:text-rose-400'
    },
    purple: {
      bg: 'from-purple-500/10 to-purple-600/5',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/30',
      highlight: 'text-purple-700 dark:text-purple-400'
    }
  };

  const currentTheme = colorMap[color] || colorMap.amber;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={clsx(
        'relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br transition-all duration-300 shadow-sm backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80',
        currentTheme.bg,
        currentTheme.border
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold font-royal tracking-tight text-stone-900 dark:text-white">
            {value}
          </h3>
        </div>
        <div className={clsx('p-3 rounded-2xl shadow-lg', currentTheme.iconBg)}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium">
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold',
              isPositive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
            )}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span className="text-stone-400 dark:text-stone-500">vs last month</span>
        </div>
      )}

      {/* Decorative luxury ornament accent */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />
    </motion.div>
  );
};

export default StatsCard;
