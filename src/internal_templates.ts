import { App, MarkdownView, normalizePath, Notice, TFile } from 'obsidian';
import axios from 'axios';
import moment from 'moment';
import { INCLUSION_LIMIT } from './constants';

// Check https://github.com/SilentVoid13/Templater/blob/master/INTERNAL_TEMPLATES.md to see how to develop your own internal template

export const internal_templates_map: {[id: string]: Function} = {
    "include": tp_include,
    "title": tp_title,
    "folder": tp_folder,
    "today": tp_today,
    "tomorrow": tp_tomorrow,
    "yesterday": tp_yesterday,
    "time": tp_time,
    "daily_quote": tp_daily_quote,
    "random_picture": tp_random_picture,
    "title_picture": tp_title_picture,
    "creation_date": tp_creation_date,
    "last_modif_date": tp_last_modif_date,
    "nextday": tp_nextday,
    "prevday": tp_prevday
};

export async function replace_internal_templates(app: App, content: string) {
    if (content.contains("templater_")) {
        new Notice("Internal templates changed ! They are now prefixed with tp_ and you can pass them arguments ! Check the plugin README page on Internal templates for more informations.");
    }

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

async function tp_daily_quote(_app: App, _args: {[key: string]: string}): Promise<String> {
    let response = await axios.get("https://quotes.rest/qod");
    let author = response.data.contents.quotes[0].author;
    let quote = response.data.contents.quotes[0].quote;

    let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;
    return new_content;
}

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

async function tp_time(_app: App, args: {[key: string]: string}): Promise<String> {
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

async function tp_creation_date(app: App, args: {[key: string]: string}): Promise<String> {
    let active_view = app.workspace.getActiveViewOfType(MarkdownView);
    if (active_view == null) {
        throw new Error("Active view is null");
    }
    
    let creation_date;
    if (existing_argument(args, "f")) {
        let format = args["f"];
        creation_date = moment(active_view.file.stat.ctime).format(format);
    }
    else {
        creation_date = moment(active_view.file.stat.ctime).format("YYYY-MM-DD HH:mm");
    }

    return creation_date;
}

async function tp_last_modif_date(app: App, args: {[key: string]: string}): Promise<String> {
    let active_view = app.workspace.getActiveViewOfType(MarkdownView);
    if (active_view == null) {
        throw new Error("Active view is null");
    }

    let modif_date;
    if (existing_argument(args, "f")) {
        let format = args["f"];
        modif_date = moment(active_view.file.stat.mtime).format(format);
    }
    else {
        modif_date = moment(active_view.file.stat.mtime).format("YYYY-MM-DD HH:mm");
    }

    return modif_date;
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

async function tp_nextday(app: App, args: {[key: string]: string}): Promise<String> {
    let nextday;
    let activeLeaf = app.workspace.activeLeaf;
    let title;
    //check for title and store value
    if (activeLeaf == null) {
        throw new Error("app.activeLeaf is null");
    }
    title = activeLeaf.getDisplayText();
    //check to make sure the title is a vald ISO8601 format
    if(moment(title, moment.ISO_8601).isValid()){
        //check for format flags
        if (existing_argument(args, "f")) {
            let format = args["f"];
            nextday = moment(title).add(1,'days').format(format);
        }
        else {
            let m = moment(title).add(1,'days');
            nextday = m.format(m.creationData().format); //create the next day with the original formatting
        }
    }
    else{ //non-ISO8601 format, failing over to default format
        nextday = moment(title).add(1, 'days').format("YYYY-MM-DD");
    }
    return nextday;
}

async function tp_prevday(app: App, args: {[key: string]: string}): Promise<String> {
    let prevday;
    let activeLeaf = app.workspace.activeLeaf;
    let title;
    //check for title and store value
    if (activeLeaf == null) {
        throw new Error("app.activeLeaf is null");
    }
    title = activeLeaf.getDisplayText();
    //check to make sure the title is a vald ISO8601 format
    if(moment(title, moment.ISO_8601).isValid()){
        //check for format flags
        if (existing_argument(args, "f")) {
            let format = args["f"];
            prevday = moment(title).add(-1,'days').format(format);
        }
        else {
            let m = moment(title).add(-1,'days');
            prevday = m.format(m.creationData().format); //create the next day with the original formatting
        }
    }
    else{ //non-ISO8601 format, failing over to default format
        prevday = moment(title).add(-1, 'days').format("YYYY-MM-DD");
    }
    return prevday;
}
