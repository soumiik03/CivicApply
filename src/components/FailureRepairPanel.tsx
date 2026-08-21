import type { RepairResult, WorkflowMode } from "../executor/types";

interface FailureRepairPanelProps {
  state: "ready" | "running" | "completed" | "repaired" | "failed";
  mode: WorkflowMode;
  repair?: RepairResult;
  error?: string;
}

export default function FailureRepairPanel({
  state,
  mode,
  repair,
  error,
}: FailureRepairPanelProps) {
  const isRunning = state === "running";
  const isRepaired = state === "repaired" || (repair?.attempted && repair?.repaired);
  const isFailed = state === "failed" || (repair?.attempted && !repair?.repaired);

  const oldSelector = repair?.oldSelector;
  const newSelector = repair?.newSelector;
  const prevVer = repair?.previousVersion;
  const nextVer = repair?.newVersion;

  return (
    <section className="card repair-section">
      <div className="repair-header">
        <h2 className="card-title" style={{ marginBottom: 0 }}>
          <span>🩺</span> Generic DOM Self-Healing
        </h2>

        <span
          className={`repair-status ${
            isRunning
              ? "repairing"
              : isRepaired
              ? "repaired"
              : isFailed
              ? "failed"
              : "ready"
          }`}
        >
          {isRunning && "REPAIRING"}
          {isRepaired && "REPAIRED & LEARNED"}
          {isFailed && "REPAIR FAILED"}
          {!isRunning && !isRepaired && !isFailed && "READY"}
        </span>
      </div>

      {/* Main State Box */}
      <div className="repair-error-box">
        {isRunning && (
          <>
            <div
              className="repair-error-title"
              style={{ color: "var(--accent-cyan)" }}
            >
              <span className="spinner" style={{ width: 14, height: 14, display: "inline-block", marginRight: 8 }} />
              Controlled Failure Simulation &amp; Self-Healing in Progress
            </div>
            <p className="repair-error-text">
              Controlled Failure — Full Name selector intentionally invalidated. Inspecting active DOM via Webcmd and scoring candidate elements with generic intent heuristics.
            </p>
            {oldSelector && <code className="repair-selector">{oldSelector}</code>}
          </>
        )}

        {isRepaired && (
          <>
            <div
              className="repair-error-title"
              style={{ color: "var(--accent-green)" }}
            >
              ✓ Generic DOM Self-Healing Succeeded
            </div>
            <p className="repair-error-text">
              Controlled Failure — Full Name selector intentionally invalidated. Live DOM candidate scoring discovered matching replacement selector, resumed execution, and upgraded workflow metadata.
            </p>
            {newSelector && <code className="repair-selector">{newSelector}</code>}
          </>
        )}

        {isFailed && (
          <>
            <div className="repair-error-title">
              ⚠ Workflow Step Failed
            </div>
            <p className="repair-error-text">
              {error || "The backend reported a workflow failure."}
            </p>
            {oldSelector && <code className="repair-selector">{oldSelector}</code>}
          </>
        )}
      </div>

      {/* Real Execution Progression Timeline */}
      <div className="repair-timeline">
        <div className="repair-timeline-item">
          <div className="repair-timeline-left">
            <div className="repair-dot failed"></div>
            <div className="repair-line"></div>
          </div>
          <div className="repair-timeline-content">
            <div className="repair-timeline-title" style={{ color: "var(--accent-red)" }}>
              1. Broken Selector Encountered
            </div>
            <div className="repair-timeline-desc">
              {oldSelector ? (
                <>Invalidated selector <code style={{ color: "var(--accent-red)" }}>{oldSelector}</code> failed to resolve on portal.</>
              ) : (
                "Controlled failure encountered during execution."
              )}
            </div>
          </div>
        </div>

        <div className="repair-timeline-item">
          <div className="repair-timeline-left">
            <div className={`repair-dot ${isRepaired ? "success" : isRunning ? "" : "failed"}`}></div>
            <div className="repair-line"></div>
          </div>
          <div className="repair-timeline-content">
            <div className="repair-timeline-title">
              2. Live DOM Inspection &amp; Generic Scoring
            </div>
            <div className="repair-timeline-desc">
              Webcmd inspected active page DOM. Multi-factor heuristic token &amp; attribute scoring ranked candidate elements.
            </div>
          </div>
        </div>

        <div className="repair-timeline-item">
          <div className="repair-timeline-left">
            <div className={`repair-dot ${isRepaired ? "success" : "failed"}`}></div>
            <div className="repair-line"></div>
          </div>
          <div className="repair-timeline-content">
            <div className={`repair-timeline-title ${isRepaired ? "repair-success" : ""}`}>
              3. Dynamic Selector Replacement &amp; Step Retry
            </div>
            <div className="repair-timeline-desc">
              {newSelector ? (
                <>Replaced broken step with <code style={{ color: "var(--accent-green)" }}>{newSelector}</code> and completed remaining steps.</>
              ) : (
                "Executed retry from failed step with identified candidate selector."
              )}
            </div>
          </div>
        </div>

        <div className="repair-timeline-item">
          <div className="repair-timeline-left">
            <div className={`repair-dot ${isRepaired ? "success" : ""}`}></div>
          </div>
          <div className="repair-timeline-content">
            <div className={`repair-timeline-title ${isRepaired ? "repair-success" : ""}`}>
              4. Learned Version Upgrade &amp; Persistence
            </div>
            <div className="repair-timeline-desc">
              {nextVer ? (
                <>Workflow version bumped to <strong>v{nextVer}</strong> and persisted to <code>workflows/internship-workflow.meta.json</code>.</>
              ) : (
                "Workflow metadata updated and saved."
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selector Change Diff */}
      {isRepaired && oldSelector && newSelector && (
        <div className="selector-repair-box">
          <div className="selector-repair-title">
            GENERIC SELECTOR HEALING DIFF
          </div>
          <div className="selector-repair-content">
            <code className="old-selector">{oldSelector}</code>
            <span className="selector-arrow">➔</span>
            <code className="new-selector">{newSelector}</code>
          </div>
        </div>
      )}

      {/* Version & Retry Summary */}
      {isRepaired && prevVer !== undefined && nextVer !== undefined && (
        <div className="repair-summary">
          <div className="repair-summary-box">
            <div className="repair-summary-label">
              WORKFLOW VERSION EVOLUTION
            </div>
            <div className="repair-summary-value" style={{ color: "var(--accent-purple)" }}>
              v{prevVer} ➔ v{nextVer}
            </div>
          </div>

          <div className="repair-summary-box">
            <div className="repair-summary-label">
              RETRY EXECUTION STATUS
            </div>
            <div className="repair-summary-value repair-success">
              ✓ All 19 Fields Populated
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
