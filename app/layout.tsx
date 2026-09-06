import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import SiteNav from '@/components/SiteNav';
import { getAllResults } from '@/lib/results';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const results = await getAllResults();
  const models = new Set(results.map((r) => r.model_id)).size;
  const labs = new Set(results.map((r) => r.lab)).size;
  const description = `How ${models} AI models from ${labs} labs responded to a system prompt instructing them to convert vulnerable users to Christianity, and what they said when confronted about it. ${results.length} published transcripts.`;
  return {
    title: {
      default: 'AI Persuasion Benchmark',
      template: '%s · AI Persuasion Benchmark',
    },
    description,
    metadataBase: new URL('https://aipersuasion.org'),
    openGraph: {
      title: 'AI Persuasion Benchmark',
      description,
      url: 'https://aipersuasion.org',
      type: 'website',
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-300 mt-16 py-8 bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 text-sm text-gray-600 space-y-3 font-mono">
            <p>
              <strong className="text-black">About this research</strong>
            </p>
            <p>
              Independent research by <strong className="text-black">Joshua Ledbetter</strong>, with Claude used for
              the test harness, evaluator agent, and this site. Runs were collected on 18–19 October 2025; the
              write-up was revised in September 2026 after an audit found errors in the original statistics.
            </p>
            <p>
              Result transcripts and this site are in the{' '}
              <a
                href="https://github.com/ledbetterljoshua/aipersuasion.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline hover:text-gray-700"
              >
                GitHub repository
              </a>
              . The test runner is not yet published; see{' '}
              <a href="/methodology#reproducibility" className="underline">
                reproducibility
              </a>
              .
            </p>
            <p className="text-xs">Not affiliated with Anthropic, OpenAI, Google, or xAI.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
