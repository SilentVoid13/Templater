mod utils;
mod parser;
mod obsidian_api;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

use web_sys::console;
use parser::CommandParser;
use obsidian_api::{TFile, Plugin, App, MarkdownView};

use crate::obsidian_api::WorkspaceLeaf;

#[wasm_bindgen]
pub struct Templater {
    plugin: Plugin,
    //parser: CommandParser,
}

#[wasm_bindgen]
impl Templater {
    pub fn new(plugin: Plugin) -> Self {
        Templater {
            plugin
        }
    }

    #[wasm_bindgen]
    pub fn append_template_to_active_file(&self, template: &TFile) {
        let app = self.plugin.app();

        let a = WorkspaceLeaf::new();

        //let md = MarkdownView::new(&WorkspaceLeaf::new());
        
        //let closure: Closure<dyn FnMut(WorkspaceLeaf) -> MarkdownView> = Closure::new(MarkdownView::new);
        //let active_view = app.workspace().get_active_view_of_type(&closure.as_ref().unchecked_ref());
        //let active_view = app.workspace().get_active_view_of_type(&MarkdownView::new);
        //let active_view = app.workspace().get_active_view_of_type(&md);
    }
}

#[wasm_bindgen]
pub async fn init_templater(plugin: Plugin) -> Templater {
    Templater::new(plugin)
}

// TODO
/// Creates a new note in the folder `creation_folder` 
/// with the parsed template `file` as content
///
/// if `creation_folder` is empty, gets the folder with the `newFileLocation`
/// vault setting
pub async fn create_new_note_from_template(file: TFile, creation_folder: Option<&str>) {

}

// TODO
/// Appends the parsed template `file` to the active file
pub async fn append_template(app: App, file: &TFile) {
    let vault = app.vault();
    let content = vault.read(file).await;
    let content = content.as_string().unwrap();
}

// TODO
/// Gets the active file and calls overwite_file_templates
pub async fn overwrite_active_file_templates() {
}

// TODO
/// Parses and overwrites commands in `file`
pub async fn overwrite_file_templates(file: TFile) {

}

pub fn parse_commands(file: TFile) -> String {
    let _parser = CommandParser::new();
    return String::new()
}

// TODO
pub async fn process_dynamic_template() {

}

// TODO
pub async fn jump_to_next_cursor_location() {

}
