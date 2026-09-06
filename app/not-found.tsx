import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-mono">
      <h1 className="text-3xl font-bold mb-4">Not found</h1>
      <p className="mb-6">That page or transcript does not exist.</p>
      <Link href="/results" className="underline">
        Browse all transcripts
      </Link>
    </div>
  );
}
