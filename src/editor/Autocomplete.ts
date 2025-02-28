import {
    Editor,
    EditorPosition,
    EditorSuggest,
    EditorSuggestContext,
    EditorSuggestTriggerInfo,
    TFile,
} from "obsidian";

import {
    Documentation,
    is_function_documentation,
    is_module_name,
    ModuleName,
    TpFunctionDocumentation,
    TpSuggestDocumentation,
} from "./TpDocumentation";
import TemplaterPlugin from "main";
import { append_bolded_label_with_value_to_parent } from "utils/Utils";

export class Autocomplete extends EditorSuggest<TpSuggestDocumentation> {
    //private in_command = false;
    // https://regex101.com/r/ocmHzR/1
    private tp_keyword_regex =
        /tp\.(?<module>[a-z]*)?(?<fn_trigger>\.(?<fn>[a-zA-Z_.]*)?)?$/;
    private documentation: Documentation;
    private latest_trigger_info: EditorSuggestTriggerInfo;
    private module_name: ModuleName | string;
    private function_trigger: boolean;
    private function_name: string;

    constructor(plugin: TemplaterPlugin) {
        super(plugin.app);
        this.documentation = new Documentation(plugin);
    }

    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        _file: TFile
    ): EditorSuggestTriggerInfo | null {
        const range = editor.getRange(
            { line: cursor.line, ch: 0 },
            { line: cursor.line, ch: cursor.ch }
        );
        const match = this.tp_keyword_regex.exec(range);
        if (!match) {
            return null;
        }

        let query: string;
        const module_name = (match.groups && match.groups["module"]) || "";
        this.module_name = module_name;

        if (match.groups && match.groups["fn_trigger"]) {
            if (module_name == "" || !is_module_name(module_name)) {
                return null;
            }
            this.function_trigger = true;
            this.function_name = match.groups["fn"] || "";
            query = this.function_name;
        } else {
            this.function_trigger = false;
            query = this.module_name;
        }

        const trigger_info: EditorSuggestTriggerInfo = {
            start: { line: cursor.line, ch: cursor.ch - query.length },
            end: { line: cursor.line, ch: cursor.ch },
            query: query,
        };
        this.latest_trigger_info = trigger_info;
        return trigger_info;
    }

    async getSuggestions(context: EditorSuggestContext): Promise<TpSuggestDocumentation[]> {
        let suggestions: Array<TpSuggestDocumentation>;
        if (this.module_name && this.function_trigger) {
            suggestions = await this.documentation.get_all_functions_documentation(
                this.module_name as ModuleName,
                this.function_name
            ) as TpFunctionDocumentation[];
        } else {
            suggestions = this.documentation.get_all_modules_documentation();
        }
        if (!suggestions) {
            return [];
        }
        return suggestions.filter((s) =>
            s.queryKey.toLowerCase().startsWith(context.query.toLowerCase())
        );
    }

    renderSuggestion(value: TpSuggestDocumentation, el: HTMLElement): void {
        el.createEl("b", { text: value.name });
        if (is_function_documentation(value))
        {
            if (value.args &&
                this.getNumberOfArguments(value.args) > 0
            ) {
                el.createEl('p', {text: "Parameter list:"})
                const list = el.createEl("ol");
                for (const [key, val] of Object.entries(value.args)) {
                    append_bolded_label_with_value_to_parent(list, key, val.description)
                }
            }
            if (value.returns) {
                append_bolded_label_with_value_to_parent(el, 'Returns', value.returns)
            }
        }
        if (this.function_trigger && is_function_documentation(value)) {
            el.createEl("code", { text: value.definition });
        }
        if (value.description) {
            el.createEl("div", { text: value.description });
        }
    }

    selectSuggestion(
        value: TpSuggestDocumentation,
        _evt: MouseEvent | KeyboardEvent
    ): void {
        const active_editor = this.app.workspace.activeEditor;
        if (!active_editor || !active_editor.editor) {
            // TODO: Error msg
            return;
        }
        active_editor.editor.replaceRange(
            value.queryKey,
            this.latest_trigger_info.start,
            this.latest_trigger_info.end
        );
        if (
            this.latest_trigger_info.start.ch == this.latest_trigger_info.end.ch
        ) {
            // Dirty hack to prevent the cursor being at the
            // beginning of the word after completion,
            // Not sure what's the cause of this bug.
            const cursor_pos = this.latest_trigger_info.end;
            cursor_pos.ch += value.queryKey.length;
            active_editor.editor.setCursor(cursor_pos);
        }
    }

    getNumberOfArguments(
        args: object
    ): number {
        try {
            return new Map(Object.entries(args)).size;
        } catch (error) {
            return 0;
        }
    }
}
