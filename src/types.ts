import type { Events } from "obsidian";

declare module "obsidian" {
    interface App {
        dom: {
            appContainerEl: HTMLElement;
        };
        internalPlugins: {
            getEnabledPluginById(
                id: string,
            ): { options: Record<string, string> } | null;
        };
        setting?: {
            openTabById?(id: string): void;
            activeTab?: {
                setQuery?(query: string): void;
            };
        };
        openWithDefaultApp(path: string): void;
    }

    interface Vault {
        getConfig: (key: string) => string;
        exists: (path: string) => Promise<boolean>;
        getAvailablePath: (path: string, extension: string) => string;
        getAbstractFileByPathInsensitive: (path: string) => string;
    }

    interface DataAdapter {
        basePath: string;
        fs: {
            uri: string;
        };
    }

    interface Workspace {
        on(
            name: "templater:all-templates-executed",
            callback: () => unknown,
        ): EventRef;
        onLayoutReadyCallbacks?: {
            pluginId: string;
            callback: () => void;
        }[];
    }

    interface EventRef {
        e: Events;
    }

    interface MarkdownSubView {
        applyFoldInfo(foldInfo: FoldInfo): void;
        getFoldInfo(): FoldInfo | null;
    }

    interface FoldInfo {
        folds: FoldRange[];
        lines: number;
    }

    interface FoldRange {
        from: number;
        to: number;
    }

    interface MarkdownView {
        metadataEditor?: {
            insertProperties?: (properties: Record<string, unknown>) => void;
        };
    }

    interface SearchComponent {
        containerEl: HTMLElement;
    }
}

export interface CodeMirrorModeState {
    [key: string]: unknown;
}

export interface TemplaterModeState extends CodeMirrorModeState {
    inCommand: boolean;
    tag_class: string;
    freeLine: boolean;
}

export interface CodeMirrorStream {
    sol(): boolean;
    peek(): string | null;
    next(): string | null;
    match(
        pattern: string | RegExp,
        consume?: boolean,
    ): RegExpMatchArray | false | null;
}

export interface CodeMirrorMode {
    name?: string;
    token?: (
        stream: CodeMirrorStream,
        state: CodeMirrorModeState,
    ) => string | null;
    startState?: () => CodeMirrorModeState;
    copyState?: (state: CodeMirrorModeState) => CodeMirrorModeState;
    blankLine?: (state: CodeMirrorModeState) => string | null;
}

export type UserScriptFunction =
    | ((...args: unknown[]) => unknown)
    | Record<string, (...args: unknown[]) => unknown>;

declare global {
    interface Window {
        CodeMirror: {
            getMode(config: object, mode: string | object): CodeMirrorMode;
            defineMode(
                name: string,
                factory: (config: object) => CodeMirrorMode,
            ): void;
            startState(mode: CodeMirrorMode): CodeMirrorModeState;
            customOverlayMode?: (
                base: CodeMirrorMode,
                overlay: Partial<CodeMirrorMode>,
            ) => CodeMirrorMode;
        };
        CodeMirrorAdapter?: {
            Vim: {
                handleKey(cm: unknown, key: string, type: string): void;
            };
        };
    }
}

export {};
