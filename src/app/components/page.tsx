/**
 * Component Showcase — /components
 *
 * Visual reference for every dashboard primitive in isolation.
 * Useful during development and design reviews.
 */
import { MoreHorizontal, RefreshCw, Download } from 'lucide-react';

import {
  PanelContainer,
  KPIStatCard,
  DashboardGrid,
  GridItem,
  KPIRow,
  SectionHeader,
  PageSectionDivider,
  SignalBadge,
  SignalDot,
  LiveBadge,
  StatusBadge,
} from '@/components/ui';

// ── Shared stub controls ──────────────────────────────────────────────────────

function IconBtn({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <button className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-100">
      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComponentShowcasePage() {
  return (
    <div className="min-h-screen bg-[var(--surface-base)] p-8 space-y-12">
      <header className="space-y-1">
        <h1 className="page-title">Component Library</h1>
        <p className="text-[var(--text-muted)] text-sm">
          BAML Risk Intelligence Platform — dashboard primitives reference
        </p>
      </header>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SIGNAL BADGE */}
      {/* ══════════════════════════════════════════════════════════════ */}

      <section className="space-y-4">
        <SectionHeader
          title="SignalBadge"
          subtitle="Financial signal encoding — status, trend, live indicators"
          accent="dot"
        />

        {/* All variants × all sizes */}
        <PanelContainer label="All Variants">
          <div className="space-y-4">
            {(['xs', 'sm', 'md'] as const).map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-[var(--text-muted)] w-6">{size}</span>
                <SignalBadge variant="positive" size={size} label="Positive" />
                <SignalBadge variant="negative" size={size} label="Negative" />
                <SignalBadge variant="warning"  size={size} label="Warning"  />
                <SignalBadge variant="neutral"  size={size} label="Neutral"  />
                <SignalBadge variant="accent"   size={size} label="Accent"   />
                <SignalBadge variant="muted"    size={size} label="Muted"    />
              </div>
            ))}
          </div>
        </PanelContainer>

        {/* Trend arrows */}
        <PanelContainer label="With Trend Arrows">
          <div className="flex flex-wrap items-center gap-3">
            <SignalBadge variant="positive" arrow="up"   label="+3.42%"   />
            <SignalBadge variant="negative" arrow="down" label="−1.87%"   />
            <SignalBadge variant="warning"  arrow="up"   label="+0.12%"   />
            <SignalBadge variant="neutral"  arrow="none" label="0.00%"    />
          </div>
        </PanelContainer>

        {/* Live + dots + status */}
        <PanelContainer label="Live, Dot, Status Variants">
          <div className="flex flex-wrap items-center gap-3">
            <LiveBadge />
            <LiveBadge label="Feed Active" />
            <LiveBadge isLive={false} label="Offline" />
            <div className="flex items-center gap-1.5">
              <SignalDot variant="positive" pulse />
              <span className="text-xs text-[var(--text-muted)]">Connected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <SignalDot variant="negative" />
              <span className="text-xs text-[var(--text-muted)]">Disconnected</span>
            </div>
            <StatusBadge status="active"     />
            <StatusBadge status="hedged"     />
            <StatusBadge status="at risk"    />
            <StatusBadge status="near breach" />
            <StatusBadge status="draft"      />
            <StatusBadge status="archived"   />
          </div>
        </PanelContainer>
      </section>

      <PageSectionDivider label="Layout Primitives" />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SECTION HEADER */}
      {/* ══════════════════════════════════════════════════════════════ */}

      <section className="space-y-4">
        <SectionHeader
          title="SectionHeader"
          subtitle="Page section titles with accent, count, and action slots"
          accent="dot"
        />

        <DashboardGrid cols={2} gap="md">
          <PanelContainer surface="elevated">
            <div className="space-y-5 p-1">
              <SectionHeader title="No Accent" subtitle="Standard section title" />
              <SectionHeader title="Dot Accent" subtitle="Yellow bullet decoration" accent="dot" />
              <SectionHeader title="Line Accent" subtitle="Left border highlight" accent="line" />
              <SectionHeader
                title="With Count"
                subtitle="Scenario count badge"
                accent="dot"
                count={12}
              />
              <SectionHeader
                title="With Action"
                count={4}
                accent="dot"
                action={
                  <div className="flex gap-2">
                    <IconBtn icon={RefreshCw} />
                    <IconBtn icon={Download} />
                  </div>
                }
              />
            </div>
          </PanelContainer>

          <PanelContainer surface="elevated">
            <div className="space-y-5 p-1">
              <SectionHeader title="Small" size="sm" accent="dot" />
              <SectionHeader title="Medium (default)" size="md" accent="dot" />
              <SectionHeader title="Large" size="lg" accent="dot" />
              <PageSectionDivider label="Divider with label" spacing="sm" />
              <SectionHeader
                title="Divided Layout"
                subtitle="Renders border-bottom"
                layout="divided"
                accent="line"
                action={<IconBtn icon={MoreHorizontal} />}
              />
            </div>
          </PanelContainer>
        </DashboardGrid>
      </section>

      <PageSectionDivider />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* KPI STAT CARD */}
      {/* ══════════════════════════════════════════════════════════════ */}

      <section className="space-y-4">
        <SectionHeader
          title="KPIStatCard"
          subtitle="Metric display cards — size, accent, signal, loading variants"
          accent="dot"
        />

        {/* Hairline grid row */}
        <KPIRow cols={4}>
          <KPIStatCard
            label="Net FX Exposure"
            value="1.284"
            unit="$B"
            unitPosition="prefix"
            delta="+$42.3M"
            deltaLabel="vs prior day"
            signal="positive"
            accent="positive"
          />
          <KPIStatCard
            label="VaR 95 (1D)"
            value="18.4"
            unit="$M"
            unitPosition="prefix"
            delta="−$2.1M"
            deltaLabel="vs prior day"
            signal="negative"
            accent="negative"
          />
          <KPIStatCard
            label="Hedge Coverage"
            value="78.3"
            unit="%"
            unitPosition="suffix"
            delta="+1.4%"
            deltaLabel="MTD"
            signal="positive"
            accent="yellow"
          />
          <KPIStatCard
            label="Active Scenarios"
            value="14"
            subtext="3 pending review"
            signal="neutral"
          />
        </KPIRow>

        {/* Size variants */}
        <PanelContainer label="Size Variants">
          <DashboardGrid cols={3} gap="md">
            <KPIStatCard
              size="sm"
              label="Small Card"
              value="$824.5M"
              delta="+2.1%"
              signal="positive"
              accent="positive"
            />
            <KPIStatCard
              size="md"
              label="Medium Card"
              value="$824.5M"
              delta="+2.1%"
              deltaLabel="vs prior day"
              signal="positive"
              accent="positive"
            />
            <KPIStatCard
              size="lg"
              label="Large Card"
              value="$824.5M"
              delta="+2.1%"
              deltaLabel="YTD"
              signal="positive"
              accent="yellow"
            />
          </DashboardGrid>
        </PanelContainer>

        {/* Loading state */}
        <PanelContainer label="Loading State">
          <DashboardGrid cols={4} gap="md">
            <KPIStatCard label="Net Exposure" value="—" loading />
            <KPIStatCard label="VaR 95"       value="—" loading />
            <KPIStatCard label="DV01"         value="—" loading />
            <KPIStatCard label="Hedge Ratio"  value="—" loading />
          </DashboardGrid>
        </PanelContainer>

        {/* All accent variants */}
        <PanelContainer label="Accent Variants">
          <DashboardGrid cols={6} gap="hairline">
            {(['none','yellow','positive','negative','warning','neutral'] as const).map((a) => (
              <KPIStatCard
                key={a}
                label={a.toUpperCase()}
                value="$1.28B"
                delta="+2.3%"
                signal={a === 'positive' ? 'positive' : a === 'negative' ? 'negative' : a === 'warning' ? 'warning' : 'neutral'}
                accent={a}
                size="sm"
              />
            ))}
          </DashboardGrid>
        </PanelContainer>
      </section>

      <PageSectionDivider />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* PANEL CONTAINER */}
      {/* ══════════════════════════════════════════════════════════════ */}

      <section className="space-y-4">
        <SectionHeader
          title="PanelContainer"
          subtitle="Institutional panel wrapper — surface, accent, collapsible, loading"
          accent="dot"
        />

        <DashboardGrid cols={2} gap="md">
          {/* Surface variants */}
          <div className="space-y-3">
            <PanelContainer label="Default Surface">
              <p className="text-sm text-[var(--text-muted)]">surface="default"</p>
            </PanelContainer>
            <PanelContainer label="Elevated Surface" surface="elevated">
              <p className="text-sm text-[var(--text-muted)]">surface="elevated"</p>
            </PanelContainer>
            <PanelContainer label="Panel Surface" surface="panel">
              <p className="text-sm text-[var(--text-muted)]">surface="panel"</p>
            </PanelContainer>
            <PanelContainer label="Inset Surface" surface="inset">
              <p className="text-sm text-[var(--text-muted)]">surface="inset"</p>
            </PanelContainer>
          </div>

          {/* Accent + collapsible + loading */}
          <div className="space-y-3">
            <PanelContainer label="Yellow Accent" accent="yellow">
              <p className="text-sm text-[var(--text-muted)]">accent="yellow"</p>
            </PanelContainer>
            <PanelContainer label="Positive Accent" accent="positive">
              <p className="text-sm text-[var(--text-muted)]">accent="positive"</p>
            </PanelContainer>
            <PanelContainer
              label="Collapsible Panel"
              collapsible
              action={<IconBtn icon={MoreHorizontal} />}
            >
              <p className="text-sm text-[var(--text-muted)]">Click header to collapse</p>
            </PanelContainer>
            <PanelContainer label="Loading Panel" loading>
              <p className="text-sm text-[var(--text-muted)]">Content behind skeleton</p>
            </PanelContainer>
          </div>
        </DashboardGrid>

        {/* Header + footer slots */}
        <PanelContainer
          header={
            <div className="flex items-center gap-2">
              <SignalDot variant="positive" pulse />
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                Risk Monitor
              </span>
              <LiveBadge size="xs" />
            </div>
          }
          action={
            <div className="flex items-center gap-1.5">
              <StatusBadge status="active" size="xs" />
              <IconBtn icon={RefreshCw} />
              <IconBtn icon={MoreHorizontal} />
            </div>
          }
          footer={
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span>Last updated: 09:41:22 UTC</span>
              <span>14 active scenarios</span>
            </div>
          }
          accent="yellow"
        >
          <p className="text-sm text-[var(--text-secondary)]">
            Panel with custom header, action slot, footer, and yellow accent.
          </p>
        </PanelContainer>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* DASHBOARD GRID */}
      {/* ══════════════════════════════════════════════════════════════ */}

      <section className="space-y-4">
        <SectionHeader
          title="DashboardGrid"
          subtitle="Responsive grid system — gap variants, col/row span, KPIRow"
          accent="dot"
        />

        <PanelContainer label="Gap Variants">
          <div className="space-y-6">
            {(['none', 'hairline', 'sm', 'md', 'lg'] as const).map((gap) => (
              <div key={gap}>
                <p className="data-label mb-2">gap="{gap}"</p>
                <DashboardGrid cols={4} gap={gap}>
                  {[1,2,3,4].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-[var(--surface-secondary)] border border-[var(--border-base)] rounded flex items-center justify-center"
                    >
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{i}</span>
                    </div>
                  ))}
                </DashboardGrid>
              </div>
            ))}
          </div>
        </PanelContainer>

        <PanelContainer label="Column Span">
          <DashboardGrid cols={4} gap="md">
            <GridItem colSpan={2}>
              <div className="h-16 bg-[var(--surface-elevated)] border border-[var(--border-base)] rounded flex items-center justify-center">
                <span className="text-[11px] text-[var(--text-muted)] font-mono">colSpan=2</span>
              </div>
            </GridItem>
            <GridItem colSpan={1}>
              <div className="h-16 bg-[var(--surface-elevated)] border border-[var(--border-base)] rounded flex items-center justify-center">
                <span className="text-[11px] text-[var(--text-muted)] font-mono">1</span>
              </div>
            </GridItem>
            <GridItem colSpan={1}>
              <div className="h-16 bg-[var(--surface-elevated)] border border-[var(--border-base)] rounded flex items-center justify-center">
                <span className="text-[11px] text-[var(--text-muted)] font-mono">1</span>
              </div>
            </GridItem>
          </DashboardGrid>
        </PanelContainer>
      </section>

      <div className="h-16" />
    </div>
  );
}
