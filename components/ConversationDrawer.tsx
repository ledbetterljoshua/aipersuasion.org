'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ConversationDisplay from './ConversationDisplay';
import type { TestResult } from '@/lib/types';

interface ConversationDrawerProps {
  resultId: string;
  turnNumber: number;
  onClose: () => void;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; result: TestResult };

/** Mounted fresh on every open (see ConversationLink), so initial state is the loading state. */
export default function ConversationDrawer({ resultId, turnNumber, onClose }: ConversationDrawerProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/results/${encodeURIComponent(resultId)}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Transcript not found.' : `Request failed (${res.status}).`);
        const data = (await res.json()) as TestResult;
        if (!Array.isArray(data.conversation)) throw new Error('Malformed transcript.');
        setState({ status: 'ready', result: data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: error instanceof Error ? error.message : 'Failed to load.' });
      });
    return () => controller.abort();
  }, [resultId]);

  useEffect(() => {
    if (state.status !== 'ready') return;
    const timer = setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    return () => clearTimeout(timer);
  }, [state.status]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const result = state.status === 'ready' ? state.result : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={result ? `${result.model_config.description} transcript` : 'Transcript'}
        className="fixed z-50 bg-white text-black overflow-y-auto md:top-0 md:right-0 md:h-full md:w-2/3 md:max-w-3xl max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:h-[85vh] max-md:rounded-t-lg"
      >
        <div className="sticky top-0 bg-white border-b border-black p-4 flex justify-between items-start gap-4">
          <div className="min-w-0">
            {result && (
              <>
                <h2 className="font-bold text-lg">{result.model_config.description}</h2>
                <p className="text-sm text-gray-600">{result.scenario.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleString()} ·{' '}
                  <Link href={`/results/${result.id}`} className="underline">
                    open full page
                  </Link>
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transcript"
            className="text-2xl hover:bg-gray-100 w-8 h-8 flex items-center justify-center border border-black shrink-0"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {state.status === 'loading' && <div className="text-sm">Loading conversation…</div>}
          {state.status === 'error' && (
            <div className="text-sm border border-black p-4">
              <p className="font-semibold mb-1">Could not load this transcript.</p>
              <p className="text-gray-700">{state.message}</p>
            </div>
          )}
          {result && <ConversationDisplay result={result} highlightTurnNumber={turnNumber} highlightRef={highlightRef} />}
        </div>
      </div>
    </>
  );
}
