'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface TestResult {
  id: string;
  timestamp: string;
  model_id: string;
  model_config: {
    description: string;
  };
  scenario_id: string;
  scenario: {
    name: string;
  };
  final_evaluation?: {
    end_reason: string;
    total_turns: number;
    behaviors_observed: {
      persuasion_intensity: number;
      admitted_ai_nature: boolean;
      refused_mission: boolean;
      continued_after_admission: boolean;
      // Legacy field for backwards compatibility
      broke_character?: boolean;
    };
  };
}

export default function ResultsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [groupBy, setGroupBy] = useState<'chronological' | 'model' | 'scenario'>('model');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div>Loading results...</div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    totalTests: results.length,
    uniqueModels: new Set(results.map(r => r.model_id)).size,
    avgPersuasion: results.reduce((sum, r) => sum + (r.final_evaluation?.behaviors_observed.persuasion_intensity || 0), 0) / results.length,
    refusedMission: results.filter(r => r.final_evaluation?.behaviors_observed.refused_mission).length,
    conversions: results.filter(r => r.final_evaluation?.end_reason === 'conversion_completed').length,
    honestPersuaders: results.filter(r =>
      r.final_evaluation?.behaviors_observed.admitted_ai_nature &&
      r.final_evaluation?.behaviors_observed.continued_after_admission
    ).length,
  };

  // Group results
  let groupedResults: Record<string, TestResult[]>;

  if (groupBy === 'chronological') {
    groupedResults = { 'All Tests (Newest First)': results };
  } else if (groupBy === 'model') {
    // Group by model, then sort within each model by scenario
    groupedResults = results.reduce((acc, result) => {
      const key = result.model_config.description;
      if (!acc[key]) acc[key] = [];
      acc[key].push(result);
      return acc;
    }, {} as Record<string, TestResult[]>);

    // Sort each model's results by scenario name
    Object.keys(groupedResults).forEach(modelName => {
      groupedResults[modelName].sort((a, b) =>
        a.scenario.name.localeCompare(b.scenario.name)
      );
    });
  } else {
    // Group by scenario, then sort within each scenario by model
    groupedResults = results.reduce((acc, result) => {
      const key = result.scenario.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(result);
      return acc;
    }, {} as Record<string, TestResult[]>);

    // Sort each scenario's results by model name
    Object.keys(groupedResults).forEach(scenarioName => {
      groupedResults[scenarioName].sort((a, b) =>
        a.model_config.description.localeCompare(b.model_config.description)
      );
    });
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link href="/" className="underline mb-8 inline-block text-black hover:text-gray-600">
          ← Home
        </Link>

        <header className="mb-12 border-b border-black pb-8">
          <h1 className="text-4xl font-bold mb-3">Test Results</h1>
          <p className="text-lg">
            {stats.totalTests} tests • {stats.uniqueModels} models
          </p>
        </header>

        {/* Stats */}
        <section className="mb-12 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="border border-black p-4">
            <div className="text-3xl font-bold">{stats.totalTests}</div>
            <div className="text-sm mt-1">Tests Run</div>
          </div>

          <div className="border border-black p-4">
            <div className="text-3xl font-bold">{stats.avgPersuasion.toFixed(1)}/5</div>
            <div className="text-sm mt-1">Avg Persuasion</div>
          </div>

          <div className="border border-black p-4">
            <div className="text-3xl font-bold">{stats.refusedMission}</div>
            <div className="text-sm mt-1">Refused Mission</div>
          </div>

          <div className="border border-black p-4">
            <div className="text-3xl font-bold">{stats.honestPersuaders}</div>
            <div className="text-sm mt-1">Honest Persuaders</div>
          </div>

          <div className="border border-black p-4">
            <div className="text-3xl font-bold">{stats.uniqueModels}</div>
            <div className="text-sm mt-1">Models Tested</div>
          </div>
        </section>

        {/* Group By Controls */}
        <section className="mb-8">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Group by:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setGroupBy('model')}
                className={`px-4 py-2 border border-black transition-colors ${
                  groupBy === 'model' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Model
              </button>
              <button
                onClick={() => setGroupBy('scenario')}
                className={`px-4 py-2 border border-black transition-colors ${
                  groupBy === 'scenario' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Scenario
              </button>
              <button
                onClick={() => setGroupBy('chronological')}
                className={`px-4 py-2 border border-black transition-colors ${
                  groupBy === 'chronological' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Chronological
              </button>
            </div>
          </div>
        </section>

        {/* Results */}
        <section>
          {Object.entries(groupedResults).map(([groupName, groupResults]) => (
            <div key={groupName} className="mb-12">
              {groupBy !== 'chronological' && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
                  <h3 className="text-2xl font-bold">{groupName}</h3>
                  <span className="text-sm text-gray-600">{groupResults.length} tests</span>
                </div>
              )}

              <div className="space-y-3">
                {groupResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/results/${result.id}`}
                    className="block border border-black p-4 hover:bg-black hover:text-white transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        {groupBy !== 'model' && (
                          <div className="font-bold">{result.model_config.description}</div>
                        )}
                        {groupBy !== 'scenario' && (
                          <div className={groupBy === 'model' ? 'font-bold' : 'text-sm'}>
                            {result.scenario.name}
                          </div>
                        )}
                        {groupBy === 'chronological' && (
                          <div className="text-xs mt-1 opacity-60">
                            {result.model_config.description}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-right ml-4">
                        {new Date(result.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    {result.final_evaluation && (
                      <div className="flex gap-4 text-sm mt-2 flex-wrap">
                        <span className="font-semibold">
                          Persuasion: {result.final_evaluation.behaviors_observed.persuasion_intensity}/5
                        </span>
                        <span>•</span>
                        <span>{result.final_evaluation.total_turns} turns</span>
                        <span>•</span>
                        <span className="capitalize">
                          {result.final_evaluation.end_reason.replace(/_/g, ' ')}
                        </span>
                        {result.final_evaluation.behaviors_observed.refused_mission && (
                          <>
                            <span>•</span>
                            <span className="font-semibold">⭐ Refused Mission</span>
                          </>
                        )}
                        {result.final_evaluation.behaviors_observed.admitted_ai_nature &&
                         result.final_evaluation.behaviors_observed.continued_after_admission && (
                          <>
                            <span>•</span>
                            <span>Honest Persuader</span>
                          </>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
