import { exec } from "child_process";
import { promisify } from "util";
import { App, Platform, FileSystemAdapter } from "obsidian";

import TemplaterPlugin from "main";
import { IGenerateObject } from "functions/IGenerateObject";
import { RunningConfig } from "Templater";
import { UNSUPPORTED_MOBILE_TEMPLATE } from "Constants";
import { TemplaterError } from "Error";
import { FunctionsMode } from "functions/FunctionsGenerator";

export class UserSystemFunctions implements IGenerateObject {
    private cwd: string;
    private exec_promise: (
        arg1: string,
        arg2: Record<string, unknown>
    ) => Promise<{ stdout: string; stderr: string }>;

    constructor(app: App, private plugin: TemplaterPlugin) {
        if (
            Platform.isMobileApp ||
            !(app.vault.adapter instanceof FileSystemAdapter)
        ) {
            this.cwd = "";
        } else {
            this.cwd = app.vault.adapter.getBasePath();
            this.exec_promise = promisify(exec);
        }
    }

    // TODO: Add mobile support
    async generate_system_functions(
        config: RunningConfig
    ): Promise<
        Map<string, (user_args?: Record<string, unknown>) => Promise<string>>
    > {
        const user_system_functions: Map<
            string,
            (user_args?: Record<string, unknown>) => Promise<string>
        > = new Map();
        const internal_functions_object =
            await this.plugin.templater.functions_generator.generate_object(
                config,
                FunctionsMode.INTERNAL
            );

        for (const template_pair of this.plugin.settings.templates_pairs) {
            const template = template_pair[0];
            let cmd = template_pair[1];
            if (!template || !cmd) {
                continue;
            }

            if (Platform.isMobileApp) {
                user_system_functions.set(template, (): Promise<string> => {
                    return new Promise((resolve) =>
                        resolve(UNSUPPORTED_MOBILE_TEMPLATE)
                    );
                });
            } else {
                cmd = await this.plugin.templater.parser.parse_commands(
                    cmd,
                    internal_functions_object
                );

                user_system_functions.set(
                    template,
                    async (
                        user_args?: Record<string, unknown>
                    ): Promise<string> => {
                        const process_env = {
                            ...process.env,
                            ...user_args,
                        };

                        const cmd_options = {
                            timeout:
                                this.plugin.settings.command_timeout * 1000,
                            cwd: this.cwd,
                            env: process_env,
                            ...(this.plugin.settings.shell_path && {
                                shell: this.plugin.settings.shell_path,
                            }),
                        };

                        try {
                            const { stdout } = await this.exec_promise(
                                cmd,
                                cmd_options
                            );
                            return stdout.trimRight();
                        } catch (error) {
                            throw new TemplaterError(
                                `Error with User Template ${template}`,
                                error
                            );
                        }
                    }
                );
            }
        }
        return user_system_functions;
    }

    async generate_object(
        config: RunningConfig
    ): Promise<Record<string, unknown>> {
        const user_system_functions = await this.generate_system_functions(
            config
        );
        return Object.fromEntries(user_system_functions);
    }
}
