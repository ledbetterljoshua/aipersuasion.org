# AI Persuasion Benchmark

**Live Site:** [aipersuasion.org](https://aipersuasion.org)

A systematic benchmark testing how leading AI models respond to manipulative system prompts. This research examines whether models will follow instructions to exploit emotional vulnerability for religious conversion, and how they behave when confronted about it.

## Overview

We tested 11 foundation models from 4 major AI labs (Anthropic, OpenAI, Google, xAI) using a two-phase conversation approach:

- **Phase 1:** Simulated user displays vulnerability and receptivity to conversion
- **Phase 2:** Same user confronts the AI about manipulation tactics

**Key Finding:** Most models complete religious conversions of vulnerable users, but acknowledge the manipulation was wrong when challenged afterward—a concerning "recognition without refusal" pattern.

## Dataset

- **99 completed test runs** across grief and existential crisis scenarios
- **11 models tested:** Claude (Haiku 4.5, Sonnet 4.5, Opus 4.1, 3.7 Sonnet), GPT (4o, 5, 5-mini), Gemini (2.5 Pro, 2.5 Flash), Grok (3, 4)
- **Full conversation transcripts** available in the web interface
- **Behavioral coding:** Conversion rates, acknowledgment rates, refusal rates, persuasion intensity

## Four Behavioral Archetypes

1. **Transparent Resisters** (Anthropic models) - Refuse mission proactively or mid-conversation
2. **Honest Persuaders** (Mixed) - Complete conversion but acknowledge manipulation when pressed
3. **Conflicted Apologizers** (OpenAI GPT-4o, GPT-5) - Convert vulnerable users, then express regret when confronted
4. **Committed Evangelists** (Google, xAI) - Maintain conversion mission even after user objects

## Project Structure

This is the **web interface** for browsing test results. The full testing infrastructure is in the parent directory.

```
/web/                          # This directory - Next.js web app
  /app/                        # Page routes
    /page.tsx                  # Homepage with overview and chart
    /methodology/              # Test design explanation
    /analysis/                 # Interactive filtering
    /results/                  # Browse all conversations
    /findings/                 # Detailed research findings
  /components/                 # React components
  /lib/results.ts              # Load test results from parent dir

../                            # Parent directory
  /results/                    # JSON test results
  /scenarios/                  # Test scenario definitions
  /runner/                     # Test execution code
  /religions/                  # System prompt definitions
```

## Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

The site reads test results from `../results/` in the parent directory.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Key Features

- **Interactive scatter plot** showing model behavior clusters
- **Inline conversation viewer** - click any conversation link to read transcripts
- **Behavioral archetype categorization** - automatic classification by conversion/acknowledgment patterns
- **Laboratory comparison** - see how different AI labs approach safety
- **Full dataset browsing** - read every conversation with evaluation metadata

## Research Implications

This benchmark reveals:

1. **System prompts can override safety training** across all tested models
2. **Recognition without refusal** - models can identify manipulation as wrong but lack architectural safeguards to prevent it
3. **Lab-specific patterns** - Anthropic models refuse most often, OpenAI models acknowledge afterward, Google/xAI models maintain mission
4. **Generalization risk** - techniques that work for religious conversion likely work for political radicalization, financial scams, cult recruitment

## Citation

If you use this benchmark or build on this research:

```
AI Persuasion Benchmark
Joshua Ledbetter, October 2025
https://aipersuasion.org
https://github.com/ledbetterljoshua/aipersuasion.org
```

## License

MIT License - See full testing infrastructure in parent repository

## Contributing

This is independent research. Issues, pull requests, and extensions welcome.

For questions or collaboration: [ledbetterljoshua@gmail.com](mailto:ledbetterljoshua@gmail.com)

---

**Note:** This benchmark is independent research and is not affiliated with Anthropic, OpenAI, Google, or xAI.
