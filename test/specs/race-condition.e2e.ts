import { browser } from "@wdio/globals";
import NoticePage from "../page-objects/Notice.page";
import VaultPage from "../page-objects/Vault.page";
import WorkspacePage from "../page-objects/Workspace.page";
import { resetVault } from "../utils/reset-vault";

// Counts its evaluations and takes 2s to finish, leaving a window
// to write to the file while the template is running
const SLOW_COMMAND =
    "<%* window.__templaterEvalCount = (window.__templaterEvalCount ?? 0) + 1; " +
    'await new Promise((resolve) => setTimeout(resolve, 2000)); tR += "rendered"; %>';

describe("concurrent writes during template execution", () => {
    afterEach(async () => {
        await browser.executeObsidian(async ({ app, plugins }) => {
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "none";
            plugins.templaterObsidian.settings.folder_templates = [];
            await plugins.templaterObsidian.save_settings();
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: false,
            });
        });
    });

    it("merges a concurrent write into the template output instead of clobbering it", async () => {
        await resetVault("test/vault", {});
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });

        await browser.executeObsidian(
            async ({ app }, slowCommand: string) => {
                const w = window as unknown as {
                    __templaterEvalCount?: number;
                };
                w.__templaterEvalCount = 0;
                const file = await app.vault.create(
                    "notes/race.md",
                    `start\n${slowCommand}\nend`,
                );
                // Write to the file while the template is still evaluating
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await app.vault.process(
                    file,
                    (content) => content + "\nconcurrent-write",
                );
            },
            SLOW_COMMAND,
        );

        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/race.md",
            "start\nrendered\nend\nconcurrent-write",
        );
        const evalCount = await browser.execute(
            () =>
                (window as unknown as { __templaterEvalCount?: number })
                    .__templaterEvalCount,
        );
        expect(evalCount).toBe(1);
    });

    it("keeps the concurrent content and shows a notice when the template output can't be merged", async () => {
        await resetVault("test/vault", {});
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });

        await browser.executeObsidian(
            async ({ app }, slowCommand: string) => {
                const file = await app.vault.create(
                    "notes/conflict.md",
                    `alpha\n${slowCommand}\nomega`,
                );
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // Rewrite the whole note so the template output can't be merged
                await app.vault.process(
                    file,
                    () => "unrelated full rewrite of the note",
                );
            },
            SLOW_COMMAND,
        );

        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/conflict.md",
            "unrelated full rewrite of the note",
        );
        await NoticePage.expectTemplateOutputNotAppliedNotice(
            "notes/conflict.md",
        );
    });

    it("does not write at all when a new file contains no template commands", async () => {
        await resetVault("test/vault", {});
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });

        const mtimeAfterCreate = await browser.executeObsidian(
            async ({ app }) => {
                const w = window as unknown as {
                    __overwriteEventFired?: boolean;
                    __overwriteEventRef?: unknown;
                };
                w.__overwriteEventFired = false;
                const workspace = app.workspace as unknown as {
                    on(name: string, callback: () => void): unknown;
                };
                w.__overwriteEventRef = workspace.on(
                    "templater:overwrite-file",
                    () => {
                        w.__overwriteEventFired = true;
                    },
                );
                const file = await app.vault.create(
                    "notes/plain.md",
                    "just some plain content",
                );
                return file.stat.mtime;
            },
        );

        // Wait longer than the 300ms delay inside on_file_creation, then
        // confirm Templater has finished before reading the file state.
        // eslint-disable-next-line wdio/no-pause
        await browser.pause(600);
        await WorkspacePage.waitForAllTemplatesExecuted();

        const { mtime, overwriteEventFired } = await browser.executeObsidian(
            ({ app }) => {
                const w = window as unknown as {
                    __overwriteEventFired?: boolean;
                    __overwriteEventRef?: unknown;
                };
                const workspace = app.workspace as unknown as {
                    offref(ref: unknown): void;
                };
                if (w.__overwriteEventRef) {
                    workspace.offref(w.__overwriteEventRef);
                }
                return {
                    mtime: app.vault.getFileByPath("notes/plain.md")?.stat
                        .mtime,
                    overwriteEventFired: w.__overwriteEventFired,
                };
            },
        );

        await VaultPage.expectFileToHaveContent(
            "notes/plain.md",
            "just some plain content",
        );
        expect(mtime).toBe(mtimeAfterCreate);
        expect(overwriteEventFired).toBe(false);
    });

    it("preserves content written by another create-event handler while create-new-note-from-template runs", async () => {
        await resetVault("test/vault", {
            "templates/slow.md":
                "<%* await new Promise((resolve) => setTimeout(resolve, 1500)); %>template-output",
        });

        await browser.executeObsidian(({ app }) => {
            const w = window as unknown as { __createEventRef?: unknown };
            // Mimic another plugin filling new notes with content
            w.__createEventRef = app.vault.on("create", (created) => {
                if (created.path === "race-note.md") {
                    const file = app.vault.getFileByPath(created.path);
                    if (file) {
                        void app.vault.process(
                            file,
                            () => "injected-by-other-plugin\n",
                        );
                    }
                }
            });
        });

        await browser.executeObsidian(async ({ app, plugins }) => {
            const templateFile = app.vault.getFileByPath("templates/slow.md");
            if (!templateFile) throw new Error("Template file not found");
            await plugins.templaterObsidian.templater.create_new_note_from_template(
                templateFile,
                "",
                "race-note",
                false,
            );
        });

        await browser.executeObsidian(({ app }) => {
            const w = window as unknown as { __createEventRef?: unknown };
            const vault = app.vault as unknown as {
                offref(ref: unknown): void;
            };
            if (w.__createEventRef) {
                vault.offref(w.__createEventRef);
            }
        });

        await VaultPage.expectFileToHaveContent(
            "race-note.md",
            "injected-by-other-plugin\ntemplate-output",
        );
    });
});

