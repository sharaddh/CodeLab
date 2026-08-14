# LeetCode Revision Lab — Complete Product Specification

## 1. Product Goal

Build a local-first **LeetCode + DSA Learning + Revision + Coding + Debugging + Algorithm Visualization IDE**.

It must let the user:

1. Browse LeetCode problems #1–#1000.
2. Open a complete problem page.
3. Read description, examples, constraints, hints, follow-ups and topics.
4. Study multiple approaches with complexity comparison.
5. Write Java or Python in a Monaco/VS Code-like editor.
6. Compile and run Java locally.
7. Syntax-check and run Python locally.
8. Create and run custom test cases.
9. Save code, notes, attempts and revision state.
10. Debug code step-by-step.
11. Highlight the executing line.
12. Show variables and call stack.
13. Animate data structures and algorithm state.
14. Track solved/reviewed/mastered problems.
15. Schedule spaced revision.
16. Work offline for cached problem data and user data.
17. Optionally use AI for explanations/hints/optimization, without making AI mandatory.

The finished product should feel like:

**LeetCode + VS Code + IntelliJ Debugger + Algorithm Visualizer + Personal DSA Revision Notebook.**

---

# 2. Non-Negotiable Rules

### Rule 1 — Never silently fail

If problem loading fails, never show:

```json
[]
```

Show a useful error with the sources attempted.

### Rule 2 — Preserve working functionality

The existing #1–#1000 problem loader is working. Do not replace it with a simpler implementation.

Every major change must continue to pass:

```text
GET /api/problems?max=1000
```

and return a non-empty list.

### Rule 3 — Local execution

Java/Python execution must be local by default.

Do not make an online compiler the core dependency.

### Rule 4 — Real debugging

Do not fake debugging with source-code text parsing.

Python should use a real tracing mechanism such as `sys.settrace`.

Java should use JDI/JDWP or another real JVM debugging mechanism.

### Rule 5 — Real visualization

Animations must be driven by execution state/trace events, not fake pre-recorded animations.

### Rule 6 — Safe execution

User code must have:

- timeout
- output limit
- temporary workspace
- process cleanup
- no access to application secrets
- no unrestricted access to application source files

### Rule 7 — Incremental development

Do not build everything in one giant file.

Implement one subsystem, test it, then move forward.

---

# 3. Recommended Technology

## Frontend

- React
- TypeScript
- Vite
- Monaco Editor
- Tailwind CSS
- Framer Motion
- Lucide React
- React Router
- Zustand or Redux Toolkit
- TanStack Query

## Backend

- Node.js
- TypeScript
- Express or Fastify

## Database

Preferred:

- SQLite
- Prisma

Use localStorage only for lightweight preferences/cache where appropriate.

## Execution

Java:

- JDK 17+
- `javac`
- `java`

Python:

- Python 3.10+

## Debugging

Python:

- `sys.settrace`

Java:

- JDI/JDWP/debug agent

---

# 4. Project Architecture

Use a proper multi-file architecture.

```text
leetcode-revision-lab/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── problems/
│   │   │   ├── editor/
│   │   │   ├── compiler/
│   │   │   ├── debugger/
│   │   │   ├── visualizer/
│   │   │   ├── revision/
│   │   │   ├── notes/
│   │   │   ├── attempts/
│   │   │   └── dashboard/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── lib/
│   │   ├── types/
│   │   └── utils/
│   └── public/
│
├── server/
│   └── src/
│       ├── routes/
│       ├── services/
│       │   ├── problemService/
│       │   ├── compiler/
│       │   ├── runner/
│       │   ├── debugger/
│       │   └── testcase/
│       ├── parsers/
│       ├── middleware/
│       └── utils/
│
├── prisma/
│   └── schema.prisma
│
├── data/
│   ├── problems/
│   ├── cache/
│   └── seed/
│
├── scripts/
│   ├── fetchProblems
│   ├── seedDatabase
│   └── validateDataset
│
└── README.md
```

Do not create one huge HTML/JS file.

---

# 5. Problem Library — First 1000

The application must support:

```text
Problem #1
Problem #2
...
Problem #1000
```

Problem data should be downloaded/normalized once and cached locally.

Startup:

