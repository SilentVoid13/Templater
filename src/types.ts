declare module "obsidian" {
    interface App {
        dom: {
            appContainerEl: HTMLElement;
        };
    }

    interface Vault {
        getConfig: (key: string) => string;
        exists: (path: string) => Promise<boolean>;
    }
    interface FileManager {
        createNewMarkdownFile: (
            folder: TFolder | undefined,
            filename: string
        ) => Promise<TFile>;
    }
    interface DataAdapter {
        basePath: string;
        fs: {
            uri: string;
        };
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
}

export {};
