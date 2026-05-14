'use client';

import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardShellProps {
  children: React.ReactNode;
  /** Page title shown in the topbar when no breadcrumb is provided */
  title?: string;
  /** Ordered breadcrumb segments — last item is the current page */
  breadcrumb?: string[];
}

const contentVariants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardShell({ children, title, breadcrumb }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--surface-base)]">
      <Sidebar />
      <Topbar title={title} breadcrumb={breadcrumb} />

      {/* Main content — offset for fixed sidebar + topbar */}
      <main className="ml-[220px] pt-12 min-h-screen">
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
