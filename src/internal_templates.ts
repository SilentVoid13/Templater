import { request } from 'http';
import axios from 'axios';

// An Internal template function takes no argument and must return a string.
// Give your function the same name as the associated template pattern. 
// This string will replace the template pattern (see the replace_internal_templates function)

// Hashmap where the template pattern is the key and the associated function is the value.
// Just add your template pattern and your internal template function here to add it to the plugin.
export const internal_templates_map: {[id: string]: Function} = {
    "{{templater_daily_quote}}": templater_daily_quote,
};

export async function replace_internal_templates(content: string) {
    for (let template_pattern in internal_templates_map) {
        if (content.contains(template_pattern)) {
            let new_content = await internal_templates_map[template_pattern]();
            content = content.replace(
                new RegExp(template_pattern, "g"), 
                new_content
            );
        }
    }

    return content;
}

async function templater_daily_quote() {
    let response = await axios.get("https://quotes.rest/qod");
    let author = response.data.contents.quotes[0].author;
    let quote = response.data.contents.quotes[0].quote;

    let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;
    return new_content;
}