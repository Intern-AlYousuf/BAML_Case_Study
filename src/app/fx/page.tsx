'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { KPIStatCard } from '@/components/ui/KPIStatCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

type Currency = 'USD/INR' | 'USD/NGN';
type Horizon  = '3M' | '6M' | '12M' | '24M';

const HORIZON_OPTIONS: Horizon[]  = ['3M', '6M', '12M', '24M'];
const CURRENCY_OPTIONS: Currency[] = ['USD/INR', 'USD/NGN'];

/* ─────────────────────────────────────────────────────────────────────────────
   Currency config
───────────────────────────────────────────────────────────────────────────── */

const CURRENCY_CONFIG: Record<Currency, {
  base: string;
  current: number;
  flag: string;
  description: string;
  formatRate: (v: number) => string;
  formatAxis: (v: number) => string;
  baseRange: [number, number]; // for distribution highlight
}> = {
  'USD/INR': {
    base: 'INR',
    current: 83.82,
    flag: '🇮🇳',
    description: 'Indian Rupee · RBI managed float',
    formatRate: (v) => v.toFixed(2),
    formatAxis: (v) => v.toFixed(1),
    baseRange: [84, 88],
  },
  'USD/NGN': {
    base: 'NGN',
    current: 1582.40,
    flag: '🇳🇬',
    description: 'Nigerian Naira · CBN managed float',
    formatRate: (v) => v >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 0 }) : v.toFixed(0),
    formatAxis: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0),
    baseRange: [1600, 2200],
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Forecast data
───────────────────────────────────────────────────────────────────────────── */

interface DataPoint {
  date: string;
  forecast: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
  actual?: number;
}

