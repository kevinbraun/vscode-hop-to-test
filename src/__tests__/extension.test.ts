// import * as path from "path";

import {
  isTestFile,
  getBaseNameFromTestFile,
  getBaseNameFromSourceFile,
  getFileDirectory,
  findTestFile,
  findSourceFile,
} from "../extension";
import * as vscode from "vscode";

// Mock vscode workspace
jest.mock("vscode", () => ({
  ...jest.requireActual("vscode"),
  workspace: {
    findFiles: jest.fn(),
  },
}));

describe("isTestFile", () => {
  it("should identify .test.js files", () => {
    expect(isTestFile("/path/to/Component.test.js")).toBe(true);
    expect(isTestFile("/path/to/useHook.test.js")).toBe(true);
  });

  it("should identify .test.ts files", () => {
    expect(isTestFile("/path/to/Component.test.ts")).toBe(true);
    expect(isTestFile("/path/to/useHook.test.ts")).toBe(true);
  });

  it("should identify .test.jsx files", () => {
    expect(isTestFile("/path/to/Component.test.jsx")).toBe(true);
  });

  it("should identify .test.tsx files", () => {
    expect(isTestFile("/path/to/Component.test.tsx")).toBe(true);
  });

  it("should identify .spec.js files", () => {
    expect(isTestFile("/path/to/Component.spec.js")).toBe(true);
  });

  it("should identify .spec.ts files", () => {
    expect(isTestFile("/path/to/Component.spec.ts")).toBe(true);
  });

  it("should identify .test.mjs files", () => {
    expect(isTestFile("/path/to/Component.test.mjs")).toBe(true);
  });

  it("should identify .test.cjs files", () => {
    expect(isTestFile("/path/to/Component.test.cjs")).toBe(true);
  });

  it("should be case insensitive", () => {
    expect(isTestFile("/path/to/Component.TEST.JS")).toBe(true);
    expect(isTestFile("/path/to/Component.Spec.Ts")).toBe(true);
  });

  it("should not identify regular source files", () => {
    expect(isTestFile("/path/to/Component.js")).toBe(false);
    expect(isTestFile("/path/to/Component.ts")).toBe(false);
    expect(isTestFile("/path/to/Component.jsx")).toBe(false);
    expect(isTestFile("/path/to/useHook.js")).toBe(false);
  });

  it("should not identify files with test in the name but not as extension", () => {
    expect(isTestFile("/path/to/testComponent.js")).toBe(false);
    expect(isTestFile("/path/to/ComponentTest.js")).toBe(false);
  });
});

describe("getBaseNameFromTestFile", () => {
  it("should extract base name from .test.js files", () => {
    expect(getBaseNameFromTestFile("/path/to/Component.test.js")).toBe(
      "Component"
    );
    expect(getBaseNameFromTestFile("/path/to/useFancyHook.test.js")).toBe(
      "useFancyHook"
    );
  });

  it("should extract base name from .test.ts files", () => {
    expect(getBaseNameFromTestFile("/path/to/Component.test.ts")).toBe(
      "Component"
    );
    expect(getBaseNameFromTestFile("/path/to/useFancyHook.test.ts")).toBe(
      "useFancyHook"
    );
  });

  it("should extract base name from .test.jsx files", () => {
    expect(getBaseNameFromTestFile("/path/to/MyComponent.test.jsx")).toBe(
      "MyComponent"
    );
  });

  it("should extract base name from .test.tsx files", () => {
    expect(getBaseNameFromTestFile("/path/to/MyComponent.test.tsx")).toBe(
      "MyComponent"
    );
  });

  it("should extract base name from .spec.js files", () => {
    expect(getBaseNameFromTestFile("/path/to/Component.spec.js")).toBe(
      "Component"
    );
  });

  it("should extract base name from .spec.ts files", () => {
    expect(getBaseNameFromTestFile("/path/to/Component.spec.ts")).toBe(
      "Component"
    );
  });

  it("should extract base name from .test.mjs files", () => {
    expect(getBaseNameFromTestFile("/path/to/Component.test.mjs")).toBe(
      "Component"
    );
  });

  it("should extract base name from .test.cjs files", () => {
    expect(getBaseNameFromTestFile("/path/to/Component.test.cjs")).toBe(
      "Component"
    );
  });

  it("should be case insensitive", () => {
    expect(getBaseNameFromTestFile("/path/to/Component.TEST.JS")).toBe(
      "Component"
    );
    expect(getBaseNameFromTestFile("/path/to/Component.Spec.Ts")).toBe(
      "Component"
    );
  });
});

