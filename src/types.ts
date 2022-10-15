declare module "obsidian" {
    interface dom {
        appContainerEl: HTMLElement;
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
}

export {};
