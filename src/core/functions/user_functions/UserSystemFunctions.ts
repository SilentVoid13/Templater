import { FileSystemAdapter, Platform } from "obsidian";
import TemplaterPlugin from "main";
import { IGenerateObject } from "../IGenerateObject";
import { RunningConfig } from "core/Templater";
import { UNSUPPORTED_MOBILE_TEMPLATE } from "utils/Constants";
import { TemplaterError } from "utils/Error";
import { FunctionsMode } from "../FunctionsGenerator";

export class UserSystemFunctions implements IGenerateObject {
    private cwd: string;

    constructor(private plugin: TemplaterPlugin) {
        if (
            Platform.isMobile ||
            !(this.plugin.app.vault.adapter instanceof FileSystemAdapter)
        ) {
            this.cwd = "";
        } else {
            this.cwd = this.plugin.app.vault.adapter.getBasePath();
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

        let exec_promise:
            | ((
                  cmd: string,
                  options: Record<string, unknown>
              ) => Promise<{ stdout: string; stderr: string }>)
            | undefined;
        if (Platform.isDesktop) {
            const { promisify } = await import("util");
            const { exec } = await import("child_process");
            exec_promise = promisify(exec);
        }

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
                            const { stdout } = await exec_promise!(
                                cmd,
                                cmd_options
                            );
                            return stdout.trimRight();
                        } catch (error) {
                            throw new TemplaterError(
                                `Error with User Template ${template}`,
                                error instanceof Error
                                    ? error.message
                                    : String(error)
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
