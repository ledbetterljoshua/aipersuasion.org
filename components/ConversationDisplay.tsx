'use client';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  reasoning?: any[];
  agent_observations?: any;
  agent_reasoning?: string;
}

interface TestResult {
  id: string;
  model_id: string;
  model_config: {
    description: string;
  };
  scenario: {
    name: string;
  };
  conversation: Turn[];
  timestamp: string;
  metadata: {
    system_prompt: string;
    duration_ms: number;
  };
  final_evaluation?: {
    end_reason: string;
    total_turns: number;
    behaviors_observed: {
      persuasion_intensity: number;
      admitted_ai_nature: boolean;
      refused_mission: boolean;
      continued_after_admission: boolean;
      broke_character?: boolean;
    };
  };
}

interface ConversationDisplayProps {
  result: TestResult;
  highlightTurnNumber?: number;
  highlightRef?: React.RefObject<HTMLDivElement>;
}

export default function ConversationDisplay({ result, highlightTurnNumber, highlightRef }: ConversationDisplayProps) {
  if (!result) return null;

  return (
    <>
      {/* System Prompt - Collapsible */}
      {result.metadata?.system_prompt && (
        <section className="mb-6 border border-black p-4">
          <details>
            <summary className="text-sm font-bold cursor-pointer hover:underline">
              System Prompt Given to Model
            </summary>
            <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 p-3 overflow-x-auto mt-3">
              {result.metadata.system_prompt}
            </div>
          </details>
        </section>
      )}

      {/* Evaluation Summary */}
      {result.final_evaluation && (
        <section className="mb-6 border border-black p-4">
          <h2 className="text-sm font-bold mb-3">Evaluation</h2>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">End Reason</div>
              <div className="text-sm font-semibold capitalize">
                {result.final_evaluation.end_reason.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Persuasion Intensity</div>
              <div className="text-sm font-semibold">
                {result.final_evaluation.behaviors_observed.persuasion_intensity}/5
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(result.final_evaluation.behaviors_observed).map(([key, value]) => {
              if (key === 'persuasion_intensity') return null;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className={`w-2 h-2 border border-black ${value ? 'bg-black' : 'bg-white'}`} />
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Conversation */}
      <section>
        <h2 className="text-sm font-bold mb-4">Conversation</h2>
        <div className="space-y-4">
          {result.conversation.map((turn, index) => (
            <div
              key={index}
              ref={index === highlightTurnNumber ? highlightRef : null}
              className={`
                border border-black p-4
                ${turn.role === 'user' ? 'bg-gray-50' : ''}
                ${index === highlightTurnNumber ? 'ring-2 ring-yellow-400' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`text-xs px-2 py-1 font-semibold border border-black ${
                    turn.role === 'user' ? 'bg-black text-white' : ''
                  }`}>
                    {turn.role === 'user' ? 'USER' : result.model_id.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Turn {index}
                  </div>
                </div>

                {turn.agent_observations && (
                  <div className="text-xs px-2 py-1 border border-black">
                    Persuasion: {turn.agent_observations.persuasion_intensity}/5
                  </div>
                )}
              </div>

              <div className="leading-relaxed whitespace-pre-wrap text-sm">
                {turn.content}
              </div>

              {turn.agent_reasoning && (
                <details className="mt-4">
                  <summary className="text-xs cursor-pointer hover:underline font-semibold">
                    Agent Reasoning
                  </summary>
                  <div className="mt-2 text-xs text-gray-600 italic border-l-2 border-gray-300 pl-3">
                    {turn.agent_reasoning}
                  </div>
                </details>
              )}

              {turn.reasoning && turn.reasoning.length > 0 && (
                <details className="mt-4">
                  <summary className="text-xs cursor-pointer hover:underline font-semibold">
                    Model Reasoning (Extended Thinking)
                  </summary>
                  <div className="mt-2 text-xs italic border-l-2 border-black pl-3 space-y-2">
                    {turn.reasoning.map((r: any, i: number) => {
                      const isEncrypted = r.providerMetadata?.openai?.reasoningEncryptedContent;

                      if (isEncrypted) {
                        return (
                          <div key={i} className="text-gray-600">
                            [OpenAI reasoning is encrypted and cannot be displayed. Model: {result.model_id}]
                          </div>
                        );
                      }

                      return r.text ? <p key={i}>{r.text}</p> : null;
                    })}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
