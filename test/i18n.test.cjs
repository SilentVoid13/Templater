const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function load(file, dependencies) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    const exports = {};
    vm.runInNewContext(outputText, {
        exports,
        require: (name) => {
            assert.ok(name in dependencies, `Unexpected runtime import: ${name}`);
            return dependencies[name];
        },
    });
    return exports;
}

test('every t() call resolves to an imported i18n translator', () => {
    const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
    assert.equal(config.error, undefined);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const checker = program.getTypeChecker();
    const audited = new Set();
    for (const source of program.getSourceFiles()) {
        if (!source.fileName.startsWith(path.join(root, 'src') + path.sep)) continue;
        function visit(node) {
            if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't') {
                const symbol = checker.getSymbolAtLocation(node.expression);
                const importSpecifier = symbol?.declarations?.find(ts.isImportSpecifier);
                assert.ok(importSpecifier, `Missing t import in ${source.fileName}`);
                assert.equal(importSpecifier.parent.parent.parent.moduleSpecifier.text, 'i18n');
                audited.add(path.relative(root, source.fileName));
            }
            ts.forEachChild(node, visit);
        }
        visit(source);
    }
    assert.ok(audited.has('src/settings/suggesters/FileSuggester.ts'));
    assert.ok(audited.size > 1);
});

for (const [language, templateError, scriptError] of [
    ['en', "Templates folder doesn't exist", "User Scripts folder doesn't exist"],
    ['zh', '模板文件夹不存在', '用户脚本文件夹不存在'],
]) {
    test(`file suggestions run without ReferenceError and translate both modes in ${language}`, () => {
        class TFile { constructor(filePath) { this.path = filePath; } }
        const obsidian = { getLanguage: () => language, TFile, AbstractInputSuggest: class {} };
        const { t } = load('src/i18n.ts', { obsidian });
        const fixtures = {
            templates: [new TFile('templates/Daily.md'), new TFile('templates/Weekly.md')],
            scripts: [new TFile('scripts/Daily.js'), new TFile('scripts/Utility.js')],
        };
        const errors = [];
        const { FileSuggest, FileSuggestMode } = load('src/settings/suggesters/FileSuggester.ts', {
            obsidian,
            i18n: { t },
            'utils/Utils': { get_tfiles_from_folder: (_app, folder) => {
                if (!fixtures[folder]) throw new Error('Missing fixture folder');
                return fixtures[folder];
            } },
            'utils/Error': { errorWrapperSync: (fn, message) => {
                try { return fn(); } catch { errors.push(message); return null; }
            } },
        });
        const plugin = { app: {}, settings: { templates_folder: 'templates', user_scripts_folder: 'scripts' } };
        for (const [mode, folder, expectedError] of [
            [FileSuggestMode.TemplateFiles, 'templates', templateError],
            [FileSuggestMode.ScriptFiles, 'scripts', scriptError],
        ]) {
            const suggest = new FileSuggest({}, plugin, mode);
            assert.equal(suggest.get_error_msg(mode), expectedError);
            assert.deepEqual(Array.from(suggest.getSuggestions('DAILY')), [fixtures[folder][0]]);
            const field = folder === 'templates' ? 'templates_folder' : 'user_scripts_folder';
            plugin.settings[field] = 'missing';
            assert.equal(suggest.getSuggestions('').length, 0);
            assert.equal(errors.pop(), expectedError);
        }
    });
}

test('t() falls back to window.localStorage language when getLanguage is unavailable', () => {
    const { t } = load('src/i18n.ts', { obsidian: {} });
    assert.equal(t('Done'), 'Done');
    const source = fs.readFileSync(path.join(root, 'src/i18n.ts'), 'utf8');
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    const exports = {};
    vm.runInNewContext(outputText, {
        exports,
        window: { localStorage: { getItem: (key) => (key === 'language' ? 'zh-CN' : null) } },
        require: (name) => (name === 'obsidian' ? {} : undefined),
    });
    assert.equal(exports.t('Done'), '完成');
    assert.equal(exports.t('Type text here'), '在此输入文本');
    assert.equal(exports.t('.'), '。');
});