describe("getBaseNameFromSourceFile", () => {
  it("should extract base name from .js files", () => {
    expect(getBaseNameFromSourceFile("/path/to/Component.js")).toBe(
      "Component"
    );
    expect(getBaseNameFromSourceFile("/path/to/useFancyHook.js")).toBe(
      "useFancyHook"
    );
  });

  it("should extract base name from .ts files", () => {
    expect(getBaseNameFromSourceFile("/path/to/Component.ts")).toBe(
      "Component"
    );
    expect(getBaseNameFromSourceFile("/path/to/useFancyHook.ts")).toBe(
      "useFancyHook"
    );
  });

  it("should extract base name from .jsx files", () => {
    expect(getBaseNameFromSourceFile("/path/to/MyComponent.jsx")).toBe(
      "MyComponent"
    );
  });

  it("should extract base name from .tsx files", () => {
    expect(getBaseNameFromSourceFile("/path/to/MyComponent.tsx")).toBe(
      "MyComponent"
    );
  });

  it("should extract base name from .mjs files", () => {
    expect(getBaseNameFromSourceFile("/path/to/Component.mjs")).toBe(
      "Component"
    );
  });

  it("should extract base name from .cjs files", () => {
    expect(getBaseNameFromSourceFile("/path/to/Component.cjs")).toBe(
      "Component"
    );
  });
});

describe("getFileDirectory", () => {
  it("should return the directory of a file", () => {
    expect(getFileDirectory("/path/to/Component.js")).toBe("/path/to");
    expect(getFileDirectory("/path/to/subdir/Component.js")).toBe(
      "/path/to/subdir"
    );
  });

  it("should handle relative paths", () => {
    expect(getFileDirectory("./Component.js")).toBe(".");
    expect(getFileDirectory("../Component.js")).toBe("..");
  });
});

describe("findTestFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should find test file in the same directory", async () => {
    const sourcePath = "/project/src/Component.js";
    const testPath = "/project/src/Component.test.js";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.test.js")) {
          return [vscode.Uri.file(testPath)];
        }
        return [];
      }
    );

    const result = await findTestFile(sourcePath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(testPath);
  });

  it("should find .test.ts file for .ts source", async () => {
    const sourcePath = "/project/src/useHook.ts";
    const testPath = "/project/src/useHook.test.ts";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("useHook.test.ts")) {
          return [vscode.Uri.file(testPath)];
        }
        return [];
      }
    );

    const result = await findTestFile(sourcePath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(testPath);
  });

  it("should find .spec.js file if .test.js does not exist", async () => {
    const sourcePath = "/project/src/Component.js";
    const testPath = "/project/src/Component.spec.js";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.spec.js")) {
          return [vscode.Uri.file(testPath)];
        }
        return [];
      }
    );

    const result = await findTestFile(sourcePath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(testPath);
  });

  it("should find test file in __tests__ directory", async () => {
    const sourcePath = "/project/src/Component.js";
    const testPath = "/project/src/__tests__/Component.test.js";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.test.js")) {
          return [vscode.Uri.file(testPath)];
        }
        return [];
      }
    );

    const result = await findTestFile(sourcePath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(testPath);
  });

  it("should find test file in tests directory", async () => {
    const sourcePath = "/project/src/Component.js";
    const testPath = "/project/src/tests/Component.test.js";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.test.js")) {
          return [vscode.Uri.file(testPath)];
        }
        return [];
      }
    );

    const result = await findTestFile(sourcePath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(testPath);
  });

  it("should find test file anywhere in workspace", async () => {
    const sourcePath = "/project/src/components/Component.js";
    const testPath = "/project/tests/integration/Component.test.js";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.test.js")) {
          return [vscode.Uri.file(testPath)];
        }
        return [];
      }
    );

    const result = await findTestFile(sourcePath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(testPath);
  });

  it("should return null if no test file is found", async () => {
    const sourcePath = "/project/src/Component.js";

    (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);

    const result = await findTestFile(sourcePath);

    expect(result).toBeNull();
  });

  it("should check .test.mjs for .mjs source files", async () => {
    const sourcePath = "/project/src/Component.mjs";
    const testPath = "/project/src/Component.test.mjs";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.test.mjs")) {
          return [vscode.Uri.file(testPath)];
        }
        return [];
      }
    );

    const result = await findTestFile(sourcePath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(testPath);
  });

  it("should check .test.cjs for .cjs source files", async () => {
    const sourcePath = "/project/src/Component.cjs";
    const testPath = "/project/src/Component.test.cjs";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.test.cjs")) {
          return [vscode.Uri.file(testPath)];
        }
        return [];
      }
    );

    const result = await findTestFile(sourcePath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(testPath);
  });
});

