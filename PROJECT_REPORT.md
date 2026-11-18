# LeetCode Revision Lab — Project Report

**Project Title:** LeetCode Revision Lab  
**Type:** Local-first DSA Learning, Coding, Debugging & Revision Platform  
**Repository/Workspace:** `leetcode-revision-lab` (v2.0.0)  
**Date:** 19 Nov 2026

---

## 1. Abstract

LeetCode Revision Lab is a web-based, local-first platform designed to help students practice Data Structures and Algorithms in an integrated environment. It combines a large LeetCode-style problem library, a Monaco-based multi-language code editor, local code execution, Python step-by-step debugging with execution tracing, algorithm/data-structure visualizers, and personal progress tracking. The goal is to provide a single workspace for browsing problems, writing and running solutions (Java, Python, C++), understanding runtime behavior, and revising concepts effectively.

## 2. Introduction

Preparing for coding interviews and strengthening DSA skills typically requires switching between multiple tools: problem websites, local IDEs, debuggers, visualizers, and note-taking apps. This fragmentation increases friction and makes systematic revision difficult.

LeetCode Revision Lab addresses this by offering an all-in-one local workspace that supports problem exploration, coding, execution/debugging, visualization, and progress monitoring with a terminal-inspired, keyboard-friendly user interface.

## 3. Objectives

- Provide an organized interface to browse and filter a large set of coding problems.
- Offer a rich problem workspace with description, examples, constraints, hints, and solution approaches.
- Enable multi-language coding and local execution for **Java, Python, and C++**.
- Support step-level debugging for Python programs via execution tracing.
- Visualize algorithm/data-structure state during traced execution.
- Track user progress (status, favorites, notes, attempts) locally for revision.
- Deliver a cohesive, responsive gray-and-black terminal-style UI.

## 4. Scope of the System

### 4.1 In Scope (Implemented/Current)
- Dashboard with problem statistics and quick navigation.
- Problems database with search and filters (difficulty, topic, company, status, etc.).
- Company index and favorites views.
- Detailed problem workspace (`/problems/[slug]`) with editor, run/debug, console, visualizer, notes, and attempts panels.
- Companion server for local toolchain checks and code execution/tracing.
- Python debug trace API using `sys.settrace`.
- Profile/operator dossier summarizing progress and activity from local user state.
- Settings page showing environment/toolchain status and editor preferences UI.
- Login/access UI screen (session/auth gate presentation).

### 4.2 Out of Scope / Future Enhancements
- Full online judge with hidden test-case evaluation and verdict matching.
- Java/C++ instruction-level interactive debugging (e.g., JDI/JDWP integration).
- Cloud sync, multi-user accounts, and server-side persistence.
- AI-driven hints/explanations integrated as a core feature.
- Automated spaced-repetition scheduling engine beyond stored revision metadata.

## 5. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling/UI | Tailwind CSS v4, custom CSS (terminal/CRT-inspired theme), Lucide React icons, Framer Motion |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| State Management | Zustand (editor, problem, debugger, UI stores) |
| Backend/Companion | Node.js, Express 5 (`companion-server/server.js`) |
| Local Execution Toolchains | Python, Java/Javac (JDK), g++ (MinGW/MSYS2 on Windows) |
| Data Storage (App Data) | Static JSON datasets in `data/` (`problems.json`, `details.json`, `solutions.json`, `companies.json`) |
| User Persistence | Browser local storage (key: `lc-revision-lab-v2`) via Zustand store |

## 6. System Architecture

The system follows a client–companion architecture:

1. **Next.js Frontend (`app/`, `components/`, `lib/`)**
   - Renders pages (dashboard, problems, problem workspace, companies, favorites, profile, settings, login).
   - Manages UI/editor/debug state using Zustand stores.
   - Reads problem/detail/solution datasets and displays problem content.
   - Persists user progress locally in the browser.

2. **Companion Execution Server (`companion-server/server.js`, default port `3001`)**
   - Exposes APIs for toolchain detection and code execution/debug tracing.
   - Runs user code in temporary directories with timeouts and buffered output.
   - Provides Python execution traces for the frontend debugger/visualizer.

3. **Data Layer (`data/`)**
   - `problems.json`: problem metadata/index (4018 records).
   - `details.json`: detailed problem content map (2913 entries).
   - `solutions.json`: curated solution/approach entries (160 entries).
   - `companies.json`: company/grouping metadata.

## 7. Key Modules and Features

### 7.1 Dashboard (`/`)
- Displays overall stats (total nodes/problems, solved, reviewed, starred/favorites, curated set).
- Shows difficulty distribution and quick navigation commands/links.
- Terminal-style system readout presentation.

### 7.2 Problem Database (`/problems`)
- Search and filter interface for problem discovery.
- Filters include difficulty, topic, company, status, sorting and premium-related options.
- Paginated/list rendering with status indicators and metadata (tags/companies/frequency where available).

