import {
    App,
    EditorPosition,
    EditorRangeOrCaret,
    EditorTransaction,
    MarkdownView,
} from "obsidian";
import { escape_RegExp } from "utils/Utils";

export class CursorJumper {
    constructor(private app: App) {}

    async jump_to_next_cursor_location(): Promise<void> {
        const active_editor = this.app.workspace.activeEditor;
        if (!active_editor || !active_editor.editor) {
            return;
        }
        const content = active_editor.editor.getValue();

        const { new_content, positions } =
            this.replace_and_get_cursor_positions(content);
        if (positions) {
            const fold_info =
                active_editor instanceof MarkdownView
                    ? active_editor.currentMode.getFoldInfo()
                    : null;
            active_editor.editor.setValue(new_content as string);
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
                }
            }
            this.set_cursor_location(positions);
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

    replace_and_get_cursor_positions(content: string): {
        new_content?: string;
        positions?: EditorPosition[];
    } {
        let cursor_matches = [];
        let match;
        const cursor_regex = new RegExp(
            "<%\\s*tp.file.cursor\\((?<order>[0-9]*)\\)\\s*%>",
            "g"
        );

        while ((match = cursor_regex.exec(content)) != null) {
            cursor_matches.push(match);
        }
        if (cursor_matches.length === 0) {
            return {};
        }

        cursor_matches.sort((m1, m2) => {
            return (
                Number(m1.groups && m1.groups["order"]) -
                Number(m2.groups && m2.groups["order"])
            );
        });
        const match_str = cursor_matches[0][0];

        cursor_matches = cursor_matches.filter((m) => {
            return m[0] === match_str;
        });

        const positions = [];
        let index_offset = 0;
        for (const match of cursor_matches) {
            const index = match.index - index_offset;
            positions.push(this.get_editor_position_from_index(content, index));

            content = content.replace(new RegExp(escape_RegExp(match[0])), "");
            index_offset += match[0].length;

            // For tp.file.cursor(), we keep the default top to bottom
            if (match[1] === "") {
                break;
            }
        }

        return { new_content: content, positions: positions };
    }

    set_cursor_location(positions: EditorPosition[]): void {
        const active_editor = this.app.workspace.activeEditor;
        if (!active_editor || !active_editor.editor) {
            return;
        }

        const editor = active_editor.editor;

        const selections: Array<EditorRangeOrCaret> = [];
        for (const pos of positions) {
            selections.push({ from: pos });
        }

        const transaction: EditorTransaction = {
            selections: selections,
        };
        editor.transaction(transaction);
    }
}
