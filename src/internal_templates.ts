import { App, Notice } from 'obsidian';
import axios from 'axios';
import moment from 'moment';

// Check https://github.com/SilentVoid13/Templater/blob/master/INTERNAL_TEMPLATES.md to see how to develop your own internal template

export const internal_templates_map: {[id: string]: Function} = {
    "title": tp_title,
    "today": tp_today,
    "tomorrow": tp_tomorrow,
    "yesterday": tp_yesterday,
    "time": tp_time,
    "daily_quote": tp_daily_quote,
    "random_picture": tp_random_picture,
    "title_picture": tp_title_picture,
};

export async function replace_internal_templates(app: App, content: string) {
    if (content.contains("templater_")) {
        new Notice("Internal templates changed ! They are now prefixed with tp_ and you can pass them arguments ! Check the plugin README page on Internal templates for more informations.");
    }

    for (let template_pattern in internal_templates_map) {
        let pattern = `{{[ \\t]*tp_${template_pattern}[ \\t]*(?::(.*?))?}}`;
        let regex = new RegExp(pattern);
        let match; 
        while((match = regex.exec(content)) !== null) {
            let args = {};
            if (match[1] !== null) {
                args = await parse_arguments(match[1]);
            }

            try {
                let new_content = await internal_templates_map[template_pattern](app, args);
                content = content.replace(
                    match[0], 
                    new_content
                );
            }
            catch(error) {
                console.log(`Error with internal template tp_${template_pattern}: ${error}`);
                new Notice(`Error with internal template tp_${template_pattern}, check the console for more informations.`);

                content = content.replace(
                    match[0], 
                    "Internal_Template_Error"
                );
            }
        }
    }

    return content;
}

async function parse_arguments(arg_str: string) {
    arg_str += ",";
    let regex = /[ \t]*([^=\n\r]+)=(?:(?:[ \t]*(?:"([^"\\\n\r]*(?:\\.[^"\\\n\r]*)*)")[ \t]*)|(?:[ \t]*(?:'([^'\\\n\r]*(?:\\.[^'\\\n\r]*)*)')[ \t]*)|([^,\n\r]+)),[ \t]*/gmi;
    let args: {[key: string]: string} = {};
    let match;

    while((match = regex.exec(arg_str)) !== null) {
        let value; 
        
        // Double quotes
        if (match[2] !== undefined) {
            value = match[2];
        }
        // Single quotes
        else if (match[3] !== undefined) {
            value = match[3];
        }
        // No quotes
        else {
            value = match[4];
        }

        value = value.replace(new RegExp("\\\\'", "g"), "'");
        value = value.replace(new RegExp("\\\\\"", "g"), "\"");

        args[match[1]] = value;
    }

    return args;
}

function existing_argument(args: {[key: string]: string}, arg_name: string) {
    if (Object.keys(args).length === 0 || args[arg_name] === undefined) {
        return false;
    }
    return true;
}

async function tp_daily_quote(_app: App, _args: {[key: string]: string}): Promise<String> {
    let response = await axios.get("https://quotes.rest/qod");
    let author = response.data.contents.quotes[0].author;
    let quote = response.data.contents.quotes[0].quote;

    let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;
    return new_content;
}

async function tp_random_picture(_app: App, args: {[key: string]: string}): Promise<String> {
    let response;
    if (existing_argument(args, "size")) {
        let size = args["size"];
        response = await axios.get(`https://source.unsplash.com/random/${size}`);
    }
    else {
        response = await axios.get("https://source.unsplash.com/1600x900");
    }

    let url = response.request.responseURL;
    let new_content = `![random_image](${url})`
    return new_content;
}

async function tp_title_picture(app: App, args: {[key: string]: string}): Promise<String> {
    let activeLeaf = app.workspace.activeLeaf;
    if (activeLeaf == null) {
        throw new Error("app.activeLeaf is null");
    }

    let title = activeLeaf.getDisplayText();
    let response;
    if (existing_argument(args, "size")) {
        let size = args["size"];
        response = await axios.get(`https://source.unsplash.com/featured/${size}/?${title}`);
    }
    else {
        response = await axios.get(`https://source.unsplash.com/featured/1600x900/?${title}`);
    }

    let url = response.request.responseURL;
    let new_content = `![title_image](${url})`
    return new_content;
}

async function tp_title(app: App, _args: {[key: string]: string}): Promise<String> {
    let activeLeaf = app.workspace.activeLeaf;
    if (activeLeaf == null) {
        throw new Error("app.activeLeaf is null");
    }
    
    return activeLeaf.getDisplayText();
}

async function tp_today(_app: App, args: {[key: string]: string}): Promise<String> {
    let today;
    if (existing_argument(args, "f")) {
        let format = args["f"];
        today = moment().format(format);
    }
    else {
        today = moment().format("YYYY-MM-DD");
    }
    return today;
}

async function tp_tomorrow(_app: App, args: {[key: string]: string}): Promise<String> {
    let tomorrow;
    if (existing_argument(args, "f")) {
        let format = args["f"];
        tomorrow = moment().add(1,'days').format(format);
    }
    else {
        tomorrow = moment().add(1,'days').format("YYYY-MM-DD");
    }
    return tomorrow;
}

async function tp_yesterday(_app: App, args: {[key: string]: string}): Promise<String> {
    let yesterday;
    if (existing_argument(args, "f")) {
        let format = args["f"];
        yesterday = moment().add(-1,'days').format(format);
    }
    else {
        yesterday = moment().add(-1,'days').format("YYYY-MM-DD");
    }
    return yesterday;
}

async function tp_time(app: App, args: {[key: string]: string}): Promise<String> {
    let time;
    if (existing_argument(args, "f")) {
        let format = args["f"];
        time = moment().format(format);
    }
    else {
        time = moment().format("HH:mm");
    }
    return time;
}