### 7.3 Problem Workspace (`/problems/[slug]`)
- **Left panel:** problem description, examples, constraints, hints, approaches/editorial content.
- **Right/editor area:** Monaco editor with language switching (Java/Python/C++).
- **Run:** executes code via companion `/api/execute` with stdin support and console output/error display.
- **Debug (Python):** requests trace from `/api/debug/trace`; supports step navigation/playback controls, current line/context, locals/variable inspection, and exception-aware states.
- **Visualizer:** renders algorithm/data-structure views from trace/state (array and other visualizer components) to aid understanding.
- **Notes & Attempts:** user notes and attempt history persisted per problem in local state.

### 7.4 Companies (`/companies`) and Favorites (`/favorites`)
- Company-wise browsing/indexing of problems.
- Favorites/starred problems list for quick revision access.

### 7.5 Profile (`/profile`) — Operator Dossier
- Aggregates local progress: solved/reviewed/mastered/favorites, completion percentage, rank label.
- Difficulty matrix and topic coverage/telemetry.
- Attempt telemetry (attempt counts, pass rate, last active) and recent activity log with links to problems.

### 7.6 Settings (`/settings`)
- Probes companion/toolchain availability (`node`, `java`, `javac`, `python`, `g++`) via `/api/system/status`.
- Displays editor configuration controls (font size, tab size, minimap, word wrap) in UI.
- Shows companion service instructions.

### 7.7 Login (`/login`)
- Terminal-styled access/authentication interface for session entry experience.

## 8. Companion Server APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/system/status` | GET | Reports availability of Node/Java/Javac/Python/g++ on host |
| `/api/execute` | POST | Compiles/runs code (`python`, `java`, `cpp`) with timeout, stdin, stdout/stderr capture |
| `/api/debug/trace` | POST | Generates Python execution trace events for step-debugging/visualization |

**Execution details (highlights):**
- Temporary isolated working directory per run (`lc-lab-*`).
- Timeouts and buffer limits to prevent runaway/hanging executions.
- **C++ support:** `g++ -std=c++17 -O2` (with `-mconsole` on Windows), common-header prelude include, and auto-appended `main()` when absent to improve snippet compile/run experience.
- **Python tracing:** `sys.settrace`-based tracer emitting structured step/variable/exception events; handles timeouts, trace limits, and missing-trace cases with user-friendly error events.

## 9. Debugging and Visualization

- **Python Step Debugger:** Uses traced execution events (line/function/locals/exception context) to let users step through code, inspect state changes, and identify errors (including mapped user-file exception lines where available).
- **Visualizer Panel:** Consumes trace/current variables to render data-structure/algorithm views (e.g., arrays, pointers, and other supported patterns via dedicated visualizer components) for intuitive understanding of program behavior.
- **Design principle:** Visualization is driven by runtime trace/state rather than static, pre-recorded animations.

## 10. User Progress and Persistence

- User-specific state (selected language/code per problem, notes, status, favorites, attempts, revision metadata) is stored locally in the browser.
- Profile and filters derive insights from this local state, enabling offline-first revision tracking without mandatory backend accounts.

## 11. UI/UX Design

- Consistent **gray & black terminal/programmatic** theme across pages.
- Monospace typography, command-prompt motifs, bordered panels, and CRT/grid-style visual accents.
- Focus on clarity, density of information, and fast navigation for practice/revision workflows.

## 12. Setup and Execution

### Prerequisites
- Node.js and npm
- (Optional per language) Python, JDK (`java`, `javac`), g++ for C++ execution

### Steps
1. Install dependencies: `npm install`
2. Start frontend dev server: `npm run dev` (default `http://localhost:3000`)
3. Start companion server: `npm run companion` (default `http://localhost:3001`)
4. Open the app in browser and use Problems/Workspace; ensure companion is running for Run/Debug and toolchain status.

## 13. Testing and Validation (Project-Level)

- TypeScript checks: `npx tsc --noEmit` (passing in current state).
- Functional verification performed during development:
  - Companion availability/status checks.
  - C++ compile/run (including common-header/prelude and Windows console behavior).
  - Python trace/debug scenarios: normal stepping, runtime exceptions, syntax errors with mapped lines, timeout/infinite-loop and stdin-wait cases with actionable messages.

## 14. Limitations

- No full automated judge; execution is user-driven (stdin/stdout) rather than comprehensive hidden-test evaluation.
- Step debugging/trace is implemented for Python; Java and C++ do not have equivalent step-level trace debugging.
- Progress and data persistence are local to the browser/device.
- Some advanced features described in broader product specifications (e.g., full JDI debugger, cloud sync, AI tutoring) are not fully implemented.

## 15. Future Work

- Integrate structured test-case runner and result comparison for problems.
- Add step-debugging support for Java (JDI/JDWP) and richer C++ debugging workflows.
- Implement cloud backup/sync and optional authentication.
- Enhance spaced-repetition scheduling and revision recommendations.
- Expand visualizers and trace depth for more algorithm patterns.
- Add export/import of user progress and notes.

## 16. Conclusion

LeetCode Revision Lab delivers a practical, integrated environment for DSA practice by combining problem browsing, coding, local execution, Python debugging/tracing, visualization, and revision tracking in a unified, local-first interface. It demonstrates an end-to-end approach to building an educational developer tool with modern web technologies and a companion execution service, while providing a strong foundation for future enhancements such as automated judging and multi-language debugging.
