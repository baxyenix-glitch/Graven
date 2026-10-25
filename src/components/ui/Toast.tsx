'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle, Info, X, ExternalLink, ShieldCheck } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, 0 = persistent modal
  actionLabel?: string;
  onAction?: () => void;
  isModal?: boolean; // If true, renders as an interactive focused modal
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
  hideToast: (id?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

// Global event bus for invoking toast outside of React component trees
type ToastListener = (toast: ToastOptions) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  show: (options: ToastOptions | string) => {
    const opts: ToastOptions =
      typeof options === 'string'
        ? { message: options, type: 'info' }
        : options;
    const toastItem: ToastOptions = {
      id: opts.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: opts.type || 'info',
      title: opts.title,
      message: opts.message,
      duration: opts.duration ?? (opts.isModal ? 0 : 5000),
      actionLabel: opts.actionLabel,
      onAction: opts.onAction,
      isModal: opts.isModal ?? false,
    };
    listeners.forEach((l) => l(toastItem));
  },
  info: (message: string, title?: string, options?: Partial<ToastOptions>) => {
    toast.show({ ...options, message, title: title || 'NOTICE', type: 'info' });
  },
  success: (message: string, title?: string, options?: Partial<ToastOptions>) => {
    toast.show({ ...options, message, title: title || 'SUCCESS', type: 'success' });
  },
  warning: (message: string, title?: string, options?: Partial<ToastOptions>) => {
    toast.show({ ...options, message, title: title || 'ATTENTION', type: 'warning' });
  },
  error: (message: string, title?: string, options?: Partial<ToastOptions>) => {
    toast.show({ ...options, message, title: title || 'ERROR', type: 'error' });
  },
  modal: (message: string, title: string = 'GRAVEN NOTICE', options?: Partial<ToastOptions>) => {
    toast.show({
      ...options,
      message,
      title,
      type: options?.type || 'warning',
      isModal: true,
      duration: 0,
    });
  },
};

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);
  const [modalToast, setModalToast] = useState<ToastOptions | null>(null);

  useEffect(() => {
    const handleNewToast: ToastListener = (newToast) => {
      if (newToast.isModal) {
        setModalToast(newToast);
        return;
      }
      setToasts((prev) => [...prev.filter((t) => t.id !== newToast.id), newToast]);

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, newToast.duration);
      }
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, []);

  const hideToast = useCallback((id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      if (modalToast?.id === id) setModalToast(null);
    } else {
      setModalToast(null);
    }
  }, [modalToast]);

  const showToast = useCallback((options: ToastOptions | string) => {
    toast.show(options);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* 1. FLOATING TOASTS (TOP RIGHT ON DESKTOP, TOP CENTER ON MOBILE - z-[80]) */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[80] flex flex-col gap-2.5 max-w-[90vw] sm:max-w-md pointer-events-none">
        <AnimatePresence>
          {toasts.map((item) => {
            const isError = item.type === 'error';
            const isWarning = item.type === 'warning';
            const isSuccess = item.type === 'success';

            const bgClass = isError
              ? 'bg-[#FF4D6D] text-white border-[#0A0F2E]'
              : isWarning
              ? 'bg-[#FFE66D] text-[#0A0F2E] border-[#0A0F2E]'
              : isSuccess
              ? 'bg-[#6CF2C2] text-[#0A0F2E] border-[#0A0F2E]'
              : 'bg-[#1237E8] text-white border-[#0A0F2E]';

            const IconComponent = isError
              ? XCircle
              : isWarning
              ? AlertTriangle
              : isSuccess
              ? CheckCircle2
              : Info;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={`pointer-events-auto w-full p-4 rounded-[16px] border-[2.5px] border-[#0A0F2E] shadow-[4px_4px_0_#0A0F2E] flex items-start gap-3 relative ${bgClass}`}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 border border-current flex items-center justify-center shrink-0 mt-0.5">
                  <IconComponent className="w-4 h-4" />
                </div>

                <div className="flex-1 pr-6">
                  {item.title && (
                    <div className="font-heading uppercase text-xs tracking-wider opacity-90 mb-0.5">
                      {item.title}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm font-body font-bold leading-snug">
                    {item.message}
                  </p>
                  {item.actionLabel && item.onAction && (
                    <button
                      type="button"
                      onClick={() => {
                        item.onAction?.();
                        hideToast(item.id);
                      }}
                      className="mt-2 text-xs font-ui font-bold underline cursor-pointer uppercase"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => hideToast(item.id)}
                  aria-label="Close notification"
                  className="absolute top-3 right-3 opacity-70 hover:opacity-100 p-1 rounded-full cursor-pointer transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 2. CUSTOM BRANDED MODAL NOTIFICATION (REPLACES BROWSER ALERT) */}
      <AnimatePresence>
        {modalToast && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalToast(null)}
              className="absolute inset-0 bg-[#0A0F2E]/70 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm sm:max-w-md bg-white border-[3px] border-[#0A0F2E] rounded-[28px] p-6 sm:p-7 shadow-[8px_8px_0_#0A0F2E] text-[#0A0F2E] overflow-hidden"
            >
              {/* Header Badge & Mascot */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#E4FF6B] border-[2px] border-[#0A0F2E] shadow-[2px_2px_0_#0A0F2E] flex items-center justify-center overflow-hidden shrink-0">
                    <Image
                      src="/assets/logo.png"
                      alt="Graven Mascot"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <span className="bento-pill bg-[#FF9CCB]">
                      {modalToast.type === 'error'
                        ? 'ERROR'
                        : modalToast.type === 'warning'
                        ? 'WALLET NOTICE'
                        : 'NOTICE'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalToast(null)}
                  className="btn-icon w-8 h-8 rounded-[10px]"
                >
                  <X className="w-4 h-4 text-[#0A0F2E]" />
                </button>
              </div>

              {/* Title */}
              <h3 className="font-heading text-xl sm:text-2xl uppercase tracking-tight text-[#0A0F2E] mb-2 leading-tight">
                {modalToast.title || 'GRAVEN NOTICE'}
              </h3>

              {/* Message */}
              <p className="font-body text-xs sm:text-sm text-[#0A0F2E]/80 font-medium leading-relaxed mb-6">
                {modalToast.message}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                {modalToast.actionLabel && modalToast.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      modalToast.onAction?.();
                      setModalToast(null);
                    }}
                    className="flex-1 btn-bento btn-cobalt text-xs justify-center"
                  >
                    <span>{modalToast.actionLabel}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalToast(null)}
                  className="flex-1 btn-bento btn-cyan text-xs justify-center"
                >
                  <span>GOT IT</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