```text
SQLite/cache
   ↓
if data exists → use immediately
   ↓
if empty → download/seed
   ↓
validate
   ↓
save locally
```

Never download all rich descriptions on every page load.

---

# 6. Problem Data Model

```ts
interface Problem {
    id: number;
    title: string;
    slug: string;
    difficulty: "Easy" | "Medium" | "Hard";

    description: string;

    examples: Example[];

    constraints: string[];

    followUp?: string;

    hints: string[];

    topics: string[];

    companies?: string[];

    acceptanceRate?: number;

    starterCode?: {
        java?: string;
        python?: string;
    };

    leetcodeUrl: string;

    approaches: Approach[];

    visualizationTypes?: VisualizationType[];
}
```

```ts
interface Example {
    input: string;
    output: string;
    explanation?: string;
}
```

```ts
interface Approach {
    name: string;
    intuition: string;
    explanation: string;
    timeComplexity: string;
    spaceComplexity: string;
    code?: {
        java?: string;
        python?: string;
    };
    pros: string[];
    cons: string[];
}
```

---

# 7. Problem List

Main route:

```text
/problems
```

Desktop layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ Search problems...          Difficulty  Topic  Status        │
├────────────┬─────────────────────────────────────────────────┤
│ Dashboard  │ #1 Two Sum                         Easy         │
│ Problems   │ Array · HashMap                                  │
│ Revision   │ ✓ Solved  ★ Favorite                            │
│ Favorites  │                                                 │
│ Notes      │ #2 Add Two Numbers                 Medium       │
│ Settings   │ Linked List                                       │
└────────────┴─────────────────────────────────────────────────┘
```

Features:

- search by number
- search by title
- search by topic
- keyword search
- difficulty filter
- topic filter
- solved filter
- reviewed filter
- favorites filter
- needs-revision filter
- sort
- random problem
- random unsolved
- random revision

Virtualize large lists.

---

# 8. Problem Card

Each card:

```text
#713

Subarray Product Less Than K

Medium

Sliding Window

✓ Solved
↻ Revision Due
★ Favorite

[Open Problem]
```

Use subtle hover/entrance animations.

---

# 9. Complete Problem Workspace

Route:

```text
/problems/:id
```

Desktop:

```text
┌───────────────────────────────────────────────────────────────────┐
│ #1 Two Sum                 Easy   ★   Open on LeetCode            │
├──────────────────────────────┬────────────────────────────────────┤
│ PROBLEM                      │ EDITOR                             │
│                              │                                    │
│ Description                  │ Java | Python                     │
│ Examples                     │                                    │
│ Constraints                  │ Monaco Editor                     │
│ Hints                        │                                    │
│ Approaches                   │                                    │
│ Notes                        │                                    │
├──────────────────────────────┴────────────────────────────────────┤
│ Tests | Console | Debugger | Visualization                        │
└───────────────────────────────────────────────────────────────────┘
```

On mobile:

```text
Problem
Code
Tests
Debugger
Visualize
```

---

# 10. Problem Page

Show:

- problem number
- title
- difficulty
- description
- examples
- explanations
- constraints
- follow-up
- topics
- LeetCode link

Use Markdown rendering.

---

# 11. Examples

Example UI:

```text
Example 1

Input:
nums = [2,7,11,15], target = 9

Output:
[0,1]

Explanation:
nums[0] + nums[1] = 9.
```

Buttons:

```text
Run Example
Copy Input
```

---

# 12. Constraints

Show constraints clearly.

Example:

```text
Constraints

• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
```

---

# 13. Progressive Hints

Hints hidden by default.

```text
Hint 1
Think about what information needs to be remembered.

Hint 2
Can extra O(n) space reduce the time complexity?

Hint 3
Use a HashMap.
```

Do not immediately reveal the complete solution.

---

# 14. Multiple Approaches

For each problem where meaningful, provide:

```text
Brute Force
Time: O(n²)
Space: O(1)

Better
Time: O(n log n)
Space: O(n)

