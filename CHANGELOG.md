# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.14.1](https://github.com/SilentVoid13/Templater/compare/2.14.0...2.14.1) (2025-08-07)


### Bug Fixes

* Revert "Adding functions to allow backup current config before overwriting it and use it in case of create_new_note_from_template" ([8dcdab7](https://github.com/SilentVoid13/Templater/commit/8dcdab75cb8bb773f4d36239d5dd5bde31e3329a)), closes [#1621](https://github.com/SilentVoid13/Templater/issues/1621) [#1554](https://github.com/SilentVoid13/Templater/issues/1554)

## [2.14.0](https://github.com/SilentVoid13/Templater/compare/2.13.1...2.14.0) (2025-08-01)


### Features

* clarify and enforce export type handling in UserScriptFunctions ([#1608](https://github.com/SilentVoid13/Templater/issues/1608)) ([b2917d6](https://github.com/SilentVoid13/Templater/commit/b2917d6be4ee5a5a549375d06568069abf0a1f6c))


### Bug Fixes

* Adding functions to allow backup current config before overwriting it and use it in case of create_new_note_from_template ([#1611](https://github.com/SilentVoid13/Templater/issues/1611)) ([506088e](https://github.com/SilentVoid13/Templater/commit/506088e7f7292260fe4ef8c4783fa7f25a6460b6))

### [2.13.1](https://github.com/SilentVoid13/Templater/compare/2.13.0...2.13.1) (2025-07-13)


### Bug Fixes

* Failure to enter vim insert mode causing Templater to stop working ([61d0b9e](https://github.com/SilentVoid13/Templater/commit/61d0b9e026d3506c17c6adeac9777af2b0ccbb9d)), closes [#1598](https://github.com/SilentVoid13/Templater/issues/1598)
* Security issue with using innerHTML ([4646c97](https://github.com/SilentVoid13/Templater/commit/4646c973e23ec3b99f63c908c663c8348a7e754a))

## [2.13.0](https://github.com/SilentVoid13/Templater/compare/2.12.1...2.13.0) (2025-07-05)


### Features

* Cleaner display of custom hot key in command palette ([09a85a6](https://github.com/SilentVoid13/Templater/commit/09a85a69b55d2f688a65607c9e03fd29d4031812)), closes [#1589](https://github.com/SilentVoid13/Templater/issues/1589)

### [2.12.1](https://github.com/SilentVoid13/Templater/compare/2.12.0...2.12.1) (2025-06-12)


### Bug Fixes

* Templater not triggering on daily note creation on startup ([63cc859](https://github.com/SilentVoid13/Templater/commit/63cc859e50f4e6cba26489bf7e401762a4b1b7f0)), closes [#1588](https://github.com/SilentVoid13/Templater/issues/1588)

## [2.12.0](https://github.com/SilentVoid13/Templater/compare/2.11.3...2.12.0) (2025-06-09)


### Features

* Reload plugin settings when data.json modified externally ([0189777](https://github.com/SilentVoid13/Templater/commit/0189777ffd6018a25e2b3f1e94c494c847855c25)), closes [#1585](https://github.com/SilentVoid13/Templater/issues/1585)

### [2.11.3](https://github.com/SilentVoid13/Templater/compare/2.11.2...2.11.3) (2025-05-31)


### Bug Fixes

* Properties not rendering when inserted into active file ([ada5321](https://github.com/SilentVoid13/Templater/commit/ada53215ae4610b290516a534c301428778b8b38)), closes [#1569](https://github.com/SilentVoid13/Templater/issues/1569)

### [2.11.2](https://github.com/SilentVoid13/Templater/compare/2.11.1...2.11.2) (2025-05-31)


### Bug Fixes

* Unexpected behavior when using hooks.on_all_templates_executed to edit front matter on a blank file ([817b223](https://github.com/SilentVoid13/Templater/commit/817b223c35d923ec043250334252b01e37f141d8)), closes [#1569](https://github.com/SilentVoid13/Templater/issues/1569)

### [2.11.1](https://github.com/SilentVoid13/Templater/compare/2.11.0...2.11.1) (2025-03-22)


### Bug Fixes

* Fix race condition with "Trigger Templater on new file creation" and daily notes "Open daily note on startup" ([6e5e26f](https://github.com/SilentVoid13/Templater/commit/6e5e26f61e65763a5847c7050dba240392e595dd)), closes [#1549](https://github.com/SilentVoid13/Templater/issues/1549)

## [2.11.0](https://github.com/SilentVoid13/Templater/compare/2.10.0...2.11.0) (2025-03-21)


### Features

* Add intellisense render settings ([0acc23b](https://github.com/SilentVoid13/Templater/commit/0acc23b5114d485ee0b6b347e7ffd7ad9c2ebe19)), closes [#1551](https://github.com/SilentVoid13/Templater/issues/1551)


### Bug Fixes

* Remove default hotkeys for "Open insert template modal", "Replace templates in the active file", and "Create new note from template" commands on MacOS since they don't work ([bf6187c](https://github.com/SilentVoid13/Templater/commit/bf6187c13a3499add6aaa09e0f48d59151d07f1b)), closes [#1491](https://github.com/SilentVoid13/Templater/issues/1491)

## [2.10.0](https://github.com/SilentVoid13/Templater/compare/2.9.3...2.10.0) (2025-02-28)


### Features

* Add 'intellisense' like support for user scripts ([4281da9](https://github.com/SilentVoid13/Templater/commit/4281da96d90d5e1624ad5a60e9176645067d882c)), closes [#1539](https://github.com/SilentVoid13/Templater/issues/1539)


### Bug Fixes

* **docs:** Format argument as optional parameter ([70d94bf](https://github.com/SilentVoid13/Templater/commit/70d94bffd87217220039081962fab12fba45d3f8))

### [2.9.3](https://github.com/SilentVoid13/Templater/compare/2.9.2...2.9.3) (2025-02-08)


### Bug Fixes

* missing character on open template modal ([d691904](https://github.com/SilentVoid13/Templater/commit/d691904c1b13ca208751e3fe8c317f97877561f3)), closes [#1497](https://github.com/SilentVoid13/Templater/issues/1497)

### [2.9.2](https://github.com/SilentVoid13/Templater/compare/2.9.1...2.9.2) (2025-01-28)


### Bug Fixes

* Duplicate hotkeys being created when updating template hotkeys ([4e8a892](https://github.com/SilentVoid13/Templater/commit/4e8a892a17d33ffcb664c746a5b153230aecb341)), closes [#1515](https://github.com/SilentVoid13/Templater/issues/1515)

### [2.9.1](https://github.com/SilentVoid13/Templater/compare/2.9.0...2.9.1) (2024-10-30)


### Bug Fixes

* Switch `isMobileApp` checks to `isMobile` and dynamically require node core packages to prevent plugin failure when emulating mobile on desktop ([3f8f764](https://github.com/SilentVoid13/Templater/commit/3f8f764ca313080457976c3498cda25605a95fd4))

## [2.9.0](https://github.com/SilentVoid13/Templater/compare/2.8.3...2.9.0) (2024-10-22)


### Features

* Add `tp.app` module with autocompletions ([f8e3f65](https://github.com/SilentVoid13/Templater/commit/f8e3f65488d61092aa70df14a6571fadd0de349c))
* Ignore casing for autocompletions ([5fadbd5](https://github.com/SilentVoid13/Templater/commit/5fadbd5201587f733b060881cb471ce196fdd11f))

### [2.8.3](https://github.com/SilentVoid13/Templater/compare/2.8.2...2.8.3) (2024-10-18)


### Bug Fixes

* Import `moment` from obsidian instead of using `window.moment` ([8d446c9](https://github.com/SilentVoid13/Templater/commit/8d446c97b7e9dc391a93f738e5389ce89ec26de4))
* Remove all references to global `app` instance ([5580544](https://github.com/SilentVoid13/Templater/commit/55805447401a4e9025b1e3b5cfff42a816940408))
* Use new quotes repo for daily quotes to fix errors with getting daily quotes ([fac9009](https://github.com/SilentVoid13/Templater/commit/fac900990f44f1d3ba71197b56fe3957fa2f52d3)), closes [#1407](https://github.com/SilentVoid13/Templater/issues/1407)
* Use sentence case in plugin settings ([922f111](https://github.com/SilentVoid13/Templater/commit/922f111392e309737fc7fe8a69de29b76ba653e7))

### [2.8.2](https://github.com/SilentVoid13/Templater/compare/2.8.1...2.8.2) (2024-10-11)


### Bug Fixes

* Fix insert command removal ([13c28eb](https://github.com/SilentVoid13/Templater/commit/13c28eb79c29b8bea6291a2cc3f5e7e249c4dea8)), closes [#1482](https://github.com/SilentVoid13/Templater/issues/1482)

### [2.8.1](https://github.com/SilentVoid13/Templater/compare/2.8.0...2.8.1) (2024-10-10)


### Bug Fixes

* Hotkeys being unset from 2.8.0 release, you will need to set them up again if you set them up again while having 2.8.0 installed ([39fd26d](https://github.com/SilentVoid13/Templater/commit/39fd26d6439e958f7c19073a060d70b8ac0d522e)), closes [#1480](https://github.com/SilentVoid13/Templater/issues/1480)

## [2.8.0](https://github.com/SilentVoid13/Templater/compare/2.7.3...2.8.0) (2024-10-08)


### Features

* Add insert hotkey setting ([4f51027](https://github.com/SilentVoid13/Templater/commit/4f510277ed9dfa09570acd44076acab08afea5e0)), closes [#1475](https://github.com/SilentVoid13/Templater/issues/1475) [#1361](https://github.com/SilentVoid13/Templater/issues/1361)


### Bug Fixes

* remove unused internal parameter `mode`, breaking change from previous commit where hotkey command IDs are now prefixed with `insert-` ([281aaf7](https://github.com/SilentVoid13/Templater/commit/281aaf787ee21efc0f902ebcec5226b017135a08)), closes [#1361](https://github.com/SilentVoid13/Templater/issues/1361)

### [2.7.3](https://github.com/SilentVoid13/Templater/compare/2.7.2...2.7.3) (2024-10-01)


### Bug Fixes

* Fix UX conflicts between changes for better folder templates UX and file regex templates ([cc95dea](https://github.com/SilentVoid13/Templater/commit/cc95dea9cc185a93d0ce557f3faba8e20bfed244)), closes [#1428](https://github.com/SilentVoid13/Templater/issues/1428) [#975](https://github.com/SilentVoid13/Templater/issues/975) [#471](https://github.com/SilentVoid13/Templater/issues/471)
* Streamline folder template UX ([78d9484](https://github.com/SilentVoid13/Templater/commit/78d9484882befd18983b5ddd8447abfc67f9e2ba)), closes [#1468](https://github.com/SilentVoid13/Templater/issues/1468)

### [2.7.2](https://github.com/SilentVoid13/Templater/compare/2.7.1...2.7.2) (2024-09-25)


### Bug Fixes

* **1446:** updates docs to match _actual_ behaviour of tp.file.folder() ([8d4f402](https://github.com/SilentVoid13/Templater/commit/8d4f4023e5adb7e85ada0c5c58bf583e27e1c190))
* Fix first letter of suggest modal being cut off ([0f07a0d](https://github.com/SilentVoid13/Templater/commit/0f07a0d884d9a70d2c4bf2084eafb9047ca13b9d)), closes [#1454](https://github.com/SilentVoid13/Templater/issues/1454) [#1436](https://github.com/SilentVoid13/Templater/issues/1436)
* Prompt Autofocus Input ([a4eca81](https://github.com/SilentVoid13/Templater/commit/a4eca812c5f55b93f7986998dceab3f92370fdb2)), closes [#1457](https://github.com/SilentVoid13/Templater/issues/1457) [#1120](https://github.com/SilentVoid13/Templater/issues/1120)
* Use requestUrl instead of fetch to fix CORS errors when using `tp.web.request` ([bfbb474](https://github.com/SilentVoid13/Templater/commit/bfbb474180193e2c1c484f34e6acf1d2f76425f0)), closes [#1455](https://github.com/SilentVoid13/Templater/issues/1455)

### [2.7.1](https://github.com/SilentVoid13/Templater/compare/2.7.0...2.7.1) (2024-09-04)


### Bug Fixes

* Include link to photographer in random image ([c81bc7d](https://github.com/SilentVoid13/Templater/commit/c81bc7d5cd61e4f393bf44f7c298a3b2e972fe14)), closes [#1435](https://github.com/SilentVoid13/Templater/issues/1435)

## [2.7.0](https://github.com/SilentVoid13/Templater/compare/2.6.0...2.7.0) (2024-09-04)


### Features

* new web function to make http requests ([56a6478](https://github.com/SilentVoid13/Templater/commit/56a64783fc9b351aa94484eb64e0c1378b4bc40d))

## [2.6.0](https://github.com/SilentVoid13/Templater/compare/2.4.2...2.6.0) (2024-09-02)


### Features

* minify production builds to speed up loading time ([4f64ff9](https://github.com/SilentVoid13/Templater/commit/4f64ff90690361b0694086318ad4e297d77c6cb1)), closes [#1437](https://github.com/SilentVoid13/Templater/issues/1437)

## [2.5.0](https://github.com/SilentVoid13/Templater/compare/2.4.2...2.5.0) (2024-09-02)


### Features

* minify production builds to speed up loading time ([4f64ff9](https://github.com/SilentVoid13/Templater/commit/4f64ff90690361b0694086318ad4e297d77c6cb1)), closes [#1437](https://github.com/SilentVoid13/Templater/issues/1437)

### [2.4.2](https://github.com/SilentVoid13/Templater/compare/2.4.1...2.4.2) (2024-08-21)


### Bug Fixes

* use new unsplash api to fix random_picture not working ([0621def](https://github.com/SilentVoid13/Templater/commit/0621defa6054544762226099e33def3861b9a51d)), closes [#1435](https://github.com/SilentVoid13/Templater/issues/1435)

### [2.4.1](https://github.com/SilentVoid13/Templater/compare/2.4.0...2.4.1) (2024-07-24)


### Bug Fixes

* Sort files by path instead of by basename ([b3c5981](https://github.com/SilentVoid13/Templater/commit/b3c5981c5651408838c676eedf8a1708f7b56feb)), closes [#1420](https://github.com/SilentVoid13/Templater/issues/1420)

## [2.4.0](https://github.com/SilentVoid13/Templater/compare/2.3.3...2.4.0) (2024-07-24)


### Features

* Return Relative Paths of Templates in Fuzzy Suggester Prompt ([4910143](https://github.com/SilentVoid13/Templater/commit/49101435dca71b0260014cc3c0f3d05ce929b988)), closes [#1418](https://github.com/SilentVoid13/Templater/issues/1418) [#1418](https://github.com/SilentVoid13/Templater/issues/1418)


### Bug Fixes

* Follow UI design guidelines ([2abce98](https://github.com/SilentVoid13/Templater/commit/2abce98863bfad10c3f9ee6440f808f9ff9dbd10)), closes [#1383](https://github.com/SilentVoid13/Templater/issues/1383)

### [2.3.3](https://github.com/SilentVoid13/Templater/compare/2.3.2...2.3.3) (2024-05-26)

### [2.3.2](https://github.com/SilentVoid13/Templater/compare/2.3.1...2.3.2) (2024-05-21)


### Bug Fixes

* limit results for file/folder suggesters in Templater settings to 1000 for better performance ([1bc91c3](https://github.com/SilentVoid13/Templater/commit/1bc91c34dedcde831f651054b3b0059ab6ca6942)), closes [#1319](https://github.com/SilentVoid13/Templater/issues/1319)
* revert change that broke template content being overridden ([2639196](https://github.com/SilentVoid13/Templater/commit/263919674a4186632651a7f7b4296b9c3b047f6e)), closes [#1309](https://github.com/SilentVoid13/Templater/issues/1309)

### [2.3.1](https://github.com/SilentVoid13/Templater/compare/2.3.0...2.3.1) (2024-05-09)


### Bug Fixes

* Folder notes sometimes applying when creating a new note from template ([08bcfca](https://github.com/SilentVoid13/Templater/commit/08bcfca5b1a2833b6eaa892753270e4c888f84a8)), closes [#1370](https://github.com/SilentVoid13/Templater/issues/1370)

## [2.3.0](https://github.com/SilentVoid13/Templater/compare/2.2.4...2.3.0) (2024-05-08)


### Features

* Support string for folder argument for `tp.file.create_new()` ([df3709b](https://github.com/SilentVoid13/Templater/commit/df3709b6a24f360a7fc51915853fbd210a51e278))


### Bug Fixes

* Mitigate edge cases where a blank string is appending during transition between active editors ([b6dd0b1](https://github.com/SilentVoid13/Templater/commit/b6dd0b1ea46187952f4a0bf7e1954590d7ad1e48)), closes [#1369](https://github.com/SilentVoid13/Templater/issues/1369)
* simplify fix for template content being overridden when using `app.fileManager.processFrontMatter` on blank files ([7378d7b](https://github.com/SilentVoid13/Templater/commit/7378d7bff55c5ab944e923b43469e69e27de47af)), closes [#1309](https://github.com/SilentVoid13/Templater/issues/1309)

### [2.2.4](https://github.com/SilentVoid13/Templater/compare/2.2.3...2.2.4) (2024-05-05)


### Bug Fixes

* template content being overridden when using `app.fileManager.processFrontMatter` on blank files ([cdc8815](https://github.com/SilentVoid13/Templater/commit/cdc8815e1e3a81a00488b256480b1ec4d4203123)), closes [#1309](https://github.com/SilentVoid13/Templater/issues/1309)

### [2.2.3](https://github.com/SilentVoid13/Templater/compare/2.2.2...2.2.3) (2024-03-05)


### Bug Fixes

* fallback to "Untitled" as filename if empty string is passed as filename to `tp.file.create_new` ([efa2920](https://github.com/SilentVoid13/Templater/commit/efa2920d4a0d95c0dace8d899193f5a959b5218e)), closes [#1332](https://github.com/SilentVoid13/Templater/issues/1332)

### [2.2.2](https://github.com/SilentVoid13/Templater/compare/2.2.1...2.2.2) (2024-03-02)


### Bug Fixes

* add 1ms delay to make it less likely to require a setTimeout when using `tp.hooks.on_all_templates_executed()` ([506e32d](https://github.com/SilentVoid13/Templater/commit/506e32d8784beb6cdc064fb78c76e121c6c52023)), closes [#1309](https://github.com/SilentVoid13/Templater/issues/1309)
* re-add support for creating missing folders when using `tp.file.create_new()` ([cc85471](https://github.com/SilentVoid13/Templater/commit/cc8547168704ad356b6430c6621d5bfccb23440f)), closes [#1327](https://github.com/SilentVoid13/Templater/issues/1327)

### [2.2.1](https://github.com/SilentVoid13/Templater/compare/2.2.0...2.2.1) (2024-02-13)


### Bug Fixes

* creating file from template not auto-incrementing file name if file already exists ([368e511](https://github.com/SilentVoid13/Templater/commit/368e511d096e71fe98e858f3541e360ef7fd4165))

## [2.2.0](https://github.com/SilentVoid13/Templater/compare/2.1.4...2.2.0) (2024-02-13)


### Features

* add support for templates with non-markdown file extensions ([34837f6](https://github.com/SilentVoid13/Templater/commit/34837f6bb7ec6dab620805b0e28526824f5a859f)), closes [#1311](https://github.com/SilentVoid13/Templater/issues/1311) [#1300](https://github.com/SilentVoid13/Templater/issues/1300)


### Bug Fixes

* Templater resetting active document position when folder template is triggered in background ([4d766d8](https://github.com/SilentVoid13/Templater/commit/4d766d8697639e816484cdd198f533e1e73897e5)), closes [#1310](https://github.com/SilentVoid13/Templater/issues/1310)

### [2.1.4](https://github.com/SilentVoid13/Templater/compare/2.1.3...2.1.4) (2024-02-10)


### Bug Fixes

* properties not showing on file creation on template insert ([e9abe48](https://github.com/SilentVoid13/Templater/commit/e9abe48c8ee06005297a0af8a0a57652dd81cf27)), closes [#1253](https://github.com/SilentVoid13/Templater/issues/1253) [#1309](https://github.com/SilentVoid13/Templater/issues/1309)

### [2.1.3](https://github.com/SilentVoid13/Templater/compare/2.1.2...2.1.3) (2024-02-02)


### Bug Fixes

* modifying current file immediately after inserting template causing file content conflicts ([b9112fa](https://github.com/SilentVoid13/Templater/commit/b9112fab0163041f710c6cb81349b54c4ec4c214)), closes [#1309](https://github.com/SilentVoid13/Templater/issues/1309)

## [2.1.2](https://github.com/SilentVoid13/Templater/compare/1.18.4...2.1.2) (2024-01-23)


### Bug Fixes

* syntax errors in user scripts not showing error message mentioning relevant user script ([6709df4](https://github.com/SilentVoid13/Templater/commit/6709df41cea175041f3dffab7713a00b0c0b0766)), closes [#1212](https://github.com/SilentVoid13/Templater/issues/1212) [#1286](https://github.com/SilentVoid13/Templater/issues/1286)
* unable to add newline in multiline inputs on mobile ([5d3b2fc](https://github.com/SilentVoid13/Templater/commit/5d3b2fcab262c98483ee4f815bed4e283e74f4e8)), closes [#1303](https://github.com/SilentVoid13/Templater/issues/1303)
* uncaught exception when cancelling prompt when creating note from template and throw_on_cancel is true ([8a27b33](https://github.com/SilentVoid13/Templater/commit/8a27b33309beb40966f0e09d49541b045f95482c)), closes [#1294](https://github.com/SilentVoid13/Templater/issues/1294)

### [2.1.1](https://github.com/SilentVoid13/Templater/compare/2.1.0...2.1.1) (2024-01-18)


### Bug Fixes

* cursor being set to top of current file when folder template was triggered ([10ab058](https://github.com/SilentVoid13/Templater/commit/10ab0586b9c96b7857716abaf6ef394474615a2d)), closes [#1297](https://github.com/SilentVoid13/Templater/issues/1297)

## [2.1.0](https://github.com/SilentVoid13/Templater/compare/2.0.0...2.1.0) (2024-01-06)


### Features

* add icon for hotkey commands for mobile toolbar ([8806dab](https://github.com/SilentVoid13/Templater/commit/8806dabf5f33a55c7e6d0d7f208cc444d2925ce7))
* add icons for commands for mobile toolbar ([9391ba9](https://github.com/SilentVoid13/Templater/commit/9391ba9a20ef92d85ab9bcf22ec07eda9f863eaa))


### Bug Fixes

* incorrect function name in popup for tp.file.move() ([b53e713](https://github.com/SilentVoid13/Templater/commit/b53e713a79f6c112d0c98737c5db8377c4b0decd)), closes [#1136](https://github.com/SilentVoid13/Templater/issues/1136)
* multiple prompts being filled out with Korean inputs ([9fc284e](https://github.com/SilentVoid13/Templater/commit/9fc284ef6bfecc30d4d857fb090207355a59fc5f)), closes [#1284](https://github.com/SilentVoid13/Templater/issues/1284)

## [2.0.0](https://github.com/SilentVoid13/Templater/compare/1.18.3...2.0.0) (2023-12-08)


### ⚠ BREAKING CHANGES

* Syntax highlighting will no longer work on older versions of Obsidian.

### Bug Fixes

* Fix syntax highlighting in Obsidian 1.5.x ([aaa2cc1](https://github.com/SilentVoid13/Templater/commit/aaa2cc109ddce6e127aeee787a1426799127fd3a))

### [1.18.4](https://github.com/SilentVoid13/Templater/compare/1.18.3...1.18.4) (2024-01-20)


### Bug Fixes

* uncaught exception when cancelling prompt when creating note from template and `throw_on_cancel` is true ([41e19ef](https://github.com/SilentVoid13/Templater/commit/41e19ef949f739bdb8e3593e108e9271fa1bbc10)), closes [#1294](https://github.com/SilentVoid13/Templater/issues/1294)

### [1.18.3](https://github.com/SilentVoid13/Templater/compare/1.18.2...1.18.3) (2023-12-02)


### Bug Fixes

* do not stack trace using Error.captureStackTrace in environments that don't support it (iOS) ([de54d0c](https://github.com/SilentVoid13/Templater/commit/de54d0cbc30e63a4434d914160ffabe26d7f5474))

### [1.18.2](https://github.com/SilentVoid13/Templater/compare/1.18.1...1.18.2) (2023-12-01)


### Bug Fixes

* plugin not unloading properly when disabled ([3cd000a](https://github.com/SilentVoid13/Templater/commit/3cd000ad6c49e4b16316ee7ebb0d40666c726665))
* properties from template not showing in note until editor change ([b349aff](https://github.com/SilentVoid13/Templater/commit/b349affc83193f69be81ac4f63e7568d326a0302)), closes [#1253](https://github.com/SilentVoid13/Templater/issues/1253)

### [1.18.1](https://github.com/SilentVoid13/Templater/compare/1.18.0...1.18.1) (2023-11-17)


### Bug Fixes

* frontmatter updates not persisting when using app.vault.processFrontMatter outside of a tp.hooks module ([21aa13e](https://github.com/SilentVoid13/Templater/commit/21aa13eedc42eb966dd0810b2d551c14b5621901)), closes [#1245](https://github.com/SilentVoid13/Templater/issues/1245)

## [1.18.0](https://github.com/SilentVoid13/Templater/compare/1.17.0...1.18.0) (2023-11-13)


### Features

* add hooks module ([e5d1aa8](https://github.com/SilentVoid13/Templater/commit/e5d1aa874fd67378fce238c1443763b8dd093434))

## [1.17.0](https://github.com/SilentVoid13/Templater/compare/1.16.5...1.17.0) (2023-11-08)


### Features

* jump to next cursor will only expand folds if cursor jump position is within fold bounds ([b1729e3](https://github.com/SilentVoid13/Templater/commit/b1729e335c9cca7902c16551fe779bfbf3dcfec7)), closes [#1222](https://github.com/SilentVoid13/Templater/issues/1222)
* support tp.system.clipboard on mobile ([5c6744d](https://github.com/SilentVoid13/Templater/commit/5c6744d50b562ac76b3465decd18cdb348edf338)), closes [#589](https://github.com/SilentVoid13/Templater/issues/589)

### [1.16.5](https://github.com/SilentVoid13/Templater/compare/1.16.4...1.16.5) (2023-11-07)


### Bug Fixes

* place cursor after frontmatter ([a65bc08](https://github.com/SilentVoid13/Templater/commit/a65bc0890cdf684e1afa0a7ab40b1cc6d8d1d09c)), closes [#1231](https://github.com/SilentVoid13/Templater/issues/1231)

### [1.16.4](https://github.com/SilentVoid13/Templater/compare/1.16.3...1.16.4) (2023-10-11)


### Bug Fixes

* add missing `=` in docs example for `tp.system.suggester` ([ea6d2c4](https://github.com/SilentVoid13/Templater/commit/ea6d2c4f26d596eef6480b696d1fbb51639e21a3)), closes [#995](https://github.com/SilentVoid13/Templater/issues/995)
* define app.dom ([7557939](https://github.com/SilentVoid13/Templater/commit/755793979b49c2166da790eb34f339f41fd87fa4))
* re-add delay on triggering templates on file creation to account for note extractor core plugin ([59603e5](https://github.com/SilentVoid13/Templater/commit/59603e5c535bb38f5cfdafff41e258974b1025eb)), closes [#1219](https://github.com/SilentVoid13/Templater/issues/1219)

### [1.16.3](https://github.com/SilentVoid13/Templater/compare/1.16.2...1.16.3) (2023-10-03)


### Bug Fixes

* clearer error message when user scripts are preventing templates from executing ([0cb0202](https://github.com/SilentVoid13/Templater/commit/0cb02026f9b0c3b98f8caef9f3e5c72bcdf765c4)), closes [#1212](https://github.com/SilentVoid13/Templater/issues/1212)

### [1.16.2](https://github.com/SilentVoid13/Templater/compare/1.16.1...1.16.2) (2023-10-02)


### Bug Fixes

* active file is undefined in binary files ([27af7a3](https://github.com/SilentVoid13/Templater/commit/27af7a3f9c7a78a477f31f11c709137d2834e528)), closes [#1210](https://github.com/SilentVoid13/Templater/issues/1210)

### [1.16.1](https://github.com/SilentVoid13/Templater/compare/1.16.0...1.16.1) (2023-09-29)


### Bug Fixes

* fixing merge conflict ([1e2fdda](https://github.com/SilentVoid13/Templater/commit/1e2fdda82f5335bb43b98534698a8c19fea1eba4))

## [1.16.0](https://github.com/SilentVoid13/Templater/compare/1.15.3...1.16.0) (2022-11-08)


### Features

* cleaning package, preparing for release ([79e2925](https://github.com/SilentVoid13/Templater/commit/79e2925f495cba50a4b1033a3caaaac423fbb6f1))
* moving from eta.js to rusty_engine ([a69ac22](https://github.com/SilentVoid13/Templater/commit/a69ac22252a5fc9f943949e4944b3247077921c6))
* updating README ([8689da4](https://github.com/SilentVoid13/Templater/commit/8689da49e7979c027ee6dcbdfc1218347bf33287))
* updating settings ([34330d2](https://github.com/SilentVoid13/Templater/commit/34330d2a3a13eb61a242415f2e4b21c7e3569593))

### [1.15.3](https://github.com/SilentVoid13/Templater/compare/1.15.2...1.15.3) (2022-11-01)


### Bug Fixes

* increase size limit to 100 000 ([#902](https://github.com/SilentVoid13/Templater/issues/902)) ([d7b4a93](https://github.com/SilentVoid13/Templater/commit/d7b4a934172a83d738a0da84ae91effb38097b1f))

### [1.15.2](https://github.com/SilentVoid13/Templater/compare/1.15.1...1.15.2) (2022-10-30)

### [1.15.1](https://github.com/SilentVoid13/Templater/compare/1.15.0...1.15.1) (2022-10-29)


### Bug Fixes

* syntax highlighting breaks live preview on mobile. ([#892](https://github.com/SilentVoid13/Templater/issues/892)) ([7fd3b33](https://github.com/SilentVoid13/Templater/commit/7fd3b332e5688fa6e0b93c3ac01f280a33018f84))

## [1.15.0](https://github.com/SilentVoid13/Templater/compare/1.14.4...1.15.0) (2022-10-29)


### Features

* enable syntax highlighting in cm6 ([#889](https://github.com/SilentVoid13/Templater/issues/889)) ([1cc6615](https://github.com/SilentVoid13/Templater/commit/1cc661576ad3318cf8309527a8ac4a5f5ef32fee))

### [1.14.4](https://github.com/SilentVoid13/Templater/compare/1.14.3...1.14.4) (2022-10-29)


### Bug Fixes

* hard coded file size limit for parsing ([#874](https://github.com/SilentVoid13/Templater/issues/874)) ([fcba602](https://github.com/SilentVoid13/Templater/commit/fcba6025bda7c3596228d96e7d7f0df1c6e6c7d7))
* tp.file.exists in Obsidian v1.0.0 always returns false for files; ([#879](https://github.com/SilentVoid13/Templater/issues/879)) ([fc08873](https://github.com/SilentVoid13/Templater/commit/fc0887356fb227e4f7f039adb87103a02edcbeeb)), closes [#878](https://github.com/SilentVoid13/Templater/issues/878) [#878](https://github.com/SilentVoid13/Templater/issues/878)

### [1.14.3](https://github.com/SilentVoid13/Templater/compare/1.14.2...1.14.3) (2022-09-19)


### Bug Fixes

* revert pr [#816](https://github.com/SilentVoid13/Templater/issues/816) ([#835](https://github.com/SilentVoid13/Templater/issues/835)) ([5ee485a](https://github.com/SilentVoid13/Templater/commit/5ee485a4e877ef13189e172db7f6d018beade4f4))

### [1.14.2](https://github.com/SilentVoid13/Templater/compare/1.14.1...1.14.2) (2022-09-17)


### Bug Fixes

* change to new unsplash api ([#827](https://github.com/SilentVoid13/Templater/issues/827)) ([c5ccd7a](https://github.com/SilentVoid13/Templater/commit/c5ccd7ac2b30e98e1c436ae13a2468ffb1b6f6e8))
* don't trigger on creation unless new file is opened in a pane ([#816](https://github.com/SilentVoid13/Templater/issues/816)) ([10d5de7](https://github.com/SilentVoid13/Templater/commit/10d5de7fc29cc3c61a458ba91349f9a43e7311c8)), closes [#716](https://github.com/SilentVoid13/Templater/issues/716) [#554](https://github.com/SilentVoid13/Templater/issues/554)
* errors after merging PRs ([#832](https://github.com/SilentVoid13/Templater/issues/832)) ([e44a485](https://github.com/SilentVoid13/Templater/commit/e44a48575843610dc97857f3a6aabee3104bbeaf))
* make tp.file.path(...) work on mobile ([#829](https://github.com/SilentVoid13/Templater/issues/829)) ([5273570](https://github.com/SilentVoid13/Templater/commit/5273570861f9a4e0d4956482a5798315de51cbd7))
* post merge errors ([#833](https://github.com/SilentVoid13/Templater/issues/833)) ([dd315d2](https://github.com/SilentVoid13/Templater/commit/dd315d2c69514336b7f3d03e94ab78c20714c08e))
* use app.fileSystemAdapter.exists for tp.file.exists ([#820](https://github.com/SilentVoid13/Templater/issues/820)) ([e57cc6c](https://github.com/SilentVoid13/Templater/commit/e57cc6c0d8d9691fe99d25618ed6aed25dd0768f))

### [1.14.1](https://github.com/SilentVoid13/Templater/compare/1.14.0...1.14.1) (2022-09-08)


### Bug Fixes

* move on mobile using obsidian api (not path) ([#814](https://github.com/SilentVoid13/Templater/issues/814)) ([6fbe143](https://github.com/SilentVoid13/Templater/commit/6fbe1431db41c3ad428758d5fcd5ef9c3981d04e))
* PromptModal default value needs to be set to this.value on load ([#813](https://github.com/SilentVoid13/Templater/issues/813)) ([42e0816](https://github.com/SilentVoid13/Templater/commit/42e081648d548acf82a167570d07b16ad5f6a009))

## [1.14.0](https://github.com/SilentVoid13/Templater/compare/1.13.0...1.14.0) (2022-09-07)


### Features

* add optional argument to include size in tp.web.random_image ([#810](https://github.com/SilentVoid13/Templater/issues/810)) ([97a4adf](https://github.com/SilentVoid13/Templater/commit/97a4adf7508b6b245e74d9355cead66c5afea62c))
* additional argument for tp.file.move for passing down specific files. ([#444](https://github.com/SilentVoid13/Templater/issues/444)) ([e46f1fb](https://github.com/SilentVoid13/Templater/commit/e46f1fb61a3327d44ac9480be08b826e69dafaa0))


### Bug Fixes

* prompt default_value and placeholder order ([#802](https://github.com/SilentVoid13/Templater/issues/802)) ([fdd1060](https://github.com/SilentVoid13/Templater/commit/fdd106070cf549a78e822482880d95361b573ebb))

## [1.13.0](https://github.com/SilentVoid13/Templater/compare/1.12.0...1.13.0) (2022-09-02)


### Features

* Add new optional parameter for multiline input ([4802287](https://github.com/SilentVoid13/Templater/commit/4802287ab11f30588ebfa9e0c71600b99ef3e811))
* Add option to show/hide Templater ribbon icon ([7cb450d](https://github.com/SilentVoid13/Templater/commit/7cb450d364a4ab6633517689de020b0f21ecb3f7))
* Update sizing of image ([dbc3df5](https://github.com/SilentVoid13/Templater/commit/dbc3df55647e4dd2167e0ae47dc161b4e181dc0f))


### Bug Fixes

* add try/catch logic to web commands ([#785](https://github.com/SilentVoid13/Templater/issues/785)) ([e03ffec](https://github.com/SilentVoid13/Templater/commit/e03ffeca5e9cb167bdf13ec5f0a5e49e719bf675))
* change `activeLeaf` to `getLeaf` ([#787](https://github.com/SilentVoid13/Templater/issues/787)) ([c85de3e](https://github.com/SilentVoid13/Templater/commit/c85de3ef1d332685a74a4607658179f6f1415a8e)), closes [#691](https://github.com/SilentVoid13/Templater/issues/691)
* change activeLead to getLeaf ([752a6a2](https://github.com/SilentVoid13/Templater/commit/752a6a222ec2309a117d1c6d5e8e3e70bfd36cba))
* comment out `reject` throwing a new TemplaterError to avoid freezing app ([5b95d7e](https://github.com/SilentVoid13/Templater/commit/5b95d7e66fd7e1d5073dd47bb43fe742770b1318))
* fixing broken documentation ([0a24f7e](https://github.com/SilentVoid13/Templater/commit/0a24f7ebca8f530a33087f3738001505395cc84c))
* **user scripts:** removed check that only allowed use of user scripts on desktop ([3e4b1ea](https://github.com/SilentVoid13/Templater/commit/3e4b1ea6fddfb5d57b962fa324594f4b35610572)), closes [#586](https://github.com/SilentVoid13/Templater/issues/586)

## [1.12.0](https://github-personal/liamcain/Templater/compare/1.11.3...1.12.0) (2022-03-19)


### Features

* **suggester:** Add limit to suggester ([#578](https://github-personal/liamcain/Templater/issues/578)) ([f7ca9a1](https://github-personal/liamcain/Templater/commit/f7ca9a10ffe1f3f5f36cb4fb3487ddb34cb20028))
* trigger events on template overwrite, new file creation ([#588](https://github-personal/liamcain/Templater/issues/588)) ([3c6238e](https://github-personal/liamcain/Templater/commit/3c6238e47e0abf8a571dc4688946d7f64b7b464d))

### [1.11.3](https://github-personal/liamcain/Templater/compare/1.11.2...1.11.3) (2022-03-06)

### [1.11.2](https://github-personal/liamcain/Templater/compare/1.11.1...1.11.2) (2022-03-06)


### Bug Fixes

* **cursorjumper:** fix issues with jump cursor stealing focus away from the 'rename file' text field ([410c3a8](https://github-personal/liamcain/Templater/commit/410c3a886e117e6a79849190aa0e9a9e64e56608))

### [1.11.1](https://github-personal/liamcain/Templater/compare/1.11.0...1.11.1) (2022-03-05)


### Bug Fixes

* rename args for new `templater:template-appended` event to be plural ([fecccad](https://github-personal/liamcain/Templater/commit/fecccad72fee43bab1bd5dcfb2c93db79de4bb25))

## [1.11.0](https://github-personal/liamcain/Templater/compare/1.10.0...1.11.0) (2022-03-05)


### Features

* Trigger events on template insertion ([#573](https://github-personal/liamcain/Templater/issues/573)) ([6b959d8](https://github-personal/liamcain/Templater/commit/6b959d8b5727837b1df5d13cb3c9524284064d1c))


### Bug Fixes

* **cursorjumper:** Activate cursor jump before renaming file ([#576](https://github-personal/liamcain/Templater/issues/576)) ([3cb9932](https://github-personal/liamcain/Templater/commit/3cb99321922d44de9b7350a59227e36711de9dc6))

## [1.10.0](https://github.com/SilentVoid13/Templater/compare/1.9.11...1.10.0) (2022-01-24)


### Features

* adding mobile support for user script templates ([06fef36](https://github.com/SilentVoid13/Templater/commit/06fef36c66fe52fcdc7bec3f23db0beff1c3dca8))

### [1.9.11](///compare/1.9.10...1.9.11) (2022-01-14)


### Features

* adding autocomplete and documentation for tp.file module 35f8bee
* adding docs for all modules 94452db
* adding tp.web docs 8abb219
* working autocompletion 8431c80


### Bug Fixes

* fixing docs SUMMARY mistake eaa6859

### [1.9.10](https://github.com/SilentVoid13/Templater/compare/1.9.9...1.9.10) (2022-01-13)

### [1.9.9](https://github.com/SilentVoid13/Templater/compare/1.9.8...1.9.9) (2021-10-03)


### Features

* **cursorjumper:** adding a setting to enable automatic cursor jumping after template insertion ([6bf2de1](https://github.com/SilentVoid13/Templater/commit/6bf2de174b4a8fbb187a3be8571288d037561524)), closes [#359](https://github.com/SilentVoid13/Templater/issues/359) [#393](https://github.com/SilentVoid13/Templater/issues/393)


### Bug Fixes

* Root template not resolving ([#395](https://github.com/SilentVoid13/Templater/issues/395)) ([e800c21](https://github.com/SilentVoid13/Templater/commit/e800c21ed0fa346fd02b5290458d70791ee6d20e))

### [1.9.8](https://github.com/SilentVoid13/Templater/compare/1.9.7...1.9.8) (2021-09-30)


### Bug Fixes

* fixing typo bug ([2cf1486](https://github.com/SilentVoid13/Templater/commit/2cf148608c4460446d62c8d16f5bc2f7f1aeffea))

### [1.9.7](https://github.com/SilentVoid13/Templater/compare/1.9.6...1.9.7) (2021-09-30)


### Bug Fixes

* fixing invalid const declaration, causing errors in user system commands ([2ca59f0](https://github.com/SilentVoid13/Templater/commit/2ca59f05b04caa7c1d4bdde9e33ea95a89df8dcf)), closes [#391](https://github.com/SilentVoid13/Templater/issues/391) [#392](https://github.com/SilentVoid13/Templater/issues/392)

### [1.9.6](https://github.com/SilentVoid13/Templater/compare/1.9.5...1.9.6) (2021-09-30)


### Features

* **settings:** improving styles of settings, adding a few forgotten save_settings ([94140f3](https://github.com/SilentVoid13/Templater/commit/94140f38992d4981f98bcaf3abbdecdae18255ef)), closes [#390](https://github.com/SilentVoid13/Templater/issues/390)

### [1.9.5](https://github.com/SilentVoid13/Templater/compare/1.9.4...1.9.5) (2021-09-29)


### Features

* Folder Templates ([#384](https://github.com/SilentVoid13/Templater/issues/384)) ([3eb60d8](https://github.com/SilentVoid13/Templater/commit/3eb60d84aa8d78c7b294d2b31c471d7a41064914)), closes [#326](https://github.com/SilentVoid13/Templater/issues/326)

### [1.9.4](https://github.com/SilentVoid13/Templater/compare/1.9.3...1.9.4) (2021-09-28)

### [1.9.3](https://github.com/SilentVoid13/Templater/compare/1.9.2...1.9.3) (2021-09-28)


### Bug Fixes

* fixing "User Scripts folder doesn't exist", replacing string checks with proper truthy checks ([4a4fc45](https://github.com/SilentVoid13/Templater/commit/4a4fc45ea7195e3a6bb24c8d429a4d363fd8e692))
* **tests:** reverting to a previous version of rollup, chai wasn't working otherwise ([e295d51](https://github.com/SilentVoid13/Templater/commit/e295d51ac68ffddb7f35479ee1882455c76f499c))

### [1.9.2](https://github.com/SilentVoid13/Templater/compare/1.9.1...1.9.2) (2021-09-26)


### Bug Fixes

* fixing startup templates bug, forgot to wait for files to be created before executing them ([3a0a21d](https://github.com/SilentVoid13/Templater/commit/3a0a21d6bdcd4d40e4975242d44d738452edcf24))

### [1.9.1](https://github.com/SilentVoid13/Templater/compare/1.9.0...1.9.1) (2021-09-26)


### Bug Fixes

* fixing startup templates bug, forgot to check for empty strings ([7304f3f](https://github.com/SilentVoid13/Templater/commit/7304f3f1c9cff32f6cd120602abc0b39b8f54027))

## [1.9.0](https://github.com/SilentVoid13/Templater/compare/1.8.1...1.9.0) (2021-09-26)


### Features

* adding active_file config option and fixing folder newFileLocation ([bb3fa5a](https://github.com/SilentVoid13/Templater/commit/bb3fa5a4b3cf9bc8cd9054679ed4a2799e25184a))
* adding better colors for light themes when syntax highlighting, was a bit unreadable until now ([b4f23e4](https://github.com/SilentVoid13/Templater/commit/b4f23e4d3c6cd7d554cc8cc76b1552a05671b03c)), closes [#268](https://github.com/SilentVoid13/Templater/issues/268) [#303](https://github.com/SilentVoid13/Templater/issues/303)
* **fuzzysuggester:** adding a new placeholder for fuzzysuggester ([2d734b6](https://github.com/SilentVoid13/Templater/commit/2d734b6652c76f4390f33eb8563b05a3412c148c)), closes [#352](https://github.com/SilentVoid13/Templater/issues/352)
* **settings:** adding a way to add hotkeys for templates in settings ([34bae3f](https://github.com/SilentVoid13/Templater/commit/34bae3f11a0231ec0f744813a2ebb22e00f5ac76))
* **settings:** adding startup templates ([920b707](https://github.com/SilentVoid13/Templater/commit/920b70762a0d712d69e284cd1b292d4f9ab233e5))
* **settings:** adding suggesters in settings for template folder, empty file, user scripts folders ([3b59e74](https://github.com/SilentVoid13/Templater/commit/3b59e74a0637dc8d509d170dab103b7b14768382))


### Bug Fixes

* fixing small naming errors ([e250bd2](https://github.com/SilentVoid13/Templater/commit/e250bd2aa589473a8c28717e0653b5e2e1883ab3))
* fixing the "edit this page" button for documentation ([e6a8f94](https://github.com/SilentVoid13/Templater/commit/e6a8f946cc233b03a7cae420cce933fcd3607c22)), closes [#300](https://github.com/SilentVoid13/Templater/issues/300)
* **tp.file.include:** fixing tp.file.include incorrect depth_limit ([7a202a4](https://github.com/SilentVoid13/Templater/commit/7a202a407be19f376e12dfa9cd393bf6dc8fc8a1))

### [1.8.1](https://github.com/SilentVoid13/Templater/compare/1.8.0...1.8.1) (2021-06-17)


### Bug Fixes

* fixing edge case with code blocks and syntax highlighting ([c42b56d](https://github.com/SilentVoid13/Templater/commit/c42b56dda80999833356b836895e8c1a43d3f758))

## [1.8.0](https://github.com/SilentVoid13/Templater/compare/1.7.1...1.8.0) (2021-06-17)


### Features

* adding 3 new tp.file internal functions ([c26e4c1](https://github.com/SilentVoid13/Templater/commit/c26e4c1a5c18f48d6428dc4ee9f6b3a4d889e6c0))
* adding placeholder argument for tp.system.suggester ([e0b288c](https://github.com/SilentVoid13/Templater/commit/e0b288cb1fcbab1860aba99eefb5bc700994b72a)), closes [#264](https://github.com/SilentVoid13/Templater/issues/264)
* adding syntax highlighting for Templater commands ([2628197](https://github.com/SilentVoid13/Templater/commit/26281976fce88107fa05e9d2b278b0f248f5f547)), closes [#222](https://github.com/SilentVoid13/Templater/issues/222)
* disabling template replacement on new files in the specified templates folder ([26eafb0](https://github.com/SilentVoid13/Templater/commit/26eafb0c59fd65a2d15714f89d834fdad81eec5d)), closes [#244](https://github.com/SilentVoid13/Templater/issues/244)
* updating tp.file internal functions ([7a00bf8](https://github.com/SilentVoid13/Templater/commit/7a00bf8a12f27a9f50a55fd00709ef15c07c7a3c))

### [1.7.1](https://github.com/SilentVoid13/Templater/compare/1.7.0...1.7.1) (2021-05-23)


### Bug Fixes

* fixing broken command with comments ([c407fc7](https://github.com/SilentVoid13/Templater/commit/c407fc7fdfc348bec63c0716c251021642c16f4d)), closes [#235](https://github.com/SilentVoid13/Templater/issues/235)
* fixing multiple dynamic commands bug ([d6e2d86](https://github.com/SilentVoid13/Templater/commit/d6e2d8650be72d7d402692d2c49215234ecf7d2a)), closes [#195](https://github.com/SilentVoid13/Templater/issues/195)

## [1.7.0](https://github.com/SilentVoid13/Templater/compare/1.6.0...1.7.0) (2021-05-22)


### Features

* adding multiple cursor at the same with tp.file.cursor ([9a54e90](https://github.com/SilentVoid13/Templater/commit/9a54e90b1faaa8efc72dcbccb6fa6c6823b1972d)), closes [#99](https://github.com/SilentVoid13/Templater/issues/99)
* Allow users to provide a default template for empty new files ([#203](https://github.com/SilentVoid13/Templater/issues/203)) ([4903f15](https://github.com/SilentVoid13/Templater/commit/4903f15389bba62b2859644ee2fb463af8abfe85)), closes [#200](https://github.com/SilentVoid13/Templater/issues/200)


### Bug Fixes

* fixing documentation broken links ([3213bfa](https://github.com/SilentVoid13/Templater/commit/3213bfac79859f7f10c061449a8f2715d9672797)), closes [#194](https://github.com/SilentVoid13/Templater/issues/194)
* fixing dynamic commands format break ([7e06048](https://github.com/SilentVoid13/Templater/commit/7e06048a3afd44bac4b2f41d215a99ad7a92e10b)), closes [#190](https://github.com/SilentVoid13/Templater/issues/190) [#204](https://github.com/SilentVoid13/Templater/issues/204)
* fixing dynamic commands match when inserting template ([dcefbc7](https://github.com/SilentVoid13/Templater/commit/dcefbc73ab706f257c788cb2ff07a45695fb5fdf)), closes [#188](https://github.com/SilentVoid13/Templater/issues/188)
* fixing invalid null comparison getting triggered on empty strings ([1df50cf](https://github.com/SilentVoid13/Templater/commit/1df50cfff6fc48162f324c0f14b63d80197eeea7))

## [1.6.0](https://github.com/SilentVoid13/Templater/compare/1.5.5...1.6.0) (2021-05-03)


### Features

* adding better error handling, more user-friendly too ([51e9411](https://github.com/SilentVoid13/Templater/commit/51e94119001911d7817504fdbdc236919d58a173))
* adding dynamic templates, rendering in preview mode ([0e2442c](https://github.com/SilentVoid13/Templater/commit/0e2442cacdcee517a3313951a177cdc77eaf2dcb)), closes [#181](https://github.com/SilentVoid13/Templater/issues/181) [#131](https://github.com/SilentVoid13/Templater/issues/131) [#63](https://github.com/SilentVoid13/Templater/issues/63)
* adding new tp.config module ([39c224a](https://github.com/SilentVoid13/Templater/commit/39c224ad7ecbcfb4c972f863f24c36e2f33ccf1d))
* adding new tp.file.move to move a file across the vault ([3877dde](https://github.com/SilentVoid13/Templater/commit/3877dde6654507881d64c26e8eb59574992f23f3)), closes [#103](https://github.com/SilentVoid13/Templater/issues/103)
* adding script user functions ([4a3404c](https://github.com/SilentVoid13/Templater/commit/4a3404c834ab22e9d44ba87b1fc2d63f975eefcc)), closes [#123](https://github.com/SilentVoid13/Templater/issues/123) [#85](https://github.com/SilentVoid13/Templater/issues/85)
* adding tp.file.exists function ([e4273b7](https://github.com/SilentVoid13/Templater/commit/e4273b706465df012648b8a0163018f4925b5808)), closes [#150](https://github.com/SilentVoid13/Templater/issues/150)


### Bug Fixes

* fixing typo in tp.system ([efd8711](https://github.com/SilentVoid13/Templater/commit/efd8711a4f23a2326cd8d156f1545881a9e1c738)), closes [#144](https://github.com/SilentVoid13/Templater/issues/144)

### [1.5.5](https://github.com/SilentVoid13/Templater/compare/1.5.4...1.5.5) (2021-04-22)


### Features

* **internaltemplates:** adding new tp.system.suggester ([91cd04e](https://github.com/SilentVoid13/Templater/commit/91cd04ed22fb19c9f60a9d598520ea4c62bc5c72))
* adding the tp.obsidian object to access obsidian functions if needed ([eab1178](https://github.com/SilentVoid13/Templater/commit/eab11785f5c411aaf8ac7ab8c5e1e8047b8d6ed0))
* **settings:** adding a setting to specify a custom shell to run command with(powershell, zsh, ...) ([d7e6894](https://github.com/SilentVoid13/Templater/commit/d7e6894f0d00f672b326460a7554c976f10e51c9)), closes [#129](https://github.com/SilentVoid13/Templater/issues/129) [#128](https://github.com/SilentVoid13/Templater/issues/128)


### Bug Fixes

* fixing tp.dynamic ([7f16c94](https://github.com/SilentVoid13/Templater/commit/7f16c9412f92a955a63713f8f458a832e5e068b5))
* fixing tp.file.include on block when the block is the last block of the file ([f886b1c](https://github.com/SilentVoid13/Templater/commit/f886b1c51c201f13feea53b09cd5885ac244628e)), closes [#124](https://github.com/SilentVoid13/Templater/issues/124)
* fixing tp.system.prompt, now handles cancellation ([6afad93](https://github.com/SilentVoid13/Templater/commit/6afad93063bbe5868a407d2fb5c563972bcb8933)), closes [#125](https://github.com/SilentVoid13/Templater/issues/125)

### [1.5.4](https://github.com/SilentVoid13/Templater/compare/1.5.3...1.5.4) (2021-04-17)


### Features

* **settings:** adding toggles for security relevant Templater features ([5f1432b](https://github.com/SilentVoid13/Templater/commit/5f1432b757afe76e96e5bffc9e8a6379a1351c7c))

### [1.5.3](https://github.com/SilentVoid13/Templater/compare/1.5.2...1.5.3) (2021-04-17)


### Features

* **internaltemplates:** upgrading tp.file.include to accept obsidian links ([77f167c](https://github.com/SilentVoid13/Templater/commit/77f167c84412c01d3d16b25b7ebb8d10f8293a19))

### [1.5.2](https://github.com/SilentVoid13/Templater/compare/1.5.1...1.5.2) (2021-04-16)


### Features

* **internaltemplates:** adding new tp.system module with the tp.system.prompt internal function ([e3ea6ae](https://github.com/SilentVoid13/Templater/commit/e3ea6ae00d00bdfe22f6ddf433521ab47ce347bb)), closes [#111](https://github.com/SilentVoid13/Templater/issues/111)


### Bug Fixes

* fixing tp.date documentation error ([8a8559f](https://github.com/SilentVoid13/Templater/commit/8a8559f6d5dbf788211bc089c8243119c0f8adf2)), closes [#113](https://github.com/SilentVoid13/Templater/issues/113)

### [1.5.1](https://github.com/SilentVoid13/Templater/compare/1.5.0...1.5.1) (2021-04-14)


### Features

* **internaltemplates:** adding multi-cursor to tp.file.cursor ([81a5c1d](https://github.com/SilentVoid13/Templater/commit/81a5c1d2a67d5b7bd00698688e36815aa09aa168)), closes [#99](https://github.com/SilentVoid13/Templater/issues/99)


### Bug Fixes

* fixing frontmatter potential bug ([8be0d41](https://github.com/SilentVoid13/Templater/commit/8be0d41fc6fc107d0b53fb1d18871b369a5ba8df))
* fixing modal opening on "create new from template" when only 1 file exists ([7cf6215](https://github.com/SilentVoid13/Templater/commit/7cf6215bb2a6195d10da1175557ca780f98cf24e)), closes [#73](https://github.com/SilentVoid13/Templater/issues/73)
* **internaltemplates:** fixing tp.web.random_picture randomness issue ([5f69f92](https://github.com/SilentVoid13/Templater/commit/5f69f92a1624b66eb191d60ea321483b3d76dda2))
* **user templates:** removing right trailing newlines from user commands ([387d274](https://github.com/SilentVoid13/Templater/commit/387d274f95f3ff2bd20c7a9e07b77b1ab6c4c29b)), closes [#108](https://github.com/SilentVoid13/Templater/issues/108) [#92](https://github.com/SilentVoid13/Templater/issues/92)
* fixing documentation bug with pipe "|" in array ([0c2d55d](https://github.com/SilentVoid13/Templater/commit/0c2d55dd7785698e038dcb06a1883ef1a5965563))

## [1.5.0](https://github.com/SilentVoid13/Templater/compare/1.4.0...1.5.0) (2021-04-13)


### Features

* **internaltemplates:** adding ISO 8601 offset format support for tp.date.now ([7054cab](https://github.com/SilentVoid13/Templater/commit/7054cab8c1e1ee3c6edab4188fd1327f189b9b45)), closes [#100](https://github.com/SilentVoid13/Templater/issues/100)
* **internaltemplates:** adding tp.date.weekday internal template ([337ad24](https://github.com/SilentVoid13/Templater/commit/337ad242b2ed0329326ec69b0f3d7232b5184ec4))

## [1.4.0](https://github.com/SilentVoid13/Templater/compare/1.3.0...1.4.0) (2021-04-12)


### Features

* adding a "create new from template" to file menu. Adding a new icon ([4eafb3b](https://github.com/SilentVoid13/Templater/commit/4eafb3ba7682b2d5240a4f1d162f75f45d2d91e8)), closes [#73](https://github.com/SilentVoid13/Templater/issues/73)


### Bug Fixes

* **internaltemplates:** fixing bug using old frontmatter data when it doesn't exist ([1734347](https://github.com/SilentVoid13/Templater/commit/173434715cb2fbde7943627008c25fece5f9f9c0))

## [1.3.0](https://github.com/SilentVoid13/Templater/compare/1.2.2...1.3.0) (2021-04-10)


### Features

* **internaltemplates:** new tp.file.cursor abilities: cursor jump order ([31abe49](https://github.com/SilentVoid13/Templater/commit/31abe4912ad2bfd0eb1be53689ad1d88d95b192a))


### Bug Fixes

* fixing create new note from template when file "Untitled" already exists ([169ca11](https://github.com/SilentVoid13/Templater/commit/169ca116d31a041c4f17a56abebef4664d3db6dc)), closes [#73](https://github.com/SilentVoid13/Templater/issues/73)

### [1.2.2](https://github.com/SilentVoid13/Templater/compare/1.2.1...1.2.2) (2021-04-10)


### Bug Fixes

* fixed tp.file.include bug, added static and dynamic templates for modules ([559ffd9](https://github.com/SilentVoid13/Templater/commit/559ffd9671e86a7d9a62c2c5b41f5e0313b965bb)), closes [#91](https://github.com/SilentVoid13/Templater/issues/91)

### [1.2.1](https://github.com/SilentVoid13/Templater/compare/1.2.0...1.2.1) (2021-04-08)


### Bug Fixes

* **settings:** adding a toggle for the update notice ([0bf6cb0](https://github.com/SilentVoid13/Templater/commit/0bf6cb014b3b19054dfd4bcf98fda0c801e45853)), closes [#90](https://github.com/SilentVoid13/Templater/issues/90)

## [1.2.0](https://github.com/SilentVoid13/Templater/compare/1.1.0...1.2.0) (2021-04-08)


### Features

* **internaltemplates:** adding tp.file.clipboard internal function ([65d0e08](https://github.com/SilentVoid13/Templater/commit/65d0e08dddcd2a1b349be7d62982be4c85b00d50)), closes [#86](https://github.com/SilentVoid13/Templater/issues/86)


### Bug Fixes

* **fuzzysuggest:** sorting files alphabetically in modal ([35e388c](https://github.com/SilentVoid13/Templater/commit/35e388c935aff749a7001c1bfd0899e00926aaca)), closes [#83](https://github.com/SilentVoid13/Templater/issues/83)

## [1.1.0](https://github.com/SilentVoid13/Templater/compare/1.0.0...1.1.0) (2021-04-06)


### Features

* adding new hotkey to create new from template ([f27d59e](https://github.com/SilentVoid13/Templater/commit/f27d59eb7f8551fd9890eee1cbef45ddd1054ec7)), closes [#73](https://github.com/SilentVoid13/Templater/issues/73)

## [1.0.0](https://github.com/SilentVoid13/Templater/compare/0.5.6...1.0.0) (2021-04-05)


### Features

* **package:** adding cz conventional commit ([f688a7f](https://github.com/SilentVoid13/Templater/commit/f688a7f5b6986c2d792d5823af87a304ef9c3517))
* **parsers:** adding dynamic templates ([7a08fd8](https://github.com/SilentVoid13/Templater/commit/7a08fd8ada08f71331fad54ac224942fe0c145f4)), closes [#63](https://github.com/SilentVoid13/Templater/issues/63)
* **templateparser:** adding ability to tab from tp.cursor to tp.cursor ([8565349](https://github.com/SilentVoid13/Templater/commit/8565349fb81097562c1e8f05b98a2a8dbcec666a)), closes [#50](https://github.com/SilentVoid13/Templater/issues/50)
* **usertemplates:** adding arguments for user templates ([58ff185](https://github.com/SilentVoid13/Templater/commit/58ff18598645f7d8de5f54f1eb3dba2fa5f3c8b4)), closes [#34](https://github.com/SilentVoid13/Templater/issues/34) [#65](https://github.com/SilentVoid13/Templater/issues/65)


### Bug Fixes

* **internaltemplates:** fixing tp.file.rename not working correctly ([26a8f62](https://github.com/SilentVoid13/Templater/commit/26a8f6278e4a7e23be2744038d519a2350a06396))
* **mobile:** fixing mobile error with promisify ([b207f54](https://github.com/SilentVoid13/Templater/commit/b207f5408147b97bf89ce6b5ab2281c15ccde7c3))
* **moduleweb:** fixing web module to work on both app and mobile ([e0956d7](https://github.com/SilentVoid13/Templater/commit/e0956d7e04b8695a8ff2c4ea51dc9703e9973450))
* **settings:** fixing broken linkk ([e472de4](https://github.com/SilentVoid13/Templater/commit/e472de409902b0865bd40bb3541202939090be43))
* **templateparser:** fixing file recovery popup when jumping to next cursor ([06c60df](https://github.com/SilentVoid13/Templater/commit/06c60df0714c9f0ba7f2e1be6a432632252ee9aa))
* **usertemplates:** fixing user arguments ([dc46b15](https://github.com/SilentVoid13/Templater/commit/dc46b15d24138ebb010fdb3c9b8dd76fde9d53c8))

### 0.5.8 (2021-03-25)


### Features

* **package:** adding cz conventional commit ([f688a7f](https://github.com/SilentVoid13/Templater/commit/f688a7f5b6986c2d792d5823af87a304ef9c3517))
