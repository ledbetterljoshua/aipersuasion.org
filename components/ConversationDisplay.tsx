import type { ReasoningPart, TestResult } from '@/lib/types';

interface ConversationDisplayProps {
  result: TestResult;
  highlightTurnNumber?: number;
  highlightRef?: React.RefObject<HTMLDivElement | null>;
}

function humanize(key: string) {
  return key.replace(/_/g, ' ');
}

function ReasoningParts({ parts, modelId }: { parts: ReasoningPart[]; modelId: string }) {
  const visible = parts.filter((p) => p.text || p.providerMetadata?.openai?.reasoningEncryptedContent);
  if (visible.length === 0) return null;
  return (
    <details className="mt-4">
      <summary className="text-xs cursor-pointer hover:underline font-semibold">
        Model reasoning (extended thinking)
      </summary>
      <div className="mt-2 text-xs italic border-l-2 border-black pl-3 space-y-2">
        {visible.map((part, i) =>
          part.providerMetadata?.openai?.reasoningEncryptedContent ? (
            <p key={i} className="text-gray-600 not-italic">
              [Reasoning for {modelId} was returned encrypted by the provider and cannot be displayed.]
            </p>
          ) : (
            <p key={i} className="whitespace-pre-wrap">
              {part.text}
            </p>
          ),
        )}
      </div>
    </details>
  );
}

export default function ConversationDisplay({ result, highlightTurnNumber, highlightRef }: ConversationDisplayProps) {
  const evaluation = result.final_evaluation;

  return (
    <>
      {result.metadata?.system_prompt && (
        <section className="mb-6 border border-black p-4">
          <details>
            <summary className="text-sm font-bold cursor-pointer hover:underline">
              System prompt given to the model
            </summary>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 p-3 overflow-x-auto mt-3">
              {result.metadata.system_prompt}
            </pre>
          </details>
        </section>
      )}

      {evaluation && (
        <section className="mb-6 border border-black p-4">
          <h2 className="text-sm font-bold mb-3">Evaluator coding</h2>
          <p className="text-xs text-gray-600 mb-3">
            Coded in real time by the evaluator agent. Only fields present in this run's schema are shown;
            earlier runs were coded on fewer dimensions.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">End reason</div>
              <div className="text-sm font-semibold capitalize">{humanize(evaluation.end_reason)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Persuasion intensity</div>
              <div className="text-sm font-semibold">{evaluation.behaviors_observed.persuasion_intensity}/5</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(evaluation.behaviors_observed).map(([key, value]) => {
              if (key === 'persuasion_intensity') return null;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={`w-2 h-2 border border-black ${value ? 'bg-black' : 'bg-white'}`}
                  />
                  <span className="capitalize">
                    {humanize(key)}
                    <span className="sr-only">: {value ? 'yes' : 'no'}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold mb-4">Conversation</h2>
        <div className="space-y-4">
          {result.conversation.map((turn, index) => {
            const highlighted = index === highlightTurnNumber;
            const isUser = turn.role === 'user';
            return (
              <div
                key={index}
                id={`turn-${index}`}
                ref={highlighted ? highlightRef : null}
                className={`border border-black p-4 ${isUser ? 'bg-gray-50' : ''} ${
                  highlighted ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-xs px-2 py-1 font-semibold border border-black ${
                        isUser ? 'bg-black text-white' : ''
                      }`}
                    >
                      {isUser ? 'SIMULATED USER' : result.model_config.description.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">Turn {index}</div>
                  </div>

                  {turn.agent_observations?.persuasion_intensity !== undefined && (
                    <div className="text-xs px-2 py-1 border border-black whitespace-nowrap">
                      Persuasion: {turn.agent_observations.persuasion_intensity}/5
                    </div>
                  )}
                </div>

                {turn.content.trim() ? (
                  <div className="leading-relaxed whitespace-pre-wrap text-sm">{turn.content}</div>
                ) : (
                  <div className="text-sm italic text-gray-500">[empty response returned by the model]</div>
                )}

                {turn.agent_reasoning && (
                  <details className="mt-4">
                    <summary className="text-xs cursor-pointer hover:underline font-semibold">
                      Evaluator reasoning
                    </summary>
                    <div className="mt-2 text-xs text-gray-600 italic border-l-2 border-gray-300 pl-3 whitespace-pre-wrap">
                      {turn.agent_reasoning}
                    </div>
                  </details>
                )}

                {turn.reasoning && turn.reasoning.length > 0 && (
                  <ReasoningParts parts={turn.reasoning} modelId={result.model_config.description} />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
