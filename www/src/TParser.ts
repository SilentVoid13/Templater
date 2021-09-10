import { RunningConfig } from "Templater";

export interface TParser {
    generateContext(config: RunningConfig): Promise<{}>;
    init(): Promise<void>;
}