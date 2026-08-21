import {
    loadWorkflow,
    loadWorkflowMeta,
    saveWorkflow,
    saveWorkflowMeta,
    WorkflowMeta
} from "./workflow";
import { buildBrowserScript } from "./browser-script";
import { createSession, closeSession, runBrowserScript } from "../lib/webcmd";
import { inspectDOM, repairFailedStep } from "./repair";
import { WorkflowExecutionResult, WorkflowMode } from "./types";

export interface RunWorkflowOptions {
    variables: Record<string, string>;
    mode?: WorkflowMode;
    workflowPath?: string;
    metaPath?: string;
    learnedWorkflowPath?: string;
    autoRepair?: boolean;
    checkReuse?: boolean;
    isCLI?: boolean;
    keepBrowser?: boolean;
}

let retainedSessionId: string | null = null;

export function closeRetainedBrowserSession(): boolean {
    if (!retainedSessionId) return false;
    closeSession(retainedSessionId);
    retainedSessionId = null;
    return true;
}

export function hasRetainedBrowserSession(): boolean {
    return retainedSessionId !== null;
}

function workflowIdentity(workflowPath: string, metaPath: string) {
    const meta = loadWorkflowMeta(metaPath);
    return {
        name: meta?.name || loadWorkflow(workflowPath).name || "workflow",
        version: meta?.version ?? 1
    };
}

export function runWorkflow(options: RunWorkflowOptions): WorkflowExecutionResult {
    const workflowPath = options.workflowPath || "workflows/internship-workflow.json";
    const metaPath = options.metaPath || "workflows/internship-workflow.meta.json";
    const learnedWorkflowPath = options.learnedWorkflowPath || "workflows/internship-workflow.json";
    const mode = options.mode || (options.autoRepair ? "repair" : options.checkReuse ? "reuse" : "normal");
    const startedAt = Date.now();
    const identity = workflowIdentity(workflowPath, metaPath);

    const base = (success: boolean, status: "completed" | "repaired" | "failed", stepsCompleted: number, error?: string): WorkflowExecutionResult => ({
        success,
        mode,
        status,
        workflow: identity,
        execution: { durationMs: Date.now() - startedAt, stepsCompleted },
        browser: { retained: false },
        safety: { submissionTriggered: false },
        ...(error ? { error } : {})
    });

    if (options.checkReuse) {
        const meta = loadWorkflowMeta(metaPath);
        if (!meta) {
            return base(false, "failed", 0, `Workflow metadata not found at ${metaPath}`);
        }
        if (meta.status !== "learned") {
            return base(false, "failed", 0, `Workflow is not in 'learned' status (found '${meta.status}')`);
        }
    }

    const workflow = loadWorkflow(workflowPath);
    if (!workflow.steps.length) {
        return base(false, "failed", 0, "No workflow steps to execute.");
    }

    const unsafeStep = workflow.steps.find((step) => {
        const target = `${step.action} ${step.selector || ""}`.toLowerCase();
        return target.includes("submit") || target.includes("final") || target.includes("document") || target.includes("upload");
    });
    if (unsafeStep) {
        return base(false, "failed", 0, "Safety boundary blocked an irreversible submission or document action.");
    }

    let sessionId: string | null = null;
    let retainSession = false;
    let executionSucceeded = false;
    try {
        closeRetainedBrowserSession();
        sessionId = createSession();
        const result = JSON.parse(runBrowserScript(sessionId, buildBrowserScript(workflow.steps, options.variables)));

        if (!result.ok) {
            return base(false, "failed", 0, "Unexpected browser runner output");
        }

        const browserResult = result.result;
        if (browserResult?.success === true) {
            executionSucceeded = true;
            retainSession = options.keepBrowser === true;
            return {
                ...base(true, "completed", browserResult.stepsCompleted ?? workflow.steps.length),
                browser: { retained: retainSession }
            };
        }

        const failedStep = browserResult?.failedStep;
        const failedStepIndex = typeof browserResult?.failedStepIndex === "number" ? browserResult.failedStepIndex : 0;
        const failureError = browserResult?.error?.split("\n")[0] || "Workflow failed";
        const failedStepDetails = failedStep
            ? ` (step ${failedStepIndex}: ${failedStep.action}${failedStep.selector ? ` ${failedStep.selector}` : ""}${failedStep.value !== undefined ? ` value=${JSON.stringify(failedStep.value)}` : ""})`
            : "";

        if (!options.autoRepair || !failedStep?.selector) {
            return base(false, "failed", browserResult?.stepsCompleted ?? failedStepIndex, `${failureError}${failedStepDetails}`);
        }

        const domElements = inspectDOM(sessionId);
        const repairedSelector = repairFailedStep(failedStep, domElements);
        const oldSelector = failedStep.selector;
        if (!repairedSelector) {
            return {
                ...base(false, "failed", browserResult?.stepsCompleted ?? failedStepIndex, "Could not find a matching replacement selector on the page"),
                repair: { attempted: true, repaired: false, oldSelector }
            };
        }

        workflow.steps[failedStepIndex].selector = repairedSelector;
        const retryResult = JSON.parse(runBrowserScript(
            sessionId,
            buildBrowserScript(workflow.steps.slice(failedStepIndex), options.variables)
        ));
        if (!retryResult.ok || retryResult.result?.success !== true) {
            return {
                ...base(false, "failed", retryResult.result?.stepsCompleted ?? failedStepIndex, "Repair attempt failed to execute remaining steps"),
                repair: { attempted: true, repaired: false, oldSelector, newSelector: repairedSelector }
            };
        }

        const currentMeta: WorkflowMeta = loadWorkflowMeta(metaPath) || {
            name: workflow.name || "workflow",
            site: workflow.url?.replace(/^https?:\/\//, "").split("/")[0] || "",
            version: 1,
            status: "learned",
            steps: workflow.steps.length
        };
        const previousVersion = currentMeta.version ?? 1;
        const newVersion = previousVersion + 1;
        currentMeta.version = newVersion;
        currentMeta.status = "learned";
        currentMeta.steps = workflow.steps.length;
        saveWorkflow(workflow, learnedWorkflowPath);
        saveWorkflowMeta(currentMeta, metaPath);

        executionSucceeded = true;
        retainSession = options.keepBrowser === true;
        return {
            ...base(true, "repaired", workflow.steps.length),
            browser: { retained: retainSession },
            workflow: { name: currentMeta.name || workflow.name || "workflow", version: newVersion },
            repair: {
                attempted: true,
                repaired: true,
                oldSelector,
                newSelector: repairedSelector,
                previousVersion,
                newVersion
            }
        };
    } catch (err) {
        return base(false, "failed", 0, err instanceof Error ? err.message : String(err));
    } finally {
        if (sessionId) {
            if (executionSucceeded && retainSession) {
                retainedSessionId = sessionId;
            } else {
                closeSession(sessionId);
            }
        }
    }
}
