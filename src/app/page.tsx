"use client";

import { useState } from "react";

interface WorkflowApiResponse {
  success: boolean;
  mode: string;
  status: string;
  version?: number;
  error?: string;
  repaired?: boolean;
}

export default function HomePage() {
  const [mode, setMode] = useState<"normal" | "reuse" | "repair">("reuse");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<WorkflowApiResponse | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({
        success: false,
        mode,
        status: "network_error",
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="header">
        <div className="logo-group">
          <div className="logo-badge">CF</div>
          <div className="title-wrap">
            <h1>CivicFlow Automation</h1>
            <p>CivicApply Autonomous Workflow Orchestrator</p>
          </div>
        </div>
        <div>
          <span className="status-badge status-learned">
            Active Adapter: Webcmd
          </span>
        </div>
      </header>

      <div className="grid">
        <section className="card">
          <h2 className="card-title">
            <span>Workflow Execution</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Target: internship.okcl.org
            </span>
          </h2>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                fontSize: "0.825rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Execution Mode
            </label>
            <div className="mode-selector">
              <button
                type="button"
                className={`mode-btn ${mode === "normal" ? "active" : ""}`}
                onClick={() => setMode("normal")}
              >
                Normal
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === "reuse" ? "active" : ""}`}
                onClick={() => setMode("reuse")}
              >
                Reuse (Learned)
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === "repair" ? "active" : ""}`}
                onClick={() => setMode("repair")}
              >
                Repair (Self-Heal)
              </button>
            </div>
          </div>

          <button
            type="button"
            className="run-btn"
            onClick={handleRun}
            disabled={loading}
          >
            {loading ? (
              <>Running Workflow via Webcmd...</>
            ) : (
              <>▶ Run Workflow ({mode})</>
            )}
          </button>

          <div style={{ marginTop: "1.5rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              Profile Context
            </h3>
            <div className="info-row">
              <span className="info-label">Applicant:</span>
              <span className="info-val">Tom Smith</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email / Phone:</span>
              <span className="info-val">tomsmith@example.com / 9876543210</span>
            </div>
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-val">Khurda / Bhubaneswar</span>
            </div>
            <div className="info-row" style={{ borderBottom: "none" }}>
              <span className="info-label">University:</span>
              <span className="info-val">BPUT (B.Tech CSE)</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">
            <span>Execution Status</span>
            {response && (
              <span
                className="status-badge"
                style={{
                  backgroundColor: response.success
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(239, 68, 68, 0.15)",
                  color: response.success
                    ? "var(--accent-green)"
                    : "var(--accent-red)",
                  border: response.success
                    ? "1px solid rgba(16, 185, 129, 0.3)"
                    : "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                {response.success ? "SUCCESS" : "FAILED"}
              </span>
            )}
          </h2>

          <div className="terminal-window">
            {loading ? (
              <div style={{ color: "var(--accent-cyan)" }}>
                &gt; Spawning Webcmd browser session...
                <br />
                &gt; Executing workflow steps on internship.okcl.org...
                <br />
                &gt; Awaiting Playwright controller response...
              </div>
            ) : response ? (
              <pre>{JSON.stringify(response, null, 2)}</pre>
            ) : (
              <div style={{ color: "var(--text-muted)" }}>
                &gt; Ready for execution. Click &apos;Run Workflow&apos; or call
                POST /api/workflow/run.
              </div>
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <div className="info-row">
              <span className="info-label">Endpoint:</span>
              <code style={{ fontSize: "0.8rem", color: "var(--accent-cyan)" }}>
                POST /api/workflow/run
              </code>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
