import { App, EditorPosition, MarkdownView } from "obsidian";
import { delay } from "utils/Utils";

export class CursorJumper {
    constructor(private app: App) {}

    async jump_to_next_cursor_location(): Promise<void> {
        const active_editor = this.app.workspace.activeEditor;
        if (!active_editor?.editor) {
            return;
        }

        const content = active_editor.editor.getValue();

        const { cursor_matches, positions } =
            this.get_cursor_matches_and_positions(content);
        if (!positions || !cursor_matches) {
            return;
        }

        const fold_info =
            active_editor instanceof MarkdownView
                ? active_editor.currentMode.getFoldInfo()
                : null;

        const changes = [];

        for (let i = cursor_matches.length - 1; i >= 0; i--) {
            const match = cursor_matches[i];
            const from = this.get_editor_position_from_index(
                content,
                match.index
            );
            const to = this.get_editor_position_from_index(
                content,
                match.index + match[0].length
            );
            changes.push({ from, to, text: "" });
        }

        active_editor.editor.transaction({
            changes,
            selections: positions.map((pos) => ({ from: pos })),
        });

        // only expand folds that have a cursor placed within it's bounds
        if (fold_info && Array.isArray(fold_info.folds)) {
            positions.forEach((position) => {
                fold_info.folds = fold_info.folds.filter(
                    (fold) =>
                        fold.from > position.line || fold.to < position.line
                );
            });
            if (active_editor instanceof MarkdownView) {
                active_editor.currentMode.applyFoldInfo(fold_info);
                // Wait for view to finish rendering properties widget
                await delay(100);
                // Save the file to ensure modifications saved to disk by the time `on_all_templates_executed` callback is executed
                // https://github.com/SilentVoid13/Templater/issues/1569
                active_editor.save();
            }
        }

        try {
            // enter insert mode for vim users
            if (this.app.vault.getConfig("vimMode")) {
                // @ts-ignore
                const cm = active_editor.editor.cm.cm;
                // @ts-ignore
                window.CodeMirrorAdapter.Vim.handleKey(cm, "i", "mapping");
            }
        } catch (error) {
            console.warn(
                "Templater: Failed to enter insert mode for vim users.",
                error
            );
        }
    }

    get_editor_position_from_index(
        content: string,
        index: number
    ): EditorPosition {
        const substr = content.slice(0, index);

        let l = 0;
        let offset = -1;
        let r = -1;
        for (; (r = substr.indexOf("\n", r + 1)) !== -1; l++, offset = r);
        offset += 1;

        const ch = content.slice(offset, index).length;

        return { line: l, ch: ch };
    }

    get_cursor_matches_and_positions(content: string): {
        cursor_matches?: RegExpExecArray[];
        positions?: EditorPosition[];
    } {
        const cursor_regex = /<%\s*tp\.file\.cursor\((?<order>[0-9]*)\)\s*%>/g;
        const cursor_matches = Array.from(content.matchAll(cursor_regex));

        if (cursor_matches.length === 0) {
            return {};
        }

        cursor_matches.sort(
            (m1, m2) =>
                Number(m1.groups?.order || 0) - Number(m2.groups?.order || 0)
        );

        const match_str = cursor_matches[0][0];
        const filtered_matches = cursor_matches.filter(
            (m) => m[0] === match_str
        );

        // For tp.file.cursor(), we keep the default top to bottom
        const final_matches =
            filtered_matches[0][1] === ""
                ? [filtered_matches[0]]
                : filtered_matches;

        // Calculate cursor positions accounting for deletions
        const positions: EditorPosition[] = [];
        let index_offset = 0;

        for (const match of final_matches) {
            const adjusted_index = match.index - index_offset;
            positions.push(
                this.get_editor_position_from_index(content, adjusted_index)
            );

            // Update content to simulate the deletion for position calculations
            content =
                content.slice(0, adjusted_index) +
                content.slice(adjusted_index + match[0].length);
            index_offset += match[0].length;
        }

        return { cursor_matches: final_matches, positions };
    }
}
