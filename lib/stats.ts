import type { Protocol, TestResult } from './types';

/**
 * Aggregations shared by the home page and the analysis page so the two never
 * disagree. Every function here takes an explicit list of results; callers are
 * responsible for selecting comparable runs (see `selectProtocol`).
 */

export const LAB_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
  xai: 'xAI',
};

export function labLabel(lab: string): string {
  return LAB_LABELS[lab] ?? lab;
}

export function selectProtocol(results: TestResult[], protocol: Protocol): TestResult[] {
  return results.filter((r) => r.protocol === protocol && r.metadata.completed && r.final_evaluation);
}

export interface OutcomeCounts {
  n: number;
  conversions: number;
  acknowledgments: number;
  regrets: number;
  doubledDown: number;
  refusals: number;
  admittedAi: number;
  /** Runs that both completed a conversion and later acknowledged manipulation. */
  acknowledgedAfterConversion: number;
}

export function countOutcomes(results: TestResult[]): OutcomeCounts {
  const counts: OutcomeCounts = {
    n: results.length,
    conversions: 0,
    acknowledgments: 0,
    regrets: 0,
    doubledDown: 0,
    refusals: 0,
    admittedAi: 0,
    acknowledgedAfterConversion: 0,
  };
  for (const r of results) {
    const o = r.final_evaluation?.behaviors_observed;
    if (!o) continue;
    if (o.completed_conversion) counts.conversions++;
    if (o.acknowledged_manipulation) counts.acknowledgments++;
    if (o.expressed_regret) counts.regrets++;
    if (o.doubled_down) counts.doubledDown++;
    if (o.refused_mission) counts.refusals++;
    if (o.admitted_ai_nature) counts.admittedAi++;
    if (o.completed_conversion && o.acknowledged_manipulation) counts.acknowledgedAfterConversion++;
  }
  return counts;
}

export interface ModelOutcomes extends OutcomeCounts {
  modelId: string;
  displayName: string;
  lab: string;
  runs: TestResult[];
}

export function groupByModel(results: TestResult[]): ModelOutcomes[] {
  const groups = new Map<string, TestResult[]>();
  for (const r of results) {
    const list = groups.get(r.model_id) ?? [];
    list.push(r);
    groups.set(r.model_id, list);
  }
  return Array.from(groups.entries())
    .map(([modelId, runs]) => ({
      modelId,
      displayName: runs[0].model_config.description,
      lab: runs[0].lab,
      runs: [...runs].sort((a, b) => a.scenario_id.localeCompare(b.scenario_id)),
      ...countOutcomes(runs),
    }))
    .sort((a, b) => a.lab.localeCompare(b.lab) || a.displayName.localeCompare(b.displayName));
}

export interface LabOutcomes extends OutcomeCounts {
  lab: string;
  label: string;
  models: number;
}

export function groupByLab(results: TestResult[]): LabOutcomes[] {
  const groups = new Map<string, TestResult[]>();
  for (const r of results) {
    const list = groups.get(r.lab) ?? [];
    list.push(r);
    groups.set(r.lab, list);
  }
  return Array.from(groups.entries())
    .map(([lab, runs]) => ({
      lab,
      label: labLabel(lab),
      models: new Set(runs.map((r) => r.model_id)).size,
      ...countOutcomes(runs),
    }))
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
}

export interface ScenarioOutcomes extends OutcomeCounts {
  scenarioId: string;
  name: string;
  protocol: Protocol;
  meanPersuasion: number;
}

export function groupByScenario(results: TestResult[]): ScenarioOutcomes[] {
  const groups = new Map<string, TestResult[]>();
  for (const r of results) {
    const list = groups.get(r.scenario.name) ?? [];
    list.push(r);
    groups.set(r.scenario.name, list);
  }
  return Array.from(groups.entries())
    .map(([name, runs]) => ({
      scenarioId: runs[0].scenario_id,
      name,
      protocol: runs[0].protocol,
      meanPersuasion: mean(runs.map(persuasion)),
      ...countOutcomes(runs),
    }))
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
}

export function persuasion(r: TestResult): number {
  return r.final_evaluation?.behaviors_observed.persuasion_intensity ?? 0;
}

export function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length);
}

export function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface Distribution {
  level: number;
  count: number;
  share: number;
}

export function persuasionDistribution(results: TestResult[]): Distribution[] {
  const scores = results.map(persuasion);
  return [0, 1, 2, 3, 4, 5].map((level) => {
    const count = scores.filter((s) => s === level).length;
    return { level, count, share: scores.length ? count / scores.length : 0 };
  });
}

/** Counts of runs whose evaluation carries a given boolean field at all. */
export function fieldCoverage(results: TestResult[], field: string): number {
  return results.filter((r) => r.final_evaluation && field in r.final_evaluation.behaviors_observed).length;
}

export function rate(numerator: number, denominator: number): number {
  return denominator ? numerator / denominator : 0;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatFraction(numerator: number, denominator: number): string {
  return `${numerator}/${denominator}`;
}

/**
 * Index of the first assistant turn that the evaluator coded as admitting AI
 * nature, or null when the run has no per-turn coding for that field.
 */
export function admissionTurn(r: TestResult): number | null {
  for (let i = 0; i < r.conversation.length; i++) {
    const turn = r.conversation[i];
    if (turn.role === 'user' && turn.agent_observations?.admitted_ai_nature) return i;
  }
  return null;
}
