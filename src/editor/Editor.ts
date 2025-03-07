/* eslint-disable @typescript-eslint/no-explicit-any */
import { Platform, TFile } from "obsidian";
import TemplaterPlugin from "main";
import { TemplaterError } from "utils/Error";
import { CursorJumper } from "editor/CursorJumper";
import { log_error } from "utils/Log";
import { get_active_file } from "utils/Utils";
import { Autocomplete } from "editor/Autocomplete";

import "editor/mode/javascript";
import "editor/mode/custom_overlay";
import { StreamLanguage } from "@codemirror/language";
import { Extension, Prec } from "@codemirror/state";
//import "editor/mode/show-hint";

const TEMPLATER_MODE_NAME = "templater";

const TP_CMD_TOKEN_CLASS = "templater-command";
const TP_INLINE_CLASS = "templater-inline";

const TP_OPENING_TAG_TOKEN_CLASS = "templater-opening-tag";
const TP_CLOSING_TAG_TOKEN_CLASS = "templater-closing-tag";

const TP_INTERPOLATION_TAG_TOKEN_CLASS = "templater-interpolation-tag";
const TP_EXEC_TAG_TOKEN_CLASS = "templater-execution-tag";

export class Editor {
    private cursor_jumper: CursorJumper;
    private activeEditorExtensions: Array<Extension>;

    // Note that this is `undefined` until `setup` has run.
    private templaterLanguage: Extension | undefined;

    private autocomplete: Autocomplete;

    public constructor(private plugin: TemplaterPlugin) {
        this.cursor_jumper = new CursorJumper(plugin.app);
        this.activeEditorExtensions = [];
    }

    desktopShouldHighlight(): boolean {
        return (
            Platform.isDesktopApp && this.plugin.settings.syntax_highlighting
        );
    }

    mobileShouldHighlight(): boolean {
        return (
            Platform.isMobile && this.plugin.settings.syntax_highlighting_mobile
        );
    }

    async setup(): Promise<void> {
        this.autocomplete = new Autocomplete(this.plugin);
        this.plugin.registerEditorSuggest(this.autocomplete);

        // We define our overlay as a stand-alone extension and keep a reference
        // to it around. This lets us dynamically turn it on and off as needed.
        await this.registerCodeMirrorMode();
        this.templaterLanguage = Prec.high(
            StreamLanguage.define(
                window.CodeMirror.getMode({}, TEMPLATER_MODE_NAME) as any
            )
        );
        if (this.templaterLanguage === undefined) {
            log_error(
                new TemplaterError(
                    "Unable to enable syntax highlighting. Could not define language."
                )
            );
        }

        // Dynamic reconfiguration is now done by passing an array. If we modify
        // that array and then call `Workspace.updateOptions` the new extension
        // will be picked up.
        this.plugin.registerEditorExtension(this.activeEditorExtensions);

        // Selectively enable syntax highlighting via per-platform preferences.
        if (this.desktopShouldHighlight() || this.mobileShouldHighlight()) {
            await this.enable_highlighter();
        }
    }

    async enable_highlighter(): Promise<void> {
        // Make sure it is idempotent
        if (
            this.activeEditorExtensions.length === 0 &&
            this.templaterLanguage
        ) {
            // There should only ever be this one extension if the array is not
            // empty.
            this.activeEditorExtensions.push(this.templaterLanguage);
            // This is expensive
            this.plugin.app.workspace.updateOptions();
        }
    }

    async disable_highlighter(): Promise<void> {
        // Make sure that it is idempotent.
        if (this.activeEditorExtensions.length > 0) {
            // There should only ever be one extension if the array is not empty.
            this.activeEditorExtensions.pop();
            // This is expensive
            this.plugin.app.workspace.updateOptions();
        }
    }

    async jump_to_next_cursor_location(
        file: TFile | null = null,
        auto_jump = false
    ): Promise<void> {
        if (auto_jump && !this.plugin.settings.auto_jump_to_cursor) {
            return;
        }
        if (file && get_active_file(this.plugin.app) !== file) {
            return;
        }
        await this.cursor_jumper.jump_to_next_cursor_location();
    }

