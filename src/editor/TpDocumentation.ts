import TemplaterPlugin from "main";
import { TFile } from "obsidian";
import { errorWrapper } from "utils/Error";
import { UserScriptFunctions } from "core/functions/user_functions/UserScriptFunctions";
import type { UserScriptFunction } from "types";
import {
    generate_jsdoc_documentation,
    get_fn_params,
    get_tfiles_from_folder,
    is_object,
    populate_docs_from_user_scripts,
} from "utils/Utils";
import documentation from "../../docs/documentation.toml";

const module_names = [
    "app",
    "config",
    "date",
    "file",
    "frontmatter",
    "hooks",
    "obsidian",
    "system",
    "user",
    "web",
] as const;
export type ModuleName = (typeof module_names)[number];
const module_names_checker: Set<string> = new Set(module_names);

export function is_module_name(x: unknown): x is ModuleName {
    return typeof x === "string" && module_names_checker.has(x);
}

export type TpDocumentation = {
    tp: {
        [key in ModuleName]: TpModuleDocumentation;
    };
};

export type TpModuleDocumentation = {
    name: string;
    queryKey: string;
    description: string;
    functions: {
        [key: string]: TpFunctionDocumentation;
    };
};

export type TpFunctionDocumentation = {
    name: string;
    queryKey: string;
    definition: string;
    description: string;
    returns: string;
    example: string;
    args?: {
        [key: string]: TpArgumentDocumentation;
    };
};

export type TpArgumentDocumentation = {
    name: string;
    description: string;
};

type UserScriptMemberDocumentation = {
    description: string;
    returns: string;
    args?: {
        [key: string]: TpArgumentDocumentation;
    };
};

export type TpSuggestDocumentation =
    | TpModuleDocumentation
    | TpFunctionDocumentation;

export function is_function_documentation(
    x: TpSuggestDocumentation
): x is TpFunctionDocumentation {
    if ((x as TpFunctionDocumentation).definition ||
        (x as TpFunctionDocumentation).returns ||
        (x as TpFunctionDocumentation).args) {
        return true;
    }
    return false;
}

export class Documentation {
    public documentation: TpDocumentation = documentation as TpDocumentation;

    constructor(private plugin: TemplaterPlugin) {}

    get_all_modules_documentation(): TpModuleDocumentation[] {
        const tp = this.documentation.tp;
        let modules = Object.values(tp);

        // Remove 'user' if no user scripts found
        if (!this.plugin.settings ||
            !this.plugin.settings.user_scripts_folder) {
            modules = modules.filter((x) => x.name !== 'user');
        }

        return modules.map((mod) => {
            mod.queryKey = mod.name;
            return mod;
        });
    }

    async get_all_functions_documentation(
        module_name: ModuleName,
        function_name: string
    ): Promise<TpFunctionDocumentation[] | undefined> {
        if (module_name === "app") {
            return this.get_app_functions_documentation(
                this.plugin.app,
                function_name
            );
        }
        if (module_name === "user") {
            if (
                !this.plugin.settings ||
                !this.plugin.settings.user_scripts_folder
            )
                return;
            // Show an error notice if the configured folder doesn't exist.
            const jsFiles = await errorWrapper(
                () =>
                    Promise.resolve(
                        get_tfiles_from_folder(
                            this.plugin.app,
                            this.plugin.settings.user_scripts_folder,
                        ).filter((x) => x.extension === "js"),
                    ),
                `User Scripts folder doesn't exist`,
            );
            if (!jsFiles || jsFiles.length === 0) return;

            const userScriptPath = get_user_script_path(function_name);
            if (userScriptPath) {
                const userScriptFile = jsFiles.find(
                    (file) => file.basename === userScriptPath.scriptName,
                );
                if (!userScriptFile) return [];

                return get_user_script_object_documentation(
                    this.plugin,
                    userScriptFile,
                    userScriptPath.scriptName,
                );
            }

            const docFiles = await errorWrapper(
                () => populate_docs_from_user_scripts(this.plugin.app, jsFiles),
                `Failed to parse user script documentation`,
            );
            if (!docFiles || docFiles.length === 0) return;

            return docFiles.reduce<TpFunctionDocumentation[]>(
                (acc, file) => [
                    ...acc,
                    {
                        name: file.basename,
                        queryKey: file.basename,
                        definition: "",
                        description: file.description ?? "",
                        returns: file.returns ?? "",
                        args: get_argument_documentation(file.arguments ?? []),
                        example: "",
                    },
                ],
                [],
            );
        }
        if (!this.documentation.tp[module_name].functions) {
            return;
        }
        return Object.values(this.documentation.tp[module_name].functions).map(
            (mod) => {
                mod.queryKey = mod.name;
                return mod;
            }
        );
    }

