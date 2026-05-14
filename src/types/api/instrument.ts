import type { UUID, Decimal, ISODate, ISODatetime, CurrencyCode } from './common';

// ── Instrument catalog ────────────────────────────────────────────────────────

export interface InstrumentSummary {
  ticker: string;
  name: string | null;
  asset_class: string;
  currency: CurrencyCode;
  exchange: string | null;
  is_active: boolean;
}

export interface InstrumentDetail extends InstrumentSummary {
  isin: string | null;
  sedol: string | null;
  contract_size: Decimal | null;
  tick_size: Decimal | null;
  last_price: Decimal | null;
  price_date: ISODatetime | null;
}

// ── Commodity ─────────────────────────────────────────────────────────────────

export interface CommodityInstrument {
  symbol: string;
  name: string;
  commodity_class: 'energy' | 'metals' | 'agriculture' | 'softs' | string;
  unit: string;
  currency: CurrencyCode;
  exchange: string | null;
  front_month_ticker: string | null;
  last_price: Decimal | null;
  price_date: ISODatetime | null;
}

// ── Market data OHLCV ─────────────────────────────────────────────────────────

export interface MarketDataPoint {
  ticker: string;
  asset_class: string;
  data_date: ISODate;
  source: string;
  open_price: Decimal | null;
  high_price: Decimal | null;
  low_price: Decimal | null;
  close_price: Decimal | null;
  volume: Decimal | null;
}

export interface MarketDataResponse extends MarketDataPoint {
  id: UUID;
  created_at: ISODatetime;
  updated_at: ISODatetime;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface InstrumentListParams {
  asset_class?: string;
  currency?: CurrencyCode;
  exchange?: string;
  offset?: number;
  limit?: number;
}

export interface MarketDataQueryParams {
  ticker?: string;
  asset_class?: string;
  source?: string;
  date_from?: ISODate;
  date_to?: ISODate;
  limit?: number;
  offset?: number;
}

export interface CommodityListParams {
  commodity_class?: string;
}
