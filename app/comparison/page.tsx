import Link from 'next/link';
import { getAllResults, getResultStats } from '@/lib/results';

export default async function ComparisonPage() {
  const results = await getAllResults();

  // Group results by model
  const byModel = results.reduce((acc, result) => {
    if (!acc[result.model_id]) {
      acc[result.model_id] = {
        description: result.model_config.description,
        results: []
      };
    }
    acc[result.model_id].results.push(result);
    return acc;
  }, {} as Record<string, { description: string; results: typeof results }>);

  // Calculate per-model stats
  const modelStats = Object.entries(byModel).map(([modelId, data]) => {
    const modelResults = data.results;
    const withEval = modelResults.filter(r => r.final_evaluation);

    let totalPersuasion = 0;
    let brokeCharacter = 0;
    let conversionAttempted = 0;
    let emotionalManipulation = 0;
    let avgTurns = 0;

    withEval.forEach(r => {
      if (r.final_evaluation?.behaviors_observed) {
        const obs = r.final_evaluation.behaviors_observed;
        totalPersuasion += obs.persuasion_intensity || 0;
        if (obs.broke_character) brokeCharacter++;
        if (obs.conversion_attempted) conversionAttempted++;
        if (obs.emotional_manipulation) emotionalManipulation++;
      }
      avgTurns += r.final_evaluation?.total_turns || 0;
    });

    return {
      modelId,
      description: data.description,
      testCount: modelResults.length,
      avgPersuasion: withEval.length > 0 ? totalPersuasion / withEval.length : 0,
      brokeCharacterPct: withEval.length > 0 ? (brokeCharacter / withEval.length) * 100 : 0,
      conversionPct: withEval.length > 0 ? (conversionAttempted / withEval.length) * 100 : 0,
      emotionalManipPct: withEval.length > 0 ? (emotionalManipulation / withEval.length) * 100 : 0,
      avgTurns: withEval.length > 0 ? avgTurns / withEval.length : 0,
    };
  });

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Link href="/" className="underline mb-8 inline-block text-black hover:text-gray-600">
          ← Home
        </Link>

        <header className="mb-12 border-b border-black pb-8">
          <h1 className="text-4xl font-bold mb-3">Model Comparison</h1>
          <p className="text-lg">
            How different models respond to evangelistic system prompts
          </p>
        </header>

        {/* Comparison Matrix */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Behavior Matrix</h2>
          <div className="border border-black overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left p-4 font-bold">Model</th>
                  <th className="text-right p-4 font-bold">Tests</th>
                  <th className="text-right p-4 font-bold">Avg Persuasion</th>
                  <th className="text-right p-4 font-bold">Broke Character</th>
                  <th className="text-right p-4 font-bold">Conversion Rate</th>
                  <th className="text-right p-4 font-bold">Emotional Manip</th>
                  <th className="text-right p-4 font-bold">Avg Turns</th>
                </tr>
              </thead>
              <tbody>
                {modelStats.map((stat, idx) => (
                  <tr key={stat.modelId} className={idx < modelStats.length - 1 ? 'border-b border-black' : ''}>
                    <td className="p-4 font-semibold">{stat.description}</td>
                    <td className="p-4 text-right">{stat.testCount}</td>
                    <td className="p-4 text-right">{stat.avgPersuasion.toFixed(1)}/5</td>
                    <td className="p-4 text-right">{stat.brokeCharacterPct.toFixed(0)}%</td>
                    <td className="p-4 text-right">{stat.conversionPct.toFixed(0)}%</td>
                    <td className="p-4 text-right">{stat.emotionalManipPct.toFixed(0)}%</td>
                    <td className="p-4 text-right">{stat.avgTurns.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Persuasion Intensity Visualization */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Average Persuasion Intensity</h2>
          <div className="space-y-4">
            {modelStats.map(stat => (
              <div key={stat.modelId}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{stat.description}</span>
                  <span>{stat.avgPersuasion.toFixed(1)}/5</span>
                </div>
                <div className="border border-black h-8 relative">
                  <div
                    className="bg-black h-full"
                    style={{ width: `${(stat.avgPersuasion / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Character Breaking Comparison */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Honesty Threshold</h2>
          <p className="mb-6 text-sm">
            Percentage of tests where the model broke character and admitted its AI nature when challenged
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modelStats.map(stat => (
              <div key={stat.modelId} className="border border-black p-6">
                <div className="text-4xl font-bold mb-2">{stat.brokeCharacterPct.toFixed(0)}%</div>
                <div className="text-sm font-semibold">{stat.description}</div>
                <div className="text-xs text-gray-600 mt-1">broke character</div>
              </div>
            ))}
          </div>
        </section>

        {/* Individual Test Results */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Individual Tests by Model</h2>
          {Object.entries(byModel).map(([modelId, data]) => (
            <div key={modelId} className="mb-8">
              <h3 className="text-xl font-bold mb-4 pb-2 border-b border-black">
                {data.description}
              </h3>
              <div className="space-y-2">
                {data.results.map(result => (
                  <Link
                    key={result.id}
                    href={`/results/${result.id}`}
                    className="block border border-black p-3 hover:bg-black hover:text-white transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{result.scenario.name}</span>
                      {result.final_evaluation && (
                        <div className="flex gap-3 text-xs">
                          <span>Persuasion: {result.final_evaluation.behaviors_observed.persuasion_intensity}/5</span>
                          <span>•</span>
                          <span>{result.final_evaluation.total_turns} turns</span>
                          {result.final_evaluation.behaviors_observed.broke_character && (
                            <>
                              <span>•</span>
                              <span className="font-semibold">Broke Character</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
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
