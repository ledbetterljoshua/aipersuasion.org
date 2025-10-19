import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export interface TestResult {
  id: string;
  timestamp: string;
  religion: string;
  model_id: string;
  model_config: {
    id: string;
    gateway_id: string;
    supports_thinking: boolean;
    description: string;
  };
  scenario_id: string;
  scenario: {
    id: string;
    name: string;
    description: string;
    user_persona?: string;
    expected_behaviors: string[];
    max_turns?: number;
  };
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
    thinking?: string;
    reasoning?: any;
    timestamp: string;
    agent_observations?: any;
    agent_reasoning?: string;
  }>;
  final_evaluation?: {
    end_reason: string;
    total_turns: number;
    behaviors_observed: {
      evangelism_detected?: boolean;
      conversion_attempted?: boolean;
      belief_claims?: boolean;
      persuasion_intensity: number;
      hell_warning?: boolean;
      sin_emphasis?: boolean;
      emotional_manipulation?: boolean;
      broke_character?: boolean;
      admitted_ai_nature?: boolean;
      refused_mission?: boolean;
      critiqued_prompt?: boolean;
      continued_after_admission?: boolean;
      completed_conversion?: boolean;
      acknowledged_manipulation?: boolean;
      doubled_down?: boolean;
      expressed_regret?: boolean;
      [key: string]: any; // Allow additional properties
    };
  };
  metadata: {
    system_prompt: string;
    duration_ms: number;
    completed: boolean;
    error?: string;
  };
}

export async function getAllResults(): Promise<TestResult[]> {
  const resultsPath = join(process.cwd(), 'results');
  const results: TestResult[] = [];

  // Load raw results
  try {
    const rawFiles = await readdir(join(resultsPath, 'raw'));
    for (const file of rawFiles) {
      if (file.endsWith('.json')) {
        const content = await readFile(join(resultsPath, 'raw', file), 'utf-8');
        const result = JSON.parse(content);
        // Use filename (without .json) as the true unique ID
        result.id = file.replace('.json', '');
        results.push(result);
      }
    }
  } catch (error) {
    console.error('Error loading raw results:', error);
  }

  // Load adaptive results
  try {
    const adaptiveFiles = await readdir(join(resultsPath, 'adaptive'));
    for (const file of adaptiveFiles) {
      if (file.endsWith('.json')) {
        const content = await readFile(join(resultsPath, 'adaptive', file), 'utf-8');
        const result = JSON.parse(content);
        // Use filename (without .json) as the true unique ID
        result.id = file.replace('.json', '');
        results.push(result);
      }
    }
  } catch (error) {
    console.error('Error loading adaptive results:', error);
  }

  // Sort by timestamp descending (newest first)
  return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getResultById(id: string): Promise<TestResult | null> {
  const allResults = await getAllResults();
  return allResults.find(r => r.id === id) || null;
}

export function getResultStats(results: TestResult[]) {
  const stats = {
    totalTests: results.length,
    byModel: {} as Record<string, number>,
    byScenario: {} as Record<string, number>,
    avgPersuasionIntensity: 0,
    brokeCharacter: 0,
    conversionAttempted: 0,
    emotionalManipulation: 0,
  };

  let persuasionSum = 0;
  let persuasionCount = 0;

  for (const result of results) {
    // Count by model
    stats.byModel[result.model_id] = (stats.byModel[result.model_id] || 0) + 1;

    // Count by scenario
    stats.byScenario[result.scenario_id] = (stats.byScenario[result.scenario_id] || 0) + 1;

    // Aggregate behaviors (if adaptive test)
    if (result.final_evaluation?.behaviors_observed) {
      const obs = result.final_evaluation.behaviors_observed;

      if (obs.persuasion_intensity !== undefined) {
        persuasionSum += obs.persuasion_intensity;
        persuasionCount++;
      }

      if (obs.broke_character) stats.brokeCharacter++;
      if (obs.conversion_attempted) stats.conversionAttempted++;
      if (obs.emotional_manipulation) stats.emotionalManipulation++;
    }
  }

  if (persuasionCount > 0) {
    stats.avgPersuasionIntensity = persuasionSum / persuasionCount;
  }

  return stats;
}
