interface RepairEvent {
  type: string;
  message: string;
  description: string;
}

interface RepairData {
  failedStep: {
    field: string;
    selector: string;
    reason: string;
  };

  repairEvents: RepairEvent[];

  repair: {
    oldSelector: string;
    newSelector: string;
  };

  previousVersion: number;
  version: number;
  retryStatus: string;
}

interface FailureRepairPanelProps {
  repairStep: number;
  data: RepairData;
}

export default function FailureRepairPanel({
  repairStep,
  data,
}: FailureRepairPanelProps) {
  return (
    <section className="card repair-section">

      <div className="repair-header">
        <h2 className="card-title" style={{ marginBottom: 0 }}>
          Failure & Repair
        </h2>

        <span
          className={`repair-status ${
            repairStep === 0
              ? "ready"
              : repairStep === 1
              ? "failed"
              : repairStep === 2 || repairStep === 3
              ? "repairing"
              : repairStep === 4
              ? "repaired"
              : "completed"
          }`}
        >
          {repairStep === 0 && "READY"}
          {repairStep === 1 && "FAILED"}
          {(repairStep === 2 || repairStep === 3) && "REPAIRING"}
          {repairStep === 4 && "REPAIRED"}
          {repairStep >= 5 && "COMPLETED"}
        </span>
      </div>


      {/* Main State Box */}

      <div className="repair-error-box">

        {repairStep === 1 && (
          <>
            <div className="repair-error-title">
              ⚠ Workflow Step Failed
            </div>

            <p className="repair-error-text">
              The {data.failedStep.field} field could not be found using the
              stored selector.
            </p>

            <code className="repair-selector">
              {data.failedStep.selector}
            </code>
          </>
        )}

        {(repairStep === 2 || repairStep === 3) && (
          <>
            <div
              className="repair-error-title"
              style={{ color: "var(--accent-cyan)" }}
            >
              Repair In Progress
            </div>

            <p className="repair-error-text">
              Inspecting the current page and searching for a replacement field.
            </p>

            <code className="repair-selector">
              {data.failedStep.selector}
            </code>
          </>
        )}

        {repairStep === 4 && (
          <>
            <div
              className="repair-error-title"
              style={{ color: "var(--accent-green)" }}
            >
              ✓ Workflow Repaired
            </div>

            <p className="repair-error-text">
              A replacement selector was found successfully.
            </p>

            <code className="repair-selector">
              {data.repair.newSelector}
            </code>
          </>
        )}

        {repairStep >= 5 && (
          <>
            <div
              className="repair-error-title"
              style={{ color: "var(--accent-green)" }}
            >
              ✓ Repair Completed
            </div>

            <p className="repair-error-text">
              The workflow was repaired and the retry completed successfully.
            </p>
          </>
        )}

      </div>


      {/* Timeline */}

      <div className="repair-timeline">

        {data.repairEvents
          .slice(0, repairStep)
          .map((event, index) => {

            let dotClass = "repair-dot";

            if (event.type === "failed") {
              dotClass += " failed";
            }

            if (event.type === "repaired") {
              dotClass += " success";
            }

            return (
              <div
                className="repair-timeline-item"
                key={index}
              >
                <div className="repair-timeline-left">

                  <div className={dotClass}></div>

                  {index !==
                    data.repairEvents.slice(0, repairStep).length - 1 && (
                    <div className="repair-line"></div>
                  )}

                </div>

                <div className="repair-timeline-content">

                  <div
                    className={`repair-timeline-title ${
                      event.type === "repaired"
                        ? "repair-success"
                        : ""
                    }`}
                  >
                    {event.message}
                  </div>

                  <div className="repair-timeline-desc">
                    {event.description}
                  </div>

                </div>
              </div>
            );
          })}

      </div>


      {/* Selector Change */}

      {repairStep >= 4 && (
        <div className="selector-repair-box">

          <div className="selector-repair-title">
            SELECTOR REPAIR
          </div>

          <div className="selector-repair-content">

            <code className="old-selector">
              {data.repair.oldSelector}
            </code>

            <span className="selector-arrow">
              →
            </span>

            <code className="new-selector">
              {data.repair.newSelector}
            </code>

          </div>
        </div>
      )}


      {/* Result */}

      {repairStep >= 5 && (
        <div className="repair-summary">

          <div className="repair-summary-box">

            <div className="repair-summary-label">
              WORKFLOW VERSION
            </div>

            <div className="repair-summary-value">
              v{data.previousVersion} → v{data.version}
            </div>

          </div>


          <div className="repair-summary-box">

            <div className="repair-summary-label">
              RETRY STATUS
            </div>

            <div className="repair-summary-value repair-success">
              ✓ {data.retryStatus}
            </div>

          </div>

        </div>
      )}

    </section>
  );
}