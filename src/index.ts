import { loadProfile } from "./executor/workflow";
import { runWorkflow } from "./executor/run";

function main() {
    const args = process.argv.slice(2);
    const isReuse = args.includes("--reuse");
    const isTestFailure = args.includes("--test-failure");
    const isRepair = args.includes("--repair");

    let workflowPath = "workflows/internship-workflow.json";

    const workflowArgIndex = args.indexOf("--workflow");
    if (workflowArgIndex !== -1 && args[workflowArgIndex + 1]) {
        workflowPath = args[workflowArgIndex + 1];
    } else if (isRepair) {
        workflowPath = "workflows/internship-workflow-broken.json";
    } else if (isTestFailure) {
        workflowPath = "workflows/internship-workflow-broken.json";
    }

    if (isRepair) {
        console.log("Running in repair mode with:", workflowPath);
    } else if (isTestFailure) {
        console.log("Running in test-failure mode with:", workflowPath);
    }

    const studentProfile = loadProfile("profiles/student.json");

    runWorkflow({
        variables: studentProfile,
        workflowPath,
        autoRepair: isRepair,
        checkReuse: isReuse
    });
}

if (require.main === module) {
    main();
}
