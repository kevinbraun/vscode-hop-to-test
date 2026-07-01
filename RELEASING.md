# Releasing Hop to Test

This extension is published to:

- [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=kbraun.hop-to-test) (`vsce`)
- [Open VSX Registry](https://open-vsx.org/extension/kbraun/hop-to-test) (`ovsx`)
- [GitHub Releases](https://github.com/kevinbraun/vscode-hop-to-test/releases) (`.vsix` attachment for manual installs)

## Prerequisites

Install dependencies:

```bash
npm install
```

Install publishing CLIs (if not already available):

```bash
# vsce is already a devDependency; npx works without a global install
npx vsce --version

# ovsx is not bundled — install globally or use npx
npm install -g ovsx
# or: npx ovsx --version
```

### Authentication

**Visual Studio Marketplace** — create a [Personal Access Token](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate) with **Marketplace (Manage)** scope, then:

```bash
vsce login kbraun
# paste PAT when prompted
```

Alternatively, set `VSCE_PAT` in your environment.

**Open VSX** — create an access token at [open-vsx.org](https://open-vsx.org/user-settings/tokens), then:

```bash
export OVSX_PAT=<your-token>
# or pass with -p on each publish
```

## Release checklist

1. Ensure `main` is clean and up to date.
2. Run tests and lint:

   ```bash
   npm test
   npm run lint
   ```

3. Update `CHANGELOG.md` — add a new version section with date, following [Keep a Changelog](https://keepachangelog.com/) format. Add a compare link at the bottom.
4. Bump `version` in `package.json` (semver).
5. Commit the version bump and changelog:

   ```bash
   git add CHANGELOG.md package.json package-lock.json
   git commit -m "Release vX.Y.Z"
   ```

## Build

Package the extension into `build/`:

```bash
npm run vscode:package
```

This runs `vscode:prepublish` (compile) and produces `build/hop-to-test-<version>.vsix`.

Sanity-check the package contents:

```bash
npx vsce ls --tree build/hop-to-test-<version>.vsix
```

## Publish

### Visual Studio Marketplace

Publish directly from source (compiles via `vscode:prepublish`):

```bash
npx vsce publish
```

Or publish the pre-built `.vsix`:

```bash
npx vsce publish -i build/hop-to-test-<version>.vsix
```

### Open VSX

```bash
ovsx publish build/hop-to-test-<version>.vsix -p $OVSX_PAT
```

### GitHub Release

1. Push the release commit and tag:

   ```bash
   git tag v<version>
   git push origin main --tags
   ```

2. Create a [GitHub Release](https://github.com/kevinbraun/vscode-hop-to-test/releases/new) for the tag.
3. Paste the changelog entry for this version as the release notes.
4. Attach `build/hop-to-test-<version>.vsix` as a release asset.

## Quick reference

| Step              | Command                                              |
| ----------------- | ---------------------------------------------------- |
| Test              | `npm test`                                           |
| Lint              | `npm run lint`                                       |
| Package           | `npm run vscode:package`                             |
| Marketplace       | `npx vsce publish`                                   |
| Open VSX          | `ovsx publish build/hop-to-test-<version>.vsix -p $OVSX_PAT` |
| Extension ID      | `kbraun.hop-to-test`                                 |
| Publisher         | `kbraun`                                             |

## Troubleshooting

**`vsce publish` rejects the version** — the version in `package.json` must be higher than what is already on the Marketplace. Bump and repackage.

**`ovsx publish` fails with auth error** — verify `OVSX_PAT` is set and the token has not expired.

**Missing files in the `.vsix`** — check `.vscodeignore`. Source (`src/`) is excluded; compiled output in `out/` must be present after `npm run compile`.

**Forgot to update `CHANGELOG.md`** — Marketplace and Open VSX read `CHANGELOG.md` from the package. Update it before packaging.
