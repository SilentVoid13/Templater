declare module "obsidian" {
    interface dom {
        appContainerEl: HTMLElement;
    }

    interface Vault {
        getConfig: (key: string) => string;
    }
    interface FileManager {
        createNewMarkdownFile: (
            folder: TFolder | undefined,
            filename: string
        ) => Promise<TFile>;
    }
}

export {};
