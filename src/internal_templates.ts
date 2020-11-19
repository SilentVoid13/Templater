import { App, Notice } from 'obsidian';
import axios from 'axios';
import moment from 'moment';

// Check https://github.com/SilentVoid13/Templater/blob/master/INTERNAL_TEMPLATES.md to see how to develop your own internal template

export const internal_templates_map: {[id: string]: Function} = {
    "title": tp_title,
    "today": tp_today,
    "tomorrow": tp_tomorrow,
    "yesterday": tp_yesterday,
    "daily_quote": tp_daily_quote,
    "random_picture": tp_random_picture,
    "title_picture": tp_title_picture,
};

export async function replace_internal_templates(app: App, content: string) {
    if (content.contains("templater_")) {
        new Notice("Internal templates changed ! They are now prefixed with tp_ and you can pass them arguments ! Check the plugin README page on Internal templates for more informations.");
    }

    for (let template_pattern in internal_templates_map) {
        let pattern = `{{\\s*tp_${template_pattern}\\s*(?::(.*?))?}}`;
        let regex = new RegExp(pattern);
        let match; 
        while((match = regex.exec(content)) !== null) {
            let args = {};
            if (match[1] !== null) {
                args = await parse_arguments(match[1]);
            }

            let new_content = await internal_templates_map[template_pattern](app, args);
            content = content.replace(
                match[0], 
                new_content
            );
        }
    }

    return content;
}

async function parse_arguments(arg_str: string) {
    arg_str += ",";
    let regex = /\s*([\w]+)=([^,]*),\s*/gmi;
    let args: {[key: string]: string} = {};
    let match;
    while((match = regex.exec(arg_str)) !== null) {
        args[match[1]] = match[2];
    }

    return args;
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
    if (Object.keys(args).length === 0) {
        response = await axios.get("https://source.unsplash.com/1600x900");
    }
    else {
        let size = args["size"];
        response = await axios.get(`https://source.unsplash.com/random/${size}`);
    }

    let url = response.request.responseURL;
    let new_content = `![random_image](${url})`
    return new_content;
}

async function tp_title_picture(app: App, args: {[key: string]: string}): Promise<String> {
    let title = app.workspace.activeLeaf.getDisplayText();
    let response;
    if (Object.keys(args).length === 0) {
        response = await axios.get(`https://source.unsplash.com/featured/1600x900/?${title}`);
    }
    else {
        let size = args["size"];
        response = await axios.get(`https://source.unsplash.com/featured/${size}/?${title}`);
    }

    let url = response.request.responseURL;
    let new_content = `![title_image](${url})`
    return new_content;
}

async function tp_title(app: App, _args: {[key: string]: string}): Promise<String> {
    let activeLeaf = app.workspace.activeLeaf;
    return activeLeaf.getDisplayText();
}

async function tp_today(_app: App, args: {[key: string]: string}): Promise<String> {
    let today;
    if (Object.keys(args).length === 0) {
        today = moment().format("YYYY-MM-DD");
    }
    else {
        let format = args["f"];
        today = moment().format(format);
    }
    return today;
}

async function tp_tomorrow(_app: App, args: {[key: string]: string}): Promise<String> {
    let tomorrow;
    if (Object.keys(args).length === 0) {
        tomorrow = moment().add(1,'days').format("YYYY-MM-DD");
    }
    else {
        let format = args["f"];
        tomorrow = moment().add(1,'days').format(format);
    }
    return tomorrow;
}

async function tp_yesterday(_app: App, args: {[key: string]: string}): Promise<String> {
    let yesterday;
    if (Object.keys(args).length === 0) {
        yesterday = moment().add(-1,'days').format("YYYY-MM-DD");
    }
    else {
        let format = args["f"];
        yesterday = moment().add(-1,'days').format(format);
    }
    return yesterday;
}