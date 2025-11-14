import * as vscode from "vscode";
import * as path from "path";

/**
 * Checks if a file path matches common test file patterns
 */
export function isTestFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  const testPatterns = [
    /\.test\.(js|jsx|ts|tsx)$/i,
    /\.spec\.(js|jsx|ts|tsx)$/i,
    /\.test\.(mjs|cjs)$/i,
    /\.spec\.(mjs|cjs)$/i,
  ];
  return testPatterns.some((pattern) => pattern.test(fileName));
}

/**
 * Extracts the base name from a test file
 * Examples:
 *   Component.test.js -> Component
 *   useFancyHook.test.ts -> useFancyHook
 *   MyComponent.spec.jsx -> MyComponent
 */
export function getBaseNameFromTestFile(filePath: string): string {
  const fileName = path.basename(filePath);
  // Remove .test or .spec and the extension
  const baseName = fileName.replace(
    /\.(test|spec)\.(js|jsx|ts|tsx|mjs|cjs)$/i,
    ""
  );
  return baseName;
}

/**
 * Extracts the base name from a source file
 * Examples:
 *   Component.jsx -> Component
 *   useFancyHook.ts -> useFancyHook
 *   MyComponent.js -> MyComponent
 */
export function getBaseNameFromSourceFile(filePath: string): string {
  const fileName = path.basename(filePath);
  // Remove the extension
  const baseName = fileName.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/i, "");
  return baseName;
}

/**
 * Gets the directory of the current file
 */
export function getFileDirectory(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * Finds a test file for a given source file
 */
export async function findTestFile(
  sourceFilePath: string
): Promise<vscode.Uri | null> {
  const baseName = getBaseNameFromSourceFile(sourceFilePath);
  const sourceExt = path.extname(sourceFilePath);

  // Common test file extensions and patterns
  const testExtensions = [
    ".test.js",
    ".test.jsx",
    ".test.ts",
    ".test.tsx",
    ".spec.js",
    ".spec.jsx",
    ".spec.ts",
    ".spec.tsx",
  ];

  // Also check for .test.mjs, .test.cjs, etc.
  if (sourceExt === ".mjs") {
    testExtensions.push(".test.mjs", ".spec.mjs");
  } else if (sourceExt === ".cjs") {
    testExtensions.push(".test.cjs", ".spec.cjs");
  }

  // Exclude common directories that shouldn't be searched
  const excludePattern =
    "**/{node_modules,dist,build,.git,.vscode,coverage}/**";

  // Search the entire workspace using glob patterns
  for (const ext of testExtensions) {
    const pattern = `**/${baseName}${ext}`;
    const files = await vscode.workspace.findFiles(
      pattern,
      excludePattern,
      1 // Limit to 1 result for performance
    );

    if (files.length > 0) {
      return files[0];
    }
  }

  return null;
}

/**
 * Finds a source file for a given test file
 */
export async function findSourceFile(
  testFilePath: string
): Promise<vscode.Uri | null> {
  const baseName = getBaseNameFromTestFile(testFilePath);
  const testExt = path.extname(testFilePath);

  // Determine source extensions based on test file extension
  let sourceExtensions: string[] = [];
  if (testExt === ".js" || testExt === ".mjs" || testExt === ".cjs") {
    sourceExtensions = [".js", ".jsx", ".mjs", ".cjs"];
  } else if (testExt === ".ts" || testExt === ".tsx") {
    sourceExtensions = [".ts", ".tsx"];
  }

  // Exclude common directories that shouldn't be searched
  const excludePattern =
    "**/{node_modules,dist,build,.git,.vscode,coverage}/**";

  // Search the entire workspace using glob patterns
  for (const ext of sourceExtensions) {
    const pattern = `**/${baseName}${ext}`;
    const files = await vscode.workspace.findFiles(
      pattern,
      excludePattern,
      1 // Limit to 1 result for performance
    );

    if (files.length > 0) {
      // Exclude test files from results (in case baseName matches a test file)
      const sourceFile = files.find((file) => !isTestFile(file.fsPath));
      if (sourceFile) {
        return sourceFile;
      }
    }
  }

  return null;
}

/**
 * Main command to jump between test and source files
 */
async function jumpToTestOrSource() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("No active editor");
    return;
  }

  const currentFile = editor.document.uri.fsPath;

  // Skip if file is not a JavaScript/TypeScript file
  const ext = path.extname(currentFile);
  if (![".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"].includes(ext)) {
    vscode.window.showWarningMessage(
      "Current file is not a JavaScript or TypeScript file"
    );
    return;
  }

  let targetFile: vscode.Uri | null = null;

  if (isTestFile(currentFile)) {
    // We're in a test file, find the source file
    targetFile = await findSourceFile(currentFile);
    if (!targetFile) {
      vscode.window.showWarningMessage(
        `Could not find source file for ${path.basename(currentFile)}`
      );
      return;
    }
  } else {
    // We're in a source file, find the test file
    targetFile = await findTestFile(currentFile);
    if (!targetFile) {
      vscode.window.showWarningMessage(
        `Could not find test file for ${path.basename(currentFile)}`
      );
      return;
    }
  }

  // Open the target file
  const document = await vscode.workspace.openTextDocument(targetFile);
  await vscode.window.showTextDocument(document);
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "hopToTest.hop",
    jumpToTestOrSource
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
