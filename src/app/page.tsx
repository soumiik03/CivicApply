"use client";

import React, { useState } from "react";

interface WorkflowApiResponse {
  success: boolean;
  mode: string;
  status: string;
  version?: number;
  error?: string;
  repaired?: boolean;
}

type ExecutionState =
  | "ready"
  | "running"
  | "completed"
  | "repaired"
  | "failed";

const INITIAL_WORKFLOW = {
  name: "Internship Application",
  site: "internship.okcl.org",
  url: "https://internship.okcl.org/internshipform",
  version: 2,
  status: "Learned",
  totalSteps: 19,
};

const STUDENT_PROFILE = {
  fullName: "Tom Smith",
  email: "tomsmith@example.com",
  phone: "9876543210",
  gender: "Male",
  district: "Khurda",
  block: "Bhubaneswar",
  university: "BPUT Rourkela (Odisha)",
  college: "Others",
  regNo: "TEST123456",
  course: "B.Tech (Computer Science & Engg)",
  semester: "1st Semester",
  admission: "August 2025",
  status: "Currently Pursuing",
};

const WORKFLOW_STAGES = [
  { id: 1, title: "Initialize Webcmd Browser Engine", detail: "Spawning isolated headless controller session" },
  { id: 2, title: "Navigate to OKCL Portal", detail: "Accessing https://internship.okcl.org/internshipform" },
  { id: 3, title: "Populate Demographics & Identity", detail: "Filling Name, Email, Phone, Gender and Address" },
  { id: 4, title: "Resolve Dynamic Geolocation", detail: "Selecting District (Khurda) and Block (Bhubaneswar)" },
  { id: 5, title: "Navigate & Populate Education Credentials", detail: "Selecting BPUT, B.Tech CSE, Reg No & Admission Year" },
  { id: 6, title: "Safety Verification & Anchor Lock", detail: "Form fully prepared without triggering final submission" },
];

