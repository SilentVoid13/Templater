import { RunningConfig } from "Templater";

export interface IGenerateObject {
    generate_object(config: RunningConfig): Promise<Record<string, unknown>>;
}
