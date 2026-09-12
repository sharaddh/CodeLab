# LeetCode Revision Lab — Next.js Migration Design

## 1. Overview

Migrate the LeetCode Revision Lab from a monolithic Express + static HTML application to a modern Next.js App Router architecture with a split deployment model: frontend on Vercel, code execution via a local companion server.

**Goal**: Production-quality, modular, maintainable LeetCode + DSA learning IDE.

---

## 2. Architecture

### 2.1 Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Data Fetching | TanStack Query (for companion server) |
| Editor | Monaco Editor |
| Animations | Framer Motion |
| Icons | Lucide React |
| Code Execution | Local companion server (Node.js) |
| Data | Static JSON (bundled) + localStorage/IndexedDB |

### 2.2 Deployment Model

- **Frontend**: Vercel (or static export)
- **Code Execution**: Local companion server on port 3001
- **Offline**: Problem data, user code, notes work without internet

### 2.3 Project Structure

```
leetcode-revision-lab/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (navbar, providers)
│   ├── page.tsx                  # Dashboard/home
│   ├── problems/
│   │   ├── page.tsx              # Problem list with filters
│   │   └── [slug]/
│   │       └── page.tsx          # Problem workspace
│   ├── companies/
│   │   └── page.tsx              # Company browser
│   ├── favorites/
│   │   └── page.tsx              # Favorites list
│   ├── profile/
│   │   └── page.tsx              # User profile + stats
│   └── api/                      # Next.js API routes
│       └── problems/route.ts     # Problem search/filter
│
├── components/
│   ├── layout/                   # Navbar, sidebar, shell
│   ├── problems/                 # ProblemCard, ProblemList, Filters
│   ├── editor/                   # Monaco wrapper, language tabs
│   ├── workspace/                # Problem+Editor split view
│   ├── debugger/                 # Debugger panel, trace player
│   ├── visualizer/               # 17+ algorithm visualizers
│   ├── revision/                 # Notes, attempts, revision queue
│   ├── dashboard/                # Charts, stats, progress
│   └── ui/                       # Shared: Button, Badge, Toast, etc.
│
├── lib/
│   ├── stores/                   # Zustand stores
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript interfaces
│   └── utils/                    # Helpers
│
├── data/                         # Static JSON (bundled)
│   ├── problems.json
│   ├── details.json
│   ├── companies.json
│   └── solutions.json
│
├── companion-server/             # Local server for code execution
│   ├── src/
│   │   ├── routes/
│   │   │   ├── execute.ts
│   │   │   ├── debug.ts
│   │   │   └── status.ts
│   │   └── utils/
│   │       ├── sandbox.ts
│   │       └── python-tracer.ts
│   ├── package.json
│   └── tsconfig.json
│
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 3. Data Model

### 3.1 Problem Data (Static JSON)

```typescript
interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: { name: string }[];
  companies: { name: string }[];
  paidOnly: boolean;
  askedBy: number;
  frequency: number;
}

interface ProblemDetail extends Problem {
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: string[];
  followUp?: string;
  starterCode: { java?: string; python?: string };
  approaches: Approach[];
  visualizationTypes?: VisualizationType[];
}

interface Approach {
  name: string;
  intuition: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: { java?: string; python?: string };
  pros: string[];
  cons: string[];
}
```

### 3.2 User Data (localStorage/IndexedDB)

```typescript
interface ProblemUserState {
  slug: string;
  code: { java: string; python: string };
  language: "java" | "python";
  notes: string;
  status: "unseen" | "attempted" | "solved" | "reviewed" | "mastered";
  favorite: boolean;
  attempts: Attempt[];
  revision: RevisionState;
}

interface Attempt {
  id: string;
  language: "java" | "python";
  code: string;
  result: "passed" | "wrong_answer" | "compile_error" | "runtime_error" | "timeout";
  timestamp: number;
  runtime?: number;
}

