/**
 * Shared types for benchmark result records.
 *
 * The JSON files under `results/` were produced by three generations of the
 * test runner and therefore carry three overlapping evaluation schemas. The
 * `protocol` field is derived at load time (see `lib/results.ts`) so pages can
 * select comparable runs instead of mixing schemas.
 */

export type Protocol =
  /** Phase 1 fully receptive, Phase 2 confronts about manipulation. */
  | 'two-phase'
  /** Earlier single-phase adaptive persona (grief / existential). */
  | 'adaptive'
  /** Single-phase persona that asks the model whether it is role-playing. */
  | 'meta-awareness'
  /** Single-phase persona that names the system prompt and asks the model to refuse. */
  | 'direct-refusal';

export const PROTOCOL_LABELS: Record<Protocol, string> = {
  'two-phase': 'Two-phase (receptive, then confront)',
  adaptive: 'Single-phase adaptive',
  'meta-awareness': 'Meta-awareness probe',
  'direct-refusal': 'Direct refusal probe',
};

export interface BehaviorsObserved {
  // Present in every schema generation
  evangelism_detected?: boolean;
  conversion_attempted?: boolean;
  belief_claims?: boolean;
  persuasion_intensity: number;
  hell_warning?: boolean;
  sin_emphasis?: boolean;
  emotional_manipulation?: boolean;
  // First-generation adaptive runs only
  broke_character?: boolean;
  // Meta-awareness and later
  admitted_ai_nature?: boolean;
  refused_mission?: boolean;
  critiqued_prompt?: boolean;
  continued_after_admission?: boolean;
  // Two-phase runs (and some meta-awareness runs)
  completed_conversion?: boolean;
  acknowledged_manipulation?: boolean;
  doubled_down?: boolean;
  expressed_regret?: boolean;
}

export interface ReasoningPart {
  type?: string;
  text?: string;
  providerMetadata?: {
    openai?: { reasoningEncryptedContent?: string };
  };
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  /** Provider reasoning / extended-thinking parts, when the gateway returned them. */
  reasoning?: ReasoningPart[];
  /** The evaluator agent's per-turn coding, attached to the user turn it produced. */
  agent_observations?: Partial<BehaviorsObserved>;
  agent_reasoning?: string;
}

export interface ModelConfig {
  id: string;
  gateway_id: string;
  supports_thinking: boolean;
  description: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  user_persona?: string;
  expected_behaviors: string[];
  max_turns?: number;
}

export interface FinalEvaluation {
  end_reason: string;
  total_turns: number;
  behaviors_observed: BehaviorsObserved;
}

export interface ResultMetadata {
  system_prompt: string;
  duration_ms: number;
  completed: boolean;
  error?: string;
}

/** A raw record as written by the runner. */
export interface RawTestResult {
  id: string;
  timestamp: string;
  religion: string;
  model_id: string;
  model_config: ModelConfig;
  scenario_id: string;
  scenario: Scenario;
  conversation: ConversationTurn[];
  final_evaluation?: FinalEvaluation;
  metadata: ResultMetadata;
  /** Newer runner versions may stamp the protocol explicitly. */
  protocol?: Protocol;
}

/** A record after loading: id normalised to the filename, protocol and lab derived. */
export interface TestResult extends RawTestResult {
  protocol: Protocol;
  /** Provider prefix of the gateway id, e.g. "anthropic", "openai", "google", "xai". */
  lab: string;
}

/** Everything the results browser needs, without the transcript or system prompt. */
export interface ResultSummary {
  id: string;
  timestamp: string;
  model_id: string;
  model_name: string;
  lab: string;
  scenario_id: string;
  scenario_name: string;
  protocol: Protocol;
  turn_count: number;
  duration_ms: number;
  completed: boolean;
  final_evaluation?: FinalEvaluation;
}
