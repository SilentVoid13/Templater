import "obsidian";

declare module "obsidian" {
  interface Editor {
    cm: CodeMirror.Editor;
  }

  interface FileManager {
    createNewMarkdownFile: (folder: string, filename: string) => Promise<void>;
  }

  interface VaultSettings {
    foldHeading: boolean;
    foldIndent: boolean;
    legacyEditor: boolean;
    newFileLocation: string;
    readableLineLength: boolean;
    rightToLeft: boolean;
    showFrontmatter: boolean;
    tabSize: number;
  }

  interface Vault {
    config: Record<string, any>;
    getConfig<T extends keyof VaultSettings>(setting: T): VaultSettings[T];
  }

  export interface PluginInstance {
    id: string;
  }
  export interface ViewRegistry {
    viewByType: Record<string, (leaf: WorkspaceLeaf) => unknown>;
    isExtensionRegistered(extension: string): boolean;
  }

  export interface App {
    internalPlugins: InternalPlugins;
    viewRegistry: ViewRegistry;
  }
  export interface InstalledPlugin {
    enabled: boolean;
    instance: PluginInstance;
  }

  export interface InternalPlugins {
    plugins: Record<string, InstalledPlugin>;
    getPluginById(id: string): InstalledPlugin;
  }
}
