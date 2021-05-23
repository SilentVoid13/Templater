# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
