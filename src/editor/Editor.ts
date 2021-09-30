import { App, Platform } from "obsidian";
import TemplaterPlugin from "main";
import { TemplaterError } from "Error";
import { CursorJumper } from "editor/CursorJumper";
import { log_error } from "Log";

import "editor/mode/javascript";
import "editor/mode/custom_overlay";
//import "editor/mode/show-hint";

const TP_CMD_TOKEN_CLASS = "templater-command";
const TP_INLINE_CLASS = "templater-inline";

const TP_OPENING_TAG_TOKEN_CLASS = "templater-opening-tag";
const TP_CLOSING_TAG_TOKEN_CLASS = "templater-closing-tag";

const TP_INTERPOLATION_TAG_TOKEN_CLASS = "templater-interpolation-tag";
const TP_RAW_TAG_TOKEN_CLASS = "templater-raw-tag";
const TP_EXEC_TAG_TOKEN_CLASS = "templater-execution-tag";

export class Editor {
    private cursor_jumper: CursorJumper;

    public constructor(private app: App, private plugin: TemplaterPlugin) {
        this.cursor_jumper = new CursorJumper(this.app);
    }

    async setup(): Promise<void> {
        await this.registerCodeMirrorMode();
        //await this.registerHinter();
    }

    async jump_to_next_cursor_location(): Promise<void> {
        this.cursor_jumper.jump_to_next_cursor_location();
    }

    async registerCodeMirrorMode(): Promise<void> {
        // cm-editor-syntax-highlight-obsidian plugin
        // https://codemirror.net/doc/manual.html#modeapi
        // https://codemirror.net/mode/diff/diff.js
        // https://codemirror.net/demo/mustache.html
        // https://marijnhaverbeke.nl/blog/codemirror-mode-system.html

        if (!this.plugin.settings.syntax_highlighting) {
            return;
        }

        // TODO: Add mobile support
        if (Platform.isMobileApp) {
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

        window.CodeMirror.defineMode("templater", function (config) {
            const templaterOverlay = {
                startState: function () {
                    const js_state = window.CodeMirror.startState(js_mode);
                    return {
                        ...js_state,
                        inCommand: false,
                        tag_class: "",
                        freeLine: false,
                    };
                },
                copyState: function (state: any) {
                    const js_state = window.CodeMirror.startState(js_mode);
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

                        const js_result = js_mode.token(stream, state);
                        if (stream.peek() == null && state.freeLine) {
                            keywords += ` line-background-templater-command-bg`;
                        }
                        if (!state.freeLine) {
                            keywords += ` line-${TP_INLINE_CLASS}`;
                        }

                        return `${keywords} ${TP_CMD_TOKEN_CLASS} ${js_result}`;
                    }

                    const match = stream.match(
                        /<%[-_]{0,1}\s*([*~+]{0,1})/,
                        true
                    );
                    if (match != null) {
                        switch (match[1]) {
                            case "*":
                                state.tag_class = TP_EXEC_TAG_TOKEN_CLASS;
                                break;
                            case "~":
                                state.tag_class = TP_RAW_TAG_TOKEN_CLASS;
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

    async registerHinter(): Promise<void> {
        // TODO
        /*
        await delay(1000);

        var comp = [
            ["here", "hither"],
            ["asynchronous", "nonsynchronous"],
            ["completion", "achievement", "conclusion", "culmination", "expirations"],
            ["hinting", "advise", "broach", "imply"],
            ["function","action"],
            ["provide", "add", "bring", "give"],
            ["synonyms", "equivalents"],
            ["words", "token"],
            ["each", "every"],
        ];
    
        function synonyms(cm: any, option: any) {
            return new Promise(function(accept) {
                setTimeout(function() {
                    var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
                    var start = cursor.ch, end = cursor.ch
                    while (start && /\w/.test(line.charAt(start - 1))) --start
                    while (end < line.length && /\w/.test(line.charAt(end))) ++end
                    var word = line.slice(start, end).toLowerCase()
                    for (var i = 0; i < comp.length; i++) {
                        if (comp[i].indexOf(word) != -1) {
                            return accept({
                                list: comp[i],
                                from: window.CodeMirror.Pos(cursor.line, start),
                                to: window.CodeMirror.Pos(cursor.line, end)
                            });
                        }
                    }
                    return accept(null);
                }, 100)
            });
        }

        this.app.workspace.on("codemirror", cm => {
            cm.setOption("extraKeys", {"Ctrl-Space": "autocomplete"});
            cm.setOption("hintOptions", {hint: synonyms});
        });

        this.app.workspace.iterateCodeMirrors(cm => {
            console.log("CM:", cm);
            cm.setOption("extraKeys", {"Space": "autocomplete"});
            cm.setOption("hintOptions", {hint: synonyms});
        });
        */
    }
}
