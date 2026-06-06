import { browser } from "@wdio/globals";

class ObsidianConfig {
    async setShowInlineTitle(value: boolean) {
        await browser.executeObsidian(({ app }, v: boolean) => {
            app.vault.setConfig("showInlineTitle", v);
        }, value);
    }

    async setShowViewHeader(value: boolean) {
        await browser.executeObsidian(({ app }, v: boolean) => {
            app.vault.setConfig("showViewHeader", v);
        }, value);
    }
}

export default new ObsidianConfig();
