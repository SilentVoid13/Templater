# Contributing to Templater

Thank you for your interest in contributing to Templater — a powerful templating plugin for [Obsidian](https://obsidian.md)! Contributions of all sizes are welcome, from small bug fixes to new features and documentation improvements.

User documentation is available at https://silentvoid13.github.io/Templater/

---

## Ways to Contribute

- **Bug reports** — open a GitHub issue describing the problem and steps to reproduce
- **Feature requests** — open a GitHub issue or discussion with your proposal
- **Code contributions** — bug fixes and features via pull requests (see below)
- **New internal functions** — see the [internal functions contribution guide](https://silentvoid13.github.io/Templater/internal-functions/contribute.html) for details
- **Documentation** — improvements to the `/docs` folder via pull requests (no issue required)

---

## Development Setup

**Prerequisites:** Node.js 20+, pnpm

```sh
npm install -g pnpm
```

1. Fork and clone the repository
2. Install dependencies:
    ```sh
    pnpm install
    ```
3. Start the development server (watch mode):
    ```sh
    pnpm dev
    ```
    The build automatically copies output to `test/vault/.obsidian/plugins/templater-obsidian/`, so you can point a local Obsidian instance at `test/vault` to test changes live.

---

## Code Style

- **TypeScript** with strict mode — run `pnpm typecheck` before submitting
- **Prettier** for formatting (4-space tabs, semicolons) and **ESLint** for linting — both covered by:
    ```sh
    pnpm lint
    ```
- CI enforces these checks on every release; PRs should pass locally before submission

---

## Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Example: `fix(parser): handle nested tags correctly`

Commit messages drive the automated changelog and semantic versioning, so please follow the format.

---

## Testing

End-to-end tests run via **WebdriverIO** against a real Obsidian instance.

```sh
pnpm test
```

- Tests live in `test/specs/`
- **Bug fixes and new features must include tests** — PRs that change behavior without tests will be asked to add them

---

## Pull Request Process

For bug fixes and new features, **please open a GitHub issue before starting work** so the approach can be discussed. This avoids wasted effort on PRs that may not align with the project's direction. Documentation improvements can skip this step.

1. Create or find an existing issue and get agreement on the approach
2. Create a branch off `master`
3. Make your changes, ensuring `pnpm typecheck`, `pnpm lint`, and `pnpm test` all pass
4. Open a PR with a title in conventional-commit format (e.g. `fix(parser): handle edge case`)
5. Describe what changed and why, and link the related issue

---

## Documentation Contributions

- Documentation source lives in `docs/src/` as Markdown files compiled by [mdBook](https://rust-lang.github.io/mdBook/)
- Preview locally:
    ```sh
    cd docs
    mdbook serve
    ```
    This serves the docs at `http://localhost:3000`
- Documentation changes in `docs/**` are deployed to GitHub Pages automatically on merge

---

## Release Process (maintainers only)

1. Run `pnpm release` — this invokes `standard-version` to bump versions and update `CHANGELOG.md`
2. Versions are synced across `package.json`, `manifest.json`, and `versions.json` via `scripts/versions-updater.cjs`
3. Push the resulting tag to trigger the `release.yml` workflow, which builds and publishes the GitHub release
