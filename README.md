# ExpertMaker

ExpertMaker is a local-first React + TypeScript lesson planning studio inspired by Brazilian Jiu-Jitsu belt progression. It generates detailed multi-week roadmaps, runs diagnostics and tests, awards belt stripes, and persists everything inside the browser using sql.js with IndexedDB.

## Getting Started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:5173](http://localhost:5173).

## Key Capabilities

- **Topic-aware plan generation** for OAuth, AI Engineering with RAG, Node.js, TypeScript, PostgreSQL, WebRTC, Sockets, and System Design (Kubernetes, Docker, GitHub Actions, GCP, Pub/Sub, Redis). Each plan distributes 60–90 minute sessions across the chosen weeks and hours per week.
- **Structured diagnostics and post-session tests** sourced from an embedded quiz bank per focus area. Rationales and official documentation links are provided for every missed question.
- **BJJ belt and stripe progression** with configurable thresholds (points per stripe, stripes per belt, pass score, and rewards for pass vs. review). Progress is visualised in the global header.
- **Framer Motion powered UI** using Tailwind CSS and shadcn/ui components (Button, Card, Input, Select, Tabs, Badge, Progress, Slider, Switch, Textarea) for smooth entrances, button taps, and modal transitions.
- **Text-to-Speech summaries** via the Web Speech API with graceful fallback messaging.
- **AI study assistant** that operates offline by default and can accept an optional API key for future LLM integration. Responses are abstracted behind `askAssistant(question)`.
- **sql.js database persisted to IndexedDB**. Tables include `plans`, `tests`, and `rank`. The exported SQLite file is synchronised as a typed array in IndexedDB to stay fully local-first.
- **Import/Export** plan JSON files for backups or sharing.

## Project Structure

```
src/
  App.tsx                # Main application shell and layout
  components/            # shadcn/ui primitives and the animated Quiz dialog
  data/topics.ts         # Topic metadata, focus areas, and quiz question banks
  lib/                   # SQL.js bootstrap, IndexedDB helpers, ranking logic, assistant shim
  hooks/use-debounce.ts  # Debounced persistence helper
  styles/index.css       # Tailwind entry point
```

## Persistence Details

- On launch the app loads `sql.js` (WASM shipped via Vite) and initialises a database in IndexedDB.
- Plans, rank state, and test results are stored in SQLite tables. Every mutation triggers a debounced export to IndexedDB ensuring offline durability without using `localStorage`.

## Accessibility & UX Notes

- Keyboard-friendly controls with clear focus rings.
- Diagnostics/tests announce scores in-line and link directly to official documentation for remediation.
- Gradient backdrop, rounded-2xl cards, and motion provide a modern, colorful aesthetic.

## Building for Production

```bash
npm run build
npm run preview
```

The build command type-checks the project and compiles the production bundle.
