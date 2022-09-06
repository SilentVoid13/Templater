import { App } from "obsidian";
import documentation from "../../docs/documentation.toml"; 

const module_names = ["config", "date", "file", "frontmatter", "obsidian", "system", "user", "web"] as const;
export type ModuleName = typeof module_names[number];
const module_names_checker: Set<string> = new Set(module_names);

export function is_module_name(x: unknown): x is ModuleName {
    return typeof x === "string" && module_names_checker.has(x);
}

export type TpDocumentation = { 
    "tp": {
        [key in ModuleName]: TpModuleDocumentation
    }
};

export type TpModuleDocumentation = {
    name: string,
    description: string,
    functions: {
        [key: string]: TpFunctionDocumentation
    }
};

export type TpFunctionDocumentation = {
    name: string,
    definition: string,
    description: string,
    example: string,
    args?: {
        [key: string]: TpArgumentDocumentation
    },
};

export type TpArgumentDocumentation = {
    name: string,
    description: string,
};

export type TpSuggestDocumentation =
    | TpModuleDocumentation
    | TpFunctionDocumentation;

export function is_function_documentation(x: TpSuggestDocumentation): x is TpFunctionDocumentation {
    if ((x as TpFunctionDocumentation).definition) {
        return true;
    }
    return false;
}

export class Documentation {
    public documentation: TpDocumentation = documentation;

    constructor(private app: App) {}

    get_all_modules_documentation(): TpModuleDocumentation[] {
        return Object.values(this.documentation.tp);
    }

    get_all_functions_documentation(module_name: ModuleName): TpFunctionDocumentation[] {
        if (!this.documentation.tp[module_name].functions) {
            return null;
        }
        return Object.values(this.documentation.tp[module_name].functions);
    }

    get_module_documentation(module_name: ModuleName): TpModuleDocumentation {
        return this.documentation.tp[module_name];
    }

    get_function_documentation(module_name: ModuleName, function_name: string): TpFunctionDocumentation | null {
        return this.documentation.tp[module_name].functions[function_name];
    }

    get_argument_documentation(module_name: ModuleName, function_name: string, argument_name: string): TpArgumentDocumentation | null {
        const function_doc = this.get_function_documentation(module_name, function_name);
        if (!function_doc || !function_doc.args) {
            return null;
        }
        return function_doc.args[argument_name];
    }
}
