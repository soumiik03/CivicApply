import { WorkflowStep } from "./workflow";
import { runBrowserScript } from "../lib/webcmd";

export interface DOMInputElement {
    id: string;
    name: string;
    placeholder: string;
    type: string;
    ariaLabel: string;
    labelText: string;
    tagName: string;
}

export function inspectDOM(sessionId: string): DOMInputElement[] {
    const inspectScript = `
return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, textarea')).map(el => {
        let labelText = '';
        if (el.id) {
            const labelEl = document.querySelector('label[for="' + el.id + '"]');
            if (labelEl) {
                labelText = labelEl.textContent || '';
            }
        }
        if (!labelText && el.closest('label')) {
            labelText = el.closest('label').textContent || '';
        }
        return {
            id: el.id || '',
            name: el.getAttribute('name') || '',
            placeholder: el.getAttribute('placeholder') || '',
            type: el.getAttribute('type') || '',
            ariaLabel: el.getAttribute('aria-label') || '',
            labelText: labelText.trim(),
            tagName: el.tagName.toLowerCase()
        };
    });
});
`;
    const inspectRaw = runBrowserScript(sessionId, inspectScript);
    try {
        const inspectParsed = JSON.parse(inspectRaw);
        if (inspectParsed.ok && Array.isArray(inspectParsed.result)) {
            return inspectParsed.result;
        }
    } catch {
    }
    return [];
}

function normalize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function tokenize(text: string): string[] {
    return text
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 1);
}

function extractIntents(step: WorkflowStep): string[] {
    const intents = new Set<string>();

    if (step.value) {
        const matches = step.value.matchAll(/\{\{(\w+)\}\}/g);
        for (const match of matches) {
            intents.add(match[1]);
        }
    }

    if (step.selector) {
        const cleaned = step.selector
            .replace(/^[#.]/, "")
            .replace(/^[a-z0-9_-]+\[.*?=["']?([^"']+)["']?\]/i, "$1")
            .replace(/[^a-zA-Z0-9_-]/g, "");
        if (cleaned) {
            intents.add(cleaned);
            const stripped = cleaned.replace(/[-_]?(changed|broken|invalid|old|new)$/i, "");
            if (stripped && stripped !== cleaned) {
                intents.add(stripped);
            }
        }
    }

    return Array.from(intents);
}

function scoreCandidate(candidate: DOMInputElement, intent: string, action?: string): number {
    let score = 0;
    const intentNorm = normalize(intent);
    const intentTokens = tokenize(intent);

    if (!intentNorm) return 0;

    if (candidate.type === "hidden" || candidate.type === "submit") {
        return -100;
    }

    const idNorm = normalize(candidate.id);
    const nameNorm = normalize(candidate.name);
    const placeholderNorm = normalize(candidate.placeholder);
    const ariaNorm = normalize(candidate.ariaLabel);
    const labelNorm = normalize(candidate.labelText);

    if (idNorm === intentNorm) score += 100;
    else if (idNorm && (idNorm.includes(intentNorm) || intentNorm.includes(idNorm))) score += 45;

    if (nameNorm === intentNorm) score += 90;
    else if (nameNorm && (nameNorm.includes(intentNorm) || intentNorm.includes(nameNorm))) score += 40;

    if (ariaNorm === intentNorm) score += 80;
    else if (ariaNorm && (ariaNorm.includes(intentNorm) || intentNorm.includes(ariaNorm))) score += 35;

    if (placeholderNorm === intentNorm) score += 70;
    else if (placeholderNorm && (placeholderNorm.includes(intentNorm) || intentNorm.includes(placeholderNorm))) score += 30;

    if (labelNorm === intentNorm) score += 60;
    else if (labelNorm && (labelNorm.includes(intentNorm) || intentNorm.includes(labelNorm))) score += 25;

    const candidateTokens = [
        ...tokenize(candidate.id),
        ...tokenize(candidate.name),
        ...tokenize(candidate.placeholder),
        ...tokenize(candidate.ariaLabel),
        ...tokenize(candidate.labelText)
    ];

    for (const token of intentTokens) {
        if (candidateTokens.includes(token)) {
            score += 20;
        }
    }

    if (action === "select" && candidate.tagName === "select") score += 15;
    if (action === "fill" && (candidate.tagName === "input" || candidate.tagName === "textarea")) score += 10;

    return score;
}

export function repairFailedStep(
    failedStep: WorkflowStep,
    domElements: DOMInputElement[]
): string | null {
    const intents = extractIntents(failedStep);
    if (intents.length === 0) {
        return null;
    }

    let highestScore = 0;
    let bestCandidate: DOMInputElement | null = null;

    for (const candidate of domElements) {
        for (const intent of intents) {
            const candidateScore = scoreCandidate(candidate, intent, failedStep.action);
            if (candidateScore > highestScore) {
                highestScore = candidateScore;
                bestCandidate = candidate;
            }
        }
    }

    if (bestCandidate && highestScore >= 40) {
        if (bestCandidate.id) {
            return `#${bestCandidate.id}`;
        }
        if (bestCandidate.name) {
            return `${bestCandidate.tagName}[name="${bestCandidate.name}"]`;
        }
        if (bestCandidate.ariaLabel) {
            return `${bestCandidate.tagName}[aria-label="${bestCandidate.ariaLabel}"]`;
        }
        if (bestCandidate.placeholder) {
            return `${bestCandidate.tagName}[placeholder="${bestCandidate.placeholder}"]`;
        }
    }

    return null;
}
