import { browser } from "@wdio/globals";

export interface RunTemplateArgs {
    templatePath: string;
    targetPath: string;
    templateContent: string;
    targetContent?: string;
    waitCache?: boolean;
    skipTargetModify?: boolean;
}

export function uniqueTestName(prefix: string): string {
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now()}-${randomSuffix}`;
}

export async function createOrUpdateVaultFile(
    filePath: string,
    content = "",
): Promise<void> {
    await browser.executeObsidian(
        async ({ app }, payload: { filePath: string; content: string }) => {
            const ensureParentFolder = async (fullPath: string) => {
                const normalizedPath = fullPath.replace(/^\/+/, "");
                const segments = normalizedPath.split("/");
                if (segments.length <= 1) {
                    return;
                }

                const folders = segments.slice(0, -1);
                let currentPath = "";

                for (const folder of folders) {
                    currentPath = currentPath
                        ? `${currentPath}/${folder}`
                        : folder;
                    const existing =
                        app.vault.getAbstractFileByPath(currentPath);
                    if (!existing) {
                        await app.vault.createFolder(currentPath);
                    }
                }
            };

            await ensureParentFolder(payload.filePath);
            const existingFile = app.vault.getFileByPath(payload.filePath);
            if (existingFile) {
                await app.vault.modify(existingFile, payload.content);
                return;
            }
            await app.vault.create(payload.filePath, payload.content);
        },
        { filePath, content },
    );
}

export async function deleteVaultPath(targetPath: string): Promise<void> {
    await browser.executeObsidian(async ({ app }, pathToDelete: string) => {
        const target = app.vault.getAbstractFileByPath(pathToDelete);
        if (target) {
            await app.vault.delete(target, true);
        }
    }, targetPath);
}

export async function runAndGetOutput(args: RunTemplateArgs): Promise<string> {
    return browser.executeObsidian(
        async ({ app }, payload: RunTemplateArgs) => {
            const ensureParentFolder = async (fullPath: string) => {
                const normalizedPath = fullPath.replace(/^\/+/, "");
                const segments = normalizedPath.split("/");
                if (segments.length <= 1) {
                    return;
                }

                const folders = segments.slice(0, -1);
                let currentPath = "";

                for (const folder of folders) {
                    currentPath = currentPath
                        ? `${currentPath}/${folder}`
                        : folder;
                    const existing =
                        app.vault.getAbstractFileByPath(currentPath);
                    if (!existing) {
                        await app.vault.createFolder(currentPath);
                    }
                }
            };

            const waitForCacheUpdate = async (targetFile: { path: string }) => {
                await new Promise<void>((resolve) => {
                    let done = false;
                    const finish = () => {
                        if (done) {
                            return;
                        }
                        done = true;
                        app.metadataCache.off("changed", onChanged);
                        resolve();
                    };

                    const onChanged = (file: unknown) => {
                        if (
                            typeof file === "object" &&
                            file &&
                            "path" in file &&
                            (file as { path: string }).path === targetFile.path
                        ) {
                            finish();
                        }
                    };

                    app.metadataCache.on("changed", onChanged);
                    activeWindow.setTimeout(finish, 500);
                });
            };

            const plugin = app.plugins.getPlugin("templater-obsidian");

            if (!plugin) {
                throw new Error("templater-obsidian is not loaded");
            }

            await ensureParentFolder(payload.targetPath);
            await ensureParentFolder(payload.templatePath);

            let targetFile = app.vault.getFileByPath(payload.targetPath);
            if (!targetFile) {
                targetFile = await app.vault.create(
                    payload.targetPath,
                    payload.targetContent ?? "",
                );
            } else if (!payload.skipTargetModify) {
                await app.vault.modify(targetFile, payload.targetContent ?? "");
            }

            let templateFile = app.vault.getFileByPath(payload.templatePath);
            if (!templateFile) {
                templateFile = await app.vault.create(
                    payload.templatePath,
                    payload.templateContent,
                );
            } else {
                await app.vault.modify(templateFile, payload.templateContent);
            }

            if (payload.waitCache) {
                await waitForCacheUpdate(targetFile);
            }

            const runningConfig = plugin.templater.create_running_config(
                templateFile,
                targetFile,
                2,
            );
            return plugin.templater.read_and_parse_template(runningConfig);
        },
        args,
    );
}

export async function runInNewLeafAndGetOutput(
    args: RunTemplateArgs,
): Promise<string> {
    return browser.executeObsidian(
        async ({ app }, payload: RunTemplateArgs) => {
            const ensureParentFolder = async (fullPath: string) => {
                const normalizedPath = fullPath.replace(/^\/+/, "");
                const segments = normalizedPath.split("/");
                if (segments.length <= 1) {
                    return;
                }

                const folders = segments.slice(0, -1);
                let currentPath = "";

                for (const folder of folders) {
                    currentPath = currentPath
                        ? `${currentPath}/${folder}`
                        : folder;
                    const existing =
                        app.vault.getAbstractFileByPath(currentPath);
                    if (!existing) {
                        await app.vault.createFolder(currentPath);
                    }
                }
            };

            const waitForCacheUpdate = async (targetFile: { path: string }) => {
                await new Promise<void>((resolve) => {
                    let done = false;
                    const finish = () => {
                        if (done) {
                            return;
                        }
                        done = true;
                        app.metadataCache.off("changed", onChanged);
                        resolve();
                    };

                    const onChanged = (file: unknown) => {
                        if (
                            typeof file === "object" &&
                            file &&
                            "path" in file &&
                            (file as { path: string }).path === targetFile.path
                        ) {
                            finish();
                        }
                    };

                    app.metadataCache.on("changed", onChanged);
                    activeWindow.setTimeout(finish, 500);
                });
            };

            const plugin = app.plugins.getPlugin("templater-obsidian");

            if (!plugin) {
                throw new Error("templater-obsidian is not loaded");
            }

            await ensureParentFolder(payload.targetPath);
            await ensureParentFolder(payload.templatePath);

            let targetFile = app.vault.getFileByPath(payload.targetPath);
            if (!targetFile) {
                targetFile = await app.vault.create(
                    payload.targetPath,
                    payload.targetContent ?? "",
                );
            } else if (!payload.skipTargetModify) {
                await app.vault.modify(targetFile, payload.targetContent ?? "");
            }

            let templateFile = app.vault.getFileByPath(payload.templatePath);
            if (!templateFile) {
                templateFile = await app.vault.create(
                    payload.templatePath,
                    payload.templateContent,
                );
            } else {
                await app.vault.modify(templateFile, payload.templateContent);
            }

            if (payload.waitCache) {
                await waitForCacheUpdate(targetFile);
            }

            await app.workspace.getLeaf(true).openFile(targetFile);
            await plugin.templater.append_template_to_active_file(templateFile);
            await sleep(300);

            return app.vault.read(targetFile);
        },
        args,
    );
}

export async function arePropertiesVisible(): Promise<boolean> {
    return browser.execute(() => {
        return !!activeDocument.querySelector(
            ".workspace-leaf.mod-active .metadata-properties .metadata-property",
        );
    });
}
export async function setClipboardText(text: string): Promise<void> {
    await browser.executeObsidian(async (_, value: string) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
                return;
            }
        } catch {
            // fallback below
        }

        const electron = window.require("electron") as unknown;
        const electronClipboard =
            typeof electron === "object" && electron && "clipboard" in electron
                ? electron.clipboard
                : null;
        if (
            electronClipboard &&
            typeof electronClipboard === "object" &&
            "writeText" in electronClipboard &&
            typeof electronClipboard.writeText === "function"
        ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            electronClipboard.writeText(value);
            return;
        }

        throw new Error("Clipboard APIs are unavailable");
    }, text);
}

export async function getFileTimes(
    targetPath: string,
): Promise<{ ctime: number; mtime: number }> {
    return browser.executeObsidian(({ app }, path: string) => {
        const file = app.vault.getFileByPath(path);
        if (!file) {
            throw new Error(`File not found: ${path}`);
        }
        return {
            ctime: file.stat.ctime,
            mtime: file.stat.mtime,
        };
    }, targetPath);
}

export async function setFileTimes(
    targetPath: string,
    values: { ctime?: number; mtime?: number },
): Promise<void> {
    await browser.executeObsidian(
        (
            { app },
            payload: { targetPath: string; ctime?: number; mtime?: number },
        ) => {
            const file = app.vault.getFileByPath(payload.targetPath);
            if (!file) {
                throw new Error(`File not found: ${payload.targetPath}`);
            }
            if (typeof payload.ctime === "number") {
                file.stat.ctime = payload.ctime;
            }
            if (typeof payload.mtime === "number") {
                file.stat.mtime = payload.mtime;
            }
        },
        { targetPath, ...values },
    );
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => activeWindow.setTimeout(resolve, ms));
}
