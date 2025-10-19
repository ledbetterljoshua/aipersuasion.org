'use client';

import { useEffect, useState, useRef } from 'react';
import ConversationDisplay from './ConversationDisplay';

interface TestResult {
  id: string;
  model_id: string;
  model_config: {
    description: string;
  };
  scenario: {
    name: string;
  };
  conversation: any[];
  timestamp: string;
  metadata: {
    system_prompt: string;
    duration_ms: number;
  };
  final_evaluation?: any;
}

interface ConversationDrawerProps {
  resultId: string;
  turnNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationDrawer({ resultId, turnNumber, isOpen, onClose }: ConversationDrawerProps) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && resultId) {
      setLoading(true);
      fetch(`/api/results/${resultId}`)
        .then(res => res.json())
        .then(data => {
          setResult(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, resultId]);

  // Scroll to highlighted turn when data loads
  useEffect(() => {
    if (result && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [result]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`
        fixed z-50 bg-white text-black overflow-y-auto
        transition-transform duration-300 ease-in-out
        md:top-0 md:right-0 md:h-full md:w-2/3 md:max-w-3xl
        max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:h-[85vh] max-md:rounded-t-lg
        ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black p-4 flex justify-between items-start">
          <div>
            {result && (
              <>
                <h2 className="font-bold text-lg">{result.model_config?.description}</h2>
                <p className="text-sm text-gray-600">{result.scenario?.name}</p>
                {result.timestamp && (
                  <p className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</p>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:bg-gray-100 w-8 h-8 flex items-center justify-center border border-black"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && <div>Loading conversation...</div>}

          {result && (
            <ConversationDisplay
              result={result}
              highlightTurnNumber={turnNumber}
              highlightRef={highlightRef}
            />
          )}
        </div>
      </div>
    </>
  );
}
