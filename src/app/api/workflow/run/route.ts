import { NextRequest, NextResponse } from "next/server";
import { closeRetainedBrowserSession, hasRetainedBrowserSession, runWorkflow } from "../../../../executor/run";
import { loadProfile, loadWorkflow, loadWorkflowMeta, saveProfile } from "../../../../executor/workflow";
import { WorkflowExecutionResult } from "../../../../executor/types";

export interface WorkflowRequestBody {
    mode?: "normal" | "reuse" | "repair";
    keepBrowser?: boolean;
}

export interface ProfileUpdateBody {
    profile?: Record<string, unknown>;
}

function publicProfile(profile: Record<string, string>): Record<string, string> {
    const { password: _password, ...safeProfile } = profile;
    return safeProfile;
}

export async function GET() {
    const workflow = loadWorkflow("workflows/internship-workflow.json");
    const metadata = loadWorkflowMeta("workflows/internship-workflow.meta.json");
    const profile = loadProfile("profiles/student.json");

    return NextResponse.json({
        workflow: {
            name: metadata?.name || workflow.name || "workflow",
            site: metadata?.site || workflow.url || null,
            url: workflow.url || null,
            version: metadata?.version ?? 1,
            status: metadata?.status || "unknown",
            steps: metadata?.steps ?? workflow.steps.length
        },
        profile: publicProfile(profile),
        browser: { retained: hasRetainedBrowserSession() }
    });
}

export async function DELETE() {
    return NextResponse.json({ closed: closeRetainedBrowserSession() });
}

export async function PUT(req: NextRequest) {
    try {
        const body = (await req.json()) as ProfileUpdateBody;
        const profile = body.profile;
        if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
            return NextResponse.json({ error: "profile must be an object" }, { status: 400 });
        }

        const cleaned = Object.fromEntries(
            Object.entries(profile).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
        );
        const required = ["fullName", "university", "course"];
        const missing = required.filter((key) => typeof cleaned[key] !== "string" || !cleaned[key]);
        if (missing.length) {
            return NextResponse.json({ error: `Required profile fields are empty: ${missing.join(", ")}` }, { status: 400 });
        }

        const current = loadProfile("profiles/student.json");
        const nextProfile = { ...current, ...cleaned } as Record<string, string>;
        saveProfile(nextProfile, "profiles/student.json");
        return NextResponse.json({ profile: publicProfile(nextProfile) });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    try {
        let body: WorkflowRequestBody = {};
        try {
            body = await req.json();
        } catch {
            body = {};
        }

        const mode = body.mode || "normal";

        if (!["normal", "reuse", "repair"].includes(mode)) {
            return NextResponse.json(
                {
                    success: false,
                    mode,
                    status: "error",
                    error: `Invalid mode: '${mode}'. Expected 'normal', 'reuse', or 'repair'.`
                },
                { status: 400 }
            );
        }

        const isRepair = mode === "repair";
        const isReuse = mode === "reuse";
        const workflowPath = isRepair
            ? "workflows/internship-workflow-broken.json"
            : "workflows/internship-workflow.json";

        const profile = loadProfile("profiles/student.json");

        const result: WorkflowExecutionResult = runWorkflow({
            variables: profile,
            mode,
            workflowPath,
            learnedWorkflowPath: "workflows/internship-workflow.json",
            autoRepair: isRepair,
            checkReuse: isReuse,
            isCLI: false,
            keepBrowser: body.keepBrowser === true
        });

        return NextResponse.json(result, { status: result.success ? 200 : 500 });
    } catch (err) {
        return NextResponse.json(
            {
                success: false,
                mode: "normal",
                status: "failed",
                safety: { submissionTriggered: false },
                error: err instanceof Error ? err.message : String(err)
            },
            { status: 500 }
        );
    }
}
