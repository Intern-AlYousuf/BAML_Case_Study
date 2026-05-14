import { apiGet } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { LivenessResponse, ReadinessResponse } from '@/types/api';

export class HealthService {
  /** Liveness probe — checks that the process is running. */
  static async live(): Promise<LivenessResponse> {
    return apiGet<LivenessResponse>(ENDPOINTS.health.live);
  }

  /** Readiness probe — checks that all dependencies are reachable. */
  static async ready(): Promise<ReadinessResponse> {
    return apiGet<ReadinessResponse>(ENDPOINTS.health.ready);
  }
}
