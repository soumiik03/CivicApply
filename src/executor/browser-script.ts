import { WorkflowStep } from "./workflow";

export function replaceVariables(
    value: string,
    variables: Record<string, string>
): string {
    return value.replace(
        /\{\{(\w+)\}\}/g,
        (_: string, key: string) =>
            variables[key] ?? ""
    );
}

export function buildBrowserScript(
    steps: WorkflowStep[],
    variables: Record<string, string>
): string {
    const lines: string[] = [];

    lines.push(
        `const __steps = ${JSON.stringify(steps)};`
    );

    lines.push(
        `let __currentStepIndex = 0;`
    );

    lines.push(`const __selectOption = async (selector, desired) => {
      await page.locator(selector).waitFor({ state: 'attached', timeout: 3000 });
      const optionValue = await page.locator(selector).evaluate((element, value) => {
        const normalize = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
        const wanted = normalize(value);
        const options = Array.from(element.options);
        const match = options.find((option) => {
          const optionValue = normalize(option.value);
          const optionText = normalize(option.textContent || '');
          return optionValue === wanted || optionText === wanted || optionText.startsWith(wanted) || wanted.startsWith(optionText);
        });
        if (!match) {
          throw new Error('No select option matched ' + JSON.stringify(value) + '. Available options: ' + options.map((option) => JSON.stringify(option.textContent?.trim() || option.value)).join(', '));
        }
        return match.value;
      }, desired);
      await page.locator(selector).selectOption({ value: optionValue }, { timeout: 3000 });
    };`);

    lines.push(`try {`);

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        lines.push(
            `  __currentStepIndex = ${i};`
        );

        if (
            step.action === "navigate" &&
            step.url
        ) {
            lines.push(
                `  await page.goto(${JSON.stringify(
                    step.url
                )});`
            );
        }

        if (
            step.action === "fill" &&
            step.selector &&
            step.value !== undefined
        ) {
            const value = replaceVariables(
                step.value,
                variables
            );

            lines.push(
                `  await page.locator(${JSON.stringify(
                    step.selector
                )}).fill(${JSON.stringify(
                    value
                )}, { timeout: 3000 });`
            );
        }

        if (
            step.action === "click" &&
            step.selector
        ) {
            lines.push(
                `  await page.locator(${JSON.stringify(
                    step.selector
                )}).click({ timeout: 3000 });`
            );
        }

        if (
            step.action === "extract" &&
            step.selector
        ) {
            lines.push(
                `  await page.locator(${JSON.stringify(
                    step.selector
                )}).innerText({ timeout: 3000 });`
            );
        }

        if (
            step.action === "select" &&
            step.selector &&
            step.value !== undefined
        ) {
            const value = replaceVariables(
                step.value,
                variables
            );

            lines.push(
                `  await __selectOption(${JSON.stringify(
                    step.selector
                )}, ${JSON.stringify(value)});`
            );
        }

        if (
            step.action === "waitForOptions" &&
            step.selector
        ) {
            lines.push(
                `  await page.waitForFunction(() => {
                    const select =
                        document.querySelector(${JSON.stringify(
                            step.selector
                        )});

                    return (
                        select &&
                        select.options.length > 1 &&
                        select.value !== 'Loading...'
                    );
                }, null, { timeout: 5000 });`
            );
        }
    }

    lines.push(
        `  return {
            success: true,
            stepsCompleted: __steps.length
        };`
    );

    lines.push(`} catch (err) {`);

    lines.push(
        `  return {
            success: false,
            failedStepIndex: __currentStepIndex,
            stepsCompleted: __currentStepIndex,
            failedStep: __steps[__currentStepIndex],
            error: err instanceof Error
                ? err.message
                : String(err)
        };`
    );

    lines.push(`}`);

    return lines.join("\n");
}
