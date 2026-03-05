declare module "obsidian" {
    interface CliFlag {
        value?: string;
        description: string;
        required?: boolean;
    }

    type CliFlags = Record<string, CliFlag>;
    type CliData = Record<string, string | "true">;
    type CliHandler = (params: CliData) => string | Promise<string>;

    interface Plugin {
        registerCliHandler(
            command: string,
            description: string,
            flags: CliFlags | null,
            handler: CliHandler
        ): void;
    }

    interface App {
        dom: {
            appContainerEl: HTMLElement;
        };
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
            callback: () => unknown
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
}

export {};
