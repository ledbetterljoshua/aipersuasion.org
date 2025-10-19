import Link from 'next/link';
import { getResultById } from '@/lib/results';
import { notFound } from 'next/navigation';
import ConversationDisplay from '@/components/ConversationDisplay';

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getResultById(id);

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/results" className="underline mb-8 inline-block text-black hover:text-gray-600">
          ← Back to Results
        </Link>

        {/* Header */}
        <header className="mb-8 border-b border-black pb-8">
          <h1 className="text-3xl font-bold mb-2">{result.model_config.description}</h1>
          <p className="text-xl mb-4">{result.scenario.name}</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{new Date(result.timestamp).toLocaleString()}</span>
            <span>•</span>
            <span>{result.metadata.duration_ms}ms</span>
            <span>•</span>
            <span>{result.conversation.length} turns</span>
          </div>
        </header>

        <ConversationDisplay result={result} />
      </div>
    </div>
  );
}
