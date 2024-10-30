import { FileSystemAdapter, Platform } from "obsidian";
import TemplaterPlugin from "main";
import { IGenerateObject } from "../IGenerateObject";
import { RunningConfig } from "core/Templater";
import { UNSUPPORTED_MOBILE_TEMPLATE } from "utils/Constants";
import { TemplaterError } from "utils/Error";
import { FunctionsMode } from "../FunctionsGenerator";

export class UserSystemFunctions implements IGenerateObject {
    private cwd: string;
    private exec_promise: (
        arg1: string,
        arg2: Record<string, unknown>
    ) => Promise<{ stdout: string; stderr: string }>;

    constructor(private plugin: TemplaterPlugin) {
        if (
            Platform.isMobile ||
            !(this.plugin.app.vault.adapter instanceof FileSystemAdapter)
        ) {
            this.cwd = "";
        } else {
            this.cwd = this.plugin.app.vault.adapter.getBasePath();
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { promisify } = require("util") as typeof import("util");
            const { exec } =
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                require("child_process") as typeof import("child_process");
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

            if (Platform.isMobile) {
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