Optimal
Time: O(n)
Space: O(n)
```

Each approach includes:

- intuition
- algorithm
- correctness idea
- complexity
- edge cases
- pros
- cons
- Java code
- Python code

---

# 15. Approach Comparison

Display:

```text
┌──────────────┬──────────┬──────────┬────────────┐
│ Approach     │ Time     │ Space    │ Notes      │
├──────────────┼──────────┼──────────┼────────────┤
│ Brute Force  │ O(n²)    │ O(1)     │ Simple     │
│ Sorting      │ O(nlogn) │ O(n)     │ Better     │
│ HashMap      │ O(n)     │ O(n)     │ Optimal    │
└──────────────┴──────────┴──────────┴────────────┘
```

---

# 16. Monaco Editor

Use Monaco Editor.

Required:

- Java syntax highlighting
- Python syntax highlighting
- line numbers
- minimap
- bracket matching
- autocomplete
- indentation
- code folding
- find
- replace
- multi-cursor
- error markers
- current-line highlighting
- keyboard shortcuts
- dark VS Code-like theme

---

# 17. Language Switching

```text
[ Java ] [ Python ]
```

Keep independent source code for each language.

Switching languages must not destroy code.

Autosave code.

---

# 18. Coding Modes

## LeetCode Mode

Use:

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
    }
}
```

## Program Mode

Allow complete programs:

```java
public class Main {
    public static void main(String[] args) {
    }
}
```

Python:

```python
def main():
    pass

if __name__ == "__main__":
    main()
```

---

# 19. Local Java Compiler

Backend:

```http
POST /api/execute
```

Request:

```json
{
    "language": "java",
    "code": "...",
    "input": "..."
}
```

Use a temporary directory:

```text
temp/session-id/Main.java
```

Compile:

```bash
javac Main.java
```

Run:

```bash
java Main
```

Return:

```json
{
    "success": true,
    "stdout": "...",
    "stderr": "",
    "exitCode": 0,
    "duration": 12
}
```

---

# 20. Local Python Runner

First compile-check:

```bash
python -m py_compile main.py
```

Then:

```bash
python main.py
```

Capture:

- stdout
- stderr
- exit code
- runtime

---

# 21. Execution Safety

Set defaults:

```text
Maximum runtime: 5 seconds
Maximum output: 1 MB
Maximum debug events: 10,000
```

Kill runaway processes.

Clean temporary files.

Do not expose environment secrets.

---

# 22. Environment Status

Endpoint:

```http
GET /api/system/status
```

Response:

```json
{
    "node": true,
    "java": true,
    "javac": true,
    "python": true
}
```

Settings should show:

```text
Environment

✓ Node
✓ Java
✓ javac
✓ Python
```

If missing, explain exactly how to install/configure it.

---

# 23. Testcase Manager

Bottom panel:

```text
Tests

[Example 1] [Example 2] [Custom +]
```

Each testcase:

```text
Input
Expected
Actual
Status
```

Buttons:

```text
Run
Run All
Add
Duplicate
Delete
```

---

# 24. Custom Tests

Allow arbitrary user input.

Example:

```text
Input:
[2,7,11,15]
9

Expected:
[0,1]
```

Output:

```text
Actual:
[0,1]

✓ Passed
```

---

# 25. Test History

Save recent testcases per problem.

Record:

- input
- expected
- actual
- status
- language
- timestamp

---

# 26. Console

Show:

```text
✓ Program finished

Output:
[0,1]

Time:
4ms

Exit code:
0
```

For errors:

```text
Runtime Error

NullPointerException
at Main.java:18
```

---

# 27. Compile Error Integration

Map compiler errors to Monaco lines.

Example:

```text
Line 14:
Type mismatch
```

Clicking error moves editor to that line.

---

# 28. Debugger

Core controls:

```text
▶ Run
⏸ Pause
⏭ Step
↶ Previous
↻ Restart
⏹ Stop
```

Speed:

```text
0.25x
0.5x
1x
2x
4x
```

---

# 29. Debugger Layout

```text
┌───────────────────────────────────────────────────────────────┐
│ CODE                              VARIABLES                    │
│                                                               │
│ 1 int left = 0;                    left = 0                    │
│ 2 int right = 6;                   right = 6                   │
│ 3 int mid = ...;          ←        mid = 3                    │
│ 4 if (...)                         target = 9                  │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ CALL STACK                         VISUALIZATION              │
│                                                               │
│ binarySearch()                     [1][3][5][7][9][11][13]   │
│                                     ↑       ↑                  │
│                                     L      MID                 │
└───────────────────────────────────────────────────────────────┘
```

