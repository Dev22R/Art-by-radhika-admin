import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import clsx from 'clsx';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl'
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in" />
        <Dialog.Content
          className={clsx(
            'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-[95%] max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-amber-200/50 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 focus:outline-none animate-in zoom-in-95',
            maxWidth
          )}
        >
          <div className="flex items-start justify-between border-b border-stone-100 dark:border-zinc-800 pb-4 mb-6">
            <div>
              <Dialog.Title className="text-xl sm:text-2xl font-bold font-royal text-stone-900 dark:text-white">
                {title}
              </Dialog.Title>
              {subtitle && (
                <Dialog.Description className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {subtitle}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