    private get_app_functions_documentation(
        obj: unknown,
        path: string
    ): TpFunctionDocumentation[] {
        if (!is_object(obj)) {
            return [];
        }
        const parts = path.split(".");
        if (parts.length === 0) {
            return [];
        }

        let currentObj = obj;
        for (let index = 0; index < parts.length - 1; index++) {
            const part = parts[index];
            if (part in currentObj) {
                const next = currentObj[part];
                if (!is_object(next)) {
                    return [];
                }
                currentObj = next;
            }
        }

        const definitionPrefix = [
            "tp",
            "app",
            ...parts.slice(0, parts.length - 1),
        ].join(".");
        const queryKeyPrefix = parts.slice(0, parts.length - 1).join(".");
        const docs: TpFunctionDocumentation[] = [];
        for (const key in currentObj) {
            const definition = `${definitionPrefix}.${key}`;
            const queryKey = queryKeyPrefix ? `${queryKeyPrefix}.${key}` : key;
            docs.push({
                name: key,
                queryKey,
                definition:
                    typeof currentObj[key] === "function"
                        ? `${definition}(${get_fn_params(
                              currentObj[key] as (...args: unknown[]) => unknown
                          ).join(", ")})`
                        : definition,
                description: "",
                returns: "",
                example: "",
            });
        }

        return docs;
    }

    get_module_documentation(module_name: ModuleName): TpModuleDocumentation {
        return this.documentation.tp[module_name];
    }

    get_function_documentation(
        module_name: ModuleName,
        function_name: string
    ): TpFunctionDocumentation | null {
        return this.documentation.tp[module_name].functions[function_name];
    }

    get_argument_documentation(
        module_name: ModuleName,
        function_name: string,
        argument_name: string
    ): TpArgumentDocumentation | null {
        const function_doc = this.get_function_documentation(
            module_name,
            function_name
        );
        if (!function_doc || !function_doc.args) {
            return null;
        }
        return function_doc.args[argument_name];
    }
}

function get_user_script_path(
    function_name: string,
): { scriptName: string } | null {
    const separatorIndex = function_name.indexOf(".");
    if (separatorIndex === -1) {
        return null;
    }

    const scriptName = function_name.slice(0, separatorIndex);
    if (!scriptName) {
        return null;
    }

    return { scriptName };
}

async function get_user_script_object_documentation(
    plugin: TemplaterPlugin,
    userScriptFile: TFile,
    scriptName: string,
): Promise<TpFunctionDocumentation[]> {
    const userScriptContent = await plugin.app.vault.cachedRead(userScriptFile);
    const memberDocumentation =
        get_user_script_member_documentation(userScriptContent);
    const userScriptFunctions = new Map<string, UserScriptFunction>();
    const loader = new UserScriptFunctions(plugin);
    await errorWrapper(
        () =>
            loader.load_user_script_function(
                userScriptFile,
                userScriptFunctions,
            ),
        `Failed to load user script at "${userScriptFile.path}"`,
    );

    const userScriptFunction = userScriptFunctions.get(scriptName);
    if (!is_object(userScriptFunction)) {
        return [];
    }

    return Object.entries(userScriptFunction)
        .filter((entry): entry is [string, (...args: unknown[]) => unknown] => {
            return typeof entry[1] === "function";
        })
        .map(([name, fn]) => {
            const docs =
                memberDocumentation.get(name) ||
                memberDocumentation.get(fn.name);
            return {
                name,
                queryKey: `${scriptName}.${name}`,
                definition: `tp.user.${scriptName}.${name}(${get_fn_params(
                    fn,
                ).join(", ")})`,
                description: docs?.description ?? "",
                returns: docs?.returns ?? "",
                args: docs?.args,
                example: "",
            };
        });
}

function get_user_script_member_documentation(
    content: string,
): Map<string, UserScriptMemberDocumentation> {
    const docs = new Map<string, UserScriptMemberDocumentation>();
    const docBlock = "\\/\\*\\*[\\s\\S]*?\\*\\/";
    const identifier = "[$A-Z_a-z][$\\w]*";
    const patterns = [
        new RegExp(
            `(${docBlock})\\s*(?:async\\s+)?function\\s+(${identifier})\\s*\\(`,
            "g",
        ),
        new RegExp(
            `(${docBlock})\\s*(?:const|let|var)\\s+(${identifier})\\s*=`,
            "g",
        ),
        new RegExp(`(${docBlock})\\s*(${identifier})\\s*:`, "g"),
        new RegExp(`(${docBlock})\\s*["'](${identifier})["']\\s*:`, "g"),
        new RegExp(
            `(${docBlock})\\s*(?:async\\s+)?(${identifier})\\s*\\([^)]*\\)\\s*{`,
            "g",
        ),
        new RegExp(`(${docBlock})\\s*(${identifier})\\s*(?=,|})`, "g"),
    ];

    for (const pattern of patterns) {
        for (const match of content.matchAll(pattern)) {
            const doc = generate_jsdoc_documentation(match[1]);
            docs.set(match[2], {
                description: doc.description,
                returns: doc.returns,
                args: get_argument_documentation(doc.arguments),
            });
        }
    }

    return docs;
}

function get_argument_documentation(
    args: { name: string; description: string }[],
): { [key: string]: TpArgumentDocumentation } | undefined {
    if (args.length === 0) {
        return undefined;
    }

    return args.reduce<{
        [key: string]: TpArgumentDocumentation;
    }>((argAcc, arg) => {
        argAcc[arg.name] = {
            name: arg.name,
            description: arg.description,
        };
        return argAcc;
    }, {});
}
