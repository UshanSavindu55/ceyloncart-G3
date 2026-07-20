import { useEffect } from 'react';

const toneClasses = {
  info: 'border-tea-200 bg-tea-50 text-brown-900',
  success: 'border-tea-300 bg-tea-100 text-brown-900',
  warning: 'border-spice-200 bg-spice-50 text-brown-900',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export default function Notification({ message, tone = 'info', autoDismissAfter, onDismiss }) {
  useEffect(() => {
    if (!message || !autoDismissAfter || !onDismiss) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onDismiss();
    }, autoDismissAfter);

    return () => window.clearTimeout(timeoutId);
  }, [autoDismissAfter, message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${toneClasses[tone] || toneClasses.info}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="leading-6">{message}</p>
        {onDismiss ? (
          <button
            type="button"
            className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-inherit underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown-900/20"
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}