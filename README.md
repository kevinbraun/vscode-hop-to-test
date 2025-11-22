# Hop to Test

A VS Code extension that allows you to quickly hop between source files and their corresponding test files.

![demo](/docs/media/demo.gif)

## Features

- **Hop from source to test**: When viewing a source file (e.g., `SomeComponent.jsx`), hop to its test file (e.g., `SomeComponent.test.js`)
- **Hop from test to source**: When viewing a test file (e.g., `useFancyHook.test.js`), hop back to the source file (e.g., `useFancyHook.js`)
- **Multiple file patterns**: Supports `.test.js`, `.test.ts`, `.spec.js`, `.spec.ts`, and more
- **Multiple extensions**: Works with `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`

## Installation

This extension is available in the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=kbraun.hop-to-test) and the [Open VSX Registry](https://open-vsx.org/extension/kbraun/hop-to-test). It can be installed in a few ways:

- You can install the extension directly in Visual Studio Code/Cursor/Windsurf/etc by searching for "Hop to Test" in the extensions view
- You can install the extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=kbraun.hop-to-test) or the [Open VSX Registry](https://open-vsx.org/extension/kbraun/hop-to-test) in your browser
- You can download the `.vsix` file from the [latest release on GitHub](https://github.com/kevinbraun/vscode-hop-to-test/releases/latest) and install it manually in your editor

## Usage

1. Open a source file or test file in VS Code
2. Press `Ctrl+Shift+T` (or `Cmd+Shift+T` on macOS) to hop to the corresponding test/source file
3. Alternatively, use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for "Hop to Test/Source"

## Configuration

The extension supports configuration via the `hopToTest` section in the `settings.json` file. The following settings are available:

- `languageConfigs`: An array of language configuration objects. Each object defines the supported language file/test patterns for a given language.
- `excludeFilePattern`: A glob pattern to exclude files from the search when finding related test/source files.

### Language Configs

The `languageConfigs` array defines the supported language file/test patterns. Each configuration entry creates a bidirectional mapping: when you're in any file matching `sourcePatterns`, you can hop to any file matching `testPatterns` (and vice versa). The extension extracts the base filename and searches for matches across all patterns in the group.

For example, with `.js` and `.test.js` in the same config, opening `Component.js` will find `Component.test.js`, and opening `Component.test.js` will find `Component.js`.

Add different language configs for different languages.

#### Default language configs

By default, I've built in support for JavaScript/TypeScript (and React, Vue, etc.), and Ruby:

```json
{
  "hopToTest": {
    "languageConfigs": [
      {
        "sourcePatterns": ".js, .jsx, .ts, .tsx, .mjs, .cjs, .vue",
        "testPatterns": ".test.js, .test.jsx, .test.ts, .test.tsx, .spec.js, .spec.jsx, .spec.ts, .spec.tsx"
      },
      {
        "sourcePatterns": ".rb",
        "testPatterns": "_test.rb, _spec.rb"
      }
    ]
  }
}
```

### Exclude File Patterns

The `excludeFilePattern` setting is a glob pattern that is used to exclude files from the search when finding related test/source files.
The `excludeFilePattern` setting can be used to exclude files from the search when finding related test/source files.

#### Default exclude file pattern

By default, the extension will exclude files in the `node_modules`, `dist`, `build`, `.git`, `.vscode`, and `coverage` directories:

```json
{
  "hopToTest": {
    "excludeFilePattern": "**/{node_modules,dist,build,.git,.vscode,coverage}/**"
  }
}
```

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Testing

1. Press `F5` to open a new Extension Development Host window
2. Open a JavaScript/TypeScript file or test file
3. Press `Ctrl+Shift+T` (or `Cmd+Shift+T`) to test the extension

## License

MIT