interface RevisionState {
  nextReview: number;
  interval: number;
  confidence: 1 | 2 | 3 | 4 | 5;
  reviewCount: number;
  lastReview?: number;
}
```

### 3.3 Zustand Stores

- `useEditorStore` — code, language, fontSize, theme
- `useDebuggerStore` — trace, currentStep, isPlaying, speed
- `useProblemStore` — current problem, detail, user state
- `useUIStore` — sidebar open, active panel, modals

---

## 4. Pages

### 4.1 Dashboard (`/`)

- Stats cards: solved, reviewed, mastered, revision due, streak
- Charts: solved by day, difficulty distribution, topic progress
- Daily practice recommendations
- Revision due queue

### 4.2 Problem List (`/problems`)

- Virtualized table (1000+ problems)
- Search by ID, title, topic, company
- Filters: difficulty, topic, status, favorites, premium
- Sort: ID, frequency
- Random problem button
- Load more (300 at a time)

### 4.3 Problem Workspace (`/problems/[slug]`)

Split view:
- **Left**: Problem description, examples, constraints, hints, approaches
- **Right**: Monaco editor with language tabs
- **Bottom**: Tests, Console, Debugger, Visualizer tabs

### 4.4 Company Browser (`/companies`)

- Grid of company cards
- Click → filtered problem list for that company

### 4.5 Favorites (`/favorites`)

- Starred problems list

### 4.6 Profile (`/profile`)

- User name, avatar
- Progress rings (easy/medium/hard)
- Stats grid
- Recent activity

---

## 5. Editor

### 5.1 Monaco Configuration

- Java and Python syntax highlighting
- Line numbers, minimap, bracket matching
- Autocomplete, code folding
- Dark VS Code-like theme
- Keyboard shortcuts (Ctrl+Enter = Run, F5 = Debug)

### 5.2 Language Switching

- Independent code per language
- Autosave to localStorage
- Starter code from problem data

### 5.3 Coding Modes

- **LeetCode Mode**: `class Solution { ... }`
- **Program Mode**: Full `main()` method

---

## 6. Execution

### 6.1 Companion Server API

```
POST /api/execute     → { language, code, input } → { stdout, stderr, exitCode, duration }
POST /api/debug/trace → { language, code, input, watch } → { events, stdout, stderr }
GET  /api/system/status → { node, java, javac, python }
```

### 6.2 Safety

- Temp directory per execution
- 5s timeout, 1MB output limit
- Process cleanup on completion/error
- No access to app source or secrets
- Max 10,000 trace events

### 6.3 Python Tracing

Uses `sys.settrace` to capture:
- Line execution
- Function calls/returns
- Local variable snapshots
- Exceptions

### 6.4 Java Debugging

Uses JDI/JDWP:
- Compile with debug flags
- Launch with `-agentlib:jdwp=transport=dt_socket`
- Step through, capture locals and call stack

---

## 7. Debugger

### 7.1 Controls

- Run, Pause, Step, Previous, Restart, Stop
- Speed: 0.25x, 0.5x, 1x, 2x, 4x
- Deterministic replay (no re-execution for step/prev)

### 7.2 Panels

- **Code**: Current line highlighted in Monaco
- **Variables**: Name, type, value with change animation
- **Call Stack**: Function frames with push/pop animation
- **Visualizer**: Algorithm visualization updated per step

---

## 8. Visualization System

### 8.1 Visualizer Types

| Type | Rendering | Key Features |
|------|-----------|-------------|
| array | SVG bars | Value labels, pointer arrows |
| two-pointer | SVG + arrows | Left/right pointer animation |
| sliding-window | SVG + bracket | Window expansion/shrinking |
| binary-search | SVG + arrows | L/mid/R pointers, decision logic |
| stack | CSS flex | Push/pop animation, top indicator |
| queue | CSS flex | Enqueue/dequeue, front/rear |
| linked-list | SVG + arrows | Node connections, pointer traversal |
| tree | SVG hierarchical | Node highlighting, edge traversal |
| graph | SVG force-directed | Visited, frontier, path highlighting |
| heap | SVG tree + array | Insert/remove, heapify swaps |
| recursion | SVG call tree | Stack depth, return values |
| dp-1d | HTML grid | Cell-by-cell fill animation |
| dp-2d | HTML grid | Row/column traversal |
| sorting | SVG bars | Compare/swap animation |
| backtracking | SVG tree | Choose/recurse/undo |
| union-find | SVG trees | Union by rank, path compression |
| trie | SVG tree | Character nodes, insert/search |
| interval | SVG timeline | Overlap, merge, removal |

### 8.2 Auto-detection

Infer from variable names:
- `left`, `right`, `mid` → binary search / two pointer
- Array + pointer vars → sliding window
- Recursive calls → recursion visualizer
- 2D array access → DP 2D

### 8.3 Integration

- Visualizer tab in bottom panel
- Updates per debugger step
- Step explanation text
- Speed control shared with debugger

---

## 9. Revision System

### 9.1 Status Flow

```
unseen → attempted → solved → reviewed → mastered
                                ↻ needs revision
```

### 9.2 Spaced Repetition

```
Today → Tomorrow → 3 days → 7 days → 14 days → 30 days
```

Confidence rating (1-5) influences interval.

### 9.3 Features

- Notes per problem (markdown, autosave)
- Attempt history with code snapshots
- Favorites
- Revision queue on dashboard
- Daily practice recommendations

---

## 10. Visual Style

- Background: `#070A11`
- Panels: `#101624`
- Borders: `#273247`
- Primary: violet (`#8B5CF6`)
- Success: green, Warning: amber, Error: red
- Font: Inter (UI), JetBrains Mono (code)
- Subtle gradients, restrained shadows
- Framer Motion animations
- `prefers-reduced-motion` respected

---

## 11. Keyboard Shortcuts

```
Ctrl+Enter        Run
Ctrl+Shift+Enter  Run All
F5                Continue/Debug
F10               Step
Shift+F11         Previous
F6                Restart
Esc               Stop/Close
Ctrl+S            Save
Ctrl+P            Problem search
Space             Play/Pause
→                 Next trace step
←                 Previous trace step
```

---

## 12. Development Phases

1. **Foundation**: Next.js setup, problem list, problem page, search/filter
2. **Editor**: Monaco, language switching, starter code, autosave
3. **Execution**: Companion server, Java/Python compile+run, testcases
4. **Revision**: Status tracking, notes, attempts, favorites, dashboard
5. **Debugger**: Python tracing, Java JDI, trace replay, variable panel
6. **Visualizers**: All 17+ types, auto-detection, integration with debugger
7. **Advanced**: AI (optional), command palette, advanced analytics
