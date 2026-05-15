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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-[260px] flex flex-col bg-[var(--surface-panel)] border-r border-[var(--border-subtle)] z-[200]">

      {/* ── Brand ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 h-14 px-5 shrink-0 border-b border-[var(--border-subtle)]">
        <div className="w-7 h-7 bg-[var(--accent-primary)] rounded-[4px] flex items-center justify-center shrink-0">
          <span className="text-[11px] font-black text-black leading-none tracking-tight">B</span>
        </div>
        <div className="flex flex-col leading-none gap-[4px]">
          <span className="text-[12px] font-bold text-[var(--text-primary)] tracking-[0.14em] uppercase">
            BAML
          </span>
          <span className="text-[10.5px] text-[var(--text-muted)] tracking-[0.06em]">
            Risk Intelligence
          </span>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scroll-thin py-4 px-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-2.5 mb-2 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)]">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className="block">
                      <motion.div
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        className={cn(
                          'relative flex items-center gap-3 px-2.5 rounded-[6px] text-[14px] font-medium transition-colors duration-100 group cursor-pointer select-none',
                          item.href === '/scenario' ? 'py-3' : 'py-2.5',
                          isActive
                            ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)]'
                            : item.href === '/scenario'
                            ? 'text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]'
                        )}
                      >
                        {/* Active indicator */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.span
                              layoutId="sidebar-pill"
                              className="absolute left-0 top-[6px] bottom-[6px] w-[2.5px] bg-[var(--accent-primary)] rounded-full"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            />
                          )}
                        </AnimatePresence>

                        <item.icon
                          className={cn(
                            'w-[16px] h-[16px] shrink-0 transition-colors duration-100',
                            isActive
                              ? 'text-[var(--accent-primary)]'
                              : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                          )}
                          strokeWidth={isActive ? 2 : 1.75}
                        />

                        <span className="flex-1 leading-none">{item.label}</span>

                        {item.badge && (
                          <span className="text-[9px] font-bold tracking-[0.1em] text-[var(--accent-primary)] bg-[var(--accent-dim)] px-[5px] py-[2.5px] rounded-[3px] border border-[rgba(255,230,0,0.18)] leading-none">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── User footer ────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[var(--border-subtle)] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[5px] bg-[var(--surface-elevated)] border border-[var(--border-base)] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] leading-none">TA</span>
          </div>
          <div className="flex flex-col min-w-0 gap-[3px]">
            <span className="text-[13px] font-semibold text-[var(--text-primary)] leading-none truncate">
              Treasury Analyst
            </span>
            <span className="text-[11px] text-[var(--text-muted)] leading-none">
              EY Advisory
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
