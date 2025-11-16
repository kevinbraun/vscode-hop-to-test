/**
 * Exclude common directories that shouldn't be searched
 */
export const EXCLUDE_FILE_PATTERN =
  "**/{node_modules,dist,build,.git,.vscode,coverage}/**";

/**
 * Language configuration for file/test pattern matching
 */
export interface LanguageConfig {
  sourcePatterns: string[];
  testPatterns: string[];
}

/**
 * Default language configurations
 *
 * Each configuration defines:
 * - sourcePatterns: File extensions for source files
 * - testPatterns: File patterns for test files
 *
 * Within each configuration, you can hop from any source pattern to any test pattern
 * and vice versa. This enables bidirectional hopping between all related files.
 */
export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  //
  // JavaScript/TypeScript/Vue
  //
  {
    sourcePatterns: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue"],
    testPatterns: [
      ".test.js",
      ".test.jsx",
      ".test.ts",
      ".test.tsx",
      ".spec.js",
      ".spec.jsx",
      ".spec.ts",
      ".spec.tsx",
      ".test.mjs",
      ".test.cjs",
      ".spec.mjs",
      ".spec.cjs",
    ],
  },

  //
  // E.g., Ruby
  //
  // {
  //   languageIds: ["ruby"],
  //   sourcePatterns: [".rb"],
  //   testPatterns: ["_spec.rb", "_test.rb"],
  // },
];
