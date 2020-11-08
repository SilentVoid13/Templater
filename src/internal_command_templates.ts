import { App, MarkdownSourceView, MarkdownView, Notice } from 'obsidian';

// Check https://github.com/SilentVoid13/Templater/blob/master/INTERNAL_COMMAND_TEMPLATES.md to see how to develop your own internal command template

export const internal_command_templates_map: {[id: string]: Function} = {
    "{{note_title}}": note_title,
    "{{note_content}}": note_content,
};

export async function replace_internal_command_templates(app: App, command: string) {
    for (let template_pattern in internal_command_templates_map) {
        if (command.contains(template_pattern)) {
            try {
                let new_content = await internal_command_templates_map[template_pattern](app);
                command = command.replace(
                    new RegExp(template_pattern, "g"), 
                    new_content
                );
            }
            catch(error) {
                console.log(`Error with the internal template ${template_pattern}:\n`, error);
				new Notice(`Error with the internal template ${template_pattern} (check console for more informations)`);
            }
        }
    }

    return command;
}

// This is a duplicate of the templater_title() function, but i prefer to keep things separated
async function note_title(app: App): Promise<string> {
    let activeLeaf = app.workspace.activeLeaf;
    return activeLeaf.getDisplayText();
}

async function note_content(app: App): Promise<string> {
    let activeLeaf = app.workspace.activeLeaf;
    if (!(activeLeaf) || !(activeLeaf.view instanceof MarkdownView)) {
        throw new Error("activeLeaf.view is not an instance of MarkdownView")
    }

    return activeLeaf.view.data;
}