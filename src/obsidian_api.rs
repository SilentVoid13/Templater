use wasm_bindgen::prelude::*;
use js_sys::{ Promise, Array, ArrayBuffer, Function };
use web_sys::HtmlElement;

#[wasm_bindgen(module = "obsidian")]
extern "C" {
    // TODO: See how to deal with generics
	//#[wasm_bindgen(extends = ValueComponent, extends = BaseComponent, extends = Object)]
    //pub type AbstractTextComponent;

    pub type App;
        #[wasm_bindgen(method, getter)]
        pub fn keymap(this: &App) -> Keymap;
        #[wasm_bindgen(method, getter)]
        pub fn scope(this: &App) -> Scope;
        #[wasm_bindgen(method, getter)]
        pub fn workspace(this: &App) -> Workspace;
        #[wasm_bindgen(method, getter)]
        pub fn vault(this: &App) -> Vault;
        #[wasm_bindgen(method, getter, js_name = metadataCache)]
        pub fn metadata_cache(this: &App) -> MetadataCache;
        #[wasm_bindgen(method, getter, js_name = fileManager)]
        pub fn file_manager(this: &App) -> FileManager;

    pub type BaseComponent;

    #[wasm_bindgen(extends = CacheItem)]
    pub type BlockCache;

    #[wasm_bindgen(extends = SubpathResult)]
    pub type BlockSubpathResult;

    #[wasm_bindgen(extends = BaseComponent)]
    pub type ButtonComponent;

    pub type CachedMetadata;

    pub type CacheItem;

    pub type CloseableComponent;

    pub type Command;

    pub type Component;

    // TODO: Constructor with generic
    //pub type Constructor;

    pub type DataAdapter;

    pub type DataWriteOptions;

    // TODO: Debouncer with generic
    //pub type Debouncer;

    // TODO: Deal with generics
    #[wasm_bindgen(extends = ValueComponent)]
    pub type DropdownComponent;

    #[wasm_bindgen(extends = FileView)]
    pub type EditableFileView;

    pub type Editor;

    #[wasm_bindgen(extends = EditorRangeOrCaret)]
    pub type EditorChange;

    // TODO?
    pub type EditorCommandName;

    pub type EditorPosition;

    pub type EditorRange;

    pub type EditorRangeOrCaret;

    pub type EditorSelection;

    pub type EditorSelectionOrCaret;

    pub type EditorTransaction; 

    #[wasm_bindgen(extends = ReferenceCache)]
    pub type EmbedCache;

    pub type EventRef;

    pub type Events;

    pub type Extension;

    #[wasm_bindgen(extends = BaseComponent)]
    pub type ExtraButtonComponent;

    pub type FileManager;

    pub type FileStats;

    #[wasm_bindgen(extends = DataAdapter)]
    pub type FileSystemAdapter;

    #[wasm_bindgen(extends = ItemView)]
    pub type FileView;

    #[wasm_bindgen(extends = CacheItem)]
    pub type FrontMatterCache;

    // TODO: FuzzyMatch with generic
    //pub type FuzzyMatch;
    
    // TODO: FuzzySuggestModal with generic
    //pub type FuzzySuggestModal;

    #[wasm_bindgen(extends = CacheItem)]
    pub type HeadingCache;

    #[wasm_bindgen(extends = SubpathResult)]
    pub type HeadingSubpathResult;

    pub type Hotkey;

    pub type HoverParent;

    #[wasm_bindgen(extends = Component)]
    pub type HoverPopover;

    pub type Instruction;

    // TODO: ISuggestOwner with generic
    //pub type ISuggestOwner;

    #[wasm_bindgen(extends = View)]
    pub type ItemView;

    pub type Keymap;

    #[wasm_bindgen(extends = KeymapInfo)]
    pub type KeymapContext;

    #[wasm_bindgen(extends = KeymapInfo)]
    pub type KeymapEventHandler;

    // TODO:?
    pub type KeymapEventListener;

    pub type KeymapInfo;

    #[wasm_bindgen(extends = ReferenceCache)]
    pub type LinkCache;

    pub type ListedFiles;

    #[wasm_bindgen(extends = CacheItem)]
    pub type ListItemCache;

    pub type Loc;

    #[wasm_bindgen(extends = MarkdownSubView, extends = HoverParent)]
    pub type MarkdownEditView;

    pub type MarkdownPostProcessor;

    pub type MarkdownPostProcessorContext;

    #[wasm_bindgen(extends = Component)]
    pub type MarkdownPreviewEvents;

    pub type MarkdownPreviewRenderer;

    #[wasm_bindgen(extends = MarkdownRenderer, extends = MarkdownSubView, extends = MarkdownPreviewEvents)]
    pub type MarkdownPreviewView;

    #[wasm_bindgen(extends = Component)]
    pub type MarkdownRenderChild;

    #[wasm_bindgen(extends = MarkdownRenderChild, extends = MarkdownPreviewEvents, extends = HoverParent)]
    pub type MarkdownRenderer;

    pub type MarkdownSectionInformation;

    #[wasm_bindgen(extends = MarkdownSubView, extends = HoverParent)]
    pub type MarkdownSourceView;

    pub type MarkdownSubView;

    #[wasm_bindgen(extends = TextFileView)]
    pub type MarkdownView;
        #[wasm_bindgen(constructor)]
        pub fn new(leaf: &WorkspaceLeaf) -> MarkdownView;

    // TODO:?
    pub type MarkdownViewModeType;

    #[wasm_bindgen(extends = Component)]
    pub type Menu;

    pub type MenuItem;

    #[wasm_bindgen(extends = Events)]
    pub type MetadataCache;

    #[wasm_bindgen(extends = CloseableComponent)]
    pub type Modal;

    // TODO:?
    pub type Modifier;

    #[wasm_bindgen(extends = TextComponent)]
    pub type MomentFormatComponent;

    pub type Notice;

    pub type ObsidianProtocolData;

    // TODO:?
    pub type ObsidianProtocolHandler;

    pub type OpenViewState;



    #[wasm_bindgen(extends = Component)]
    pub type Plugin;
        #[wasm_bindgen(method, getter)]
        pub fn app(this: &Plugin) -> App;
        #[wasm_bindgen(method, getter)]
        pub fn manifest(this: &Plugin) -> PluginManifest;
        #[wasm_bindgen(constructor)]
        pub fn new(app: &App, manifest: &PluginManifest) -> Plugin;
        #[wasm_bindgen(method, js_name = addRibbonIcon)]
        pub fn add_ribbon_icon(this: &Plugin, icon: &str, title: &str, callback: &Function) -> HtmlElement;
        #[wasm_bindgen(method, js_name = addStatusBarItem)]
        pub fn add_status_bar_item(this: &Plugin) -> HtmlElement;
        #[wasm_bindgen(method, js_name = addCommand)]
        pub fn add_command(this: &Plugin, command: &Command) -> Command;
        #[wasm_bindgen(method, js_name = addSettingTab)]
        pub fn add_setting_tab(this: &Plugin, setting_tab: PluginSettingTab);
        #[wasm_bindgen(method, js_name = registerView)]
        pub fn register_view(this: &Plugin, type_view: &str, view_creator: &ViewCreator);
        #[wasm_bindgen(method, js_name = registerExtensions)]
        pub fn register_extensions(this: &Plugin, extensions: &Array, view_type: &str);
        #[wasm_bindgen(method, js_name = registerMarkdownPostProcessor)]
        pub fn register_markdown_post_processor(this: &Plugin, post_processor: &MarkdownPostProcessor) -> MarkdownPostProcessor;
        #[wasm_bindgen(method, js_name = registerMarkdownCodeBlockProcessor)]
        pub fn register_markdown_codeblock_processor(this: &Plugin, language: &str, handler: &Function) -> MarkdownPostProcessor;
        #[wasm_bindgen(method, js_name = registerCodeMirror)]
        pub fn register_codemirror(this: &Plugin, callback: &Function);
        #[wasm_bindgen(method, js_name = registerEditorExtension)]
        pub fn register_editor_extension(this: &Plugin, extension: &Extension);
        #[wasm_bindgen(method, js_name = registerObsidianProtocolHandler)]
        pub fn register_obsidian_protocol_handler(this: &Plugin, action: &str, handler: &ObsidianProtocolHandler);
        #[wasm_bindgen(method, js_name = loadData)]
        pub async fn load_data(this: &Plugin) -> JsValue;
        #[wasm_bindgen(method, js_name = saveData)]
        pub async fn save_data(this: &Plugin, data: &JsValue);


    pub type PluginManifest;

    #[wasm_bindgen(extends = SettingTab)]
    pub type PluginSettingTab;

    pub type Point;

    pub type PopoverState;

    pub type Pos;

    pub type PreparedQuery;

    #[wasm_bindgen(extends = CacheItem)]
    pub type ReferenceCache;

    pub type RequestParam;

    pub type Scope;


    // TODO: SearchComponent with generic
    //pub type SearchComponent;

    // TODO:?
    pub type SearchMatches;

    // TODO:?
    pub type SearchMatchPart;

    pub type SearchResult;

    pub type SearchResultContainer;

    #[wasm_bindgen(extends = CacheItem)]
    pub type SectionCache;

    pub type Setting;

    pub type SettingTab;

    // TODO: SliderComponent with generic
    //pub type SliderComponent;

    // TODO:?
    pub type SplitDirection;

    pub type Stat;

    pub type SubpathResult;

    // TODO: SuggestModal with generic
    //pub type SuggestModal;

    pub type TAbstractFile;

    #[wasm_bindgen(extends = CacheItem)]
    pub type TagCache;

    pub type Tasks;


    // TODO: TextAreaComponent with generic
    //pub type TextAreaComponent;

    // TODO: TextComponent with generic
    pub type TextComponent;

    #[wasm_bindgen(extends = EditableFileView)]
    pub type TextFileView;

    #[wasm_bindgen(extends = TAbstractFile)]
    pub type TFile;

    #[wasm_bindgen(extends = TAbstractFile)]
    pub type TFolder;

    // TODO: ToggleComponent with generic
    //pub type ToggleComponent;

    // TODO: ValueComponent with generic
    pub type ValueComponent;


    #[wasm_bindgen(extends = Events)]
    pub type Vault;
        #[wasm_bindgen(method)]
        pub fn adapter(this: &Vault) -> DataAdapter;
        #[wasm_bindgen(method, js_name = configDir)]
        pub fn config_dir(this: &Vault) -> String;
        #[wasm_bindgen(method, js_name = getName)]
        pub fn get_name(this: &Vault) -> String; 
        // TODO: getAbstractFileByPath
        #[wasm_bindgen(method, js_name = getRoot)]
        pub fn get_root(this: &Vault) -> TFolder; 
        #[wasm_bindgen(method)]
        pub fn create(this: &Vault, path: &str, data: &str, options: Option<DataWriteOptions>) -> Promise;
        #[wasm_bindgen(method, js_name = createBinary)]
        pub fn create_binary(this: &Vault, path: &str, data: &ArrayBuffer, options: Option<DataWriteOptions>) -> Promise; 
        #[wasm_bindgen(method, js_name = createFolder)]
        pub fn create_folder(this: &Vault, path: &str) -> Promise;
        #[wasm_bindgen(method)]
        pub async fn read(this: &Vault, file: &TFile) -> JsValue;
        #[wasm_bindgen(method, js_name = cacheRead)]
        pub fn cached_read(this: &Vault, file: &TFile) -> Promise;
        #[wasm_bindgen(method, js_name = readBinary)]
        pub fn read_binary(this: &Vault, file: &TFile) -> Promise;
        #[wasm_bindgen(method, js_name = getResourcePath)]
        pub fn get_resource_path(this: &Vault, file: &TFile) -> Promise;
        #[wasm_bindgen(method)]
        pub fn delete(this: &Vault, file: &TAbstractFile, force: Option<bool>) -> Promise;
        #[wasm_bindgen(method)]
        pub fn trash(this: &Vault, file: &TAbstractFile, system: bool) -> Promise;
        #[wasm_bindgen(method)]
        pub fn rename(this: &Vault, file: &TAbstractFile, new_path: &str) -> Promise;
        #[wasm_bindgen(method)]
        pub fn modify(this: &Vault, file: &TFile, data: &str, options: Option<DataWriteOptions>) -> Promise;
        #[wasm_bindgen(method, js_name = modifyBinary)]
        pub fn modify_binary(this: &Vault, file: &TFile, data: &ArrayBuffer, options: Option<DataWriteOptions>) -> Promise;
        #[wasm_bindgen(method)]
        pub fn copy(this: &Vault, file: &TFile, new_path: &str) -> Promise;
        #[wasm_bindgen(method, js_name = getAllLoadedFiles)]
        pub fn get_all_loaded_files(this: &Vault) -> Array;
        // TODO: recurseChildren
        #[wasm_bindgen(method, js_name = getMarkdownFiles)]
        pub fn get_markdown_files(this: &Vault) -> Array;
        #[wasm_bindgen(method, js_name = getFiles)]
        pub fn get_files(this: &Vault) -> Array;
        #[wasm_bindgen(method)]
        pub fn on(this: &Vault, name: &str, callback: &Function, ctx: JsValue) -> EventRef;



    #[wasm_bindgen(extends = Component)]
    pub type View;

    // TODO:?
    pub type ViewCreator;

    pub type ViewState;

    pub type ViewStateResult;

    #[wasm_bindgen(extends = Events)]
    pub type Workspace;
        #[wasm_bindgen(method, js_name = getActiveViewOfType)]
        //pub fn get_active_view_of_type(this: &Workspace, typ: &Function) -> JsValue;
        pub fn get_active_view_of_type(this: &Workspace, typ: &JsValue) -> JsValue;

    #[wasm_bindgen(extends = Events)]
    pub type WorkspaceItem;

    #[wasm_bindgen(extends = WorkspaceItem)]
    pub type WorkspaceLeaf;
        #[wasm_bindgen(constructor)]
        pub fn new() -> WorkspaceLeaf;

    #[wasm_bindgen(extends = WorkspaceParent)]
    pub type WorkspaceMobileDrawer;

    #[wasm_bindgen(extends = WorkspaceItem)]
    pub type WorkspaceParent;

    pub type WorkspaceRibbon;

    #[wasm_bindgen(extends = WorkspaceSplit)]
    pub type WorkspaceSidedock;

    #[wasm_bindgen(extends = WorkspaceParent)]
    pub type WorkspaceSplit;

    #[wasm_bindgen(extends = WorkspaceParent)]
    pub type WorkspaceTabs;
}
