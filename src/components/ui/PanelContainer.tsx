'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Variants ──────────────────────────────────────────────────────────────────

const panelVariants = cva(
  'flex flex-col overflow-hidden border border-[var(--border-base)] rounded-[var(--radius-lg)]',
  {
    variants: {
      surface: {
        default:  'bg-[var(--surface-secondary)]',
        elevated: 'bg-[var(--surface-elevated)] shadow-[var(--shadow-sm)]',
        panel:    'bg-[var(--surface-panel)]',
        inset:    'bg-[var(--surface-inset)] border-[var(--border-subtle)]',
      },
      accent: {
        none:     '',
        yellow:   'border-l-2 border-l-[var(--accent-primary)]',
        positive: 'border-l-2 border-l-[var(--status-positive)]',
        negative: 'border-l-2 border-l-[var(--status-negative)]',
        warning:  'border-l-2 border-l-[var(--status-warning)]',
        neutral:  'border-l-2 border-l-[var(--status-neutral)]',
      },
    },
    defaultVariants: {
      surface: 'default',
      accent:  'none',
    },
  }
);

// ── Props ─────────────────────────────────────────────────────────────────────

export interface PanelContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelVariants> {
  /** Short uppercase label in the header row */
  label?: string;
  /** Custom header — replaces the default label row */
  header?: React.ReactNode;
  /** Right-side header slot: action buttons or controls */
  action?: React.ReactNode;
  /** Footer content below a hairline border */
  footer?: React.ReactNode;
  /** Remove default body padding (e.g. for full-bleed charts) */
  noPadding?: boolean;
  /** Allow the panel to be collapsed by clicking the header */
  collapsible?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Callback when collapsed state changes (uncontrolled if omitted) */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Render a skeleton shimmer overlay over the body */
  loading?: boolean;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PanelContainer({
  children,
  className,
  surface,
  accent,
  label,
  header,
  action,
  footer,
  noPadding = false,
  collapsible = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  loading = false,
  'aria-label': ariaLabel,
  ...rest
}: PanelContainerProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = React.useCallback(() => {
    const next = !isCollapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }, [isCollapsed, onCollapsedChange]);

  const hasHeader =
    label !== undefined ||
    header !== undefined ||
    action !== undefined ||
    collapsible;

  return (
    <div
      className={cn(panelVariants({ surface, accent }), className)}
      aria-label={ariaLabel}
      {...rest}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      {hasHeader && (
        <div
          className={cn(
            'flex items-center justify-between px-4 py-[10px]',
            'border-b border-[var(--border-subtle)] bg-[var(--surface-panel)]',
            'shrink-0 min-h-[40px]',
            collapsible && 'cursor-pointer select-none hover:bg-[var(--surface-overlay)] transition-colors duration-100'
          )}
          onClick={collapsible ? handleToggle : undefined}
          role={collapsible ? 'button' : undefined}
          aria-expanded={collapsible ? !isCollapsed : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={collapsible ? (e) => e.key === 'Enter' && handleToggle() : undefined}
        >
          <div className="flex items-center gap-2 min-w-0">
            {label && (
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--text-muted)] truncate">
                {label}
              </span>
            )}
            {header}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {action && !collapsible && (
              <div className="flex items-center gap-2">{action}</div>
            )}
            {action && collapsible && !isCollapsed && (
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {action}
              </div>
            )}
            {collapsible && (
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ease-out',
                  isCollapsed && '-rotate-90'
                )}
                strokeWidth={1.75}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="panel-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className={cn('relative flex-1', !noPadding && 'p-4')}>
              {children}

              {/* Loading overlay */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    key="loading-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-10"
                    aria-hidden="true"
                  >
                    <LoadingSkeleton />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      {footer && !isCollapsed && (
        <div className="shrink-0 px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--surface-panel)]">
          {footer}
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <div className="skeleton h-3 w-1/3 rounded-sm" />
      <div className="skeleton h-8 w-2/3 rounded-sm" />
      <div className="skeleton h-3 w-1/2 rounded-sm" />
    </div>
  );
}
