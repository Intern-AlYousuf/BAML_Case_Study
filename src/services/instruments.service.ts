import { apiGet, apiPost } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { cleanParams } from '@/lib/api/types';
import type {
  InstrumentSummary,
  InstrumentDetail,
  CommodityInstrument,
  MarketDataPoint,
  MarketDataResponse,
  InstrumentListParams,
  MarketDataQueryParams,
  CommodityListParams,
} from '@/types/api';

export class InstrumentsService {
  /** Paginated instrument catalog with optional filters. */
  static async list(
    params?: InstrumentListParams
  ): Promise<InstrumentSummary[]> {
    return apiGet<InstrumentSummary[]>(ENDPOINTS.instruments.list, {
      params: cleanParams(params ?? {}),
    });
  }

  /** Full instrument record by primary ticker. */
  static async getByTicker(ticker: string): Promise<InstrumentDetail> {
    return apiGet<InstrumentDetail>(ENDPOINTS.instruments.byTicker(ticker));
  }

  /**
   * Ingest a single OHLCV market data point.
   * The (ticker, data_date, source) combination must be unique.
   */
  static async ingestMarketData(
    point: MarketDataPoint
  ): Promise<MarketDataResponse> {
    return apiPost<MarketDataResponse, MarketDataPoint>(
      ENDPOINTS.instruments.marketDataIngest,
      point
    );
  }

  /**
   * Query historical OHLCV records with optional filters.
   * All parameters are optional — omitting returns the most recent records.
   */
  static async queryMarketData(
    params?: MarketDataQueryParams
  ): Promise<MarketDataResponse[]> {
    return apiGet<MarketDataResponse[]>(ENDPOINTS.instruments.marketDataQuery, {
      params: cleanParams(params ?? {}),
    });
  }

  /** Supported commodity instruments with contract metadata. */
  static async listCommodities(
    params?: CommodityListParams
  ): Promise<CommodityInstrument[]> {
    return apiGet<CommodityInstrument[]>(ENDPOINTS.instruments.commodities, {
      params: cleanParams(params ?? {}),
    });
  }

  /** Single commodity instrument by exchange symbol. */
  static async getCommodityBySymbol(
    symbol: string
  ): Promise<CommodityInstrument> {
    return apiGet<CommodityInstrument>(
      ENDPOINTS.instruments.commodityBySymbol(symbol)
    );
  }
}
