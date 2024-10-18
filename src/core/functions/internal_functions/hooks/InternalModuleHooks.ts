import { EventRef } from "obsidian";
import { ModuleName } from "editor/TpDocumentation";
import { delay } from "utils/Utils";
import { InternalModule } from "../InternalModule";

export class InternalModuleHooks extends InternalModule {
    public name: ModuleName = "hooks";
    private event_refs: EventRef[] = [];

    async create_static_templates(): Promise<void> {
        this.static_functions.set(
            "on_all_templates_executed",
            this.generate_on_all_templates_executed()
        );
    }

    async create_dynamic_templates(): Promise<void> {}

    async teardown(): Promise<void> {
        this.event_refs.forEach((eventRef) => {
            eventRef.e.offref(eventRef);
        });
        this.event_refs = [];
    }

    generate_on_all_templates_executed(): (
        callback_function: () => unknown
    ) => void {
        return (callback_function) => {
            const event_ref = this.plugin.app.workspace.on(
                "templater:all-templates-executed",
                async () => {
                    await delay(1);
                    callback_function();
                }
            );
            if (event_ref) {
                this.event_refs.push(event_ref);
            }
        };
    }
}
