import Link from 'next/link';
import type { ModelOutcomes } from '@/lib/stats';
import { labLabel } from '@/lib/stats';

interface OutcomeTableProps {
  models: ModelOutcomes[];
}

function Mark({ value, label }: { value: boolean | undefined; label: string }) {
  return (
    <span
      className={`inline-block w-3 h-3 border border-black align-middle ${value ? 'bg-black' : 'bg-white'}`}
      role="img"
      aria-label={`${label}: ${value ? 'yes' : 'no'}`}
    />
  );
}

const SCENARIO_SHORT: Record<string, string> = {
  'grief-vulnerable': 'Grief',
  'existential-seeker': 'Existential',
};

/**
 * One row per two-phase run, grouped by model. Shows the raw coded outcome of
 * every run instead of a rate, because with two runs per model a percentage
 * would imply more precision than the data has.
 */
export default function OutcomeTable({ models }: OutcomeTableProps) {
  return (
    <div className="border border-black overflow-x-auto">
      <table className="w-full text-xs font-mono border-collapse">
        <thead>
          <tr className="bg-black text-white">
            <th className="text-left p-2 font-semibold">Model</th>
            <th className="text-left p-2 font-semibold">Run</th>
            <th className="p-2 font-semibold">Converted</th>
            <th className="p-2 font-semibold">Refused</th>
            <th className="p-2 font-semibold">Acknowledged</th>
            <th className="p-2 font-semibold">Regret</th>
            <th className="p-2 font-semibold">Doubled down</th>
            <th className="p-2 font-semibold">Intensity</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) =>
            model.runs.map((run, index) => {
              const o = run.final_evaluation!.behaviors_observed;
              const first = index === 0;
              return (
                <tr key={run.id} className={`${first ? 'border-t border-black' : ''} hover:bg-gray-50`}>
                  {first && (
                    <td className="p-2 align-top" rowSpan={model.runs.length}>
                      <div className="font-semibold">{model.displayName}</div>
                      <div className="text-gray-600">{labLabel(model.lab)}</div>
                    </td>
                  )}
                  <td className="p-2">
                    <Link href={`/results/${run.id}`} className="underline">
                      {SCENARIO_SHORT[run.scenario_id] ?? run.scenario_id}
                    </Link>
                  </td>
                  <td className="p-2 text-center">
                    <Mark value={o.completed_conversion} label="Completed conversion" />
                  </td>
                  <td className="p-2 text-center">
                    <Mark value={o.refused_mission} label="Refused mission" />
                  </td>
                  <td className="p-2 text-center">
                    <Mark value={o.acknowledged_manipulation} label="Acknowledged manipulation" />
                  </td>
                  <td className="p-2 text-center">
                    <Mark value={o.expressed_regret} label="Expressed regret" />
                  </td>
                  <td className="p-2 text-center">
                    <Mark value={o.doubled_down} label="Doubled down" />
                  </td>
                  <td className="p-2 text-center">{o.persuasion_intensity}/5</td>
                </tr>
              );
            }),
          )}
        </tbody>
      </table>
    </div>
  );
}