---

# 30. Trace Model

Create structured trace events:

```ts
interface TraceEvent {
    step: number;

    type:
        | "line"
        | "call"
        | "return"
        | "assignment"
        | "condition"
        | "loop"
        | "exception";

    file: string;
    line: number;

    variables: VariableState[];

    callStack: StackFrame[];

    visualization?: VisualizationState;
}
```

---

# 31. Variables

```ts
interface VariableState {
    name: string;
    type: string;
    value: unknown;
    previousValue?: unknown;
}
```

Animate changes:

```text
left
0 → 1
```

---

# 32. Python Debugging

Use a real Python trace mechanism such as:

```python
sys.settrace(...)
```

Capture:

- line
- call
- return
- locals
- exception

Generate a deterministic trace.

---

# 33. Java Debugging

Use:

- JDI
- JDWP
- debugger agent

Do NOT parse Java source to pretend it is executing.

Capture:

- current line
- local variables
- method calls
- method returns
- exceptions
- call stack

---

# 34. Deterministic Trace Replay

Generate trace once:

```text
Program
  ↓
Trace
  ↓
Step 0
Step 1
Step 2
...
```

Then support:

```text
Previous
Next
Jump to step
Play
Pause
Replay
```

No need to rerun for every Next/Previous.

---

# 35. Call Stack

Example recursion:

```text
CALL STACK

factorial(4)
factorial(3)
factorial(2)
factorial(1) ← current
```

Each frame:

```text
function: factorial
n: 1
```

Animate push/pop.

---

# 36. Array Visualizer

Represent arrays:

```text
[ 2 ][ 7 ][ 11 ][ 15 ]
  ↑       ↑
 left    right
```

Recognize pointer variables such as:

- left
- right
- slow
- fast
- mid
- i
- j
- current
- min
- max

Allow explicit visualization metadata when automatic inference is ambiguous.

---

# 37. HashMap Visualizer

```text
HashMap

key    value

2      0
7      1
11     2
```

Animate:

- insert
- update
- lookup
- delete

---

# 38. Set Visualizer

```text
Set

{ 2, 5, 7, 10 }
```

Show:

```text
contains(7)
→ FOUND ✓
```

---

# 39. Stack Visualizer

```text
┌─────┐
│  9  │ ← TOP
├─────┤
│  7  │
├─────┤
│  3  │
└─────┘
```

Animate push/pop/peek.

---

# 40. Queue Visualizer

```text
FRONT → [2][5][7][9] ← REAR
```

Animate enqueue/dequeue.

---

# 41. Linked List Visualizer

```text
HEAD
 ↓
[1] → [2] → [3] → [4] → null
       ↑
      cur
```

Animate pointer changes.

---

# 42. Tree Visualizer

Example:

```text
             8
           /             4     12
         / \    /         2   6  10 14
```

Highlight:

- current
- visited
- left
- right
- parent

Support:

- DFS
- BFS
- BST operations

---

# 43. Graph Visualizer

Example:

```text
      A
     /     B   C
    |   |
    D---E
```

Show:

- current node
- visited
- frontier
- queue
- stack
- path
- edges

Support BFS/DFS/shortest-path visual states.

---

# 44. Heap Visualizer

Show:

```text
          2
        /          4     7
      /      8   9

Array:
[2,4,7,8,9]
```

Animate:

- insert
- remove
- heapify
- swaps

---

# 45. Two Pointer Visualizer

```text
[1][2][3][4][5][6][7]
 ↑                 ↑
 L                 R
```

Animate pointer movement.

---

# 46. Sliding Window Visualizer

```text
[1][2][3][4][5][6]

 ┌──────────────┐
 │    WINDOW    │
 └──────────────┘
  L            R
```

Show:

- expansion
- shrinking
- current sum/product
- best answer

---

# 47. Binary Search Visualizer

```text
[1][3][5][7][9][11][13]
 ↑          ↑          ↑
 L         MID         R
```

At every step explain:

```text
nums[mid] = 7
target = 9

7 < 9

Move:
left = mid + 1
```

Animate pointer movement.

