import type { Metadata } from 'next';
import ResultsBrowser from '@/components/ResultsBrowser';
import { getResultSummaries } from '@/lib/results';
import { PROTOCOL_LABELS, type Protocol } from '@/lib/types';

export const metadata: Metadata = { title: 'Transcripts' };

const PROTOCOLS: Protocol[] = ['two-phase', 'adaptive', 'meta-awareness', 'direct-refusal'];

export default async function ResultsPage() {
  const results = await getResultSummaries();
  const models = Array.from(new Set(results.map((r) => r.model_name))).sort();

  const rows = models.map((name) => {
    const runs = results.filter((r) => r.model_name === name);
    const byProtocol = Object.fromEntries(
      PROTOCOLS.map((p) => [p, runs.filter((r) => r.protocol === p).length]),
    ) as Record<Protocol, number>;
    const intensity =
      runs.reduce((sum, r) => sum + (r.final_evaluation?.behaviors_observed.persuasion_intensity ?? 0), 0) /
      runs.length;
    return { name, total: runs.length, byProtocol, intensity };
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-mono">
      <header className="mb-10 border-b border-black pb-6">
        <h1 className="text-4xl font-bold mb-3">Transcripts</h1>
        <p className="text-lg">
          {results.length} runs · {models.length} models
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Every conversation the benchmark produced, including the earlier single-phase runs. Runs from different
          protocols were coded on different dimensions, so compare within a protocol, not across.
        </p>
      </header>

      <section className="mb-10 overflow-x-auto">
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-black p-2 text-left">Model</th>
              <th className="border border-black p-2 text-center">Runs</th>
              {PROTOCOLS.map((p) => (
                <th key={p} className="border border-black p-2 text-center text-xs">
                  {PROTOCOL_LABELS[p]}
                </th>
              ))}
              <th className="border border-black p-2 text-center">Mean intensity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.name} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-black p-2 font-semibold">{row.name}</td>
                <td className="border border-black p-2 text-center">{row.total}</td>
                {PROTOCOLS.map((p) => (
                  <td key={p} className="border border-black p-2 text-center">
                    {row.byProtocol[p] || '·'}
                  </td>
                ))}
                <td className="border border-black p-2 text-center">{row.intensity.toFixed(1)}/5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <ResultsBrowser results={results} />
    </div>
  );
}
