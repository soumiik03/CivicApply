import fs from "node:fs";

const workflowPath = "workflows/internship-workflow.json";
const brokenPath = "workflows/internship-workflow-broken.json";
const metaPath = "workflows/internship-workflow.meta.json";

const broken = JSON.parse(fs.readFileSync(brokenPath, "utf8")) as {
  name?: string;
  url?: string;
  steps: Array<{ selector?: string; [key: string]: unknown }>;
};
const clean = {
  ...broken,
  name: "internship",
  steps: broken.steps.map((step) => ({
    ...step,
    ...(step.selector ? { selector: step.selector.replace(/Changed$/, "") } : {})
  }))
};

fs.writeFileSync(workflowPath, `${JSON.stringify(clean, null, 2)}\n`);
fs.writeFileSync(metaPath, `${JSON.stringify({
  name: "internship-application",
  site: "internship.okcl.org",
  version: 1,
  status: "learned",
  steps: clean.steps.length
}, null, 2)}\n`);
console.log("Demo reset: canonical workflow restored to v1; controlled broken workflow remains available.");