---

# 48. Sorting Visualizer

Support:

- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort

Show:

```text
5 2 8 1 3

Compare:
5 ↔ 2

Swap:

2 5 8 1 3
```

Use animated bars and values.

---

# 49. Recursion Visualizer

For:

```text
factorial(4)
```

show:

```text
factorial(4)
      ↓
factorial(3)
      ↓
factorial(2)
      ↓
factorial(1)
      ↓
1
      ↑
return 2
      ↑
return 6
      ↑
return 24
```

Also show recursion tree where appropriate.

---

# 50. DP Visualizer

Support:

- 1D DP
- 2D DP
- memoization
- tabulation

Example:

```text
      j →
    0 1 2 3 4

0   0 0 0 0 0
1   0 1 1 1 1
2   0 1 2 2 2
↑
i
```

Animate each cell.

Show formula for current transition.

---

# 51. Backtracking Visualizer

Example:

```text
                  []
             /    |               [1]   [2]   [3]
          /        [1,2] [1,3]
```

Show:

- choose
- recurse
- undo
- backtrack
- current path

---

# 52. Union-Find Visualizer

Show:

```text
1  2  3  4  5

union(1,2)

1
└──2

union(2,3)

1
└──2
   └──3
```

Also parent array and path compression.

---

# 53. Trie Visualizer

For:

```text
cat
car
can
```

show:

```text
root
 |
 c
 |
 a
/|t r n
```

Animate insertion/search.

---

# 54. Interval Visualizer

Example:

```text
0    5    10   15   20

───────
     ───────────
             ───────
```

Highlight:

- overlap
- merge
- current interval
- removal

---

# 55. Algorithm Explanation During Debugging

At each step show a human-readable explanation.

Example:

```text
CURRENT STEP

mid = 3
nums[mid] = 7
target = 9

7 < 9.

Because the array is sorted, everything
before index 3 is also too small.

Therefore:
left = mid + 1
```

Update dynamically from trace metadata.

---

# 56. Complexity Panel

Always show:

```text
Time: O(n)
Space: O(n)
```

For multiple approaches, show comparison.

---

# 57. Visualization Registry

```ts
type VisualizationType =
    | "array"
    | "two-pointer"
    | "sliding-window"
    | "binary-search"
    | "sorting"
    | "stack"
    | "queue"
    | "linked-list"
    | "tree"
    | "bst"
    | "graph"
    | "heap"
    | "recursion"
    | "dp-1d"
    | "dp-2d"
    | "backtracking"
    | "union-find"
    | "trie"
    | "interval"
    | "generic";
```

Problems can have multiple visualization types:

```json
{
    "id": 713,
    "visualizationTypes": [
        "sliding-window",
        "array"
    ]
}
```

---

# 58. Generic Debugger Fallback

If no specialized visualization exists, always show:

- current line
- variables
- call stack
- execution timeline

Never claim arbitrary source code can be perfectly visualized.

---

# 59. Problem Pattern Metadata

Store verified algorithm patterns.

Examples:

```text
#1 Two Sum
→ HashMap

#704 Binary Search
→ Binary Search

#695 Max Area of Island
→ DFS/BFS

#713 Subarray Product Less Than K
→ Sliding Window

#630 Course Schedule III
→ Greedy + Heap
```

Do not depend on runtime AI to determine patterns.

---

# 60. Notes

Every problem gets personal notes.

Example:

```text
Pattern:
Sliding Window

Important:
When product >= k, shrink from left.

My mistake:
Forgot k <= 1.
```

Autosave.

---

# 61. Attempts

Save attempts:

```text
Attempt #4

Language:
Java

Result:
Wrong Answer

Date:
13 Aug 2026

Runtime:
4ms
```

Allow reopening old code.

---

# 62. Submission History

Record:

- problem
- language
- code
- result
- runtime
- memory if available
- timestamp

Statuses:

```text
Passed
Wrong Answer
Compile Error
Runtime Error
Timeout
```

---

# 63. Problem Status

States:

```text
Unseen
Attempted
Solved
Reviewed
Needs Revision
Mastered
```

Manual state changes must always be possible.

Automatic suggestions are allowed.

---

# 64. Spaced Revision

When solved:

