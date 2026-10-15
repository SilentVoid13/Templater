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

import {
    IntellisenseRenderOption,
    shouldRenderDescription,
    shouldRenderParameters,
    shouldRenderReturns,
} from "../settings/RenderSettings/IntellisenseRenderOption";

import TemplaterPlugin from "main";
import {
    append_bolded_label_with_value_to_parent,
    format_property_path,
} from "utils/Utils";

export class Autocomplete extends EditorSuggest<TpSuggestDocumentation> {
    //private in_command = false;
    // A standalone `tp` (not `http.` nor `obj.tp.`) followed by the accessor
    // chain typed so far, e.g. `tp.`, `tp.user.fo` or
    // `tp.app.plugins.plugins["templater-obsidian"].`
    private tp_keyword_regex =
        /(?<![\w$.])tp(?<accessors>(?:\.[\w$-]*|\[(?:"[^"]*"|'[^']*')\])+)$/;
    private documentation: Documentation;
    private latest_trigger_info?: EditorSuggestTriggerInfo;
    private module_name: ModuleName | "" = "";
    private function_trigger: boolean = false;
    private function_path: string[] = [];
    private query_path: string[] = [];
    private intellisense_render_setting: IntellisenseRenderOption;

    constructor(plugin: TemplaterPlugin) {
        super(plugin.app);
        this.documentation = new Documentation(plugin);
        this.intellisense_render_setting = plugin.settings.intellisense_render;
    }

    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        _file: TFile,
    ): EditorSuggestTriggerInfo | null {
        const range = editor.getRange(
            { line: cursor.line, ch: 0 },
            { line: cursor.line, ch: cursor.ch },
        );
        const match = this.tp_keyword_regex.exec(range);
        if (!match || !match.groups) {
            return null;
        }
        const accessors = match.groups["accessors"];
        const [module_name, ...function_path] = parse_accessors(accessors);
        if (module_name === undefined) {
            return null;
        }

        if (function_path.length > 0) {
            if (!is_module_name(module_name)) {
                return null;
            }
            this.module_name = module_name;
            this.function_trigger = true;
            this.function_path = function_path;
        } else {
            this.function_trigger = false;
        }
        // Suggestions are matched against the members being completed, which
        // for a module is the module name itself.
        this.query_path = this.function_trigger ? function_path : [module_name];

        const trigger_info: EditorSuggestTriggerInfo = {
            // The whole accessor chain is replaced on completion, so that every
            // segment can be rewritten to the notation its name requires.
            start: { line: cursor.line, ch: cursor.ch - accessors.length },
            end: { line: cursor.line, ch: cursor.ch },
            query: this.query_path.join("."),
        };
        this.latest_trigger_info = trigger_info;
        return trigger_info;
    }

    async getSuggestions(
        _context: EditorSuggestContext,
    ): Promise<TpSuggestDocumentation[]> {
        let suggestions: Array<TpSuggestDocumentation>;
        if (this.module_name && this.function_trigger) {
            suggestions =
                (await this.documentation.get_all_functions_documentation(
                    this.module_name,
                    this.function_path,
                )) as TpFunctionDocumentation[];
        } else {
            suggestions = this.documentation.get_all_modules_documentation();
        }
        if (!suggestions) {
            return [];
        }
        return suggestions.filter((s) =>
            matches_query_path(s.queryPath, this.query_path),
        );
    }

    renderSuggestion(value: TpSuggestDocumentation, el: HTMLElement): void {
        const isFunctionDocumentation = is_function_documentation(value);
        const shouldRenderFunctionParameters =
            isFunctionDocumentation &&
            value.args &&
            this.getNumberOfArguments(value.args) > 0 &&
            shouldRenderParameters(this.intellisense_render_setting);
        const shouldRenderFunctionReturns =
            isFunctionDocumentation &&
            value.returns &&
            shouldRenderReturns(this.intellisense_render_setting);
        const shouldRenderFunctionDefinition =
            isFunctionDocumentation &&
            this.function_trigger &&
            value.definition;
        const shouldRenderFunctionDescription =
            value.description &&
            shouldRenderDescription(this.intellisense_render_setting);
        const hasSecondaryContent =
            shouldRenderFunctionParameters ||
            shouldRenderFunctionReturns ||
            shouldRenderFunctionDefinition ||
            shouldRenderFunctionDescription;

        el.createEl("b", { text: value.name });
        if (hasSecondaryContent) {
            el.createEl("br");
        }

        if (isFunctionDocumentation) {
            if (shouldRenderFunctionParameters) {
                el.createEl("p", { text: "Parameter list:" });
                const list = el.createEl("ol");
                for (const [key, val] of Object.entries(value.args ?? {})) {
                    append_bolded_label_with_value_to_parent(
                        list,
                        key,
                        val.description,
                    );
                }
            }
            if (shouldRenderFunctionReturns) {
                append_bolded_label_with_value_to_parent(
                    el,
                    "Returns",
                    value.returns,
                );
            }
        }
        if (shouldRenderFunctionDefinition) {
            el.createEl("code", { text: value.definition });
        }
        if (shouldRenderFunctionDescription) {
            el.createDiv({ text: value.description });
        }
    }

    selectSuggestion(
        value: TpSuggestDocumentation,
        _evt: MouseEvent | KeyboardEvent,
    ): void {
        const active_editor = this.app.workspace.activeEditor;
        if (!active_editor || !active_editor.editor) {
            // TODO: Error msg
            return;
        }
        if (!this.latest_trigger_info) return;
        const editor = active_editor.editor;
        const { start, end } = this.latest_trigger_info;
        // The replaced range covers the whole accessor chain, so the module
        // name is completed again alongside the function path, and every
        // segment brings its own leading `.` or `["..."]`.
        const text = format_property_path(
            this.function_trigger
                ? [this.module_name, ...value.queryPath]
                : value.queryPath,
        );

        editor.replaceRange(text, start, end);
        editor.setCursor({ line: start.line, ch: start.ch + text.length });
    }

    getNumberOfArguments(args: object): number {
        try {
            return new Map(Object.entries(args)).size;
        } catch {
            return 0;
        }
    }

    updateAutocompleteIntellisenseSetting(value: IntellisenseRenderOption) {
        this.intellisense_render_setting = value;
    }
}

/**
 * Whether a suggestion is a candidate for the members being completed: every
 * member but the last one has to match exactly, the last one being only
 * partially typed.
 * @param suggestion_path The members the suggestion would complete
 * @param query_path The members being completed
 * @returns Whether the suggestion matches
 */
function matches_query_path(
    suggestion_path: string[],
    query_path: string[],
): boolean {
    if (suggestion_path.length !== query_path.length) {
        return false;
    }
    return query_path.every((member, index) =>
        index === query_path.length - 1
            ? suggestion_path[index]
                  .toLowerCase()
                  .startsWith(member.toLowerCase())
            : suggestion_path[index] === member,
    );
}

/**
 * Split an accessor chain into the member names it accesses, e.g.
 * `.plugins.plugins["templater-obsidian"].` into
 * `["plugins", "plugins", "templater-obsidian", ""]`.
 * @param accessors The accessor chain, as written in the editor
 * @returns The member names, the last one being what has been typed so far
 */
function parse_accessors(accessors: string): string[] {
    const accessor_regex = /\.([\w$-]*)|\[(?:"([^"]*)"|'([^']*)')\]/g;
    const members: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = accessor_regex.exec(accessors)) !== null) {
        members.push(match[1] ?? match[2] ?? match[3]);
    }
    return members;
}
