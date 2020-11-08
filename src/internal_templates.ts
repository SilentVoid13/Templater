import { App } from 'obsidian';
import axios from 'axios';

// Check https://github.com/SilentVoid13/Templater/blob/master/INTERNAL_TEMPLATES.md to see how to develop your own internal template

// An Internal template method takes the App object as an argument and must return a string.
// Your method should have the same name as the associated template pattern. 
// This string will replace the template pattern (see the replace_internal_templates method)

// Hashmap where the template pattern is the key and the associated function is the value.
// Just add them here to add your internal template to the plugin.
export const internal_templates_map: {[id: string]: Function} = {
    "{{templater_daily_quote}}": templater_daily_quote,
    "{{templater_random_picture}}": templater_random_picture,
    "{{templater_title}}": templater_title,
};

export async function replace_internal_templates(app: App, content: string) {
    for (let template_pattern in internal_templates_map) {
        if (content.contains(template_pattern)) {
            let new_content = await internal_templates_map[template_pattern](app);
            content = content.replace(
                new RegExp(template_pattern, "g"), 
                new_content
            );
        }
    }

    return content;
}

async function templater_daily_quote(_app: App): Promise<String> {
    let response = await axios.get("https://quotes.rest/qod");
    let author = response.data.contents.quotes[0].author;
    let quote = response.data.contents.quotes[0].quote;

    let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;
    return new_content;
}

async function templater_random_picture(_app: App): Promise<String> {
    let response = await axios.get("https://source.unsplash.com/random");
    let url = response.request.responseURL;

    let new_content = `![random_image](${url})`
    return new_content;
}

async function templater_title(app: App): Promise<String> {
    let activeLeaf = app.workspace.activeLeaf;
    return activeLeaf.getDisplayText();
}
