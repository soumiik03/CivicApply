import { execFileSync } from "child_process";

export function runWebcmd(args: string[], options: { input?: string } = {}): string {
    if (process.platform === "win32") {
        return execFileSync("cmd.exe", ["/c", "webcmd", ...args], {
            encoding: "utf8",
            input: options.input
        });
    } else {
        return execFileSync("webcmd", args, {
            encoding: "utf8",
            input: options.input
        });
    }
}

export function createSession(): string {
    const output = runWebcmd(["session", "create", "-f", "json"]);
    const session = JSON.parse(output);
    return session.id as string;
}

export function closeSession(sessionId: string): void {
    try {
        runWebcmd(["session", "close", sessionId]);
    } catch {
    }
}

export function runBrowserScript(sessionId: string, script: string): string {
    return runWebcmd(
        [
            "--session",
            sessionId,
            "browser",
            "run",
            "--stdin"
        ],
        {
            input: script
        }
    );
}
