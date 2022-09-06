import { RunningConfig } from "core/Templater";

export interface IGenerateObject {
    generate_object(config: RunningConfig): Promise<Record<string, unknown>>;
}