    async registerCodeMirrorMode(): Promise<void> {
        // cm-editor-syntax-highlight-obsidian plugin
        // https://codemirror.net/doc/manual.html#modeapi
        // https://codemirror.net/mode/diff/diff.js
        // https://codemirror.net/demo/mustache.html
        // https://marijnhaverbeke.nl/blog/codemirror-mode-system.html

        // If no configuration requests highlighting we should bail.
        if (!this.desktopShouldHighlight() && !this.mobileShouldHighlight()) {
            return;
        }

        const js_mode = window.CodeMirror.getMode({}, "javascript");
        if (js_mode.name === "null") {
            log_error(
                new TemplaterError(
                    "Javascript syntax mode couldn't be found, can't enable syntax highlighting."
                )
            );
            return;
        }

        // Custom overlay mode used to handle edge cases
        // @ts-ignore
        const overlay_mode = window.CodeMirror.customOverlayMode;
        if (overlay_mode == null) {
            log_error(
                new TemplaterError(
                    "Couldn't find customOverlayMode, can't enable syntax highlighting."
                )
            );
            return;
        }

        window.CodeMirror.defineMode(TEMPLATER_MODE_NAME, function (config) {
            const templaterOverlay = {
                startState: function () {
                    const js_state = window.CodeMirror.startState(
                        js_mode
                    ) as Object;
                    return {
                        ...js_state,
                        inCommand: false,
                        tag_class: "",
                        freeLine: false,
                    };
                },
                copyState: function (state: any) {
                    const js_state = window.CodeMirror.startState(
                        js_mode
                    ) as Object;
                    const new_state = {
                        ...js_state,
                        inCommand: state.inCommand,
                        tag_class: state.tag_class,
                        freeLine: state.freeLine,
                    };
                    return new_state;
                },
                blankLine: function (state: any) {
                    if (state.inCommand) {
                        return `line-background-templater-command-bg`;
                    }
                    return null;
                },
                token: function (stream: any, state: any) {
                    if (stream.sol() && state.inCommand) {
                        state.freeLine = true;
                    }

                    if (state.inCommand) {
                        let keywords = "";
                        if (stream.match(/[-_]{0,1}%>/, true)) {
                            state.inCommand = false;
                            state.freeLine = false;
                            const tag_class = state.tag_class;
                            state.tag_class = "";

                            return `line-${TP_INLINE_CLASS} ${TP_CMD_TOKEN_CLASS} ${TP_CLOSING_TAG_TOKEN_CLASS} ${tag_class}`;
                        }

                        const js_result =
                            js_mode.token && js_mode.token(stream, state);
                        if (stream.peek() == null && state.freeLine) {
                            keywords += ` line-background-templater-command-bg`;
                        }
                        if (!state.freeLine) {
                            keywords += ` line-${TP_INLINE_CLASS}`;
                        }

                        return `${keywords} ${TP_CMD_TOKEN_CLASS} ${js_result}`;
                    }

                    const match = stream.match(
                        /<%[-_]{0,1}\s*([*+]{0,1})/,
                        true
                    );
                    if (match != null) {
                        switch (match[1]) {
                            case "*":
                                state.tag_class = TP_EXEC_TAG_TOKEN_CLASS;
                                break;
                            default:
                                state.tag_class =
                                    TP_INTERPOLATION_TAG_TOKEN_CLASS;
                                break;
                        }
                        state.inCommand = true;
                        return `line-${TP_INLINE_CLASS} ${TP_CMD_TOKEN_CLASS} ${TP_OPENING_TAG_TOKEN_CLASS} ${state.tag_class}`;
                    }

                    while (stream.next() != null && !stream.match(/<%/, false));
                    return null;
                },
            };
            return overlay_mode(
                window.CodeMirror.getMode(config, "hypermd"),
                templaterOverlay
            );
        });
    }

    updateEditorIntellisenseSetting(value: any){
        this.autocomplete.updateAutocompleteIntellisenseSetting(value)
    }
}
