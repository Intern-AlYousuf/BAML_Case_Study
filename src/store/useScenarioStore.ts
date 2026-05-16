/**
 * useScenarioStore — Zustand v5 store for the Scenario Analysis page.
 *
 * Architecture:
 *  - Inputs (sliders, toggles) are stored directly.
 *  - All derived data (outputs, chart datasets) is recomputed synchronously
 *    on every action — computation is pure arithmetic, < 1ms.
 *  - Actions are the single mutation point; components never write state
 *    directly.
 *  - Saved scenarios live in memory. Swap `create` for `create + persist`
 *    to add localStorage durability when needed.
 *
 * Selector pattern (preferred):
 *   const netEBITDA = useScenarioStore(s => s.outputs.netEBITDA);
 *   const setField  = useScenarioStore(s => s.setField);
 *
 * For object slices use useShallow to avoid unnecessary re-renders:
 *   import { useShallow } from 'zustand/react/shallow';
 *   const inputs = useScenarioStore(useShallow(s => s.inputs));
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  ScenarioInputs,
  ScenarioOutputs,
  WaterfallEntry,
  ComparisonEntry,
  SensitivityEntry,
  BASE_INPUTS,
  PRESETS,
  computeOutputs,
  buildWaterfallData,
  buildComparisonData,
  buildSensitivityData,
} from '@/lib/scenarioModel';

/* ─────────────────────────────────────────────────────────────────────────────
   Saved scenario type
───────────────────────────────────────────────────────────────────────────── */

export interface SavedScenario {
  id:        string;
  name:      string;
  presetKey: string | null;   // null = custom
  inputs:    ScenarioInputs;
  outputs:   ScenarioOutputs;
  savedAt:   Date;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Store shape
───────────────────────────────────────────────────────────────────────────── */

interface ScenarioState {
  // ── Inputs (controlled by sliders / toggles)
  inputs:       ScenarioInputs;
  activePreset: string;           // preset key or 'custom'

  // ── Derived outputs (recomputed on every input change)
  outputs:         ScenarioOutputs;
  waterfallData:   WaterfallEntry[];
  comparisonData:  ComparisonEntry[];
  sensitivityData: SensitivityEntry[];

  // ── Saved scenario library
  savedScenarios: SavedScenario[];
}

interface ScenarioActions {
  /** Update a single input field; marks preset as 'custom'. */
  setField: <K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) => void;

  /** Load a named preset, replacing all inputs. */
  applyPreset: (key: string) => void;

  /** Restore inputs to BASE_INPUTS / 'base' preset. */
  resetToBase: () => void;

  /** Persist the current scenario to the in-memory library. */
  saveCurrentScenario: (name?: string) => void;

  /** Remove a saved scenario by id. */
  deleteSavedScenario: (id: string) => void;

  /** Load a saved scenario back into the simulator. */
  loadSavedScenario: (id: string) => void;
}

export type ScenarioStore = ScenarioState & ScenarioActions;

/* ─────────────────────────────────────────────────────────────────────────────
   Internal helper — recompute all derived state from inputs
───────────────────────────────────────────────────────────────────────────── */

function derive(inputs: ScenarioInputs): Pick<ScenarioState, 'outputs' | 'waterfallData' | 'comparisonData' | 'sensitivityData'> {
  const outputs = computeOutputs(inputs);
  return {
    outputs,
    waterfallData:   buildWaterfallData(outputs),
    comparisonData:  buildComparisonData(outputs),
    sensitivityData: buildSensitivityData(inputs),
  };
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Store
───────────────────────────────────────────────────────────────────────────── */

export const useScenarioStore = create<ScenarioStore>()(
  devtools(
    (set, get) => ({
      /* ── Initial state ─────────────────────────────────────────────── */
      inputs:       { ...BASE_INPUTS },
      activePreset: 'base',
      savedScenarios: [],
      ...derive(BASE_INPUTS),

      /* ── Actions ───────────────────────────────────────────────────── */

      setField: (key, value) => {
        const next = { ...get().inputs, [key]: value };
        set(
          { inputs: next, activePreset: 'custom', ...derive(next) },
          false,
          'setField',
        );
      },

      applyPreset: (key) => {
        const preset = PRESETS[key];
        if (!preset) return;
        const inputs = { ...preset.inputs };
        set(
          { inputs, activePreset: key, ...derive(inputs) },
          false,
          'applyPreset',
        );
      },

      resetToBase: () => {
        const inputs = { ...BASE_INPUTS };
        set(
          { inputs, activePreset: 'base', ...derive(inputs) },
          false,
          'resetToBase',
        );
      },

      saveCurrentScenario: (name) => {
        const { inputs, outputs, activePreset } = get();
        const defaultName =
          activePreset === 'custom'
            ? 'Custom Scenario'
            : (PRESETS[activePreset]?.label ?? 'Scenario');

        const entry: SavedScenario = {
          id:        uid(),
          name:      name ?? defaultName,
          presetKey: activePreset === 'custom' ? null : activePreset,
          inputs:    { ...inputs },
          outputs:   { ...outputs },
          savedAt:   new Date(),
        };

        set(
          (state) => ({ savedScenarios: [entry, ...state.savedScenarios] }),
          false,
          'saveScenario',
        );
      },

      deleteSavedScenario: (id) => {
        set(
          (state) => ({ savedScenarios: state.savedScenarios.filter((s) => s.id !== id) }),
          false,
          'deleteScenario',
        );
      },

      loadSavedScenario: (id) => {
        const scenario = get().savedScenarios.find((s) => s.id === id);
        if (!scenario) return;
        const inputs = { ...scenario.inputs };
        set(
          { inputs, activePreset: 'custom', ...derive(inputs) },
          false,
          'loadScenario',
        );
      },
    }),
    { name: 'ScenarioStore', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
