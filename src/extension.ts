import * as vscode from "vscode";
import * as path from "path";

/**
 * Language configuration for file/test pattern matching
 */
export interface LanguageConfig {
  sourcePatterns: string[];
  testPatterns: string[];
}

/** The user-configurable language configuration entry - uses a comma separated string for sourcePatterns and testPatterns */
export interface LanguageConfigEntry {
  sourcePatterns: string;
  testPatterns: string;
}

/**
 * Finds the language configuration that matches a given file path
 */
export function findLanguageConfig(filePath: string): LanguageConfig | null {
  const fileName = path.basename(filePath).toLowerCase();

  // Get the user-configurable language configuration entries and convert them to LanguageConfig[]
  let userSettingConfigEntries = vscode.workspace
    .getConfiguration("hopToTest")
    .get("languageConfigs") as LanguageConfigEntry[] | undefined;

  // ensure userSettingConfigEntries is an array
  userSettingConfigEntries = userSettingConfigEntries || [];

  const languageConfigs = userSettingConfigEntries.map(
    (entry: LanguageConfigEntry) => {
      return {
        sourcePatterns: entry.sourcePatterns
          .split(",")
          .map((pattern) => pattern.trim()),
        testPatterns: entry.testPatterns
          .split(",")
          .map((pattern) => pattern.trim()),
      };
    }
  ) as LanguageConfig[];

  for (const config of languageConfigs) {
    // Check if file matches any source pattern
    const matchesSource = config.sourcePatterns.some((pattern) => {
      return fileName.endsWith(pattern.toLowerCase());
    });

    // Check if file matches any test pattern
    const matchesTest = config.testPatterns.some((pattern) => {
      return fileName.endsWith(pattern.toLowerCase());
    });

    if (matchesSource || matchesTest) {
      return config;
    }
  }

  return null;
}

/**
 * Checks if a file path matches any test file pattern from the language configs
 */
export function isTestFile(filePath: string): boolean {
  const config = findLanguageConfig(filePath);
  if (!config) {
    return false;
  }

  const fileName = path.basename(filePath).toLowerCase();
  return config.testPatterns.some((pattern) => {
    return fileName.includes(pattern.toLowerCase());
  });
}

/**
 * Extracts the base name from a file using the provided source/test patterns
 * Examples:
 *   Component.test.js -> Component (with test patterns)
 *   Component.jsx -> Component (with source patterns)
 *   useFancyHook.test.ts -> useFancyHook (with test patterns)
 */
export function getBaseNameFromFile(
  filePath: string,
  config: LanguageConfig | null,
  patterns: string[]
): string {
  if (!config) {
    // Fallback: return filename without extension
    return path.basename(filePath, path.extname(filePath));
  }

  const fileName = path.basename(filePath);
  const fileNameLower = fileName.toLowerCase();

  // Try each pattern to extract the base name
  for (const pattern of patterns) {
    const patternLower = pattern.toLowerCase();

    // For source patterns (like .js), they're at the end, so use endsWith
    // This ensures we match the last occurrence, not the first
    if (fileNameLower.endsWith(patternLower)) {
      return fileName.substring(0, fileName.length - pattern.length);
    }
  }

  // Fallback: return filename without extension
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Finds a test file for a given source file
 * Can find any test pattern for any source pattern within the same language config
 */
export async function findTestFile(
  sourceFilePath: string,
  config: LanguageConfig,
  excludeFilePattern: string
): Promise<vscode.Uri | null> {
  const baseName = getBaseNameFromFile(
    sourceFilePath,
    config,
    config.sourcePatterns
  );

  // Search for all test patterns in the config
  for (const testPattern of config.testPatterns) {
    const pattern = `**/${baseName}${testPattern}`;
    const files = await vscode.workspace.findFiles(
      pattern,
      excludeFilePattern,
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
 * Can find any source pattern for any test pattern within the same language config
 */
export async function findSourceFile(
  testFilePath: string,
  config: LanguageConfig,
  excludeFilePattern: string
): Promise<vscode.Uri | null> {
  const baseName = getBaseNameFromFile(
    testFilePath,
    config,
    config.testPatterns
  );

  // Search for all source patterns in the config
  for (const sourcePattern of config.sourcePatterns) {
    const pattern = `**/${baseName}${sourcePattern}`;
    const files = await vscode.workspace.findFiles(
      pattern,
      excludeFilePattern,
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
  if (!editor) return;

  const currentFile = editor.document.uri.fsPath;

  const excludeFilePattern = vscode.workspace
    .getConfiguration("hopToTest")
    .get("excludeFilePattern") as string;

  // Check if file matches any language config
  const config = findLanguageConfig(currentFile);
  if (!config) {
    displayMessage(
      `${path.basename(currentFile)} does not have a supported file type`
    );
    return;
  }

  let targetFile: vscode.Uri | null = null;

  if (isTestFile(currentFile)) {
    // We're in a test file, find the source file
    targetFile = await findSourceFile(currentFile, config, excludeFilePattern);
    if (!targetFile) {
      displayMessage(
        `Could not find source file for ${path.basename(currentFile)}`
      );
      return;
    }
  } else {
    // We're in a source file, find the test file
    targetFile = await findTestFile(currentFile, config, excludeFilePattern);
    if (!targetFile) {
      displayMessage(
        `Could not find test file for ${path.basename(currentFile)}`
      );
      return;
    }
  }

  // Open the target file
  const document = await vscode.workspace.openTextDocument(targetFile);
  await vscode.window.showTextDocument(document);
}

function displayMessage(message: string) {
  const statusBarMsg = vscode.window.setStatusBarMessage(
    "Hop to Test: " + message
  );

  setTimeout(() => statusBarMsg.dispose(), 5000);
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "hopToTest.hop",
    jumpToTestOrSource
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
