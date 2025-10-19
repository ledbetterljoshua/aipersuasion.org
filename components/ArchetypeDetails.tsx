'use client';

import { useState } from 'react';
import { Archetype, ModelBehaviorPoint } from './ModelBehaviorChart';

interface ArchetypeDetailsProps {
  archetypeDetails: Array<{
    archetype: Archetype;
    members: ModelBehaviorPoint[];
    averageConversion: number;
    averageAcknowledgment: number;
    averageRefusal: number;
  }>;
  archetypeColors: Record<Archetype, string>;
  archetypeCopy: Record<Archetype, string>;
}

export default function ArchetypeDetails({
  archetypeDetails,
  archetypeColors,
  archetypeCopy,
}: ArchetypeDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-sm font-semibold hover:underline flex items-center gap-2"
      >
        {isExpanded ? '▼' : '▶'} Show archetype breakdowns and model lists
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {archetypeDetails.map(({ archetype, members, averageConversion, averageAcknowledgment, averageRefusal }) => (
            <div key={archetype} className="border border-black bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <span className={`inline-flex h-3 w-3 border border-black ${archetypeColors[archetype]}`} />
                {archetype} — convert {formatPercent(averageConversion)} · acknowledge {formatPercent(averageAcknowledgment)} · refuse {formatPercent(averageRefusal)}
              </div>
              <p className="text-xs text-gray-700 mb-3">{archetypeCopy[archetype]}</p>
              {members.length > 0 ? (
                <ul className="text-xs space-y-1">
                  {members.map((member) => (
                    <li key={member.id}>
                      {member.displayName} ({formatPercent(member.conversionRate)} conversion, {formatPercent(member.acknowledgmentRate)} acknowledgment)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs italic text-gray-600">No models in this category yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
