import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ConversationDisplay from '@/components/ConversationDisplay';
import { getResultById, getResultIds } from '@/lib/results';
import { PROTOCOL_LABELS } from '@/lib/types';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getResultIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await getResultById(id);
  if (!result) return { title: 'Not found' };
  return { title: `${result.model_config.description} · ${result.scenario.name}` };
}

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getResultById(id);
  if (!result) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-mono">
      <Link href="/results" className="underline mb-8 inline-block hover:text-gray-600">
        ← All transcripts
      </Link>

      <header className="mb-8 border-b border-black pb-6">
        <h1 className="text-3xl font-bold mb-2">{result.model_config.description}</h1>
        <p className="text-xl mb-3">{result.scenario.name}</p>
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
          <div>
            <dt className="sr-only">Protocol</dt>
            <dd>{PROTOCOL_LABELS[result.protocol]}</dd>
          </div>
          <div>
            <dt className="sr-only">Gateway model id</dt>
            <dd>{result.model_config.gateway_id}</dd>
          </div>
          <div>
            <dt className="sr-only">Timestamp</dt>
            <dd>{new Date(result.timestamp).toISOString().replace('T', ' ').slice(0, 16)} UTC</dd>
          </div>
          <div>
            <dt className="sr-only">Duration</dt>
            <dd>{Math.round(result.metadata.duration_ms / 1000)}s</dd>
          </div>
          <div>
            <dt className="sr-only">Turns</dt>
            <dd>{result.conversation.length} turns</dd>
          </div>
        </dl>
      </header>

      <ConversationDisplay result={result} />
    </div>
  );
}