describe("frontmatter merging on new file creation", () => {
    async function setupFolderTemplate(templateContent: string) {
        await resetVault("test/vault", {
            "templates/t.md": templateContent,
        });
        await browser.executeObsidian(async ({ app, plugins }) => {
            plugins.templaterObsidian.settings.templates_folder = "templates";
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "folder";
            plugins.templaterObsidian.settings.folder_templates = [
                { folder: "notes", template: "templates/t.md" },
            ];
            await plugins.templaterObsidian.save_settings();
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });
    }

    afterEach(async () => {
        await browser.executeObsidian(async ({ app, plugins }) => {
            plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                "none";
            plugins.templaterObsidian.settings.folder_templates = [];
            await plugins.templaterObsidian.save_settings();
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: false,
            });
        });
    });

    it("keeps the existing frontmatter block byte-identical when the template has no frontmatter", async () => {
        await setupFolderTemplate("body-from-template");
        await browser.executeObsidian(async ({ app }) => {
            await app.vault.create(
                "notes/props-only.md",
                "---\nfoo: bar # keep me\n---\n",
            );
        });
        await VaultPage.expectFileToHaveContent(
            "notes/props-only.md",
            "---\nfoo: bar # keep me\n---\nbody-from-template",
        );
    });

    it("merges frontmatter from both sides, unioning arrays", async () => {
        await setupFolderTemplate(
            "---\ntags:\n  - from-template\n---\ntemplate-body",
        );
        await browser.executeObsidian(async ({ app }) => {
            await app.vault.create(
                "notes/props-merge.md",
                "---\ntags:\n  - existing\nfoo: bar\n---\n",
            );
        });
        await VaultPage.expectFileToHaveContent(
            "notes/props-merge.md",
            "---\ntags:\n  - existing\n  - from-template\nfoo: bar\n---\ntemplate-body",
        );
    });

    it("never emits a second frontmatter block when the existing frontmatter is invalid YAML", async () => {
        await setupFolderTemplate("---\nbar: baz\n---\ntemplate-body");
        await browser.executeObsidian(async ({ app }) => {
            await app.vault.create(
                "notes/props-invalid.md",
                "---\nfoo: [unclosed\n---\n",
            );
        });
        await VaultPage.expectFileToHaveContent(
            "notes/props-invalid.md",
            "---\nfoo: [unclosed\n---\ntemplate-body",
        );
        await NoticePage.expectFrontmatterMergeFailedNotice();
    });
});
