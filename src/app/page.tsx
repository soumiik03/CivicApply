"use client";

import { useEffect, useState } from "react";
import type {
  WorkflowExecutionResult,
  WorkflowMode,
} from "../executor/types";

import FailureRepairPanel from "../components/FailureRepairPanel";
import { mockRepair } from "../data/mockRepair";

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
  description: string;
}> = [
  {
    id: "normal",
    title: "Normal",
    description: "Run the persisted workflow",
  },
  {
    id: "reuse",
    title: "Reuse",
    description: "Require and run the learned workflow",
  },
  {
    id: "repair",
    title: "Repair",
    description: "Repair a broken selector and learn it",
  },
];

export default function HomePage() {
  const [mode, setMode] =
    useState<WorkflowMode>("normal");

  const [state, setState] =
    useState<RequestState>("ready");

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [response, setResponse] =
    useState<WorkflowExecutionResult | null>(null);

  const [clientError, setClientError] =
    useState<string | null>(null);

  const [showTechnicalDetails, setShowTechnicalDetails] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [hasRunRepair, setHasRunRepair] =
    useState(false);

  useEffect(() => {
    fetch("/api/workflow/run")
      .then(async (result) => {
        if (!result.ok) {
          throw new Error(
            "Could not load workflow status"
          );
        }

        return result.json() as Promise<DashboardData>;
      })
      .then(setDashboard)
      .catch(() => setDashboard(null));
  }, [response]);

  const run = async () => {
    setState("running");
    setResponse(null);
    setClientError(null);
    setCopied(false);

    if (mode === "repair") {
      setHasRunRepair(true);
    } else {
      setHasRunRepair(false);
    }

    try {
      const result = await fetch(
        "/api/workflow/run",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            mode,
          }),
        }
      );

      const data =
        (await result.json()) as WorkflowExecutionResult;

      setResponse(data);

      if (data.success) {
        setState(data.status);
      } else {
        setState("failed");
      }
    } catch (error) {
      setState("failed");

      setClientError(
        error instanceof Error
          ? error.message
          : String(error)
      );
    }
  };

  const copyResponse = () => {
    if (!response) return;

    void navigator.clipboard.writeText(
      JSON.stringify(response, null, 2)
    );

    setCopied(true);
  };

  const profile = dashboard?.profile;

  const displayedWorkflow =
    response?.workflow ||
    dashboard?.workflow;

  const displayState =
    response ? state : "ready";

  const statusLabel =
    displayState === "ready"
      ? "Ready"
      : displayState === "running"
        ? "Running automation…"
        : displayState === "completed"
          ? "Completed"
          : displayState === "repaired"
            ? "Repaired & learned"
            : "Execution failed";

  return (
    <main className="container">

      {/* HEADER */}

      <header className="header">
        <div className="logo-group">

          <div className="logo-badge">
            CA
          </div>

          <div className="title-wrap">
            <h1>CivicApply</h1>

            <p>
              Persisted browser workflows with
              heuristic DOM selector repair
            </p>
          </div>

        </div>

        <span
          className={`status-pill ${displayState}`}
        >
          <span className="dot-indicator" />
          {statusLabel}
        </span>
      </header>


      {/* SAFETY */}

      <div className="safety-banner">

        <span className="safety-banner-icon">
          🛡️
        </span>

        <div>
          <strong>
            Pre-submission safety boundary:
          </strong>{" "}
          the workflow fills and validates
          application fields, then stops before
          final submission.
        </div>

      </div>


      {/* METRICS */}

      <div className="metrics-strip">

        <div className="metric-card">
          <span className="metric-label">
            Workflow
          </span>

          <span className="metric-value">
            {displayedWorkflow?.name ||
              "Loading…"}
          </span>
        </div>


        <div className="metric-card">
          <span className="metric-label">
            Target portal
          </span>

          <span className="metric-value">
            {dashboard?.workflow.site ||
              "Loading…"}
          </span>
        </div>


        <div className="metric-card">
          <span className="metric-label">
            Learned version
          </span>

          <span className="metric-value">
            {displayedWorkflow
              ? `v${displayedWorkflow.version}`
              : "Loading…"}
          </span>
        </div>


        <div className="metric-card">
          <span className="metric-label">
            Persisted status
          </span>

          <span className="metric-value">
            {dashboard?.workflow.status ||
              "Loading…"}
          </span>
        </div>

      </div>


      {/* MAIN */}

      <div className="main-grid">

        {/* LEFT COLUMN */}

        <div className="column">

          {/* WORKFLOW */}

          <section className="card">

            <div className="card-header">

              <h2 className="card-title">
                Target workflow
              </h2>

              <span className="card-subtitle">
                Webcmd DOM
              </span>

            </div>


            <div className="workflow-info-box">

              <div className="workflow-top">

                <div>

                  <div className="workflow-name">
                    {displayedWorkflow?.name ||
                      "Loading workflow…"}
                  </div>

                  {dashboard?.workflow.url && (
                    <a
                      className="workflow-url"
                      href={
                        dashboard.workflow.url
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {dashboard.workflow.site}
                    </a>
                  )}

                </div>

                <span className="status-pill completed">
                  v
                  {displayedWorkflow?.version ??
                    "—"}
                </span>

              </div>


              <div className="workflow-badges">

                <span>
                  Total steps:{" "}
                  <strong>
                    {dashboard?.workflow.steps ??
                      "—"}
                  </strong>
                </span>

                <span>•</span>

                <span>
                  Learned:{" "}
                  <strong>
                    {dashboard?.workflow.status ||
                      "—"}
                  </strong>
                </span>

              </div>

            </div>


            {/* MODE */}

            <label className="section-label">
              Execution mode
            </label>


            <div className="mode-grid">

              {MODES.map((item) => (

                <button
                  key={item.id}
                  type="button"
                  className={`mode-option-btn ${
                    mode === item.id
                      ? "active"
                      : ""
                  } ${
                    item.id === "repair"
                      ? "repair"
                      : ""
                  }`}
                  onClick={() =>
                    setMode(item.id)
                  }
                  disabled={
                    state === "running"
                  }
                >

                  <div className="mode-btn-title">

                    {item.title}

                    <span>
                      {mode === item.id
                        ? "●"
                        : "○"}
                    </span>

                  </div>

                  <div className="mode-btn-desc">
                    {item.description}
                  </div>

                </button>

              ))}

            </div>


            {/* RUN */}

            <button
              type="button"
              className={`run-cta-btn ${
                mode === "repair"
                  ? "repair-mode"
                  : ""
              }`}
              onClick={run}
              disabled={
                state === "running" ||
                !dashboard
              }
            >

              {state === "running" ? (
                <>
                  <span className="spinner" />
                  Running automation…
                </>
              ) : (
                <>
                  ▶ Run workflow
                </>
              )}

            </button>

          </section>


          {/* PROFILE */}

          <section className="card">

            <div className="card-header">

              <h2 className="card-title">
                Student profile
              </h2>

              <span className="status-pill ready">
                student.json
              </span>

            </div>


            {profile ? (

              <div className="profile-card-content">

                <div className="profile-hero">

                  <div className="profile-avatar">
                    {profile.firstName?.[0] ||
                      "?"}

                    {profile.lastName?.[0] ||
                      ""}
                  </div>

                  <div>

                    <div className="profile-name">
                      {profile.fullName}
                    </div>

                    <div className="profile-subtext">
                      {profile.email} •{" "}
                      {profile.phone}
                    </div>

                  </div>

                </div>


                <div className="profile-grid">

                  <div className="profile-item">
                    <span className="profile-label">
                      University
                    </span>

                    <div className="profile-value">
                      {profile.university}
                    </div>
                  </div>


                  <div className="profile-item">
                    <span className="profile-label">
                      Course
                    </span>

                    <div className="profile-value">
                      {profile.course}
                    </div>
                  </div>


                  <div className="profile-item">
                    <span className="profile-label">
                      Location
                    </span>

                    <div className="profile-value">
                      {profile.district} /{" "}
                      {profile.block}
                    </div>
                  </div>


                  <div className="profile-item">
                    <span className="profile-label">
                      Registration no.
                    </span>

                    <div className="profile-value">
                      {
                        profile.universityRegNo
                      }
                    </div>
                  </div>


                  <div className="profile-item">
                    <span className="profile-label">
                      Semester
                    </span>

                    <div className="profile-value">
                      {profile.currentSemester}
                    </div>
                  </div>


                  <div className="profile-item">
                    <span className="profile-label">
                      Admission
                    </span>

                    <div className="profile-value">
                      {profile.admissionMonth}{" "}
                      {profile.admissionYear}
                    </div>
                  </div>

                </div>

              </div>

            ) : (

              <p>
                Loading profile…
              </p>

            )}

          </section>

        </div>


        {/* RIGHT COLUMN */}

        <div className="column">

          <section className="card">

            <div className="card-header">

              <h2 className="card-title">
                Execution result
              </h2>

              <span
                className={`status-pill ${
                  displayState
                }`}
              >
                {statusLabel}
              </span>

            </div>


            {/* READY */}

            {displayState === "ready" && (

              <div className="result-hero-box ready">

                <div className="result-hero-title">
                  Ready to run
                </div>

                <div className="result-hero-desc">
                  Choose a mode to execute the
                  real browser workflow.
                </div>

              </div>

            )}


            {/* RUNNING */}

            {displayState === "running" && (

              <div className="result-hero-box running">

                <div className="result-hero-title">

                  <span className="spinner" />

                  Running automation…

                </div>

                <div className="result-hero-desc">
                  Webcmd is executing the real
                  browser workflow.
                </div>

              </div>

            )}


            {/* CLIENT ERROR */}

            {clientError && (

              <div className="result-hero-box failed">

                <div className="result-hero-title">
                  Execution failed
                </div>

                <div className="result-hero-desc">
                  {clientError}
                </div>

              </div>

            )}


            {/* RESPONSE */}

            {response && (

              <>

                <div
                  className={`result-hero-box ${
                    response.success
                      ? response.status
                      : "failed"
                  }`}
                >

                  <div className="result-hero-title">

                    {response.success
                      ? response.status ===
                        "repaired"
                        ? "DOM selector repair succeeded"
                        : "Workflow completed successfully"
                      : "Execution failed"}

                  </div>

                  <div className="result-hero-desc">

                    {response.error ||
                      (response.success
                        ? "The real workflow completed and stopped before final submission."
                        : "The backend reported a failure.")}

                  </div>

                </div>


                {/* STATS */}

                <div className="result-stats-row">

                  <div className="stat-block">

                    <span className="stat-block-label">
                      Duration
                    </span>

                    <span className="stat-block-val">
                      {response.execution.durationMs}
                      ms
                    </span>

                  </div>


                  <div className="stat-block">

                    <span className="stat-block-label">
                      Steps completed
                    </span>

                    <span className="stat-block-val">
                      {
                        response.execution
                          .stepsCompleted
                      }
                    </span>

                  </div>


                  <div className="stat-block">

                    <span className="stat-block-label">
                      Version
                    </span>

                    <span className="stat-block-val">
                      v
                      {response.workflow.version}
                    </span>

                  </div>

                </div>


                {/* REPAIR */}

                {response.repair?.attempted && (

                  <div className="repair-card">

                    <div className="repair-header">

                      <div className="repair-title">
                        Workflow repair
                      </div>

                      <span
                        className={`status-pill ${
                          response.repair.repaired
                            ? "repaired"
                            : "failed"
                        }`}
                      >
                        {response.repair.repaired
                          ? "Repaired & learned"
                          : "Repair failed"}
                      </span>

                    </div>


                    {response.repair.oldSelector && (

                      <div className="diff-box">

                        <div className="diff-row">

                          <span className="diff-tag old">
                            Old
                          </span>

                          <span className="diff-code">
                            {
                              response.repair
                                .oldSelector
                            }
                          </span>

                        </div>


                        {response.repair.newSelector && (

                          <div className="diff-row">

                            <span className="diff-tag new">
                              New
                            </span>

                            <span className="diff-code">
                              {
                                response.repair
                                  .newSelector
                              }
                            </span>

                          </div>

                        )}

                      </div>

                    )}


                    {response.repair
                      .previousVersion !==
                      undefined &&
                      response.repair
                        .newVersion !==
                      undefined && (

                        <div className="repair-version-upgrade">

                          v
                          {
                            response.repair
                              .previousVersion
                          }

                          {" → "}

                          v
                          {
                            response.repair
                              .newVersion
                          }

                        </div>

                      )}

                  </div>

                )}

              </>

            )}


            {/* ACTIVITY */}

            <div className="activity-area">

              <div className="section-label">
                Workflow activity
              </div>


              <div className="activity-list">

                {!response && (
                  <div className="activity-step pending">

                    <div className="activity-step-icon">
                      •
                    </div>

                    <div className="activity-step-text">
                      Waiting for workflow to start
                    </div>

                  </div>
                )}


                {response && (

                  <>

                    {Array.from({
                      length:
                        response.execution
                          .stepsCompleted,
                    }).map((_, index) => (

                      <div
                        className="activity-step completed"
                        key={index}
                      >

                        <div className="activity-step-icon">
                          ✓
                        </div>

                        <div className="activity-step-text">
                          Workflow step{" "}
                          {index + 1} completed
                        </div>

                      </div>

                    ))}


                    {response.status ===
                      "completed" && (

                      <div className="activity-step completed">

                        <div className="activity-step-icon">
                          ✓
                        </div>

                        <div className="activity-step-text">
                          Workflow completed
                        </div>

                      </div>

                    )}


                    {response.status ===
                      "repaired" && (

                      <>

                        <div className="activity-step completed">

                          <div className="activity-step-icon">
                            ✓
                          </div>

                          <div className="activity-step-text">
                            Selector repaired
                          </div>

                        </div>


                        <div className="activity-step completed">

                          <div className="activity-step-icon">
                            ✓
                          </div>

                          <div className="activity-step-text">
                            Workflow upgraded to v
                            {
                              response.workflow
                                .version
                            }
                          </div>

                        </div>

                      </>

                    )}


                    {!response.success && (

                      <div className="activity-step failed">

                        <div className="activity-step-icon">
                          !
                        </div>

                        <div className="activity-step-text">
                          Workflow failed
                        </div>

                      </div>

                    )}

                  </>

                )}

              </div>

            </div>


            {/* TECHNICAL DETAILS */}

            <div className="tech-details-wrap">

              <button
                type="button"
                className="tech-toggle-btn"
                onClick={() =>
                  setShowTechnicalDetails(
                    (value) => !value
                  )
                }
              >

                <span>
                  {showTechnicalDetails
                    ? "▼"
                    : "▶"}{" "}
                  Technical details
                </span>

                <span>
                  POST /api/workflow/run
                </span>

              </button>


              {showTechnicalDetails && (

                <div className="tech-content">

                  <button
                    type="button"
                    className="copy-btn"
                    onClick={copyResponse}
                  >
                    {copied
                      ? "Copied"
                      : "Copy JSON"}
                  </button>

                  <div className="tech-json-viewer">

                    <pre>
                      {response
                        ? JSON.stringify(
                            response,
                            null,
                            2
                          )
                        : "No execution response yet."}
                    </pre>

                  </div>

                </div>

              )}

            </div>

          </section>

        </div>

      </div>


      {/* FAILURE & REPAIR */}

      {mode === "repair" &&
        hasRunRepair && (

          <FailureRepairPanel
            repairStep={0}
            data={mockRepair}
          />

        )}

    </main>
  );
}