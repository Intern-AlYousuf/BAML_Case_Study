import { cn } from '@/lib/utils';

interface PanelContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Short uppercase label rendered in the panel header */
  label?: string;
  /** Custom header content — replaces the default label row */
  header?: React.ReactNode;
  /** Slot for action buttons or controls in the header right side */
  action?: React.ReactNode;
  /** Footer content rendered below a hairline border */
  footer?: React.ReactNode;
  /** Remove default body padding (e.g. for full-bleed charts) */
  noPadding?: boolean;
  /** Raise the panel surface one layer above the default */
  elevated?: boolean;
  /** Accent left border variant — 'yellow' | 'positive' | 'negative' */
  accent?: 'yellow' | 'positive' | 'negative';
}

const ACCENT_BORDER: Record<string, string> = {
  yellow:   'border-l-2 border-l-[var(--accent-primary)]',
  positive: 'border-l-2 border-l-[var(--status-positive)]',
  negative: 'border-l-2 border-l-[var(--status-negative)]',
};

export function PanelContainer({
  children,
  className,
  label,
  header,
  action,
  footer,
  noPadding = false,
  elevated = false,
  accent,
}: PanelContainerProps) {
  const hasHeader = label !== undefined || header !== undefined || action !== undefined;

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden',
        elevated
          ? 'bg-[var(--surface-elevated)] border border-[var(--border-base)] rounded-[6px] shadow-[0_1px_4px_rgba(0,0,0,0.5)]'
          : 'bg-[var(--surface-secondary)] border border-[var(--border-base)] rounded-[6px]',
        accent && ACCENT_BORDER[accent],
        className
      )}
    >
      {/* Header */}
      {hasHeader && (
        <div className="flex items-center justify-between px-4 py-[10px] border-b border-[var(--border-subtle)] bg-[var(--surface-panel)] shrink-0 min-h-[40px]">
          <div className="flex items-center gap-2">
            {label && (
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--text-muted)]">
                {label}
              </span>
            )}
            {header}
          </div>
          {action && (
            <div className="flex items-center gap-2 shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={cn('flex-1', !noPadding && 'p-4')}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="shrink-0 px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--surface-panel)]">
          {footer}
        </div>
      )}
    </div>
  );
}