```text
Today
↓
Tomorrow
↓
3 days
↓
7 days
↓
14 days
↓
30 days
```

Dashboard:

```text
Revision Due Today
12 problems
```

Allow confidence rating:

```text
1 = Don't remember
2 = Weak
3 = Okay
4 = Strong
5 = Mastered
```

Use confidence to influence scheduling.

---

# 65. Dashboard

Main dashboard:

```text
Good evening 👋

Solved          137
Reviewed         82
Mastered         31
Revision Due     12
Current Streak    7
```

Charts:

- solved by day
- difficulty distribution
- topic distribution
- success rate
- average attempts
- revision activity

---

# 66. Topic Progress

Example:

```text
Arrays          78 / 120
Strings         42 / 80
Linked Lists    21 / 50
Trees            32 / 90
Graphs           18 / 70
DP               14 / 80
```

---

# 67. Pattern Progress

```text
Two Pointers       14 solved
Sliding Window      9 solved
Binary Search      12 solved
DFS                18 solved
BFS                11 solved
Greedy              8 solved
Heap                6 solved
DP                  5 solved
Backtracking        4 solved
Union Find          3 solved
Trie                2 solved
```

---

# 68. Daily Practice

Daily session:

```text
1 Easy
1 Medium
1 Hard
```

Prioritize:

1. due revisions
2. weak patterns
3. unsolved problems

---

# 69. Random Practice

Support:

```text
Random
Random Easy
Random Medium
Random Hard
Random Unsolved
Random Revision
Random Topic
```

---

# 70. Favorites

Star problems.

Route:

```text
/favorites
```

---

# 71. Notes Search

Search personal notes:

```text
Search notes...
```

Example:

```text
"shrink window"

→ #713
→ #76
→ #209
```

---

# 72. Command Palette

Keyboard:

```text
Ctrl + Shift + P
```

Commands:

```text
Open Problem
Random Problem
Run Code
Run Tests
Start Debugging
Next Step
Previous Step
Restart Debugger
Stop Debugger
Toggle Visualization
Toggle Notes
Mark Solved
Mark Reviewed
Add Testcase
```

---

# 73. Keyboard Shortcuts

```text
Ctrl + Enter           Run
Ctrl + Shift + Enter   Run All
F5                     Continue
F10                    Step
Shift + F11            Previous
F6                     Restart
Esc                    Stop/Close
Ctrl + S               Save
Ctrl + P               Problem search
Space                  Play/Pause
→                      Next trace step
←                      Previous trace step
```

---

# 74. Settings

Settings page:

```text
Editor

Font Size
Tab Size
Minimap
Word Wrap
Theme

Debugger

Animation Speed
Max Trace Events
Auto Scroll

Execution

Java Path
Python Path
Timeout
```

Auto-detect Java/Python.

---

# 75. Offline Mode

After data is cached, the app must still support:

- browsing
- problem descriptions
- examples
- saved code
- notes
- favorites
- revision state
- attempts

Internet should only be required for:

- dataset refresh
- optional AI
- external LeetCode page

---

# 76. API Design

Problems:

```http
GET /api/problems
GET /api/problems/:id
GET /api/problems/search?q=
```

Execution:

```http
POST /api/execute
POST /api/test
```

Debugger:

```http
POST /api/debug/trace
POST /api/debug/start
POST /api/debug/stop
```

System:

```http
GET /api/system/status
```

---

# 77. Debug Trace Endpoint

```http
POST /api/debug/trace
```

Request:

```json
{
    "language": "python",
    "code": "...",
    "input": "..."
}
```

Response:

```json
{
    "success": true,
    "events": [
        {
            "step": 0,
            "type": "line",
            "line": 2,
            "variables": {
                "left": 0,
                "right": 6
            }
        }
    ]
}
```

---

# 78. Error Handling

Never silently fail.

Bad:

```text
Problem list empty.
```

Good:

```text
Problem dataset unavailable.

Sources attempted:
- local database
- GitHub dataset
- LeetCode metadata
- GraphQL

Reason:
...
```

Compile errors should include:

- compiler message
- file
- line
- column if available

Runtime errors should include:

- exception
- stack trace
- line

---

# 79. Dataset Validation

Create:

