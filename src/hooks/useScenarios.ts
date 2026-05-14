'use client';

import { useApi, useMutation } from './useApi';
import { ScenarioService } from '@/services/scenario.service';
import type {
  CreateScenarioInput,
  Scenario,
  ScenarioListParams,
  UpdateScenarioInput,
  UUID,
} from '@/types/api';

/**
 * Paginated scenario list with optional status filter.
 */
export function useScenarios(params?: ScenarioListParams) {
  return useApi(() => ScenarioService.list(params), {
    immediate: true,
    deps: [params?.status, params?.offset, params?.limit],
  });
}

/**
 * Single scenario by UUID.
 */
export function useScenario(id: UUID | null) {
  return useApi(
    () => {
      if (!id) return Promise.resolve(null as unknown as Scenario);
      return ScenarioService.getById(id);
    },
    { immediate: !!id, deps: [id] }
  );
}

/**
 * Create scenario mutation.
 *
 * Usage:
 *   const { mutate, loading, error } = useCreateScenario();
 *   const scenario = await mutate({ name: 'Base Case' });
 */
export function useCreateScenario() {
  return useMutation<Scenario, CreateScenarioInput>(ScenarioService.create);
}

/**
 * Update scenario mutation.
 */
export function useUpdateScenario(id: UUID) {
  return useMutation<Scenario, UpdateScenarioInput>((input) =>
    ScenarioService.update(id, input)
  );
}

/**
 * Delete scenario mutation (soft-delete).
 */
export function useDeleteScenario(id: UUID) {
  return useMutation<void, void>(() => ScenarioService.delete(id));
}