const FORECAST_DATA: Record<Currency, Record<Horizon, DataPoint[]>> = {
  'USD/INR': {
    '3M': [
      { date: 'Dec 25', actual: 84.12, forecast: 84.12, p10: 84.12, p25: 84.12, p75: 84.12, p90: 84.12 },
      { date: 'Jan 26', actual: 84.35, forecast: 84.35, p10: 84.35, p25: 84.35, p75: 84.35, p90: 84.35 },
      { date: 'Feb 26', actual: 83.82, forecast: 83.82, p10: 83.82, p25: 83.82, p75: 83.82, p90: 83.82 },
      { date: 'Mar 26', forecast: 84.20, p10: 83.10, p25: 83.55, p75: 84.85, p90: 85.50 },
      { date: 'Apr 26', forecast: 84.38, p10: 82.90, p25: 83.60, p75: 85.12, p90: 86.00 },
      { date: 'May 26', forecast: 84.55, p10: 83.10, p25: 83.80, p75: 85.30, p90: 86.10 },
    ],
    '6M': [
      { date: 'Dec 25', actual: 84.12, forecast: 84.12, p10: 84.12, p25: 84.12, p75: 84.12, p90: 84.12 },
      { date: 'Jan 26', actual: 84.35, forecast: 84.35, p10: 84.35, p25: 84.35, p75: 84.35, p90: 84.35 },
      { date: 'Feb 26', actual: 83.82, forecast: 83.82, p10: 83.82, p25: 83.82, p75: 83.82, p90: 83.82 },
      { date: 'Mar 26', forecast: 84.20, p10: 83.05, p25: 83.60, p75: 84.80, p90: 85.45 },
      { date: 'Apr 26', forecast: 84.42, p10: 82.80, p25: 83.52, p75: 85.32, p90: 86.20 },
      { date: 'May 26', forecast: 84.68, p10: 82.55, p25: 83.48, p75: 85.88, p90: 87.10 },
      { date: 'Jun 26', forecast: 84.92, p10: 82.25, p25: 83.40, p75: 86.44, p90: 87.90 },
      { date: 'Jul 26', forecast: 85.10, p10: 82.00, p25: 83.32, p75: 86.88, p90: 88.20 },
      { date: 'Aug 26', forecast: 85.20, p10: 82.40, p25: 83.60, p75: 86.80, p90: 88.40 },
    ],
    '12M': [
      { date: 'Dec 25', actual: 84.12, forecast: 84.12, p10: 84.12, p25: 84.12, p75: 84.12, p90: 84.12 },
      { date: 'Jan 26', actual: 84.35, forecast: 84.35, p10: 84.35, p25: 84.35, p75: 84.35, p90: 84.35 },
      { date: 'Feb 26', actual: 83.82, forecast: 83.82, p10: 83.82, p25: 83.82, p75: 83.82, p90: 83.82 },
      { date: 'Mar 26', forecast: 84.20, p10: 83.00, p25: 83.60, p75: 84.80, p90: 85.40 },
      { date: 'Apr 26', forecast: 84.44, p10: 82.70, p25: 83.48, p75: 85.40, p90: 86.30 },
      { date: 'May 26', forecast: 84.70, p10: 82.40, p25: 83.40, p75: 86.00, p90: 87.20 },
      { date: 'Jun 26', forecast: 84.98, p10: 82.10, p25: 83.28, p75: 86.66, p90: 88.20 },
      { date: 'Jul 26', forecast: 85.32, p10: 81.80, p25: 83.18, p75: 87.44, p90: 89.40 },
      { date: 'Aug 26', forecast: 85.68, p10: 81.50, p25: 83.08, p75: 88.24, p90: 90.50 },
      { date: 'Sep 26', forecast: 86.02, p10: 81.20, p25: 82.96, p75: 88.86, p90: 91.40 },
      { date: 'Oct 26', forecast: 86.36, p10: 80.90, p25: 82.78, p75: 89.58, p90: 92.40 },
      { date: 'Nov 26', forecast: 86.62, p10: 80.70, p25: 82.62, p75: 90.00, p90: 92.90 },
      { date: 'Dec 26', forecast: 86.80, p10: 80.50, p25: 83.00, p75: 90.20, p90: 93.50 },
    ],
    '24M': [
      { date: 'Dec 25', actual: 84.12, forecast: 84.12, p10: 84.12, p25: 84.12, p75: 84.12, p90: 84.12 },
      { date: 'Mar 26', forecast: 84.22, p10: 83.00, p25: 83.60, p75: 84.82, p90: 85.42 },
      { date: 'Jun 26', forecast: 85.02, p10: 82.00, p25: 83.28, p75: 86.72, p90: 88.22 },
      { date: 'Sep 26', forecast: 86.12, p10: 81.00, p25: 82.98, p75: 89.04, p90: 91.52 },
      { date: 'Dec 26', forecast: 87.22, p10: 80.00, p25: 82.48, p75: 91.82, p90: 95.02 },
      { date: 'Mar 27', forecast: 88.12, p10: 79.00, p25: 81.98, p75: 93.82, p90: 98.02 },
      { date: 'Jun 27', forecast: 88.82, p10: 78.50, p25: 81.98, p75: 95.52, p90: 101.02 },
      { date: 'Sep 27', forecast: 89.22, p10: 78.20, p25: 81.98, p75: 96.42, p90: 102.52 },
      { date: 'Dec 27', forecast: 89.50, p10: 78.00, p25: 83.50, p75: 96.00, p90: 104.00 },
    ],
  },

  'USD/NGN': {
    '3M': [
      { date: 'Dec 25', actual: 1535, forecast: 1535, p10: 1535, p25: 1535, p75: 1535, p90: 1535 },
      { date: 'Jan 26', actual: 1559, forecast: 1559, p10: 1559, p25: 1559, p75: 1559, p90: 1559 },
      { date: 'Feb 26', actual: 1582, forecast: 1582, p10: 1582, p25: 1582, p75: 1582, p90: 1582 },
      { date: 'Mar 26', forecast: 1612, p10: 1488, p25: 1552, p75: 1672, p90: 1742 },
      { date: 'Apr 26', forecast: 1628, p10: 1482, p25: 1548, p75: 1712, p90: 1792 },
      { date: 'May 26', forecast: 1645, p10: 1480, p25: 1558, p75: 1742, p90: 1842 },
    ],
    '6M': [
      { date: 'Dec 25', actual: 1535, forecast: 1535, p10: 1535, p25: 1535, p75: 1535, p90: 1535 },
      { date: 'Jan 26', actual: 1559, forecast: 1559, p10: 1559, p25: 1559, p75: 1559, p90: 1559 },
      { date: 'Feb 26', actual: 1582, forecast: 1582, p10: 1582, p25: 1582, p75: 1582, p90: 1582 },
      { date: 'Mar 26', forecast: 1613, p10: 1484, p25: 1549, p75: 1675, p90: 1746 },
      { date: 'Apr 26', forecast: 1632, p10: 1470, p25: 1542, p75: 1722, p90: 1804 },
      { date: 'May 26', forecast: 1655, p10: 1456, p25: 1536, p75: 1774, p90: 1874 },
      { date: 'Jun 26', forecast: 1680, p10: 1440, p25: 1528, p75: 1828, p90: 1962 },
      { date: 'Jul 26', forecast: 1702, p10: 1408, p25: 1524, p75: 1876, p90: 2026 },
      { date: 'Aug 26', forecast: 1720, p10: 1380, p25: 1530, p75: 1930, p90: 2080 },
    ],
    '12M': [
      { date: 'Dec 25', actual: 1535, forecast: 1535, p10: 1535, p25: 1535, p75: 1535, p90: 1535 },
      { date: 'Jan 26', actual: 1559, forecast: 1559, p10: 1559, p25: 1559, p75: 1559, p90: 1559 },
      { date: 'Feb 26', actual: 1582, forecast: 1582, p10: 1582, p25: 1582, p75: 1582, p90: 1582 },
      { date: 'Mar 26', forecast: 1614, p10: 1484, p25: 1548, p75: 1676, p90: 1748 },
      { date: 'Apr 26', forecast: 1634, p10: 1472, p25: 1540, p75: 1722, p90: 1804 },
      { date: 'May 26', forecast: 1658, p10: 1458, p25: 1536, p75: 1776, p90: 1874 },
      { date: 'Jun 26', forecast: 1682, p10: 1438, p25: 1526, p75: 1830, p90: 1964 },
      { date: 'Jul 26', forecast: 1710, p10: 1418, p25: 1514, p75: 1888, p90: 2056 },
      { date: 'Aug 26', forecast: 1738, p10: 1394, p25: 1502, p75: 1948, p90: 2152 },
      { date: 'Sep 26', forecast: 1768, p10: 1366, p25: 1486, p75: 2012, p90: 2244 },
      { date: 'Oct 26', forecast: 1800, p10: 1336, p25: 1468, p75: 2080, p90: 2340 },
      { date: 'Nov 26', forecast: 1834, p10: 1304, p25: 1494, p75: 2134, p90: 2392 },
      { date: 'Dec 26', forecast: 1865, p10: 1200, p25: 1520, p75: 2180, p90: 2420 },
    ],
    '24M': [
      { date: 'Dec 25', actual: 1535, forecast: 1535, p10: 1535, p25: 1535, p75: 1535, p90: 1535 },
      { date: 'Mar 26', forecast: 1614, p10: 1484, p25: 1548, p75: 1676, p90: 1748 },
      { date: 'Jun 26', forecast: 1692, p10: 1398, p25: 1520, p75: 1874, p90: 2044 },
      { date: 'Sep 26', forecast: 1770, p10: 1338, p25: 1490, p75: 2024, p90: 2284 },
      { date: 'Dec 26', forecast: 1870, p10: 1238, p25: 1506, p75: 2204, p90: 2484 },
      { date: 'Mar 27', forecast: 1954, p10: 1148, p25: 1488, p75: 2384, p90: 2744 },
      { date: 'Jun 27', forecast: 2010, p10: 1078, p25: 1478, p75: 2524, p90: 2904 },
      { date: 'Sep 27', forecast: 2052, p10: 1038, p25: 1476, p75: 2616, p90: 3024 },
      { date: 'Dec 27', forecast: 2080, p10: 1020, p25: 1480, p75: 2680, p90: 3120 },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Distribution data (12M representative)
───────────────────────────────────────────────────────────────────────────── */

interface DistPoint { rate: string; prob: number }

const DISTRIBUTION_DATA: Record<Currency, DistPoint[]> = {
  'USD/INR': [
    { rate: '82', prob: 3.2 },
    { rate: '83', prob: 6.8 },
    { rate: '84', prob: 11.4 },
    { rate: '85', prob: 18.6 },
    { rate: '86', prob: 22.4 },
    { rate: '87', prob: 18.8 },
    { rate: '88', prob: 10.6 },
    { rate: '89', prob: 5.2 },
    { rate: '90', prob: 1.8 },
    { rate: '91', prob: 0.8 },
    { rate: '92', prob: 0.4 },
  ],
  'USD/NGN': [
    { rate: '1,200', prob: 2.4 },
    { rate: '1,400', prob: 4.8 },
    { rate: '1,600', prob: 10.6 },
    { rate: '1,800', prob: 19.8 },
    { rate: '2,000', prob: 26.2 },
    { rate: '2,200', prob: 19.4 },
    { rate: '2,400', prob: 11.2 },
    { rate: '2,600', prob: 4.4 },
    { rate: '2,800', prob: 1.4 },
    { rate: '3,000', prob: 0.2 },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   Metrics per currency + horizon
───────────────────────────────────────────────────────────────────────────── */

interface MetricsData {
  projected: string;
  volatility: string;
  volLabel: string;
  probRange: string;
  confidence: string;
  delta: string;
  deltaSignal: 'positive' | 'negative' | 'neutral' | 'warning';
  volSignal: 'positive' | 'negative' | 'neutral' | 'warning';
}

const METRICS: Record<Currency, Record<Horizon, MetricsData>> = {
  'USD/INR': {
    '3M':  { projected: '84.55',  volatility: '6.4',  volLabel: 'Ann. vol (%)',     probRange: '83.10 – 86.10', confidence: '86.4', delta: '+0.73 vs today',    deltaSignal: 'negative', volSignal: 'positive' },
    '6M':  { projected: '85.20',  volatility: '9.2',  volLabel: 'Ann. vol (%)',     probRange: '82.40 – 88.40', confidence: '80.8', delta: '+1.38 vs today',    deltaSignal: 'negative', volSignal: 'positive' },
    '12M': { projected: '86.80',  volatility: '12.8', volLabel: 'Ann. vol (%)',     probRange: '80.50 – 93.50', confidence: '72.6', delta: '+2.98 vs today',    deltaSignal: 'negative', volSignal: 'warning'  },
    '24M': { projected: '89.50',  volatility: '17.4', volLabel: 'Ann. vol (%)',     probRange: '78.00 – 104.00', confidence: '63.4', delta: '+5.68 vs today',   deltaSignal: 'negative', volSignal: 'warning'  },
  },
  'USD/NGN': {
    '3M':  { projected: '1,645',  volatility: '18.6', volLabel: 'Ann. vol (%)',     probRange: '1,480 – 1,842', confidence: '78.4', delta: '+62.6 vs today',   deltaSignal: 'negative', volSignal: 'warning'  },
    '6M':  { projected: '1,720',  volatility: '26.4', volLabel: 'Ann. vol (%)',     probRange: '1,380 – 2,080', confidence: '71.2', delta: '+137.6 vs today',  deltaSignal: 'negative', volSignal: 'negative' },
    '12M': { projected: '1,865',  volatility: '38.2', volLabel: 'Ann. vol (%)',     probRange: '1,200 – 2,420', confidence: '62.8', delta: '+282.6 vs today',  deltaSignal: 'negative', volSignal: 'negative' },
    '24M': { projected: '2,080',  volatility: '52.6', volLabel: 'Ann. vol (%)',     probRange: '1,020 – 3,120', confidence: '52.4', delta: '+497.6 vs today',  deltaSignal: 'negative', volSignal: 'negative' },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Insights per currency + horizon
───────────────────────────────────────────────────────────────────────────── */

interface InsightData {
  icon: 'trend' | 'risk' | 'signal';
  label: string;
  body: string;
  accent?: boolean;
}

const INSIGHTS: Record<Currency, Record<Horizon, InsightData[]>> = {
  'USD/INR': {
    '3M': [
      { icon: 'trend',  accent: true, label: 'Modest INR Weakness',      body: 'RBI expected to maintain rates near 6.5% through Q2. Carry differential versus USD supports range-bound trading, with modest downside for INR. 3M central estimate sits at 84.55.' },
      { icon: 'signal',              label: 'High Near-term Confidence',  body: 'Distribution is tightly clustered with an 86.4% confidence score. The P10–P90 spread of just 3.0 rupees reflects a low-volatility near-term regime.' },
      { icon: 'risk',                label: 'Oil Import Risk',            body: 'India\'s current account deficit and crude import bill are the primary near-term risk variables. A WTI spike above $95 would pressure INR toward the P75 band at 84.85.' },
    ],
    '6M': [
      { icon: 'trend',  accent: true, label: 'Gradual Depreciation Path', body: 'Base case embeds ~1.4% INR depreciation over 6 months, driven by the US rate differential and capital flow dynamics. RBI FX intervention provides a managed ceiling.' },
      { icon: 'signal',              label: 'Fed Easing Sensitivity',     body: 'Earlier-than-expected Fed rate cuts would compress the USD-INR carry differential, providing relief toward the P25 band. A hawkish hold extends the depreciation path.' },
      { icon: 'risk',                label: 'Election Volatility',        body: 'State election cycles and potential policy uncertainty could trigger positioning-driven volatility in the May–June window, amplifying moves beyond the fundamental base case.' },
    ],
    '12M': [
      { icon: 'trend',  accent: true, label: 'Structural Adjustment',     body: '12M forecast embeds ~3.6% cumulative depreciation. RBI FX reserve management provides a structural floor, but persistent current account pressures and US rate differentials dominate.' },
      { icon: 'signal',              label: 'Wide Confidence Band',       body: 'The P10–P90 spread of 13 rupees reflects genuine uncertainty about global risk appetite, the Fed easing path, and domestic growth dynamics over this horizon.' },
      { icon: 'risk',                label: 'EM Risk Sentiment',          body: 'A significant global risk-off episode or broad EM capital flight could drive INR well beyond the base case, testing the P90 scenario at 93.50.' },
    ],
    '24M': [
      { icon: 'trend',  accent: true, label: 'Long-term Depreciation',    body: '24M base case of 89.50 is consistent with the 3–4% annual depreciation trend observed over the prior decade. Structural current account dynamics dominate at this horizon.' },
      { icon: 'signal',              label: 'Terminal Uncertainty',        body: 'The 26-rupee P10–P90 spread at 24 months makes point forecasts largely indicative. Regime changes in Fed policy or India\'s external balance are the dominant drivers.' },
      { icon: 'risk',                label: 'Geopolitical Tail Risk',     body: 'India-China border tensions, Asian contagion dynamics, or a major EM sovereign debt event represent discontinuous risk scenarios that are not captured in the Monte Carlo ensemble.' },
    ],
  },
  'USD/NGN': {
    '3M': [
      { icon: 'trend',  accent: true, label: 'Continued Devaluation',     body: 'CBN\'s managed float continues to allow gradual naira depreciation. FX reserves near $36B provide some buffer, but structural USD demand remains elevated above organic supply.' },
      { icon: 'signal',              label: 'Elevated Volatility',        body: 'NGN remains in a high-volatility regime. The 3M P10–P90 spread of 362 naira reflects genuine uncertainty about CBN FX intervention decisions and policy continuity.' },
      { icon: 'risk',                label: 'Oil Revenue Sensitivity',    body: 'With oil contributing ~85% of FX earnings, a Brent decline below $70 would materially accelerate devaluation beyond the P90 scenario and compress FX reserve coverage.' },
    ],
    '6M': [
      { icon: 'trend',  accent: true, label: 'Structural Reform Path',    body: 'Nigeria\'s ongoing FX market liberalization continues to pressure the official rate toward market-clearing levels. Base case implies ~8.7% further depreciation over the 6M horizon.' },
      { icon: 'signal',              label: 'IMF Program Dynamics',       body: 'Continued IMF engagement and Eurobond market access are the key stabilizing anchors. Disruption to external financing would push NGN significantly toward the P90 band at 2,080.' },
      { icon: 'risk',                label: 'Security Premium',           body: 'Regional security conditions in the Niger Delta and broader political risk introduce a persistent volatility premium that amplifies NGN moves beyond fundamental valuation drivers.' },
    ],
    '12M': [
      { icon: 'trend',  accent: true, label: 'Devaluation Cycle',         body: 'Base case of 1,865 implies ~17.9% cumulative depreciation over 12 months, consistent with ongoing structural adjustment and reserve management constraints.' },
      { icon: 'signal',              label: 'Confidence Erosion',         body: 'Model confidence of 62.8% at this horizon reflects genuine structural ambiguity. The P10–P90 range of 1,220 naira is among the widest in our EM FX coverage universe.' },
      { icon: 'risk',                label: 'FX Policy Shift Risk',       body: 'A sudden CBN move toward full convertibility could trigger a sharp one-off devaluation event, potentially driving the exchange rate well beyond current model confidence bounds.' },
    ],
    '24M': [
      { icon: 'trend',  accent: true, label: 'Structural Pressures',      body: '24M base case of 2,080 reflects continued devaluation driven by fiscal sustainability concerns, oil price dependency, and the structural current account deficit dynamic.' },
      { icon: 'signal',              label: 'Model Uncertainty Dominant', body: 'At 24 months, the P10–P90 spread of 2,100 naira makes point forecasts largely uninformative. Scenario-based planning is significantly more valuable than central estimate tracking.' },
      { icon: 'risk',                label: 'Sovereign Risk Premium',     body: 'External debt servicing pressures, budget deficit trajectory, and potential credit rating downgrades represent regime-level risks capable of triggering discontinuous devaluation events.' },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Tooltip components
───────────────────────────────────────────────────────────────────────────── */

function ForecastTooltip({
  active,
  payload,
  label,
  formatRate,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  formatRate: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const fcast = payload.find(p => p.name === 'forecast');
  const p10   = payload.find(p => p.name === 'p10');
  const p90   = payload.find(p => p.name === 'p90');

  return (
    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--surface-elevated)] px-4 py-3.5 shadow-xl min-w-[175px]">
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      {fcast && (
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <span className="text-[11px] text-[var(--text-muted)]">Forecast</span>
          <span className="font-mono text-[14px] font-bold text-[var(--accent-primary)] nums-tabular">
            {formatRate(fcast.value)}
          </span>
        </div>
      )}
      {p10 && p90 && (
        <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-[var(--border-subtle)]">
          <span className="text-[11px] text-[var(--text-muted)]">90% CI</span>
          <span className="font-mono text-[12px] text-[var(--text-secondary)] nums-tabular">
            {formatRate(p10.value)} – {formatRate(p90.value)}
          </span>
        </div>
      )}
    </div>
  );
}

function DistributionTooltip({
  active,
  payload,
  label,
  currencyCode,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  currencyCode: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border-base)] bg-[var(--surface-elevated)] px-3.5 py-3 shadow-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1.5">
        {label} {currencyCode}
      </p>
      <p className="font-mono text-[14px] font-bold text-[var(--text-primary)] nums-tabular">{payload[0].value.toFixed(1)}%</p>
      <p className="text-[11px] text-[var(--text-muted)]">probability mass</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   InsightCard
───────────────────────────────────────────────────────────────────────────── */

function InsightCard({ icon, label, body, accent = false }: InsightData) {
  const IconEl = icon === 'trend' ? TrendingDown : icon === 'risk' ? AlertTriangle : Activity;
  const iconColor = icon === 'trend' ? 'text-[var(--accent-primary)]' : icon === 'risk' ? 'text-[var(--status-negative)]' : 'text-[var(--status-neutral)]';
  const iconBg    = icon === 'trend' ? 'bg-[rgba(245,217,10,0.10)]' : icon === 'risk' ? 'bg-[rgba(239,68,68,0.10)]' : 'bg-[rgba(59,130,246,0.10)]';

  return (
    <div className={cn(
      'rounded-[18px] border p-6 transition-all duration-150',
      accent
        ? 'bg-[rgba(245,217,10,0.04)] border-[rgba(245,217,10,0.14)] hover:border-[rgba(245,217,10,0.24)]'
        : 'bg-[var(--surface-elevated)] border-[var(--border-base)] hover:border-[var(--border-strong)]',
    )}>
      <div className="flex items-start gap-4">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', iconBg)}>
          <IconEl className={cn('h-4 w-4', iconColor)} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-[12.5px] font-bold uppercase tracking-[0.12em] mb-2',
            accent ? 'text-[var(--accent-muted)]' : 'text-[var(--text-muted)]',
          )}>
            {label}
          </p>
          <p className="text-[14.5px] leading-relaxed text-[var(--text-secondary)]">{body}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */

const FADE_UP = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
};

export default function FXForecastPage() {
  const [currency, setCurrency] = useState<Currency>('USD/INR');
  const [horizon,  setHorizon]  = useState<Horizon>('12M');

  const cfg      = CURRENCY_CONFIG[currency];
  const data     = FORECAST_DATA[currency][horizon];
  const metrics  = METRICS[currency][horizon];
  const insights = INSIGHTS[currency][horizon];
  const distData = DISTRIBUTION_DATA[currency];

  const splitIdx   = data.findIndex(d => d.actual === undefined);
  const lastPoint  = data[data.length - 1];
  const confidenceSignal =
    parseFloat(metrics.confidence) >= 80 ? 'positive' :
    parseFloat(metrics.confidence) >= 65 ? 'warning'  : 'negative';
  const confidenceAccent =
    parseFloat(metrics.confidence) >= 80 ? 'positive' :
    parseFloat(metrics.confidence) >= 65 ? 'warning'  : 'negative';

  const contentKey = `${currency}-${horizon}`;

  return (
    <DashboardShell title="FX Forecast" breadcrumb={['BAML Platform', 'FX Forecast']}>
      <div className="mx-auto max-w-[1600px] px-12 py-14 space-y-12">

        {/* ── 1. Header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          className="flex items-start justify-between gap-6"
        >
          {/* Left: title + dynamic subtitle */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                FX Forecasting
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-positive)] animate-pulse" />
                <span className="text-[10.5px] text-[var(--text-muted)]">Model live</span>
              </span>
            </div>
            <h1 className="text-[40px] font-semibold tracking-tight text-[var(--text-primary)] leading-none">
              FX Forecast
            </h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={currency}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                className="text-[15px] text-[var(--text-muted)]"
              >
                {cfg.flag} {cfg.description} · Monte Carlo ensemble · 10,000 simulations · As of 17 May 2026
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Right: currency toggle + horizon + export */}
          <div className="flex items-center gap-3 shrink-0 pt-1">

            {/* Currency toggle — primary selector */}
            <div className="flex items-center rounded-[14px] border border-[var(--border-base)] bg-[var(--surface-elevated)] p-1 gap-0.5">
              {CURRENCY_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    'relative rounded-[10px] px-6 py-3 text-[15px] font-semibold transition-all duration-200',
                    currency === c
                      ? 'bg-[var(--accent-primary)] text-black shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-[var(--border-base)]" />

            {/* Horizon selector */}
            <div className="flex items-center rounded-[12px] border border-[var(--border-base)] bg-[var(--surface-elevated)] p-1 gap-0.5">
              {HORIZON_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={cn(
                    'rounded-[9px] px-5 py-2.5 text-[14px] font-semibold transition-all duration-150',
                    horizon === h
                      ? 'bg-[var(--accent-primary)] text-black shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                  )}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Export */}
            <button className="flex items-center gap-2 rounded-[12px] border border-[var(--border-base)] bg-[var(--surface-elevated)] px-5 py-3 text-[14px] font-medium text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </motion.div>

        {/* ── 2. Hero Forecast Chart ───────────────────────────────── */}
        <motion.div
          key={`chart-${contentKey}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="rounded-[22px] border border-[var(--border-base)] bg-[var(--surface-elevated)] overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-9 py-7">
            <div>
              <p className="text-[16px] font-semibold text-[var(--text-primary)] leading-none">
                {currency} Rate Trajectory · {horizon} Forecast
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
                Spot rate · Confidence intervals from Monte Carlo ensemble · Values in {cfg.base}
              </p>
            </div>
            <div className="flex items-center gap-7">
              {[
                { color: 'rgba(255,255,255,0.7)',     label: 'Historical'        },
                { color: '#F5D90A',                   label: 'Central Forecast'  },
                { color: 'rgba(245,217,10,0.22)',     label: '50% CI'            },
                { color: 'rgba(245,217,10,0.09)',     label: '90% CI'            },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="h-[11px] w-[11px] rounded-sm" style={{ background: color }} />
                  <span className="text-[12px] text-[var(--text-muted)]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-9 py-8">
            <ResponsiveContainer width="100%" height={440}>
              <AreaChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id={`fxCiOuter-${currency}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F5D90A" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#F5D90A" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id={`fxCiInner-${currency}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F5D90A" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#F5D90A" stopOpacity={0.06} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)' }}
                  dy={10}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={cfg.formatAxis}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}
                  width={currency === 'USD/NGN' ? 56 : 52}
                />
                <Tooltip
                  content={(props) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const p = props as any;
                    return <ForecastTooltip active={p.active} payload={p.payload} label={p.label} formatRate={cfg.formatRate} />;
                  }}
                  cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
                />

                {/* 90% confidence band */}
                <Area type="monotone" dataKey="p90" stroke="none" fill={`url(#fxCiOuter-${currency})`} fillOpacity={1} name="p90" activeDot={false} isAnimationActive animationDuration={600} animationEasing="ease-out" />
                <Area type="monotone" dataKey="p10" stroke="none" fill="var(--surface-elevated)" fillOpacity={1} name="p10" activeDot={false} isAnimationActive={false} />

                {/* 50% confidence band */}
                <Area type="monotone" dataKey="p75" stroke="none" fill={`url(#fxCiInner-${currency})`} fillOpacity={1} name="p75" activeDot={false} isAnimationActive animationDuration={700} animationEasing="ease-out" />
                <Area type="monotone" dataKey="p25" stroke="none" fill="var(--surface-elevated)" fillOpacity={1} name="p25" activeDot={false} isAnimationActive={false} />

                {/* Central forecast */}
                <Line type="monotone" dataKey="forecast" stroke="#F5D90A" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#F5D90A', strokeWidth: 0 }} name="forecast" isAnimationActive animationDuration={800} animationEasing="ease-out" />

                {/* Historical actuals */}
                <Line type="monotone" dataKey="actual" stroke="rgba(245,247,250,0.7)" strokeWidth={1.5} dot={false} activeDot={false} name="actual" isAnimationActive={false} />

                {/* Today divider */}
                {splitIdx > 0 && (
                  <ReferenceLine
                    x={data[splitIdx - 1]?.date}
                    stroke="rgba(255,255,255,0.12)"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    label={{ value: 'Today', position: 'insideTopRight', fill: 'var(--text-muted)', fontSize: 10.5, fontFamily: 'var(--font-sans)', dy: -10 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── 3. Prediction Metrics Row ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`metrics-${contentKey}`}
            {...FADE_UP}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="grid grid-cols-4 gap-5"
          >
            <KPIStatCard
              label={`${currency} Rate · ${horizon}`}
              value={metrics.projected}
              unit={cfg.base}
              unitPosition="suffix"
              delta={metrics.delta}
              signal={metrics.deltaSignal}
              accent="yellow"
              size="lg"
              featured
            />
            <KPIStatCard
              label="Annualized Volatility"
              value={metrics.volatility}
              unit="%"
              unitPosition="suffix"
              delta={metrics.volLabel}
              signal={metrics.volSignal}
              accent={metrics.volSignal === 'positive' ? 'positive' : metrics.volSignal === 'negative' ? 'negative' : 'warning'}
              size="lg"
            />
            <KPIStatCard
              label={`Probability Range · ${horizon}`}
              value={metrics.probRange}
              unit={cfg.base}
              unitPosition="suffix"
              delta="P10 – P90 spread"
              signal="neutral"
              accent="neutral"
              size="lg"
            />
            <KPIStatCard
              label="Forecast Confidence"
              value={metrics.confidence}
              unit="%"
              unitPosition="suffix"
              delta="Ensemble agreement"
              signal={confidenceSignal}
              accent={confidenceAccent}
              size="lg"
            />
          </motion.div>
        </AnimatePresence>

        {/* ── 4. Monte Carlo Section ───────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`mc-${contentKey}`}
            {...FADE_UP}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="grid grid-cols-[1fr_420px] gap-5"
          >

            {/* Probability distribution */}
            <div className="rounded-[22px] border border-[var(--border-base)] bg-[var(--surface-elevated)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-9 py-7">
                <div>
                  <p className="text-[16px] font-semibold text-[var(--text-primary)] leading-none">
                    Outcome Distribution · {horizon}
                  </p>
                  <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
                    Probability mass by terminal {currency} rate · 10,000 paths
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-muted)] bg-[var(--surface-overlay)] px-3.5 py-2 rounded-lg">
                  <Info className="h-3.5 w-3.5" />
                  Monte Carlo
                </div>
              </div>
              <div className="px-9 py-8">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={distData} barCategoryGap="12%" margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="0" vertical={false} />
                    <XAxis
                      dataKey="rate"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                      tickFormatter={(v) => `${v}%`}
                      width={40}
                    />
                    <Tooltip
                      content={(props) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const p = props as any;
                        return <DistributionTooltip active={p.active} payload={p.payload} label={p.label} currencyCode={cfg.base} />;
                      }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="prob" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} animationEasing="ease-out">
                      {distData.map((entry) => {
                        const isMode    = entry.prob === Math.max(...distData.map(d => d.prob));
                        const rateVal   = parseFloat(entry.rate.replace(/,/g, ''));
                        const inBase    = rateVal >= cfg.baseRange[0] && rateVal <= cfg.baseRange[1];
                        return (
                          <Cell
                            key={entry.rate}
                            fill={
                              isMode  ? '#F5D90A' :
                              inBase  ? 'rgba(245,217,10,0.38)' :
                                        'rgba(245,217,10,0.12)'
                            }
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Percentile bands */}
            <div className="rounded-[22px] border border-[var(--border-base)] bg-[var(--surface-elevated)] overflow-hidden flex flex-col">
              <div className="border-b border-[var(--border-subtle)] px-8 py-7">
                <p className="text-[16px] font-semibold text-[var(--text-primary)] leading-none">
                  Scenario Percentiles
                </p>
                <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
                  Terminal {currency} at {horizon} horizon
                </p>
              </div>

              <div className="flex flex-1 flex-col divide-y divide-[var(--border-subtle)] px-8 justify-center">
                {[
                  { label: 'P90 — Hawkish tail',  value: lastPoint?.p90,      color: 'var(--status-negative)',  desc: 'Sharp currency weakness' },
                  { label: 'P75 — Upside case',   value: lastPoint?.p75,      color: 'var(--status-warning)',   desc: 'Above-trend depreciation' },
                  { label: 'P50 — Base case',      value: lastPoint?.forecast, color: 'var(--accent-primary)',   desc: 'Consensus FX path', featured: true },
                  { label: 'P25 — Dovish case',   value: lastPoint?.p25,      color: 'var(--status-positive)',  desc: 'Partial recovery / stabilization' },
                  { label: 'P10 — Bull tail',      value: lastPoint?.p10,      color: '#22C55E',                 desc: 'Material currency strength' },
                ].map(({ label, value, color, desc, featured }) => (
                  <div
                    key={label}
                    className={cn(
                      'flex items-center justify-between py-5 transition-colors duration-100',
                      featured && 'bg-[rgba(245,217,10,0.03)]',
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                      <div>
                        <p className={cn(
                          'text-[13.5px] font-medium leading-none',
                          featured ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]',
                        )}>
                          {label}
                        </p>
                        <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">{desc}</p>
                      </div>
                    </div>
                    <span className={cn(
                      'font-mono text-[16px] font-bold nums-tabular',
                      featured ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]',
                    )}>
                      {value !== undefined ? cfg.formatRate(value) : '—'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border-subtle)] px-8 py-5">
                <p className="text-[12px] text-[var(--text-muted)]">
                  Rates shown as end-of-period {currency} spot. Ensemble of 10,000 simulated paths.
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── 5. Forecast Insights ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`insights-${contentKey}`}
            {...FADE_UP}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[20px] font-semibold text-[var(--text-primary)]">Forecast Insights</p>
                <p className="mt-1 text-[13.5px] text-[var(--text-muted)]">
                  Model-generated analysis · {currency} · {horizon} horizon
                </p>
              </div>
              <button className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent-muted)] hover:text-[var(--accent-primary)] transition-colors duration-150">
                Full report
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {insights.map((insight) => (
                <InsightCard key={insight.label} {...insight} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center justify-between pt-2 pb-6 border-t border-[var(--border-subtle)]"
        >
          <p className="text-[11.5px] text-[var(--text-muted)]">
            BAML Risk Intelligence Platform · FX forecasts are model outputs and not investment advice. Spot rates sourced from Bloomberg composite. 17 May 2026.
          </p>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-muted)]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Last updated: 17 May 2026, 16:45 EST
          </div>
        </motion.div>

      </div>
    </DashboardShell>
  );
}
