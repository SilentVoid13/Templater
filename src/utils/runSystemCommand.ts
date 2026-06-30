export type SystemCommandOptions = {
    timeout: number;
    cwd: string;
    env: typeof process.env;
    shell?: string;
};

export type SystemCommandResult = {
    stdout: string;
    stderr: string;
};

export function runSystemCommand(
    command: string,
    options: SystemCommandOptions,
): Promise<SystemCommandResult> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, import/no-nodejs-modules -- Node.js built-ins required for shell command execution
    const { spawn } = require("child_process") as typeof import("child_process");

    return new Promise<SystemCommandResult>((resolve, reject) => {
        const stdout_chunks: Buffer[] = [];
        const stderr_chunks: Buffer[] = [];
        let timed_out = false;

        const child = spawn(command, [], {
            cwd: options.cwd,
            env: options.env,
            shell: options.shell || true,
            windowsHide: true,
        });
        const timeout =
            options.timeout > 0
                ? window.setTimeout(() => {
                      timed_out = true;
                      child.kill();
                  }, options.timeout)
                : undefined;
        const cleanup = () => {
            if (timeout) {
                window.clearTimeout(timeout);
            }
        };

        child.stdout.on("data", (chunk: Buffer | string) => {
            stdout_chunks.push(
                Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
            );
        });
        child.stderr.on("data", (chunk: Buffer | string) => {
            stderr_chunks.push(
                Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
            );
        });
        child.once("error", (error: Error) => {
            cleanup();
            reject(error);
        });
        child.once("close", (code: number | null, signal: string | null) => {
            cleanup();
            const stdout = Buffer.concat(stdout_chunks).toString();
            const stderr = Buffer.concat(stderr_chunks).toString();

            if (timed_out) {
                reject(
                    new Error(
                        `Command failed: ${command}\nTimed out after ${options.timeout}ms`,
                    ),
                );
                return;
            }

            if (code !== 0) {
                const reason =
                    code === null
                        ? `signal ${signal ?? "unknown"}`
                        : `exit code ${code}`;
                const stderr_message = stderr.trim()
                    ? `\n${stderr.trim()}`
                    : "";
                reject(
                    new Error(
                        `Command failed with ${reason}: ${command}${stderr_message}`,
                    ),
                );
                return;
            }

            resolve({ stdout, stderr });
        });
    });
}
