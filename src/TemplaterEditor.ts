import { App, Platform } from "obsidian";
import "mode/javascript";
import TemplaterPlugin from "main";
import { TemplaterError } from "Error";

const TP_CMD_TOKEN_CLASS: string = "templater-command";
const TP_OPENING_TAG_TOKEN_CLASS: string = "templater-opening-tag";
const TP_CLOSING_TAG_TOKEN_CLASS: string = "templater-closing-tag";
const TP_INTERPOLATION_TAG_TOKEN_CLASS: string = "templater-interpolation-tag";
const TP_RAW_TAG_TOKEN_CLASS: string = "templater-raw-tag";
const TP_EXEC_TAG_TOKEN_CLASS: string = "templater-execution-tag";

export class TemplaterEditor {
    public constructor(private app: App, private plugin: TemplaterPlugin) {}

    async setup(): Promise<void> {
        await this.registerCodeMirrorMode();
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

        let js_mode = window.CodeMirror.getMode({}, "javascript");
		if (js_mode.name === "null") {
            this.plugin.log_error(new TemplaterError("Javascript syntax mode couldn't be found, can't enable syntax highlighting."));
            return;
		}

        window.CodeMirror.defineMode("templater", function(config, parserConfig) {
			const templaterOverlay = {
                startState: function() {
                    const js_state = window.CodeMirror.startState(js_mode);
                    return {
                        ...js_state,
                        inCommand: false,
                        tag_class: "",
                        freeLine: false,
                    };
                },
                copyState: function(state: any) {
                    const js_state = window.CodeMirror.startState(js_mode);
                    const new_state = {
                        ...js_state,
                        inCommand: state.inCommand,
                        tag_class: state.tag_class,
                        freeLine: state.freeLine,
                    };
                    return new_state;
                },
                blankLine: function(state: any) {
                    if (state.inCommand) {
                        return `line-${TP_CMD_TOKEN_CLASS}`;
                    }
                    return null;
                },
                token: function(stream: any, state: any) {
                    if (stream.sol() && state.inCommand) {
                        state.freeLine = true;
                    }

                    if (state.inCommand) {
                        let keywords = "";
                        if (stream.match(/[\-_]{0,1}%>/, true)) {
                            state.inCommand = false;
                            state.freeLine = false;
                            const tag_class = state.tag_class;
                            state.tag_class = "";

                            return `${keywords} ${TP_CMD_TOKEN_CLASS} ${TP_CLOSING_TAG_TOKEN_CLASS} ${tag_class}`;
                        } 

                        const js_result = js_mode.token(stream, state);
                        if (stream.peek() == null && state.freeLine) {
                            keywords += `line-${TP_CMD_TOKEN_CLASS}`;
                        }

                        return `${keywords} ${TP_CMD_TOKEN_CLASS} ${js_result}`;
                    }

                    const match = stream.match(/<%[\-_]{0,1}\s*([*~+]{0,1})/, true);
                    if (match != null) {
                        switch (match[1]) {
                            case '*':
                                state.tag_class = TP_EXEC_TAG_TOKEN_CLASS;
                                break;
                            case '~':
                                state.tag_class = TP_RAW_TAG_TOKEN_CLASS;
                                break;
                            default:
                                state.tag_class = TP_INTERPOLATION_TAG_TOKEN_CLASS;
                                break;
                        }
                        state.inCommand = true;
                        return `${state.tag_class} ${TP_OPENING_TAG_TOKEN_CLASS} ${TP_CMD_TOKEN_CLASS}`;
                    }

                    while (stream.next() != null && !stream.match(/<%/, false));
                    return null;
                }
			};
            return window.CodeMirror.overlayMode(window.CodeMirror.getMode(config, "hypermd"), templaterOverlay);
		}); 
	}
}