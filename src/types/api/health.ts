import type { ISODatetime } from './common';

export interface LivenessResponse {
  status: 'alive';
  app: string;
  version: string;
  timestamp: ISODatetime;
}

export interface ReadinessResponse {
  status: 'ready' | 'degraded';
  checks: Record<string, 'ok' | 'unreachable'>;
  app: string;
  version: string;
  env: string;
  timestamp: ISODatetime;
}
