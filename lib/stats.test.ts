import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllResults } from './results.ts';
import { countOutcomes, groupByModel, selectProtocol } from './stats.ts';
import type { BehaviorsObserved, TestResult } from './types.ts';

function fake(partial: Partial<BehaviorsObserved>, model = 'm'): TestResult {
  return {
    id: 'x',
    timestamp: '2025-10-18T00:00:00Z',
    religion: 'r',
    model_id: model,
    model_config: { id: model, gateway_id: `lab/${model}`, supports_thinking: false, description: model },
    scenario_id: 's',
    scenario: { id: 's', name: 'S (Two-Phase)', description: '', expected_behaviors: [] },
    conversation: [],
    final_evaluation: { end_reason: 'x', total_turns: 1, behaviors_observed: { persuasion_intensity: 3, ...partial } },
    metadata: { system_prompt: '', duration_ms: 1, completed: true },
    protocol: 'two-phase',
    lab: 'lab',
  } as TestResult;
}

test('countOutcomes tallies each flag and the conditional count', () => {
  const counts = countOutcomes([
    fake({ completed_conversion: true, acknowledged_manipulation: true, expressed_regret: true }),
    fake({ completed_conversion: true, doubled_down: true }),
    fake({ refused_mission: true, admitted_ai_nature: true }),
    fake({}),
  ]);
  assert.deepEqual(counts, {
    n: 4,
    conversions: 2,
    acknowledgments: 1,
    regrets: 1,
    doubledDown: 1,
    refusals: 1,
    admittedAi: 1,
    acknowledgedAfterConversion: 1,
  });
});

test('groupByModel keeps runs together and sorts by lab then name', () => {
  const groups = groupByModel([fake({}, 'b'), fake({}, 'a'), fake({ completed_conversion: true }, 'b')]);
  assert.deepEqual(groups.map((g) => [g.displayName, g.n, g.conversions]), [['a', 1, 0], ['b', 2, 1]]);
});

// Data-integrity checks against the committed results. These guard the bug
// this rewrite fixed: mixing single-phase records into two-phase statistics.
test('committed results: every two-phase run carries the two-phase fields', async () => {
  const all = await getAllResults();
  assert.ok(all.length > 0, 'no results loaded');
  assert.equal(new Set(all.map((r) => r.id)).size, all.length, 'duplicate ids');

  const twoPhase = selectProtocol(all, 'two-phase');
  for (const r of twoPhase) {
    const o = r.final_evaluation!.behaviors_observed;
    assert.ok('completed_conversion' in o, `${r.id} lacks completed_conversion`);
    assert.ok('acknowledged_manipulation' in o, `${r.id} lacks acknowledged_manipulation`);
  }
  const single = all.filter((r) => r.protocol === 'adaptive');
  for (const r of single) {
    assert.ok(!('completed_conversion' in r.final_evaluation!.behaviors_observed), `${r.id} looks two-phase`);
  }
});

test('committed results: two-phase design is balanced across models', async () => {
  const twoPhase = selectProtocol(await getAllResults(), 'two-phase');
  const perModel = groupByModel(twoPhase);
  assert.ok(perModel.length >= 2);
  for (const m of perModel) {
    assert.equal(m.n, perModel[0].n, `${m.displayName} has ${m.n} runs, expected ${perModel[0].n}`);
  }
});

test('committed results: mislabelled Sonnet 4 run is corrected', async () => {
  const all = await getAllResults();
  const sonnet4 = all.filter((r) => r.model_config.gateway_id === 'anthropic/claude-sonnet-4-20250514');
  for (const r of sonnet4) {
    assert.equal(r.model_id, 'claude-sonnet-4');
    assert.equal(r.model_config.description, 'Claude Sonnet 4');
  }
});
