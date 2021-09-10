mod utils;
mod parser;

use wasm_bindgen::prelude::*;
use obsidian_api_rs::*;
use web_sys::console;
use parser::CommandParser;

#[wasm_bindgen]
pub async fn load_templater(plugin: Plugin) {
      
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
pub async fn append_template(file: TFile) {

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
