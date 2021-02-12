import { InternalModule } from "../InternalModule";
import { FileContent } from "./FileContent";
import { FileCreationDate } from "./FileCreationDate";
import { FileFolder } from "./FileFolder";
import { FileInclude } from "./FileInclude";
import { FileLastModifiedDate } from "./FileLastModifiedDate";
import { FilePath } from "./FilePath";
import { FileSelection } from "./FileSelection";

export class InternalModuleFile extends InternalModule {
    registerTemplates() {
        this.templates.set("include", FileInclude);
        this.templates.set("folder", FileFolder);
        this.templates.set("last_modified_date", FileLastModifiedDate);
        this.templates.set("creation_date", FileCreationDate);
        this.templates.set("selection", FileSelection);
        this.templates.set("content", FileContent);
        this.templates.set("path", FilePath);
    }
}