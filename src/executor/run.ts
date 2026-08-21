import {
    loadWorkflow,
    loadWorkflowMeta,
    saveWorkflowMeta,
    WorkflowMeta
} from "./workflow";
import { buildBrowserScript } from "./browser-script";
import { createSession, closeSession, runBrowserScript } from "../lib/webcmd";
import { inspectDOM, repairFailedStep } from "./repair";

export interface RunWorkflowOptions {
    variables: Record<string, string>;
    workflowPath?: string;
    metaPath?: string;
    autoRepair?: boolean;
    checkReuse?: boolean;
    isCLI?: boolean;
}

export interface WorkflowResult {
    success: boolean;
    status: string;
    version?: number;
    error?: string;
    repaired?: boolean;
}

export function runWorkflow(options: RunWorkflowOptions): WorkflowResult {
    const workflowPath = options.workflowPath || "workflows/internship-workflow.json";
    const metaPath = options.metaPath || "workflows/internship-workflow.meta.json";

    if (options.checkReuse) {
        const meta = loadWorkflowMeta(metaPath);

        if (!meta) {
            const err = `Workflow metadata not found at ${metaPath}`;
            console.error(err);
            if (options.isCLI) {
                process.exit(1);
            }
            return { success: false, status: "error", error: err };
        }

        if (meta.status !== "learned") {
            const err = `Workflow is not in 'learned' status (found '${meta.status}')`;
            console.error(err);
            if (options.isCLI) {
                process.exit(1);
            }
            return { success: false, status: meta.status, version: meta.version, error: err };
        }

        console.log(`Reusing learned workflow: ${meta.name || "workflow"} (v${meta.version ?? 1})`);
    }

    const workflow = loadWorkflow(workflowPath);

    if (!workflow.steps || workflow.steps.length === 0) {
        console.log("No workflow steps to execute.");
        return { success: false, status: "empty", error: "No workflow steps to execute." };
    }

    let sessionId: string | null = null;

    try {
        sessionId = createSession();
        console.log("Session:", sessionId);

        const browserScript = buildBrowserScript(workflow.steps, options.variables);
        const result = runBrowserScript(sessionId, browserScript);

        const parsed = JSON.parse(result);
        if (parsed.ok && parsed.result?.success === false) {
            const failure = parsed.result;
            console.error(`\n[Workflow Failed at Step ${failure.failedStepIndex + 1}]`);
            console.error(`Action:   ${failure.failedStep?.action}`);
            console.error(`Selector: ${failure.failedStep?.selector || failure.failedStep?.url}`);
            console.error(`Error:    ${failure.error?.split("\n")[0]}`);

            if (options.autoRepair && failure.failedStep?.selector) {
                console.log("\n[Attempting Auto-Repair on Active DOM]...");

                const domElements = inspectDOM(sessionId);
                const repairedSelector = repairFailedStep(failure.failedStep, domElements);

                if (repairedSelector) {
                    console.log(
                        `Identified correct selector for Step ${failure.failedStepIndex + 1}: ${repairedSelector}`
                    );

                    workflow.steps[failure.failedStepIndex].selector = repairedSelector;

                    const remainingSteps = workflow.steps.slice(failure.failedStepIndex);
                    const repairScript = buildBrowserScript(remainingSteps, options.variables);
                    const repairResultRaw = runBrowserScript(sessionId, repairScript);

                    const repairParsed = JSON.parse(repairResultRaw);
                    if (repairParsed.ok && repairParsed.result?.success === true) {
                        console.log("\nREPAIRED");
                        console.log(
                            `[Workflow Recovered & Completed Successfully] Step ${failure.failedStepIndex + 1} (${failure.failedStep.selector} -> ${repairedSelector})`
                        );

                        const currentMeta: WorkflowMeta = loadWorkflowMeta(metaPath) || {
                            name: workflow.name || "workflow",
                            site: workflowPath.replace(/^.*[/\\]/, "").replace(/\.json$/, ""),
                            version: 1,
                            status: "learned",
                            steps: workflow.steps.length
                        };

                        currentMeta.version = (currentMeta.version ?? 1) + 1;
                        currentMeta.status = "learned";
                        currentMeta.steps = workflow.steps.length;

                        saveWorkflowMeta(currentMeta, metaPath);
                        console.log(
                            `[Metadata Updated] Saved ${metaPath} (version: ${currentMeta.version}, status: "${currentMeta.status}")`
                        );
                        console.log(repairResultRaw);

                        return {
                            success: true,
                            status: currentMeta.status,
                            version: currentMeta.version,
                            repaired: true
                        };
                    } else {
                        console.error("\n[Repair Attempt Failed]");
                        console.error(repairResultRaw);
                        return {
                            success: false,
                            status: "repair_failed",
                            error: "Repair attempt failed to execute remaining steps"
                        };
                    }
                } else {
                    console.error("\nCould not find matching replacement selector on the page.");
                    return {
                        success: false,
                        status: "repair_failed",
                        error: "Could not find matching replacement selector on the page"
                    };
                }
            }

            return {
                success: false,
                status: "failed",
                error: failure.error?.split("\n")[0] || "Workflow failed"
            };
        } else if (parsed.ok && parsed.result?.success === true) {
            console.log("\n[Workflow Completed Successfully]");
            console.log(result);

            const meta = loadWorkflowMeta(metaPath);
            return {
                success: true,
                status: meta?.status || "learned",
                version: meta?.version || 1
            };
        } else {
            console.log(result);
            return {
                success: false,
                status: "error",
                error: "Unexpected runner output"
            };
        }
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Execution error:", errorMsg);
        return {
            success: false,
            status: "error",
            error: errorMsg
        };
    } finally {
        if (sessionId) {
            closeSession(sessionId);
        }
    }
}
