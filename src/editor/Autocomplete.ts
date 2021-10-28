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
    is_module_name,
    ModuleName,
    TpModuleDocumentation,
    TpFunctionDocumentation,
} from "functions/TpDocumentation";

export type TpSuggestDocumentation =
    | TpModuleDocumentation
    | TpFunctionDocumentation;

export class Autocomplete extends EditorSuggest<TpSuggestDocumentation> {
    //private in_command = false;
    // https://regex101.com/r/ocmHzR/1
    private tp_keyword_regex =
        /tp\.(?<module>[a-z]*)?(?<fn_trigger>\.(?<fn>[a-z_]*)?)?$/;
    private latest_trigger_info: EditorSuggestTriggerInfo;
    private module_name: ModuleName | "";
    private function_trigger: boolean;
    private function_name: string;

    constructor(private app: App, private plugin: TemplaterPlugin) {
        super(app);
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
        if (module_name !== "" && !is_module_name(module_name)) {
            return;
        }
        this.module_name = module_name;

        if (match.groups["fn_trigger"]) {
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
                this.plugin.templater.documentation.get_all_functions_documentation(
                    this.module_name
                );
        } else {
            suggestions =
                this.plugin.templater.documentation.get_all_modules_documentation();

        }
        return suggestions.filter(s => s.name.startsWith(context.query));
    }

    renderSuggestion(value: TpSuggestDocumentation, el: HTMLElement): void {
        if (value.description) {
            el.createEl("b", { text: value.name });
            el.createEl("br");
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
    }
}
