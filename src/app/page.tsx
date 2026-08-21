"use client";

import { useEffect, useState } from "react";
import type {
  WorkflowExecutionResult,
  WorkflowMode,
} from "../executor/types";
import FailureRepairPanel from "../components/FailureRepairPanel";

interface DashboardData {
  workflow: {
    name: string;
    site: string | null;
    url: string | null;
    version: number;
    status: string;
    steps: number;
  };
  profile: Record<string, string>;
}

type RequestState =
  | "ready"
  | "running"
  | "completed"
  | "repaired"
  | "failed";

const MODES: Array<{
  id: WorkflowMode;
  title: string;
  badge: string;
  description: string;
}> = [
  {
    id: "normal",
    title: "NORMAL",
    badge: "Baseline",
    description: "Executes baseline workflow against the live portal",
  },
  {
    id: "reuse",
    title: "REUSE",
    badge: "Learned",
    description: "Reuses stored learned workflow metadata & selectors",
  },
  {
    id: "repair",
    title: "REPAIR",
    badge: "Self-Heal",
    description: "Simulates broken DOM drift & executes heuristic self-healing",
  },
];

export default function HomePage() {
  const [mode, setMode] = useState<WorkflowMode>("reuse");
  const [state, setState] = useState<RequestState>("ready");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [response, setResponse] = useState<WorkflowExecutionResult | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Record<string, string>>({});
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [keepBrowser, setKeepBrowser] = useState(false);

  const fetchDashboardData = () => {
    fetch("/api/workflow/run")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load workflow status");
        return res.json() as Promise<DashboardData>;
      })
      .then(setDashboard)
      .catch(() => setDashboard(null));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [response]);

  useEffect(() => {
    if (dashboard?.profile) setProfileDraft(dashboard.profile);
  }, [dashboard]);

  const saveProfile = async () => {
    setProfileMessage(null);
    const result = await fetch("/api/workflow/run", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: profileDraft }),
    });
    const data = (await result.json()) as { profile?: Record<string, string>; error?: string };
    if (!result.ok || !data.profile) {
      setProfileMessage(data.error || "Profile could not be saved.");
      return;
    }
    setEditingProfile(false);
    setProfileMessage("Profile saved to backend source of truth.");
    fetchDashboardData();
  };

  const run = async () => {
    setState("running");
    setResponse(null);
    setClientError(null);
    setCopied(false);

    try {
      const result = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, keepBrowser }),
      });

      const data = (await result.json()) as WorkflowExecutionResult;
      setResponse(data);

      if (data.success) {
        setState(data.status);
      } else {
        setState("failed");
      }
    } catch (error) {
      setState("failed");
      setClientError(
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  const closeInspectedBrowser = async () => {
    await fetch("/api/workflow/run", { method: "DELETE" });
    setResponse((current) => current ? { ...current, browser: { retained: false } } : current);
  };

  const copyResponse = () => {
    if (!response) return;
    void navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const profile = dashboard?.profile;
  const displayedWorkflow = response?.workflow || dashboard?.workflow;
  const displayState = response ? state : state === "running" ? "running" : "ready";

  const getStatusLabel = () => {
    if (state === "running") {
      return mode === "repair"
        ? "SELF-HEALING DOM"
        : mode === "reuse"
        ? `REUSING V${dashboard?.workflow.version ?? 1}`
        : "RUNNING AUTOMATION";
    }
    if (state === "completed") return "COMPLETED";
    if (state === "repaired") return "REPAIRED & LEARNED";
    if (state === "failed") return "EXECUTION FAILED";
    return "READY";
  };

  return (
    <main className="container">
      {/* HEADER */}
      <header className="header">
        <div className="title-wrap">
          <span className="brand-tag">Autonomous Webcmd Agent</span>
          <h1>CivicApply</h1>
          <p>Persisted browser workflows with heuristic DOM selector self-healing</p>
        </div>

        <span className={`status-pill ${displayState}`}>
          <span className={`dot-indicator ${state === "running" ? "dot-pulse" : ""}`} />
          {getStatusLabel()}
        </span>
      </header>

      {/* SAFETY PRINCIPLE RESTRICTION BANNER */}
      <div className="safety-banner">
        <div>
          <strong>[SAFETY PROTOCOL ACTIVE]</strong> The workflow completes the persisted supported fields on <code>internship.okcl.org</code>, then halts strictly before final submission.
        </div>
      </div>

      {/* METRICS STRIP */}
      <div className="metrics-strip">
        <div className="metric-card">
          <span className="metric-label">Workflow Target</span>
          <span className="metric-value font-mono">
            {dashboard?.workflow.name || displayedWorkflow?.name || "internship-application"}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Target Portal</span>
          <span className="metric-value font-mono" style={{ color: "var(--accent-cyan)" }}>
            {dashboard?.workflow.site || "internship.okcl.org"}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Learned Version</span>
          <span className="metric-value font-mono">
            {displayedWorkflow ? `v${displayedWorkflow.version}` : "v1"}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Persisted Status</span>
          <span className="metric-value font-mono" style={{ color: "var(--accent-green)" }}>
            <span className="dot-indicator dot-pulse" />
            {dashboard?.workflow.status || "learned"}
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="main-grid">
        {/* LEFT COLUMN: Controls & Profile */}
        <div className="column">
          {/* TARGET WORKFLOW CARD */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Target Workflow</h2>
              <span className="card-subtitle">WEBCMD DOM ADAPTER</span>
            </div>

            <div className="workflow-info-box">
              <div className="workflow-top">
                <div>
                  <div className="workflow-name font-mono">
                    {dashboard?.workflow.name || "internship-application"}
                  </div>
                  {dashboard?.workflow.url && (
                    <a
                      className="workflow-url font-mono"
                      href={dashboard.workflow.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {dashboard.workflow.site}
                    </a>
                  )}
                </div>

                <span className="status-pill completed">
                  v{displayedWorkflow?.version ?? dashboard?.workflow.version ?? 1}
                </span>
              </div>

              <div className="workflow-badges">
                <span>
                  FIELDS: <strong>{dashboard?.workflow.steps ?? 19}</strong>
                </span>
                <span>/</span>
                <span>
                  STATUS: <strong style={{ color: "var(--accent-green)" }}>{dashboard?.workflow.status || "learned"}</strong>
                </span>
                <span>/</span>
                <span>
                  CONTROLLER: <strong style={{ color: "var(--accent-cyan)" }}>Playwright Headless</strong>
                </span>
              </div>
            </div>

            {/* EXECUTION MODE SELECTION */}
            <label className="section-label">Execution Mode</label>
            <div className="mode-grid">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`mode-option-btn ${mode === item.id ? "active" : ""}`}
                  onClick={() => setMode(item.id)}
                  disabled={state === "running"}
                >
                  <div className="mode-btn-title">
                    <span>{item.title}</span>
                    <span style={{ fontSize: "0.68rem" }}>
                      {mode === item.id ? "●" : "○"}
                    </span>
                  </div>
                  <div className="mode-btn-desc">{item.description}</div>
                </button>
              ))}
            </div>

            {/* RUN CTA BUTTON */}
            <div>
              <button
                type="button"
                className={`run-cta-btn ${mode === "repair" ? "repair-mode" : ""}`}
                onClick={run}
                disabled={state === "running" || !dashboard}
              >
                {state === "running" ? (
                  <>
                    <span className="spinner" />
                    {mode === "repair"
                      ? "SELF-HEALING DOM SELECTORS..."
                      : mode === "reuse"
                      ? `REUSING WORKFLOW V${displayedWorkflow?.version ?? 1}...`
                      : "RUNNING AUTOMATION..."}
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    {mode === "repair"
                      ? "RUN REPAIR & SELF-HEAL"
                      : mode === "reuse"
                      ? `RUN WORKFLOW (REUSE V${displayedWorkflow?.version ?? 1})`
                      : "RUN WORKFLOW (NORMAL MODE)"}
                  </>
                )}
              </button>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.85rem", color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "JetBrains Mono, monospace" }}>
                <input
                  type="checkbox"
                  checked={keepBrowser}
                  onChange={(event) => setKeepBrowser(event.target.checked)}
                  disabled={state === "running"}
                  style={{ accentColor: "#ffffff" }}
                />
                RETAIN BROWSER SESSION FOR INSPECTION
              </label>

              {response?.browser?.retained && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginTop: "0.6rem", color: "var(--accent-green)", fontSize: "0.75rem", fontFamily: "JetBrains Mono, monospace", background: "#0d0d0d", padding: "0.5rem 0.75rem", border: "1px solid var(--border-color)" }}>
                  <span>● Browser session active</span>
                  <button type="button" className="copy-btn" onClick={closeInspectedBrowser}>CLOSE BROWSER</button>
                </div>
              )}
            </div>
          </section>

          {/* STUDENT PROFILE CARD */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Student Profile</h2>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span className="status-pill ready">STUDENT.JSON</span>
                <button type="button" className="copy-btn" onClick={() => setEditingProfile((v) => !v)}>
                  {editingProfile ? "CANCEL" : "EDIT"}
                </button>
                {editingProfile && <button type="button" className="copy-btn" onClick={saveProfile}>SAVE</button>}
              </div>
            </div>

            {profile ? (
              <div className="profile-card-content">
                {editingProfile && (
                  <div className="profile-grid" style={{ marginBottom: "1rem" }}>
                    {[
                      "firstName", "lastName", "fullName", "email", "phone", "gender",
                      "district", "block", "address", "university", "college", "universityRegNo",
                      "course", "specialization", "currentSemester", "admissionMonth", "admissionYear",
                      "educationStatus",
                    ].map((key) => (
                      <label className="profile-item" key={key}>
                        <span className="profile-label">{key}</span>
                        <input
                          value={profileDraft[key] || ""}
                          onChange={(event) => setProfileDraft((draft) => ({ ...draft, [key]: event.target.value }))}
                          style={{
                            background: "#080808",
                            border: "1px solid #333333",
                            color: "#ffffff",
                            padding: "0.35rem 0.5rem",
                            fontSize: "0.8rem",
                            fontFamily: "JetBrains Mono, monospace",
                            width: "100%",
                            outline: "none",
                          }}
                        />
                      </label>
                    ))}
                  </div>
                )}

                {profileMessage && (
                  <p style={{ color: "var(--accent-green)", fontSize: "0.75rem", fontFamily: "JetBrains Mono, monospace", background: "#0d0d0d", padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                    {profileMessage}
                  </p>
                )}

                <div className="profile-hero">
                  <div className="profile-avatar font-mono">
                    {(profile.firstName?.[0] || "T")}{(profile.lastName?.[0] || "S")}
                  </div>
                  <div>
                    <div className="profile-name">{profile.fullName}</div>
                    <div className="profile-subtext font-mono">
                      {profile.email} • {profile.phone}
                    </div>
                  </div>
                </div>

                <div className="profile-grid">
                  <div className="profile-item">
                    <span className="profile-label">University</span>
                    <div className="profile-value">{profile.university}</div>
                  </div>

                  <div className="profile-item">
                    <span className="profile-label">Course &amp; Spec</span>
                    <div className="profile-value">{profile.course} ({profile.specialization})</div>
                  </div>

                  <div className="profile-item">
                    <span className="profile-label">Location</span>
                    <div className="profile-value">
                      {profile.district} / {profile.block}
                    </div>
                  </div>

                  <div className="profile-item">
                    <span className="profile-label">Registration No.</span>
                    <div className="profile-value font-mono">
                      {profile.universityRegNo}
                    </div>
                  </div>

                  <div className="profile-item">
                    <span className="profile-label">Semester</span>
                    <div className="profile-value">{profile.currentSemester}</div>
                  </div>

                  <div className="profile-item">
                    <span className="profile-label">Admission</span>
                    <div className="profile-value">
                      {profile.admissionMonth} {profile.admissionYear}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "JetBrains Mono, monospace" }}>Loading student.json profile…</p>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Execution Result & Details */}
        <div className="column">
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Execution Result</h2>
              <span className={`status-pill ${displayState}`}>
                {getStatusLabel()}
              </span>
            </div>

            {/* READY STATE */}
            {displayState === "ready" && (
              <div className="result-hero-box ready">
                <div className="result-hero-title">READY TO EXECUTE</div>
                <div className="result-hero-desc">
                  Select execution mode and click <strong>RUN WORKFLOW</strong> to launch an isolated Webcmd session against <code>internship.okcl.org</code>.
                </div>
              </div>
            )}

            {/* RUNNING STATE */}
            {displayState === "running" && (
              <div className="result-hero-box running">
                <div className="result-hero-title font-mono" style={{ color: "var(--accent-cyan)" }}>
                  <span className="spinner" style={{ borderTopColor: "var(--accent-cyan)" }} />
                  {mode === "repair" ? "EXECUTING DOM HEURISTIC REPAIR..." : "EXECUTING BROWSER WORKFLOW..."}
                </div>
                <div className="result-hero-desc font-mono">
                  Webcmd headless controller active. Interacting with target portal. Awaiting execution result.
                </div>
              </div>
            )}

            {/* CLIENT ERROR */}
            {clientError && (
              <div className="result-hero-box failed">
                <div className="result-hero-title" style={{ color: "var(--accent-red)" }}>
                  EXECUTION FAILED
                </div>
                <div className="result-hero-desc font-mono">{clientError}</div>
              </div>
            )}

            {/* API EXECUTION RESPONSE */}
            {response && (
              <>
                <div
                  className={`result-hero-box ${
                    response.success ? response.status : "failed"
                  }`}
                >
                  <div className="result-hero-title">
                    {response.success ? (
                      response.status === "repaired" ? (
                        <span style={{ color: "var(--accent-green)" }}>DOM SELECTOR REPAIR SUCCEEDED</span>
                      ) : (
                        <span style={{ color: "var(--accent-green)" }}>WORKFLOW COMPLETED SUCCESSFULLY</span>
                      )
                    ) : (
                      <span style={{ color: "var(--accent-red)" }}>EXECUTION FAILED</span>
                    )}
                  </div>

                  <div className="result-hero-desc">
                    {response.error ||
                      (response.success
                        ? response.status === "repaired"
                          ? response.repair?.newSelector
                            ? `Invalidated selector successfully replaced with ${response.repair.newSelector} via live DOM scoring. Remaining steps completed.`
                            : "Repair completed."
                          : `All 19 form fields populated accurately using learned map v${response.workflow.version}. Pre-submission safety lock verified.`
                        : "The backend reported an execution failure.")}
                  </div>
                </div>

                {/* STATS ROW */}
                <div className="result-stats-row">
                  <div className="stat-block">
                    <span className="stat-block-label">Duration</span>
                    <span className="stat-block-val">{response.execution.durationMs}ms</span>
                  </div>

                  <div className="stat-block">
                    <span className="stat-block-label">Fields Completed</span>
                    <span className="stat-block-val" style={{ color: "var(--accent-cyan)" }}>
                      {response.execution.stepsCompleted} / {dashboard?.workflow.steps ?? 19}
                    </span>
                  </div>

                  <div className="stat-block">
                    <span className="stat-block-label">Workflow Version</span>
                    <span className="stat-block-val" style={{ color: "var(--accent-purple)" }}>
                      v{response.workflow.version}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* WORKFLOW STAGES EXPLANATION */}
            <div className="activity-area">
              <div className="section-label">Workflow Pipeline Stages</div>

              <div className="activity-list">
                {[
                  { title: "Initialize Headless Session", desc: "Isolated Webcmd Playwright session instantiation" },
                  { title: "Navigate & Connect to Portal", desc: "Connecting to https://internship.okcl.org/internshipform" },
                  { title: "Populate Demographics & Identity", desc: "Dispatching student name, email, phone, gender, district, block" },
                  { title: "Fill Educational Credentials", desc: "Populating BPUT, CSE branch, registration number, semester, year" },
                  { title: "Pre-Submission Safety Verification", desc: "Halts strictly before final submission or document actions" },
                ].map((stage, idx) => (
                  <div
                    className={`activity-step ${response?.success ? "completed" : state === "running" ? "in-progress" : "pending"}`}
                    key={stage.title}
                  >
                    <div className="activity-step-icon">
                      {response?.success ? "✓" : state === "running" ? "●" : idx + 1}
                    </div>
                    <div className="activity-step-text">
                      <div style={{ fontWeight: 600, fontSize: "0.8rem", fontFamily: "JetBrains Mono, monospace" }}>{stage.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                        {stage.desc}
                      </div>
                    </div>
                    <div className="activity-step-time">
                      {response?.success ? "VERIFIED" : state === "running" ? "ACTIVE" : "QUEUED"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TECHNICAL DETAILS DRAWER */}
            <div className="tech-details-wrap">
              <button
                type="button"
                className="tech-toggle-btn"
                onClick={() => setShowTechnicalDetails((v) => !v)}
              >
                <span>
                  {showTechnicalDetails ? "▼" : "▶"} Technical Details &amp; Raw API Payload
                </span>
                <span style={{ color: "var(--accent-cyan)" }}>
                  POST /api/workflow/run
                </span>
              </button>

              {showTechnicalDetails && (
                <div className="tech-content">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace" }}>
                      Payload: <code>{JSON.stringify({ mode, keepBrowser })}</code>
                    </span>
                    {response && (
                      <button type="button" className="copy-btn" onClick={copyResponse}>
                        {copied ? "COPIED" : "COPY JSON"}
                      </button>
                    )}
                  </div>

                  <div className="tech-json-viewer">
                    <pre>
                      {response
                        ? JSON.stringify(response, null, 2)
                        : "// No execution response dispatched yet."}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* FAILURE & REPAIR PROGRESSION PANEL */}
      {(mode === "repair" || response?.repair?.attempted) && (
        <FailureRepairPanel
          state={state}
          mode={mode}
          repair={response?.repair}
          error={response?.error || clientError || undefined}
        />
      )}
    </main>
  );
}