```bash
npm run validate-data
```

Validate:

- IDs 1–1000
- duplicate IDs
- missing titles
- missing slugs
- valid difficulty
- examples
- constraints
- JSON integrity
- starter code

Expected:

```text
✓ 1000 problems checked
✓ 0 duplicate IDs
✓ 0 invalid records
```

---

# 80. Performance

Requirements:

- virtualize 1000-problem list
- lazy-load Monaco
- lazy-load visualizers
- debounce search
- memoize visualization state
- avoid rerendering unrelated panels
- cache problem data
- paginate/search efficiently

---

# 81. Responsive Design

Desktop is primary.

Mobile:

```text
Problem
↓
Code
↓
Tests
↓
Debugger
↓
Visualization
```

Use tabs/drawers.

---

# 82. Visual Style

Dark-first developer-tool aesthetic.

Colors:

```text
Background: #070A11
Panel: #101624
Secondary: #151D2D
Border: #273247
Primary: violet
Secondary: cyan
Success: green
Warning: amber
Error: red
```

Use:

- clean typography
- subtle gradients
- rounded panels
- restrained shadows
- high contrast

Avoid excessive neon/glassmorphism.

---

# 83. Animations

Use Framer Motion where useful.

Animate:

- cards
- tabs
- panels
- array swaps
- pointer movement
- variable changes
- tree operations
- stack push/pop
- queue operations
- DP cell updates
- debugger line transitions

Respect:

```text
prefers-reduced-motion
```

---

# 84. Accessibility

Support:

- keyboard navigation
- focus indicators
- high contrast
- screen-reader labels
- reduced motion
- status indicators that are not color-only

---

# 85. Optional AI

AI must be optional.

If configured, provide:

- explain problem
- explain code
- generate hints
- find bug
- optimize code
- generate testcases
- explain debugger step
- compare approaches

Use an abstraction:

```text
AIProvider
├── OpenAI
├── Local Model
└── Other Provider
```

Never hardcode API keys.

The application must work without AI.

---

# 86. "Explain This Code"

Button:

```text
Explain Code
```

Output:

```text
1. Initialization
2. Main loop
3. Condition
4. State update
5. Return
```

Connect explanation to the debugger trace where possible.

---

# 87. "Analyze / Optimize"

Optional AI feature.

Example:

```text
Current:
O(n²)

Potential:
O(n)

Bottleneck:
Nested loop at line 18

Suggestion:
Use a HashMap.
```

---

# 88. Development Phases

## Phase 1 — Foundation

Implement and stabilize:

- React + TypeScript
- Node backend
- SQLite
- existing #1–#1000 loader
- problem list
- search/filter
- complete problem page

Acceptance:

```text
#1
#100
#500
#1000
```

all open.

---

## Phase 2 — Editor

Implement:

- Monaco
- Java
- Python
- starter code
- local Java compiler
- local Python runner
- custom testcases
- output
- errors

Acceptance:

```text
Open #1
Write Java
Compile
Run
See result
```

---

## Phase 3 — Revision

Implement:

- solved
- reviewed
- favorites
- notes
- attempts
- submission history
- revision queue
- dashboard
- spaced repetition

---

## Phase 4 — Debugger

Implement:

- Python tracing
- Java JDI/JDWP
- trace format
- current-line highlighting
- variables
- call stack
- step
- previous
- play/pause
- restart

Minimum acceptance:

Binary Search can be stepped line-by-line while:

- `left`
- `right`
- `mid`

change visibly.

---

## Phase 5 — Visualizers

Implement in this order:

1. Array
2. Two Pointer
3. Sliding Window
4. Binary Search
5. Stack
6. Queue
7. Linked List
8. Recursion
9. Tree
10. Heap
11. Graph
12. DP
13. Sorting
14. Backtracking
15. Union Find
16. Trie
17. Interval

---

## Phase 6 — Advanced

- AI
- command palette
- advanced analytics
- smarter spaced repetition
- pattern recommendations
- optimization analysis

---

# 89. Initial Visualization Metadata

Examples:

```json
{
    "id": 704,
    "visualizationTypes": ["binary-search", "array"]
}
```

```json
{
    "id": 713,
    "visualizationTypes": ["sliding-window", "array"]
}
```

