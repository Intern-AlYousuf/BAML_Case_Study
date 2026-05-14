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
    label: 'Platform',
    items: [
      { label: 'Overview',          href: '/',         icon: LayoutDashboard },
      { label: 'Scenario Analysis', href: '/scenario', icon: TrendingUp,  badge: 'LIVE' },
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
    <aside className="fixed inset-y-0 left-0 w-[220px] flex flex-col bg-[var(--surface-panel)] border-r border-[var(--border-base)] z-[200]">

      {/* ── Brand ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 h-12 px-4 shrink-0 border-b border-[var(--border-base)]">
        <div className="w-[22px] h-[22px] bg-[var(--accent-primary)] rounded-[2px] flex items-center justify-center shrink-0">
          <span className="text-[9px] font-black text-black leading-none tracking-tight">B</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[11px] font-bold text-[var(--text-primary)] tracking-[0.12em] uppercase">
            BAML
          </span>
          <span className="text-[9px] text-[var(--text-muted)] tracking-[0.08em] uppercase mt-[3px]">
            Risk Intelligence
          </span>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scroll-thin py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--text-muted)]">
              {section.label}
            </p>
            <ul className="space-y-px">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className="block">
                      <motion.div
                        whileHover={{ x: 1 }}
                        transition={{ duration: 0.1, ease: 'easeOut' }}
                        className={cn(
                          'relative flex items-center gap-2.5 px-2 py-[7px] rounded-[4px] text-[13px] font-medium transition-colors duration-100 group cursor-pointer select-none',
                          isActive
                            ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]'
                        )}
                      >
                        {/* Active indicator */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.span
                              layoutId="sidebar-pill"
                              className="absolute left-0 top-[5px] bottom-[5px] w-[2px] bg-[var(--accent-primary)] rounded-full"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            />
                          )}
                        </AnimatePresence>

                        <item.icon
                          className={cn(
                            'w-[15px] h-[15px] shrink-0 transition-colors duration-100',
                            isActive
                              ? 'text-[var(--accent-primary)]'
                              : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                          )}
                          strokeWidth={isActive ? 2 : 1.75}
                        />

                        <span className="flex-1 leading-none">{item.label}</span>

                        {item.badge && (
                          <span className="text-[9px] font-bold tracking-[0.1em] text-[var(--accent-primary)] bg-[var(--accent-dim)] px-[5px] py-[2px] rounded-[2px] border border-[rgba(255,230,0,0.18)] leading-none">
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
      <div className="shrink-0 border-t border-[var(--border-base)] px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[3px] bg-[var(--surface-elevated)] border border-[var(--border-base)] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] leading-none">TA</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-semibold text-[var(--text-primary)] leading-none truncate">
              Treasury Analyst
            </span>
            <span className="text-[10px] text-[var(--text-muted)] leading-none mt-[3px]">
              EY Advisory
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
