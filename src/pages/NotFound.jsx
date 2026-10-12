import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-zinc-800 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-bold font-royal text-stone-900 dark:text-white">404</h1>
      <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200">
        Page Not Found
      </h2>
      <p className="text-xs sm:text-sm text-stone-500 max-w-md">
        The studio section you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