```json
{
    "id": 206,
    "visualizationTypes": ["linked-list"]
}
```

```json
{
    "id": 70,
    "visualizationTypes": ["dp-1d", "recursion"]
}
```

---

# 90. Final User Flow

The ideal flow:

```text
Open #704 Binary Search
        ↓
Read problem
        ↓
See examples
        ↓
Think
        ↓
Write Java
        ↓
Run testcase
        ↓
Wrong Answer
        ↓
Start Debugger
        ↓
Step
        ↓
Current line highlighted
        ↓
Variables update
        ↓
Array visualization updates
        ↓
Understand bug
        ↓
Fix code
        ↓
Run all tests
        ↓
Passed
        ↓
Compare approaches
        ↓
Save note
        ↓
Mark Reviewed
        ↓
Schedule Revision
```

---

# 91. Acceptance Checklist

The project is not complete until these work:

## Problems

- [ ] Problems #1–#1000 load
- [ ] Search
- [ ] Difficulty filter
- [ ] Topic filter
- [ ] Status filter
- [ ] Favorites
- [ ] Random
- [ ] Complete problem details
- [ ] Examples
- [ ] Constraints
- [ ] Hints
- [ ] Follow-up
- [ ] LeetCode link
- [ ] Multiple approaches

## Editor

- [ ] Monaco
- [ ] Java
- [ ] Python
- [ ] Language switching
- [ ] Autosave
- [ ] Starter code
- [ ] Program mode
- [ ] LeetCode mode

## Execution

- [ ] Local Java compilation
- [ ] Local Java execution
- [ ] Python compile check
- [ ] Python execution
- [ ] Custom input
- [ ] Run all tests
- [ ] stdout
- [ ] stderr
- [ ] exit code
- [ ] timeout
- [ ] output limit

## Debugger

- [ ] Python trace
- [ ] Java debugger
- [ ] Current line
- [ ] Variables
- [ ] Call stack
- [ ] Step
- [ ] Previous
- [ ] Continue
- [ ] Pause
- [ ] Restart
- [ ] Stop
- [ ] Deterministic replay

## Visualization

- [ ] Array
- [ ] Two pointer
- [ ] Sliding window
- [ ] Binary search
- [ ] Stack
- [ ] Queue
- [ ] Linked list
- [ ] Tree
- [ ] Graph
- [ ] Heap
- [ ] Recursion
- [ ] DP
- [ ] Sorting
- [ ] Backtracking
- [ ] Union Find
- [ ] Trie
- [ ] Interval

## Revision

- [ ] Solved
- [ ] Reviewed
- [ ] Mastered
- [ ] Needs revision
- [ ] Notes
- [ ] Favorites
- [ ] Attempts
- [ ] Submission history
- [ ] Revision queue
- [ ] Spaced repetition
- [ ] Confidence rating
- [ ] Dashboard

## Reliability

- [ ] No silent empty dataset
- [ ] Cached problems
- [ ] Offline browsing
- [ ] Environment detection
- [ ] Error messages
- [ ] Safe code execution
- [ ] Responsive UI
- [ ] Accessibility
- [ ] Reduced-motion support

---

# 92. Critical Regression Test

Before every release:

```text
GET /api/problems?max=1000
```

must return non-empty data.

Verify:

```text
#1
#100
#500
#1000
```

Then:

```text
Open problem
→ load details
→ editor
→ execute
→ save
→ refresh browser
→ data remains
```

Never ship a version that regresses the working problem loader.

---

# 93. OpenCode Implementation Instruction

Build this specification incrementally.

For every feature:

1. Inspect existing code.
2. Preserve working features.
3. Implement the smallest complete subsystem.
4. Run backend tests.
5. Run frontend tests/build.
6. Test the actual UI.
7. Verify problem loading.
8. Verify Java/Python execution where relevant.
9. Fix errors.
10. Only then proceed.

Do not respond with a fake "implemented" status when the feature has not been tested.

Do not replace working functionality with mock data unless explicitly required.

Do not use placeholder buttons that appear functional but do nothing.

If a feature cannot yet be implemented, show a clear disabled state rather than silently failing.

The final application should be production-quality, modular, maintainable, and genuinely useful for DSA learning.
