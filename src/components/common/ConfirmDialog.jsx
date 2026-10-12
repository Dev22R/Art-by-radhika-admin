import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon: Icon = AlertTriangle,
  confirmVariant = 'danger',
  isLoading = false,
  loadingText = 'Processing...'
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-[95%] max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 focus:outline-none animate-in zoom-in-95">
          <div className="flex items-start gap-4">
            <div
              className={clsx(
                'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md',
                confirmVariant === 'danger' && 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
                confirmVariant === 'warning' && 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
                confirmVariant === 'success' && 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
                confirmVariant === 'primary' && 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              )}
            >
              <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-lg font-bold font-royal text-stone-900 dark:text-white leading-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                {description}
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={clsx(
                'px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer',
                confirmVariant === 'danger' && 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25',
                confirmVariant === 'warning' && 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25',
                confirmVariant === 'success' && 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25',
                confirmVariant === 'primary' && 'bg-amber-700 hover:bg-amber-800 shadow-amber-800/25'
              )}
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {loadingText}
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmDialog;