describe("findSourceFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should find source file in the same directory", async () => {
    const testPath = "/project/src/Component.test.js";
    const sourcePath = "/project/src/Component.js";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.js")) {
          return [vscode.Uri.file(sourcePath)];
        }
        return [];
      }
    );

    const result = await findSourceFile(testPath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(sourcePath);
  });

  it("should find .ts source file for .test.ts", async () => {
    const testPath = "/project/src/useHook.test.ts";
    const sourcePath = "/project/src/useHook.ts";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("useHook.ts")) {
          return [vscode.Uri.file(sourcePath)];
        }
        return [];
      }
    );

    const result = await findSourceFile(testPath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(sourcePath);
  });

  it("should find .jsx source file if .js does not exist", async () => {
    const testPath = "/project/src/Component.test.js";
    const sourcePath = "/project/src/Component.jsx";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.jsx")) {
          return [vscode.Uri.file(sourcePath)];
        }
        return [];
      }
    );

    const result = await findSourceFile(testPath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(sourcePath);
  });

  it("should find source file anywhere in workspace", async () => {
    const testPath = "/project/tests/Component.test.js";
    const sourcePath = "/project/src/components/Component.js";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.js")) {
          return [vscode.Uri.file(sourcePath)];
        }
        return [];
      }
    );

    const result = await findSourceFile(testPath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(sourcePath);
  });

  it("should exclude test files from results", async () => {
    const testPath = "/project/src/Component.test.js";
    const sourcePath = "/project/src/Component.js";
    const testFilePath = "/project/src/Component.test.js";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.js")) {
          // Return both source and test file, but source should be selected
          return [vscode.Uri.file(testFilePath), vscode.Uri.file(sourcePath)];
        }
        return [];
      }
    );

    const result = await findSourceFile(testPath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(sourcePath);
  });

  it("should return null if no source file is found", async () => {
    const testPath = "/project/src/Component.test.js";

    (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);

    const result = await findSourceFile(testPath);

    expect(result).toBeNull();
  });

  it("should check .tsx for .test.tsx files", async () => {
    const testPath = "/project/src/Component.test.tsx";
    const sourcePath = "/project/src/Component.tsx";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.tsx")) {
          return [vscode.Uri.file(sourcePath)];
        }
        return [];
      }
    );

    const result = await findSourceFile(testPath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(sourcePath);
  });

  it("should check .mjs and .cjs for .test.js files", async () => {
    const testPath = "/project/src/Component.test.js";
    const sourcePath = "/project/src/Component.mjs";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.mjs")) {
          return [vscode.Uri.file(sourcePath)];
        }
        return [];
      }
    );

    const result = await findSourceFile(testPath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(sourcePath);
  });
});
