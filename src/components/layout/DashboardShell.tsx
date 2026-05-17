'use client';

import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: string[];
}

const contentVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0  },
};

export function DashboardShell({ children, title, breadcrumb }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--surface-base)]">
      <Sidebar />
      <Topbar title={title} breadcrumb={breadcrumb} />

      {/* Content — offset for 280px sidebar + 80px topbar */}
      <main className="ml-[280px] pt-[80px] min-h-screen">
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
