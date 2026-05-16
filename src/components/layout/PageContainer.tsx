import { cn } from '@/lib/utils';

/**
 * PageContainer — centered, max-width content wrapper for standard pages.
 *
 * Usage:
 *   <DashboardShell ...>
 *     <PageContainer>
 *       ... page content ...
 *     </PageContainer>
 *   </DashboardShell>
 *
 * size variants:
 *   narrow  — max 1024px  (focused single-column pages)
 *   default — max 1440px  (standard dashboards)
 *   wide    — max 1680px  (data-heavy grid pages)
 *   full    — no max-width (workspace / full-bleed layouts like Scenario)
 */

interface PageContainerProps {
  children: React.ReactNode;
  size?: 'narrow' | 'default' | 'wide' | 'full';
  /** Override the default vertical + horizontal padding. */
  className?: string;
}

const sizeClasses: Record<NonNullable<PageContainerProps['size']>, string> = {
  narrow:  'max-w-[1024px]',
  default: 'max-w-[1440px]',
  wide:    'max-w-[1680px]',
  full:    'max-w-none',
};

export function PageContainer({
  children,
  size = 'default',
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto px-10 py-10',
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * PageHeader — consistent page-level heading row.
 *
 * Provides the title + optional subtitle and right-side action slot
 * used at the top of every standard page.
 */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-6 mb-10">
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)] leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] text-[var(--text-muted)] leading-none">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
