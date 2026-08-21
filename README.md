# CivicApply — Autonomous Civic Workflow & Self-Healing Agent

> Autonomous form completion engine that learns, reuses, and self-heals repetitive student internship and civic application workflows.

---

## 🌟 Overview

CivicApply automates tedious multi-stage application forms on civic portals (such as `internship.okcl.org`) using headless browser orchestration. When portal UI selectors change or drift over time, CivicApply's deterministic heuristic DOM inspection engine detects failures, scores candidate elements, repairs the workflow dynamically, and persists the updated selector map as a new learned version.

---

## 🚀 Key Features

- **Autonomous Workflow Execution**: Populates complex demographic, geolocation, and educational fields via headless browser automation.
- **Pre-Submission Safety Boundary**: Automatically halts prior to final submission or irreversible document actions, ensuring safe, human-reviewed operations.
- **Self-Healing DOM Repair**: Introspects live DOM elements upon selector mismatch, scores candidate replacements based on field intent, and auto-repairs the workflow in real-time.
- **Metadata Persistence & Versioning**: Automatically version-tracks and persists learned selector mappings (`v1 ➔ v2 ➔ vN`) for subsequent reuse.
- **Human-Centric Dashboard**: A clean Next.js dashboard providing real-time execution status, student profile review, selector diff visualizer, and raw technical diagnostics.

---

## 🛠️ Architecture & Flow

```
Student Profile (student.json)
       │
       ▼
Workflow Definition (internship-workflow.json)
       │
       ▼
Browser Script Compiler (browser-script.ts)
       │
       ▼
Webcmd Controller (Playwright Headless Session)
       │
       ├─────────────────────────────────┐
       ▼ [Success]                       ▼ [Selector Mismatch]
Learned State / Reuse            DOM Candidate Scoring (repair.ts)
                                         │
                                         ▼
                                 Auto-Repaired Selector
                                         │
                                         ▼
                               Persisted Metadata (vNext)
```

---

## ⚡ Execution Modes

| Mode | Description |
| :--- | :--- |
| **Normal** | Executes baseline workflow against the live portal. |
| **Reuse** | Verifies learned cache and executes the persisted learned selector map. |
| **Repair** | Runs a broken selector simulation, detects the failure, scores replacement candidates from live DOM, repairs the step, and bumps the version index. |

---

## 💻 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/soumiik03/CivicApply.git
cd CivicApply

# Install dependencies
npm install
```

### 2. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the CivicApply interface.

### 3. CLI Execution

```bash
# Run baseline workflow via CLI
npx tsx src/index.ts

# Run in reuse mode
npx tsx src/index.ts --reuse

# Run in self-healing repair mode
npx tsx src/index.ts --repair

# Reset demo workflow and metadata back to v1
npm run reset-demo
```

### 4. Production Build

```bash
npm run build
npm run start
```

---

## 📁 Repository Structure

```
.
├── profiles/
│   └── student.json              # Student applicant profile data
├── workflows/
│   ├── internship-workflow.json        # Canonical learned workflow definition
│   ├── internship-workflow.meta.json   # Persisted metadata (version, status, step count)
│   └── internship-workflow-broken.json # Controlled broken workflow for repair simulation
├── scripts/
│   └── reset-demo.ts             # Utility to restore canonical v1 state
├── src/
│   ├── app/                      # Next.js App Router (UI & API routes)
│   │   ├── api/workflow/run/     # POST & GET endpoints for workflow orchestration
│   │   ├── globals.css           # Design tokens & styling
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # CivicApply dashboard interface
│   ├── executor/                 # Core automation & self-healing engine
│   │   ├── browser-script.ts     # Playwright script generator
│   │   ├── repair.ts             # Generic DOM inspection & candidate scoring
│   │   ├── run.ts                # Orchestrator & lifecycle manager
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── workflow.ts           # JSON loaders & persistence utilities
│   ├── lib/
│   │   └── webcmd.ts             # Webcmd headless session bridge
│   └── index.ts                  # CLI runner entrypoint
└── package.json
```

---

## 🛡️ Safety & Compliance

- **No Unauthorized Submissions**: The execution stops immediately after populating education credentials (`NEXT: EDUCATION`). It never clicks final submit or document upload buttons.
- **Deterministic Heuristic Scoring**: Candidate matching uses multi-factor tokenization across `id`, `name`, `aria-label`, `placeholder`, and label text without fabricating non-existent DOM nodes.

---

## 📄 License

ISC License. Built for civic workflow automation.
