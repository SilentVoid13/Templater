const NodeEnvironment = require("jest-environment-node");
const Application = require('spectron').Application

class ObsidianEnvironment extends NodeEnvironment {
    async setup() {
        let path = process.env.OBSIDIAN_PATH;
        if (!path) {
            path = "/obsidian/obsidian";
        }

        this.app = new Application({path});
        await this.app.start();

        const client = this.app.client;

        await client.execute(
            "require('electron').ipcRenderer.sendSync('vaultOpen', 'test/empty_vault', false)"
        );
        await client.windowByIndex(1);
        await (await client.$(".empty-state-title")).waitForExist();

        // Disable safemode and turn on our plugin
        await client.execute(
            "app.plugins.setEnable(true);app.plugins.enablePlugin('templater-obsidian')"
        );

        // Dismiss warning model and get out of settings
        await (await client.$(".modal-button-container button:last-child")).click();
        await (await client.$(".modal-close-button")).click();
    }

    async teardown() {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    }

    runScript(script) {
        return super.runScript(script);
    }
}

module.exports = ObsidianEnvironment;