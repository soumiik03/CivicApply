import { NextRequest, NextResponse } from "next/server";
import { runWorkflow } from "../../../../executor/run";
import { loadProfile } from "../../../../executor/workflow";

export interface WorkflowRequestBody {
    mode?: "normal" | "reuse" | "repair";
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

        const result = runWorkflow({
            variables: profile,
            workflowPath,
            autoRepair: isRepair,
            checkReuse: isReuse,
            isCLI: false
        });

        return NextResponse.json({
            success: result.success,
            mode,
            status: result.status,
            version: result.version,
            ...(result.error ? { error: result.error } : {})
        });
    } catch (err) {
        return NextResponse.json(
            {
                success: false,
                mode: "unknown",
                status: "error",
                error: err instanceof Error ? err.message : String(err)
            },
            { status: 500 }
        );
    }
}
