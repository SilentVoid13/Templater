import { App, MarkdownView, normalizePath, Notice, TFile } from 'obsidian';
import axios from 'axios';
import moment from 'moment';
import { INCLUSION_LIMIT } from './constants';
import { get_date_string } from './i18n';
import { format } from 'path';

// Check https://github.com/SilentVoid13/Templater/blob/master/INTERNAL_TEMPLATES.md to see how to develop your own internal template

export const internal_templates_map: {[id: string]: Function} = {
    "include": tp_include,
    "title": tp_title,
    "folder": tp_folder,
    "tomorrow": tp_tomorrow,
    "today": tp_today,
    "yesterday": tp_yesterday,
    "time": tp_time,
    "daily_quote": tp_daily_quote,
    "random_picture": tp_random_picture,
    "title_picture": tp_title_picture,
    "creation_date": tp_creation_date,
    "last_modif_date": tp_last_modif_date,
    "title_tomorrow": tp_title_tomorrow,
    "title_today": tp_title_today,
    "title_yesterday": tp_title_yesterday,
};

export async function replace_internal_templates(app: App, content: string) {
    let nested_count = 0;
    let children: Array<number> = Array();

    for (let template_pattern in internal_templates_map) {
        let pattern = `{{[ \\t]*tp_${template_pattern}[ \\t]*(?::(.*?))?}}`;
        let regex = new RegExp(pattern);
        let global_regex = new RegExp(pattern, "g");
        let match;

        while((match = regex.exec(content)) !== null) {
            let args = {};
            if (match[1] !== null) {
                args = await parse_arguments(match[1]);
            }

            try {
                if (nested_count < INCLUSION_LIMIT) {
                    let new_content: string = await internal_templates_map[template_pattern](app, args);
                    content = content.replace(
                        match[0], 
                        new_content
                    );

                    if (template_pattern === "include") {
                        let n_child = (new_content.match(global_regex) || []).length;

                        if (n_child > 0) {
                            nested_count += 1;
                            children.push(n_child);
                        }
                        else {
                            let i = children.length-1;
                            while (children[i--] === 1) {
                                children.pop();
                                nested_count -= 1;
                            }
                            children[children.length-1] -= 1;
                        }
                    }
                }
                else {
                    throw new Error("Reached inclusion depth limit (max: 10), tp_include ignored");
                }
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

function get_argument(args: {[key: string]: string}, arg_name: string, default_value: string) {
    if (existing_argument(args, arg_name)) {
        return args[arg_name];
    }
    return default_value;
}

///////////////////////////////////////////
// Date Internal Templates
///////////////////////////////////////////

async function tp_tomorrow(_app: App, args: {[key: string]: string}): Promise<String> {
    let format = get_argument(args, "f", "YYYY-MM-DD");
    let tomorrow = get_date_string(format, 1);
    return tomorrow;
}

async function tp_today(_app: App, args: {[key: string]: string}): Promise<String> {
    let format = get_argument(args, "f", "YYYY-MM-DD");
    let today = get_date_string(format);
    return today;
}

async function tp_yesterday(_app: App, args: {[key: string]: string}): Promise<String> {
    let format = get_argument(args, "f", "YYYY-MM-DD");
    let yesterday = get_date_string(format, -1);
    return yesterday;
}

async function tp_time(_app: App, args: {[key: string]: string}): Promise<String> {
    let format = get_argument(args, "f", "HH:mm");
    let time = get_date_string(format);
    return time;
}

function parse_tp_title_date_args(app: App, args: {[key: string]: string}) {
    let activeLeaf = app.workspace.activeLeaf;
    if (activeLeaf == null) {
        throw new Error("app.activeLeaf is null");
    }
    let title = activeLeaf.getDisplayText();
    let title_format = get_argument(args, "title_f", "YYYY-MM-DD");

    if(!moment(title, title_format).isValid()){
        throw new Error("Invalid title date format, try specifying one with the argument 'title_f'");
    }
    
    let format = get_argument(args, "f", title_format);
    return [title, format, title_format];
}

async function tp_title_tomorrow(app: App, args: {[key: string]: string}): Promise<String> {
    let [title, format, title_format] = parse_tp_title_date_args(app, args);
    let title_tomorrow = get_date_string(format, 1, title, title_format);
    return title_tomorrow;
}

async function tp_title_today(app: App, args: {[key: string]: string}): Promise<String> {
    let [title, format, title_format] = parse_tp_title_date_args(app, args);
    let title_today = get_date_string(format, undefined, title, title_format);
    return title_today;
}

async function tp_title_yesterday(app: App, args: {[key: string]: string}): Promise<String> {
    let [title, format, title_format] = parse_tp_title_date_args(app, args);
    let title_today = get_date_string(format, -1, title, title_format);
    return title_today;
}

async function tp_creation_date(app: App, args: {[key: string]: string}): Promise<String> {
    let active_view = app.workspace.getActiveViewOfType(MarkdownView);
    if (active_view == null) {
        throw new Error("Active view is null");
    }
    let format = get_argument(args, "f", "YYYY-MM-DD HH:mm");
    let creation_date = get_date_string(format, undefined, active_view.file.stat.ctime);
    return creation_date;
}

async function tp_last_modif_date(app: App, args: {[key: string]: string}): Promise<String> {
    let active_view = app.workspace.getActiveViewOfType(MarkdownView);
    if (active_view == null) {
        throw new Error("Active view is null");
    }
    let format = get_argument(args, "f", "YYYY-MM-DD HH:mm");
    let modif_date = get_date_string(format, undefined, active_view.file.stat.mtime);
    return modif_date;
}

///////////////////////////////////////////
// Pictures Internal Templates
///////////////////////////////////////////

async function tp_random_picture(_app: App, args: {[key: string]: string}): Promise<String> {
    let response;
    if (existing_argument(args, "size") || existing_argument(args, "query")) {
        let size = args["size"];
        let query = args["query"];

        let u = "https://source.unsplash.com/random/";

        if (size) {
            u += size;
        }
        if (query) {
            u += `?${query}`;
        }
        response = await axios.get(u);
    }
    else {
        response = await axios.get("https://source.unsplash.com/random/1600x900");
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

///////////////////////////////////////////
// Misc Internal Templates
///////////////////////////////////////////

async function tp_daily_quote(_app: App, _args: {[key: string]: string}): Promise<String> {
    let response = await axios.get("https://quotes.rest/qod");
    let author = response.data.contents.quotes[0].author;
    let quote = response.data.contents.quotes[0].quote;
    let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;
    return new_content;
}

async function tp_title(app: App, _args: {[key: string]: string}): Promise<String> {
    let activeLeaf = app.workspace.activeLeaf;
    if (activeLeaf == null) {
        throw new Error("app.activeLeaf is null");
    }
    return activeLeaf.getDisplayText();
}

async function tp_folder(app: App, args: {[key: string]: string}): Promise<String> {
    let active_view = app.workspace.getActiveViewOfType(MarkdownView);
    if (active_view == null) {
        throw new Error("Active view is null");
    }
    let parent = active_view.file.parent;
    let folder;

    if (existing_argument(args, "vault_path")) {
        folder = parent.path;
    }
    else {
        folder = parent.name;
    }

    return folder;
}

async function tp_include(app: App, args: {[key: string]: string}): Promise<String> {
    if (!existing_argument(args, "f")) {
        throw new Error("No file argument passed to tp_include");
    }
    let f = args["f"];

    let file = app.metadataCache.getFirstLinkpathDest(normalizePath(f), "");
    if (!file) {
        throw new Error(`File ${f} passed to tp_include doesn't exist`);
    }
    if (!(file instanceof TFile)) {
        throw new Error(`tp_include: ${f} is a folder, not a file`);
    }

    let content = await app.vault.read(file);

    return content;
}