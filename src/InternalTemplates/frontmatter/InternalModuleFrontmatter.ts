import { InternalModule } from "../InternalModule";

export class InternalModuleFrontmatter extends InternalModule {
    name = "frontmatter";

    async registerTemplates() {
        let cache = this.app.metadataCache.getFileCache(this.file)
        if (cache.frontmatter) {
            this.templates = new Map(Object.entries(cache.frontmatter));
        }
    }
}