export default function HomePage() {
  const [mode, setMode] = useState<"normal" | "reuse" | "repair">("reuse");
  const [executionState, setExecutionState] = useState<ExecutionState>("ready");
  const [currentVersion, setCurrentVersion] = useState<number>(INITIAL_WORKFLOW.version);
  const [previousVersion, setPreviousVersion] = useState<number>(1);
  const [response, setResponse] = useState<WorkflowApiResponse | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRun = async () => {
    setExecutionState("running");
    setResponse(null);

    const startTime = Date.now();

    try {
      const res = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      const data: WorkflowApiResponse = await res.json();
      const duration = Date.now() - startTime;
      setExecutionTime(duration);
      setResponse(data);

      if (data.success) {
        if (data.version) {
          setPreviousVersion(currentVersion);
          setCurrentVersion(data.version);
        }

        if (mode === "repair") {
          setExecutionState("repaired");
        } else {
          setExecutionState("completed");
        }
      } else {
        setExecutionState("failed");
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      setExecutionTime(duration);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setResponse({
        success: false,
        mode,
        status: "network_error",
        error: errorMsg,
      });
      setExecutionState("failed");
    }
  };

  const handleCopyJson = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (executionState) {
      case "ready":
        return (
          <span className="status-pill ready">
            <span className="dot-indicator"></span>
            Ready
          </span>
        );
      case "running":
        return (
          <span className="status-pill running">
            <span className="dot-indicator dot-pulse"></span>
            Running Automation...
          </span>
        );
      case "completed":
        return (
          <span className="status-pill completed">
            <span className="dot-indicator"></span>
            Completed
          </span>
        );
      case "repaired":
        return (
          <span className="status-pill repaired">
            <span className="dot-indicator dot-pulse"></span>
            Repaired &amp; Learned
          </span>
        );
      case "failed":
        return (
          <span className="status-pill failed">
            <span className="dot-indicator"></span>
            Execution Failed
          </span>
        );
    }
  };

  const isRunning = executionState === "running";

  return (
    <main className="container">
      {/* Product Top Header */}
      <header className="header">
        <div className="logo-group">
          <div className="logo-badge">CA</div>
          <div className="title-wrap">
            <h1>CivicApply Automation Suite</h1>
            <p>Autonomous Form Completion &amp; Heuristic Selector Repair</p>
          </div>
        </div>
        <div className="header-right">
          <span className="status-pill completed">
            <span className="dot-indicator"></span>
            Webcmd Controller v2.4
          </span>
        </div>
      </header>

      {/* Safety Principle Restriction Notice */}
      <div className="safety-banner">
        <span className="safety-banner-icon">🛡️</span>
        <div>
          <strong>Pre-Submission Safety Anchor Active:</strong> Workflow fills and validates 19 application fields on <code>internship.okcl.org</code> without triggering irreversible final submission.
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="metrics-strip">
        <div className="metric-card">
          <span className="metric-label">Target Workflow</span>
          <span className="metric-value">
            <span>📋</span> {INITIAL_WORKFLOW.name}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Target Portal</span>
          <span className="metric-value">
            <span style={{ color: "var(--accent-cyan)" }}>🌐</span> {INITIAL_WORKFLOW.site}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Engine Version</span>
          <span className="metric-value">
            <span style={{ color: "var(--accent-purple)" }}>🏷️</span> v{currentVersion}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Memory Status</span>
          <span className="metric-value" style={{ color: "var(--accent-green)" }}>
            <span className="dot-indicator dot-pulse" style={{ background: "var(--accent-green)" }}></span>
            {response ? response.status : INITIAL_WORKFLOW.status}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="main-grid">
        {/* Left Column: Target Workflow, Profile, Controls */}
        <div className="column">
          {/* Card 1: Target Workflow Card */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                <span>⚙️</span> Target Workflow
              </h2>
              <span className="card-subtitle">CF-WF-001</span>
            </div>

            <div className="workflow-info-box">
              <div className="workflow-top">
                <div>
                  <div className="workflow-name">{INITIAL_WORKFLOW.name}</div>
                  <a
                    href={INITIAL_WORKFLOW.url}
                    target="_blank"
                    rel="noreferrer"
                    className="workflow-url"
                  >
                    <span>🔗</span> {INITIAL_WORKFLOW.site}
                  </a>
                </div>
                <span className="status-pill completed">
                  <span className="dot-indicator"></span>
                  v{currentVersion}
                </span>
              </div>

              <div className="workflow-badges">
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Total Fields: <strong style={{ color: "#fff" }}>{INITIAL_WORKFLOW.totalSteps}</strong>
                </span>
                <span style={{ color: "var(--border-color)" }}>•</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Status: <strong style={{ color: "var(--accent-green)" }}>{response ? response.status : INITIAL_WORKFLOW.status}</strong>
                </span>
                <span style={{ color: "var(--border-color)" }}>•</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Adapter: <strong style={{ color: "var(--accent-cyan)" }}>Webcmd DOM</strong>
                </span>
              </div>
            </div>

            {/* Execution Mode Controls */}
            <div className="mode-section">
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Execution Mode Selection
              </label>

              <div className="mode-grid">
                <button
                  type="button"
                  className={`mode-option-btn ${mode === "normal" ? "active" : ""}`}
                  onClick={() => setMode("normal")}
                  disabled={isRunning}
                >
                  <div className="mode-btn-title">
                    <span>Normal</span>
                    {mode === "normal" && <span style={{ color: "var(--accent-blue)" }}>●</span>}
                  </div>
                  <div className="mode-btn-desc">Baseline flow without cache check</div>
                </button>

                <button
                  type="button"
                  className={`mode-option-btn ${mode === "reuse" ? "active" : ""}`}
                  onClick={() => setMode("reuse")}
                  disabled={isRunning}
                >
                  <div className="mode-btn-title">
                    <span>Reuse</span>
                    {mode === "reuse" && <span style={{ color: "var(--accent-blue)" }}>●</span>}
                  </div>
                  <div className="mode-btn-desc">Executes verified learned selector map</div>
                </button>

                <button
                  type="button"
                  className={`mode-option-btn repair ${mode === "repair" ? "active" : ""}`}
                  onClick={() => setMode("repair")}
                  disabled={isRunning}
                >
                  <div className="mode-btn-title">
                    <span>Repair</span>
                    {mode === "repair" && <span style={{ color: "var(--accent-purple)" }}>●</span>}
                  </div>
                  <div className="mode-btn-desc">Simulates broken DOM &amp; self-heals</div>
                </button>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="run-cta-wrap">
              <button
                type="button"
                className={`run-cta-btn ${mode === "repair" ? "repair-mode" : ""}`}
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <span className="spinner"></span>
                    Running Automation...
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    Run Application
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Card 2: Student Profile Context */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                <span>👤</span> Student Profile
              </h2>
              <span className="status-pill ready" style={{ fontSize: "0.7rem" }}>
                student.json
              </span>
            </div>

            <div className="profile-card-content">
              <div className="profile-hero">
                <div className="profile-avatar">TS</div>
                <div>
                  <div className="profile-name">{STUDENT_PROFILE.fullName}</div>
                  <div className="profile-subtext">
                    {STUDENT_PROFILE.email} • {STUDENT_PROFILE.phone}
                  </div>
                </div>
              </div>

              <div className="profile-grid">
                <div className="profile-item">
                  <span className="profile-label">University</span>
                  <div className="profile-value">{STUDENT_PROFILE.university}</div>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Degree &amp; Branch</span>
                  <div className="profile-value">{STUDENT_PROFILE.course}</div>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Location / Block</span>
                  <div className="profile-value">
                    {STUDENT_PROFILE.district} / {STUDENT_PROFILE.block}
                  </div>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Registration No</span>
                  <div className="profile-value" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {STUDENT_PROFILE.regNo}
                  </div>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Academic Semester</span>
                  <div className="profile-value">{STUDENT_PROFILE.semester}</div>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Admission Year</span>
                  <div className="profile-value">{STUDENT_PROFILE.admission}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Execution Status, Human-Readable Results, Repair Diff, Activity */}
        <div className="column">
          {/* Main Execution Result Card */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">
                <span>📊</span> Execution Result
              </h2>
              <div>{getStatusBadge()}</div>
            </div>

            {/* Human-Readable Status Hero Box */}
            {executionState === "ready" && (
              <div className="result-hero-box ready">
                <div className="result-hero-title" style={{ color: "#e2e8f0" }}>
                  <span>⚪</span> Ready for Orchestration
                </div>
                <div className="result-hero-desc">
                  Select an execution mode (Reuse, Normal, or Repair) on the left panel and click <strong>Run Application</strong> to launch the automated submission workflow via Webcmd.
                </div>
              </div>
            )}

            {executionState === "running" && (
              <div className="result-hero-box running">
                <div className="result-hero-title" style={{ color: "var(--accent-blue)" }}>
                  <span className="spinner"></span> Executing Application Workflow
                </div>
                <div className="result-hero-desc">
                  Connecting to <code>internship.okcl.org</code>, waiting for the real backend process to complete...
                </div>
              </div>
            )}

            {executionState === "completed" && (
              <div className="result-hero-box completed">
                <div className="result-hero-title" style={{ color: "var(--accent-green)" }}>
                  <span>✅</span> Workflow Completed Successfully
                </div>
                <div className="result-hero-desc">
                  All fields on <code>internship.okcl.org</code> were populated accurately. Pre-submission safety lock verified.
                </div>
              </div>
            )}

            {executionState === "repaired" && (
              <div className="result-hero-box repaired">
                <div className="result-hero-title" style={{ color: "var(--accent-green)" }}>
                  <span>✨</span> DOM Self-Healing Succeeded
                </div>
                <div className="result-hero-desc">
                  Identified DOM drift, mapped broken selector to active element via heuristic scoring, successfully executed remaining steps, and persisted new version <strong>v{currentVersion}</strong>.
                </div>
              </div>
            )}

            {executionState === "failed" && (
              <div className="result-hero-box failed">
                <div className="result-hero-title" style={{ color: "var(--accent-red)" }}>
                  <span>❌</span> Execution Failed
                </div>
                <div className="result-hero-desc">
                  {response?.error || "The workflow encountered an unexpected failure during execution."}
                </div>
              </div>
            )}

            {/* Result Stats Row */}
            {(executionState === "completed" || executionState === "repaired" || executionState === "failed") && (
              <div className="result-stats-row">
                <div className="stat-block">
                  <span className="stat-block-label">Execution Time</span>
                  <span className="stat-block-val">{executionTime ? `${executionTime}ms` : "—"}</span>
                </div>
                <div className="stat-block">
                  <span className="stat-block-label">Engine Mode</span>
                  <span className="stat-block-val" style={{ textTransform: "uppercase" }}>
                    {response?.mode || mode}
                  </span>
                </div>
                <div className="stat-block">
                  <span className="stat-block-label">Learned Version</span>
                  <span className="stat-block-val" style={{ color: "var(--accent-cyan)" }}>
                    v{response?.version || currentVersion}
                  </span>
                </div>
              </div>
            )}

            {/* Dedicated Repair Diff Card (Shown on successful repair or repair mode) */}
            {(executionState === "repaired" || (response?.repaired && executionState === "completed")) && (
              <div className="repair-card">
                <div className="repair-header">
                  <div className="repair-title">
                    <span>🩺</span> DOM Self-Healing Diagnostic
                  </div>
                  <span className="status-pill repaired" style={{ fontSize: "0.7rem" }}>
                    Auto-Healed
                  </span>
                </div>

                <div className="diff-box">
                  <div className="diff-row">
                    <span className="diff-tag old">Old Selector</span>
                    <span className="diff-code" style={{ color: "#f87171" }}>
                      #fullNameChanged
                    </span>
                  </div>
                  <div style={{ paddingLeft: "4.5rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    ↓ Heuristic match scored 100/100 (Intent: &apos;fullName&apos;)
                  </div>
                  <div className="diff-row">
                    <span className="diff-tag new">New Selector</span>
                    <span className="diff-code" style={{ color: "#34d399" }}>
                      #fullName
                    </span>
                  </div>
                </div>

                <div className="repair-version-upgrade">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Workflow Version Evolution:
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "var(--accent-purple)" }}>
                    v{previousVersion} ➔ v{currentVersion}
                  </span>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  ✓ Updated <code>workflows/internship-workflow.meta.json</code> with status <strong>&quot;learned&quot;</strong> and bumped version index.
                </div>
              </div>
            )}

            {/* Activity & Progress Timeline Area */}
            <div className="activity-area">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>Workflow Stages</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {WORKFLOW_STAGES.length} Stages Defined
                </span>
              </div>

              <div className="activity-list">
                {WORKFLOW_STAGES.map((stage) => {
                  let stageStatus: "completed" | "in-progress" | "pending" = "pending";

                  if (executionState === "completed" || executionState === "repaired") {
                    stageStatus = "completed";
                  } else if (isRunning) {
                    stageStatus = "in-progress";
                  } else if (executionState === "failed") {
                    stageStatus = "pending"; // Assuming all pending when failed since we don't have partial progress from API
                  }

                  return (
                    <div key={stage.id} className={`activity-step ${stageStatus}`}>
                      <div className="activity-step-icon">
                        {stageStatus === "completed" ? "✓" : stageStatus === "in-progress" ? "●" : stage.id}
                      </div>
                      <div className="activity-step-text">
                        <div style={{ fontWeight: 600, fontSize: "0.825rem" }}>{stage.title}</div>
                        <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                          {stage.detail}
                        </div>
                      </div>
                      <div className="activity-step-time">
                        {stageStatus === "completed" ? "OK" : stageStatus === "in-progress" ? "RUNNING" : "QUEUED"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical Details Collapsible Area */}
            <div className="tech-details-wrap">
              <button
                type="button"
                className="tech-toggle-btn"
                onClick={() => setShowTechDetails((prev) => !prev)}
              >
                <span>
                  {showTechDetails ? "▼" : "▶"} Technical Details &amp; Raw API Response
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontFamily: "JetBrains Mono, monospace" }}>
                  POST /api/workflow/run
                </span>
              </button>

              {showTechDetails && (
                <div className="tech-content">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Integration: <code>POST /api/workflow/run</code> • Payload: <code>{JSON.stringify({ mode })}</code>
                    </span>
                    {response && (
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={handleCopyJson}
                      >
                        {copied ? "Copied JSON!" : "Copy JSON"}
                      </button>
                    )}
                  </div>

                  <div className="tech-json-viewer">
                    {response ? (
                      <pre>{JSON.stringify(response, null, 2)}</pre>
                    ) : (
                      <div style={{ color: "var(--text-muted)" }}>
                        // No request dispatched yet. Click &apos;Run Application&apos; to view raw API payload.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
