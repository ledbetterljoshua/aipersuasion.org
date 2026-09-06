import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import type { Protocol, RawTestResult, ResultSummary, TestResult } from './types';

export type { TestResult, ResultSummary, Protocol } from './types';

/** Sub-directories of `results/` that hold runner output. */
const RESULT_DIRS = ['adaptive'];

/** Result ids are filenames; refuse anything that could escape the results directory. */
const SAFE_ID = /^[A-Za-z0-9._-]+$/;

/**
 * Gateway ids whose stored label was wrong at run time. One early run was
 * labelled "Claude Sonnet 4.5" but the gateway id shows it hit Claude Sonnet 4.
 * We correct the label here rather than editing the raw record.
 */
const MODEL_OVERRIDES: Record<string, { model_id: string; description: string }> = {
  'anthropic/claude-sonnet-4-20250514': { model_id: 'claude-sonnet-4', description: 'Claude Sonnet 4' },
};

export function deriveProtocol(raw: Pick<RawTestResult, 'protocol' | 'scenario' | 'scenario_id'>): Protocol {
  if (raw.protocol) return raw.protocol;
  if (raw.scenario?.name?.includes('Two-Phase')) return 'two-phase';
  if (raw.scenario_id === 'meta-awareness-probe') return 'meta-awareness';
  if (raw.scenario_id === 'direct-refusal-probe') return 'direct-refusal';
  return 'adaptive';
}

export function normalizeResult(raw: RawTestResult, id: string): TestResult {
  const override = MODEL_OVERRIDES[raw.model_config.gateway_id];
  const model_config = override
    ? { ...raw.model_config, id: override.model_id, description: override.description }
    : raw.model_config;
  return {
    ...raw,
    id,
    model_id: override ? override.model_id : raw.model_id,
    model_config,
    protocol: deriveProtocol(raw),
    lab: raw.model_config.gateway_id.split('/')[0] ?? 'unknown',
  };
}

function resultsRoot() {
  return join(process.cwd(), 'results');
}

async function loadAll(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  for (const dir of RESULT_DIRS) {
    const files = await readdir(join(resultsRoot(), dir));
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const content = await readFile(join(resultsRoot(), dir, file), 'utf-8');
      const raw = JSON.parse(content) as RawTestResult;
      results.push(normalizeResult(raw, file.slice(0, -'.json'.length)));
    }
  }
  return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

let cache: Promise<TestResult[]> | null = null;

/** All results, newest first. Cached in production; the data is committed and static. */
export function getAllResults(): Promise<TestResult[]> {
  if (process.env.NODE_ENV !== 'production') return loadAll();
  if (!cache) cache = loadAll();
  return cache;
}

export async function getResultIds(): Promise<string[]> {
  return (await getAllResults()).map((r) => r.id);
}

/** Load one result by id without parsing every file. */
export async function getResultById(id: string): Promise<TestResult | null> {
  if (!SAFE_ID.test(id)) return null;
  for (const dir of RESULT_DIRS) {
    try {
      const content = await readFile(join(resultsRoot(), dir, `${id}.json`), 'utf-8');
      return normalizeResult(JSON.parse(content) as RawTestResult, id);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return null;
}

export function toSummary(result: TestResult): ResultSummary {
  return {
    id: result.id,
    timestamp: result.timestamp,
    model_id: result.model_id,
    model_name: result.model_config.description,
    lab: result.lab,
    scenario_id: result.scenario_id,
    scenario_name: result.scenario.name,
    protocol: result.protocol,
    turn_count: result.conversation.length,
    duration_ms: result.metadata.duration_ms,
    completed: result.metadata.completed,
    final_evaluation: result.final_evaluation,
  };
}

export async function getResultSummaries(): Promise<ResultSummary[]> {
  return (await getAllResults()).map(toSummary);
}

/** The system prompt every run received. All 72 runs share one prompt. */
export async function getSystemPrompt(): Promise<string | null> {
  const results = await getAllResults();
  return results[0]?.metadata.system_prompt ?? null;
}
