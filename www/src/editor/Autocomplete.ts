import {
    App,
    EditorSuggest,
    EditorSuggestContext,
    EditorSuggestTriggerInfo,
    EditorPosition,
    Editor,
    MarkdownView,
    TFile,
} from "obsidian";

import TemplaterPlugin from "main";
import {
    is_function_documentation,
    is_module_name,
    ModuleName,
    TpSuggestDocumentation,
    Documentation 
} from "./TpDocumentation";

export class Autocomplete extends EditorSuggest<TpSuggestDocumentation> {
    //private in_command = false;
    // https://regex101.com/r/ocmHzR/1
    private tp_keyword_regex =
        /tp\.(?<module>[a-z]*)?(?<fn_trigger>\.(?<fn>[a-z_]*)?)?$/;
    private documentation: Documentation;
    private latest_trigger_info: EditorSuggestTriggerInfo;
    private module_name: ModuleName | string;
    private function_trigger: boolean;
    private function_name: string;

    constructor(private app: App, private plugin: TemplaterPlugin) {
        super(app);
        this.documentation = new Documentation(this.app);
    }

    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        file: TFile
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
        const module_name = match.groups["module"] || "";
        this.module_name = module_name;

        if (match.groups["fn_trigger"]) {
            if (module_name == "" || !is_module_name(module_name)) {
                return;
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

    getSuggestions(
        context: EditorSuggestContext
    ): Array<TpSuggestDocumentation> {
        let suggestions: Array<TpSuggestDocumentation>;
        if (this.module_name && this.function_trigger) {
            suggestions =
                this.documentation.get_all_functions_documentation(
                    this.module_name as ModuleName
                );
        } else {
            suggestions =
                this.documentation.get_all_modules_documentation();
        }
        if (!suggestions) {
            return [];
        }
        return suggestions.filter(s => s.name.startsWith(context.query));
    }

    renderSuggestion(value: TpSuggestDocumentation, el: HTMLElement): void {
        el.createEl("b", { text: value.name });
        el.createEl("br");
        if (this.function_trigger && is_function_documentation(value)) {
            el.createEl("code", { text: value.definition }); 
        }
        if (value.description) {
            el.createEl("div", { text: value.description });
        }
    }

    selectSuggestion(
        value: TpSuggestDocumentation,
        evt: MouseEvent | KeyboardEvent
    ): void {
        const active_view =
            this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!active_view) {
            // TODO: Error msg
            return;
        }
        active_view.editor.replaceRange(
            value.name,
            this.latest_trigger_info.start,
            this.latest_trigger_info.end
        );
        if (this.latest_trigger_info.start.ch == this.latest_trigger_info.end.ch) {
            // Dirty hack to prevent the cursor being at the
            // beginning of the word after completion, 
            // Not sure what's the cause of this bug.
            const cursor_pos = this.latest_trigger_info.end;
            cursor_pos.ch += value.name.length;
            active_view.editor.setCursor(cursor_pos);
        }
    }
}
