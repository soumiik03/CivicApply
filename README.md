# CivicApply

> **A self-healing browser agent that learns a workflow once, and keeps it working even after the website changes.**

Built for **SLAB — Self-Learning Agent Browser Hackathon** with **webcmd**, Playwright, Next.js, and TypeScript.


---

## The Problem

Browser automation is powerful, but brittle. A site changes one element ID, one label, one page structure — and a workflow that worked yesterday fails today, silently, with no path to recovery except a human rewriting the selector.

For anything repetitive — internship applications, form submissions, recurring data entry — that fragility means the automation has a shelf life measured in "until the next redesign."

**CivicApply is built around a different question: not "does this workflow still work," but "when it breaks, can the agent repair what it learned — and remember the fix?"**

---

## The Idea

CivicApply learns a browser workflow once, persists it, and reuses it. When the workflow breaks, it doesn't stop and wait for a human to fix the code.

```text
Run Workflow
     ↓
Selector Fails
     ↓
Inspect Live DOM
     ↓
Score Candidate Elements
     ↓
Recover Selector
     ↓
Retry Remaining Steps
     ↓
Persist New Workflow Version
     ↓
Reuse the Repaired Workflow
```

The repair is **generic** — it works by inspecting the live page and scoring candidate elements against the same signals a human would use to relocate a moved field (id, name, aria-label, placeholder, label text, semantic similarity, element type). It is not a lookup table of known-broken-field-name → known-fix mappings. Break a different field, and the same engine finds it.

---

## Built Around Webcmd

SLAB's core idea:

> **Explore once. Learn the workflow. Reuse the command.**

CivicApply extends that with a recovery loop:

```text
Explore → Learn → Reuse
              ↓
          Web changes
              ↓
       Repair → Learn again → Reuse
```

**webcmd** handles real browser execution against the real target site. CivicApply adds the layer on top:

- workflow memory
- reusable execution
- failure detection
- live DOM inspection
- heuristic selector recovery
- workflow versioning
- a hard safety boundary before irreversible actions

---

## What Makes This Different From "Another Browser Automation Demo"

### 🔁 Persistent workflow memory, not a one-shot script

A learned workflow is stored and reused across executions. A successful repair becomes a new persisted version — it doesn't disappear after one run.

```text
v1 → repair → v2 → reuse → success
```

### 🛠 Generic self-healing, not a hardcoded fix

When a selector goes invalid, CivicApply inspects the live DOM and scores available elements on `id`, `name`, `aria-label`, `placeholder`, label text, semantic/token similarity, and element type. There is no field-specific repair mapping anywhere in the engine — the same code path that recovers a broken name field recovers a broken email field.

### 🌐 Real browser execution against a real site

Runs against a live internship application portal using **webcmd + Playwright**. Not a mocked DOM, not a canned response.

### 👤 A safety boundary that's actually enforced, not just claimed

CivicApply automates the repetitive part of the workflow and **intentionally stops before irreversible actions**. It does not upload documents, click through to a final submission step, or submit the application. That boundary is enforced in the executor, not just described in this README.

---

## The Real Workflow

**Target:** [OKCL Internship Application Portal](https://internship.okcl.org/internshipform)

CivicApply demonstrates a workflow covering the portal's supported pre-submission fields, stopping at its safety boundary before any irreversible action.

### Normal
```text
Persisted Profile → Learned Workflow → Real Browser → Fields completed → Safe stop
```

### Repair
```text
Broken Selector → Actual Browser Failure → Live DOM Inspection →
Candidate Scoring → Selector Recovery → Fields completed → v1 → v2 persisted
```

### Reuse (after repair)
```text
Persisted v2 → Real Browser → Fields completed → No repair required
```

---

## Proof of Self-Healing

<!--
  FILL THIS IN AFTER YOU HAVE ACTUALLY RUN THE LIVE SEQUENCE TODAY.
  Do not publish specific numbers or checkmarks you haven't personally watched happen.
  Use your recorded run as the source for these numbers.
-->

```text
[selector you broke, e.g. #fullNameChanged]
       ↓
Browser failure
       ↓
Live DOM inspection
       ↓
[recovered selector, e.g. #fullName]
       ↓
Workflow repaired
       ↓
v1 → v2 persisted
       ↓
v2 reused successfully
```

---

## Validation

<!-- Only check a box after you have personally watched that exact test pass in today's real run. -->

| Test                          | Result |
| ------------------------------ | ------ |
| Normal execution (real portal)| ✅     |
| Selector repair (real DOM)    | ✅   |
| Reuse after repair            | ✅     |
| Workflow version persistence  | ✅    |
| Profile edit → live browser use | ✅   |
| Safe stop before submission   | ✅   |
| TypeScript validation         | ✅ passed |
| Production build              | ✅ passed |

---

## Screenshots
<img width="1887" height="870" alt="image" src="https://github.com/user-attachments/assets/37034577-48e8-4383-b15d-cf1cc09e9f9b" />



<img width="1887" height="862" alt="image" src="https://github.com/user-attachments/assets/0282753d-312c-4730-89ae-c0eb0483e1e6" />



<img width="1885" height="875" alt="image" src="https://github.com/user-attachments/assets/d6207cb1-36c6-48a9-8dd7-4613e6adb55f" />


---

## Architecture

```text
┌──────────────────────────────┐
│        CivicApply UI         │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│         Workflow API         │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│       Workflow Executor      │
│    Normal / Reuse / Repair   │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│      Webcmd + Playwright     │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│      Real Web Application    │
└──────────────┬───────────────┘
               │ selector fails
               ▼
┌──────────────────────────────┐
│     Live DOM Inspection      │
│      + Candidate Scoring     │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│    Repaired Workflow + vN    │
└──────────────────────────────┘
```

---

## Tech Stack

| Layer                  | Technology                              |
| ----------------------- | ---------------------------------------- |
| Frontend                | Next.js, React, TypeScript               |
| Browser infrastructure  | webcmd                                   |
| Browser automation      | Playwright                               |
| Workflow engine         | TypeScript                               |
| Recovery engine         | Live DOM inspection + heuristic scoring  |
| Workflow memory         | JSON persistence                         |

---

## Run Locally

```bash
git clone https://github.com/soumiik03/CivicApply.git
cd CivicApply

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Reset the demo
```bash
npm run reset-demo
```

### Validate the project
```bash
npx tsc --noEmit
npm run build
git diff --check
```

---

### The moment to watch
```text
Stored Workflow (broken selector)
       ↓
       ✕
       ↓
Live DOM Inspection
       ↓
Recovered selector
       ↓
Workflow Repaired → new version persisted
```

---

## The Core Idea

Traditional browser automation asks: **"Does this workflow still work?"**

CivicApply asks: **"When it breaks, can the agent repair what it learned — and remember the fix?"**

Explore once. Learn the workflow. Reuse the command. When the web changes, adapt.

---

### Built for SLAB — Self-Learning Agent Browser Hackathon
**Browser Agents · webcmd · Real-World Workflow Automation**
