'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Shield,
  BarChart3,
  Activity,
  FileBarChart,
  Settings2,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavSection } from '@/types/navigation';

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Analytics',
    items: [
      { label: 'Scenario Analysis', href: '/scenario', icon: TrendingUp,     badge: 'LIVE' },
      { label: 'Overview',          href: '/',         icon: LayoutDashboard },
      { label: 'Risk Exposure',     href: '/risk',     icon: Shield },
      { label: 'Hedge Portfolio',   href: '/hedge',    icon: BarChart3 },
      { label: 'Market Data',       href: '/market',   icon: Activity },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Reports',  href: '/reports',  icon: FileBarChart },
      { label: 'Settings', href: '/settings', icon: Settings2 },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   NavItem — 48px min-height, modern SaaS hover + active states
───────────────────────────────────────────────────────────────────────────── */

interface NavItemProps {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isActive: boolean;
  isPrimary?: boolean;
}

function NavItem({ label, href, icon: Icon, badge, isActive, isPrimary }: NavItemProps) {
  return (
    <Link href={href} className="block outline-none">
      <motion.div
        whileHover={{ x: 1 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className={cn(
          'group relative flex items-center gap-3.5 rounded-[12px] px-3.5 min-h-[48px]',
          'text-[15px] font-medium cursor-pointer select-none transition-all duration-150',
          isActive
            ? 'bg-[rgba(245,217,10,0.10)] text-[var(--accent-primary)]'
            : isPrimary
            ? [
                'bg-[rgba(245,217,10,0.05)] text-[var(--text-primary)]',
                'border border-[rgba(245,217,10,0.10)]',
                'hover:bg-[rgba(245,217,10,0.09)] hover:border-[rgba(245,217,10,0.18)]',
              ].join(' ')
            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]',
        )}
      >
        {/* Active left pill */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-full bg-[var(--accent-primary)]"
              initial={{ opacity: 0, scaleY: 0.5 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.5 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        <Icon
          className={cn(
            'shrink-0 transition-colors duration-150',
            isPrimary ? 'w-[19px] h-[19px]' : 'w-[18px] h-[18px]',
            isActive
              ? 'text-[var(--accent-primary)]'
              : isPrimary
              ? 'text-[var(--accent-muted)] group-hover:text-[var(--accent-secondary)]'
              : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]',
          )}
          strokeWidth={isActive || isPrimary ? 2 : 1.75}
        />

        {/* Label */}
        <span className={cn('flex-1 leading-none', isPrimary && !isActive && 'font-semibold')}>
          {label}
        </span>

        {/* Badge */}
        {badge && (
          <span className={cn(
            'inline-flex items-center px-[7px] py-[3px] rounded-full text-[10px] font-bold tracking-[0.06em] leading-none uppercase',
            isActive
              ? 'bg-[rgba(245,217,10,0.18)] text-[var(--accent-primary)] border border-[rgba(245,217,10,0.3)]'
              : 'bg-[rgba(245,217,10,0.08)] text-[var(--accent-muted)] border border-[rgba(245,217,10,0.15)]',
          )}>
            {badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sidebar
───────────────────────────────────────────────────────────────────────────── */

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-[200] flex w-[280px] flex-col"
      style={{
        backgroundColor: 'var(--surface-panel)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >

      {/* ── Brand ──────────────────────────────────────────────────── */}
      <div className="flex h-[72px] shrink-0 items-center gap-4 border-b border-[var(--border-subtle)] px-6">
        {/* Mark */}
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--accent-primary)]">
          <span className="text-[14px] font-black leading-none tracking-tight text-black">B</span>
          {/* Live status dot */}
          <span className="absolute -right-[3px] -top-[3px] h-[9px] w-[9px] rounded-full border-2 border-[var(--surface-panel)] bg-[var(--status-positive)]" />
        </div>

        {/* Wordmark */}
        <div className="flex flex-col gap-[5px] leading-none">
          <span className="text-[13.5px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">
            BAML
          </span>
          <span className="text-[11.5px] tracking-[0.03em] text-[var(--text-muted)]">
            Risk Intelligence
          </span>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-5">

        {/* Scenario Analysis — always first, always primary */}
        <div className="mb-5">
          <NavItem
            label="Scenario Analysis"
            href="/scenario"
            icon={TrendingUp}
            badge="LIVE"
            isActive={pathname === '/scenario'}
            isPrimary
          />
        </div>

        {/* Section groups */}
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((i) => i.href !== '/scenario');
          if (!items.length) return null;
          return (
            <div key={section.label} className="mb-6">
              <p className="mb-2 px-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {section.label}
              </p>
              <ul className="space-y-[2px]">
                {items.map((item) => (
                  <li key={item.href}>
                    <NavItem
                      label={item.label}
                      href={item.href}
                      icon={item.icon}
                      badge={item.badge}
                      isActive={pathname === item.href}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* ── User footer ────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[var(--border-subtle)] p-3">
        <button className="group flex w-full items-center gap-3.5 rounded-[12px] px-3.5 py-3.5 transition-colors duration-150 hover:bg-[var(--surface-overlay)]">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-dim)] border border-[rgba(245,217,10,0.15)]">
              <span className="text-[12px] font-bold leading-none text-[var(--accent-primary)]">TA</span>
            </div>
            <span className="absolute -bottom-px -right-px h-[10px] w-[10px] rounded-full border-2 border-[var(--surface-panel)] bg-[var(--status-positive)]" />
          </div>

          {/* Identity */}
          <div className="flex min-w-0 flex-1 flex-col gap-[4px] text-left leading-none">
            <span className="truncate text-[14px] font-semibold text-[var(--text-primary)]">
              Treasury Analyst
            </span>
            <span className="text-[12px] text-[var(--text-muted)]">EY Advisory</span>
          </div>

          {/* Expand icon — appears on hover */}
          <ChevronsUpDown
            className="h-[15px] w-[15px] shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            strokeWidth={1.75}
          />
        </button>
      </div>

    </aside>
  );
}
