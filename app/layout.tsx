import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Persuasion Benchmark - Testing How AI Models Respond to Manipulative System Prompts",
  description: "Research testing how leading AI models (Claude, GPT, Gemini, Grok) respond to religious conversion system prompts. Interactive dataset with 99 tests across 11 models from 4 labs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="border-t border-gray-300 mt-16 py-8 bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 text-sm text-gray-600 space-y-3">
            <p>
              <strong className="text-black">About This Research</strong>
            </p>
            <p>
              The AI Persuasion Benchmark tests how leading foundation models respond to manipulative system prompts.
              This research was conducted by{" "}
              <a
                href="https://jledbetter.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline hover:text-gray-700"
              >
                Joshua Ledbetter
              </a>{" "}
              in October 2025.
            </p>
            <p>
              All test infrastructure, scenarios, and evaluation code are available in the{" "}
              <a
                href="https://github.com/ledbetterljoshua/religious-ai-test"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline hover:text-gray-700"
              >
                GitHub repository
              </a>.
            </p>
            <p className="text-xs">
              This benchmark is independent research and is not affiliated with Anthropic, OpenAI, Google, or xAI.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
