import * as fs from "fs";

export interface WorkflowStep {
    action: "navigate" | "fill" | "click" | "extract" | "select" | "waitForOptions" | string;
    url?: string;
    selector?: string;
    value?: string;
}

export interface Workflow {
    name?: string;
    url?: string;
    steps: WorkflowStep[];
}

export interface WorkflowMeta {
    name?: string;
    site?: string;
    version?: number;
    status: string;
    steps?: number;
}

export function loadWorkflow(workflowPath: string = "workflows/internship-workflow.json"): Workflow {
    if (fs.existsSync(workflowPath)) {
        const rawContent = fs.readFileSync(workflowPath, "utf8").trim();
        if (rawContent) {
            return JSON.parse(rawContent) as Workflow;
        }
    }
    return { steps: [] };
}

export function loadWorkflowMeta(metaPath: string = "workflows/internship-workflow.meta.json"): WorkflowMeta | null {
    if (fs.existsSync(metaPath)) {
        const rawContent = fs.readFileSync(metaPath, "utf8").trim();
        if (rawContent) {
            return JSON.parse(rawContent) as WorkflowMeta;
        }
    }
    return null;
}

export function saveWorkflowMeta(
    meta: WorkflowMeta,
    metaPath: string = "workflows/internship-workflow.meta.json"
): void {
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf8");
}

export function saveWorkflow(
    workflow: Workflow,
    workflowPath: string = "workflows/internship-workflow.json"
): void {
    fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2) + "\n", "utf8");
}

export function loadProfile(profilePath: string = "profiles/student.json"): Record<string, string> {
    if (fs.existsSync(profilePath)) {
        const rawProfile = fs.readFileSync(profilePath, "utf8").trim();
        if (rawProfile) {
            return JSON.parse(rawProfile) as Record<string, string>;
        }
    }
    return {};
}

export function saveProfile(profile: Record<string, string>, profilePath: string = "profiles/student.json"): void {
    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2) + "\n", "utf8");
}
