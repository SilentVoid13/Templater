import * as path from "path";
import { env } from "process";
import { parseObsidianVersions } from "wdio-obsidian-service";

const cacheDir = path.resolve(".obsidian-cache");

const desktopVersions = await parseObsidianVersions(
    env.OBSIDIAN_VERSIONS ?? "latest/latest",
    { cacheDir },
);

export const config: WebdriverIO.Config = {
    runner: "local",
    framework: "mocha",
    specs: ["./test/specs/**/*.e2e.ts"],
    maxInstances: 5,
    capabilities: desktopVersions.map<WebdriverIO.Capabilities>(
        ([appVersion, installerVersion]) => ({
            browserName: "obsidian",
            "wdio:obsidianOptions": {
                appVersion,
                installerVersion,
                plugins: ["."],
                vault: "test/vault",
            },
        }),
    ),
    services: ["obsidian"],
    reporters: ["obsidian"],
    cacheDir,
    mochaOpts: {
        ui: "bdd",
        timeout: 60000,
    },
    logLevel: "warn",
    waitforTimeout: 10000,
};
