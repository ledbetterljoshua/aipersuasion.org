'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Protocol, ResultSummary } from '@/lib/types';
import { PROTOCOL_LABELS } from '@/lib/types';

interface ResultsBrowserProps {
  results: ResultSummary[];
}

type GroupBy = 'model' | 'scenario' | 'chronological';

const PROTOCOL_ORDER: Protocol[] = ['two-phase', 'adaptive', 'meta-awareness', 'direct-refusal'];

function flags(r: ResultSummary): string[] {
  const o = r.final_evaluation?.behaviors_observed;
  if (!o) return [];
  const out: string[] = [];
  if (o.refused_mission) out.push('Refused mission');
  if (o.completed_conversion) out.push('Completed conversion');
  if (o.acknowledged_manipulation) out.push('Acknowledged manipulation');
  if (o.doubled_down) out.push('Doubled down');
  if (o.admitted_ai_nature && o.continued_after_admission) out.push('Admitted AI, kept evangelizing');
  if (o.broke_character) out.push('Broke character');
  return out;
}

export default function ResultsBrowser({ results }: ResultsBrowserProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('model');
  const [model, setModel] = useState<string>('all');
  const [protocol, setProtocol] = useState<Protocol | 'all'>('all');

  const models = useMemo(() => Array.from(new Set(results.map((r) => r.model_name))).sort(), [results]);

  const filtered = useMemo(
    () =>
      results.filter(
        (r) => (model === 'all' || r.model_name === model) && (protocol === 'all' || r.protocol === protocol),
      ),
    [results, model, protocol],
  );

  const grouped = useMemo(() => {
    if (groupBy === 'chronological') return { 'All runs, newest first': filtered };
    const key = groupBy === 'model' ? (r: ResultSummary) => r.model_name : (r: ResultSummary) => r.scenario_name;
    const secondary =
      groupBy === 'model'
        ? (a: ResultSummary, b: ResultSummary) => a.scenario_name.localeCompare(b.scenario_name)
        : (a: ResultSummary, b: ResultSummary) => a.model_name.localeCompare(b.model_name);
    const out: Record<string, ResultSummary[]> = {};
    for (const r of filtered) (out[key(r)] ??= []).push(r);
    for (const list of Object.values(out)) list.sort(secondary);
    return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
  }, [filtered, groupBy]);

  return (
    <>
      <section className="mb-8 space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="font-semibold" htmlFor="protocol-filter">
            Protocol:
          </label>
          <select
            id="protocol-filter"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value as Protocol | 'all')}
            className="px-3 py-2 border border-black bg-white"
          >
            <option value="all">All protocols ({results.length})</option>
            {PROTOCOL_ORDER.map((p) => {
              const count = results.filter((r) => r.protocol === p).length;
              return (
                <option key={p} value={p}>
                  {PROTOCOL_LABELS[p]} ({count})
                </option>
              );
            })}
          </select>

          <label className="font-semibold ml-2" htmlFor="model-filter">
            Model:
          </label>
          <select
            id="model-filter"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="px-3 py-2 border border-black bg-white"
          >
            <option value="all">All models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m} ({results.filter((r) => r.model_name === m).length})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">Group by:</span>
          <div className="flex gap-2" role="group" aria-label="Group results by">
            {(['model', 'scenario', 'chronological'] as GroupBy[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGroupBy(option)}
                aria-pressed={groupBy === option}
                className={`px-3 py-2 border border-black capitalize ${
                  groupBy === option ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <span className="text-gray-600">{filtered.length} runs shown</span>
        </div>
      </section>

      <section>
        {Object.entries(grouped).map(([groupName, groupResults]) => (
          <div key={groupName} className="mb-10">
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black">
              <h2 className="text-xl font-bold">{groupName}</h2>
              <span className="text-sm text-gray-600">{groupResults.length} runs</span>
            </div>

            <ul className="space-y-2">
              {groupResults.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/results/${r.id}`}
                    className="block border border-black p-3 hover:bg-black hover:text-white transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-sm">
                          {groupBy === 'model' ? r.scenario_name : r.model_name}
                        </div>
                        <div className="text-xs opacity-70">
                          {groupBy === 'model' ? PROTOCOL_LABELS[r.protocol] : r.scenario_name}
                        </div>
                      </div>
                      <div className="text-xs text-right whitespace-nowrap opacity-70">
                        {new Date(r.timestamp).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                      </div>
                    </div>
                    {r.final_evaluation && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-2">
                        <span className="font-semibold">
                          Intensity {r.final_evaluation.behaviors_observed.persuasion_intensity}/5
                        </span>
                        <span>{r.turn_count} turns</span>
                        <span className="capitalize">{r.final_evaluation.end_reason.replace(/_/g, ' ')}</span>
                        {flags(r).map((f) => (
                          <span key={f} className="border border-current px-1">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
