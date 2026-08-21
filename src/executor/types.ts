export type WorkflowMode = "normal" | "reuse" | "repair";

export type WorkflowExecutionStatus = "completed" | "repaired" | "failed";

export interface RepairResult {
    attempted: boolean;
    repaired: boolean;
    oldSelector?: string;
    newSelector?: string;
    previousVersion?: number;
    newVersion?: number;
    score?: number;
}

export interface WorkflowExecutionResult {
    success: boolean;
    mode: WorkflowMode;
    status: WorkflowExecutionStatus;
    workflow: { name: string; version: number };
    execution: { durationMs: number; stepsCompleted: number };
    browser?: { retained: boolean };
    repair?: RepairResult;
    safety: { submissionTriggered: false };
    error?: string;
}
