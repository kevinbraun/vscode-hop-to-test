# Hop to Test

A VS Code extension that allows you to quickly hop between source files and their corresponding test files.

![demo](https://github.com/user-attachments/assets/adba6c6b-22e3-4304-af34-f3d7216c1d44)

## Features

- **Hop from source to test**: When viewing a source file (e.g., `SomeComponent.jsx`), hop to its test file (e.g., `SomeComponent.test.js`)
- **Hop from test to source**: When viewing a test file (e.g., `useFancyHook.test.js`), hop back to the source file (e.g., `useFancyHook.js`)
- **Multiple file patterns**: Supports `.test.js`, `.test.ts`, `.spec.js`, `.spec.ts`, and more
- **Multiple extensions**: Works with `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`

## Usage

1. Open a source file or test file in VS Code
2. Press `Ctrl+Shift+T` (or `Cmd+Shift+T` on macOS) to hop to the corresponding test/source file
3. Alternatively, use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for "Hop to Test/Source"

## Supported Patterns

### Source Files

- `Component.jsx` → `Component.test.js` or `Component.test.jsx`
- `useHook.ts` → `useHook.test.ts`
- `MyComponent.js` → `MyComponent.test.js` or `MyComponent.spec.js`

### Test Files

- `Component.test.js` → `Component.js` or `Component.jsx`
- `useHook.test.ts` → `useHook.ts` or `useHook.tsx`
- `MyComponent.spec.js` → `MyComponent.js` or `MyComponent.jsx`

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
