import { InternalModule } from "../InternalModule";

export class InternalModuleFrontmatter extends InternalModule {
    public name: string = "frontmatter";

    async createStaticTemplates(): Promise<void> {}

    async updateTemplates(): Promise<void> {
        const cache = this.app.metadataCache.getFileCache(this.config.target_file)
        this.dynamic_templates = new Map(Object.entries(cache?.frontmatter || {}));
    }
}