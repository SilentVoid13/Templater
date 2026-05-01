import { browser } from "@wdio/globals";
import { TFile } from "obsidian";
import { obsidianPage } from "wdio-obsidian-service";

class Workspace {
    get activeTabEl() {
        return browser.$(
            ".workspace-split.mod-root .workspace-tab-header.mod-active .workspace-tab-header-inner-title",
        );
    }

    get allTabEls() {
        return browser.$$(
            ".workspace-split.mod-root .workspace-tab-header .workspace-tab-header-inner-title",
        );
    }

    async expectActiveTabToHaveText(text: string) {
        const platform = await obsidianPage.getPlatform();
        if (platform.isMobile) {
            // On mobile, the active tab title is not shown in the UI
            return;
        }
        await expect(this.activeTabEl).toHaveText(text);
    }

    async getTabCount(): Promise<number> {
        const tabs = this.allTabEls;
        return tabs.length;
    }

    async waitForAllTemplatesExecuted() {
        await browser.waitUntil(async () => {
            try {
                return browser.executeObsidian(({ plugins }) => {
                    return (
                        plugins.templaterObsidian.templater
                            .files_with_pending_templates.size === 0
                    );
                });
            } catch {
                return false;
            }
        });
    }
}

export default new Workspace();
