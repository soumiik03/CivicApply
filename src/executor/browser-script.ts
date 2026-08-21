import { WorkflowStep } from "./workflow";

export function replaceVariables(value: string, variables: Record<string, string>): string {
    return value.replace(
        /\{\{(\w+)\}\}/g,
        (_: string, key: string) => variables[key] ?? ""
    );
}

export function buildBrowserScript(steps: WorkflowStep[], variables: Record<string, string>): string {
    const lines: string[] = [];

    lines.push(`const __steps = ${JSON.stringify(steps)};`);
    lines.push(`let __currentStepIndex = 0;`);
    lines.push(`try {`);

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        lines.push(`  __currentStepIndex = ${i};`);

        if (step.action === "navigate" && step.url) {
            lines.push(`  await page.goto(${JSON.stringify(step.url)});`);
        }

        if (step.action === "fill" && step.selector && step.value !== undefined) {
            const value = replaceVariables(step.value, variables);

            lines.push(
                `  await page.locator(${JSON.stringify(step.selector)}).fill(${JSON.stringify(value)}, { timeout: 3000 });`
            );
        }

        if (step.action === "click" && step.selector) {
            lines.push(
                `  await page.locator(${JSON.stringify(step.selector)}).click({ timeout: 3000 });`
            );
        }

        if (step.action === "extract" && step.selector) {
            lines.push(
                `  await page.locator(${JSON.stringify(step.selector)}).innerText({ timeout: 3000 });`
            );
        }

        if (step.action === "select" && step.selector && step.value !== undefined) {
            const value = replaceVariables(step.value, variables);

            lines.push(
                `  await page.locator(${JSON.stringify(step.selector)}).selectOption({ label: ${JSON.stringify(value)} }, { timeout: 3000 });`
            );
        }

        if (step.action === "waitForOptions" && step.selector) {
            lines.push(
                `  await page.waitForFunction(() => {\n` +
                `      const select = document.querySelector(${JSON.stringify(step.selector)});\n` +
                `      return select && select.options.length > 1 && select.value !== 'Loading...';\n` +
                `  }, null, { timeout: 5000 });`
            );
        }
    }

    lines.push(`  return { success: true };`);
    lines.push(`} catch (err) {`);
    lines.push(`  return {`);
    lines.push(`    success: false,`);
    lines.push(`    failedStepIndex: __currentStepIndex,`);
    lines.push(`    failedStep: __steps[__currentStepIndex],`);
    lines.push(`    error: err instanceof Error ? err.message : String(err)`);
    lines.push(`  };`);
    lines.push(`}`);

    return lines.join("\n");
}
