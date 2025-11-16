import {
  isTestFile,
  getBaseNameFromFile,
  findTestFile,
  findSourceFile,
  findLanguageConfig,
} from "../extension";
import { LANGUAGE_CONFIGS } from "../config";
import * as vscode from "vscode";

// Mock vscode workspace
jest.mock("vscode", () => ({
  ...jest.requireActual("vscode"),
  workspace: {
    ...jest.requireActual("vscode").workspace,
    findFiles: jest.fn(),
  },
}));

describe("findLanguageConfig", () => {
  it("should find config for .js source files", () => {
    const config = findLanguageConfig("/path/to/Component.js");
    expect(config).not.toBeNull();
    expect(config?.sourcePatterns).toContain(".js");
  });

  it("should find config for .ts source files", () => {
    const config = findLanguageConfig("/path/to/Component.ts");
    expect(config).not.toBeNull();
    expect(config?.sourcePatterns).toContain(".ts");
  });

  it("should find config for .test.js files", () => {
    const config = findLanguageConfig("/path/to/Component.test.js");
    expect(config).not.toBeNull();
    expect(config?.testPatterns).toContain(".test.js");
  });

  it("should find config for .spec.ts files", () => {
    const config = findLanguageConfig("/path/to/Component.spec.ts");
    expect(config).not.toBeNull();
    expect(config?.testPatterns).toContain(".spec.ts");
  });

  it("should return null for unsupported file types", () => {
    const config = findLanguageConfig("/path/to/Component.java");
    expect(config).toBeNull();
  });
});

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

describe("getBaseNameFromFile", () => {
  const jsConfig = LANGUAGE_CONFIGS[0];

  describe("with test patterns", () => {
    it("should extract base name from .test.js files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.test.js",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("Component");
      expect(
        getBaseNameFromFile(
          "/path/to/useFancyHook.test.js",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("useFancyHook");
    });

    it("should extract base name from .test.ts files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.test.ts",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("Component");
      expect(
        getBaseNameFromFile(
          "/path/to/useFancyHook.test.ts",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("useFancyHook");
    });

    it("should extract base name from .test.jsx files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/MyComponent.test.jsx",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("MyComponent");
    });

    it("should extract base name from .test.tsx files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/MyComponent.test.tsx",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("MyComponent");
    });

    it("should extract base name from .spec.js files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.spec.js",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("Component");
    });

    it("should extract base name from .spec.ts files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.spec.ts",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("Component");
    });

    it("should extract base name from .test.mjs files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.test.mjs",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("Component");
    });

    it("should extract base name from .test.cjs files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.test.cjs",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("Component");
    });

    it("should be case insensitive", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.TEST.JS",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("Component");
      expect(
        getBaseNameFromFile(
          "/path/to/Component.Spec.Ts",
          jsConfig,
          jsConfig.testPatterns
        )
      ).toBe("Component");
    });
  });

  describe("with source patterns", () => {
    it("should extract base name from .js files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.js",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("Component");
      expect(
        getBaseNameFromFile(
          "/path/to/useFancyHook.js",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("useFancyHook");
    });

    it("should extract base name from .ts files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.ts",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("Component");
      expect(
        getBaseNameFromFile(
          "/path/to/useFancyHook.ts",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("useFancyHook");
    });

    it("should extract base name from .jsx files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/MyComponent.jsx",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("MyComponent");
    });

    it("should extract base name from .tsx files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/MyComponent.tsx",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("MyComponent");
    });

    it("should extract base name from .mjs files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.mjs",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("Component");
    });

    it("should extract base name from .cjs files", () => {
      expect(
        getBaseNameFromFile(
          "/path/to/Component.cjs",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("Component");
    });

    it("should match source patterns at the end, not first occurrence", () => {
      // Edge case: filename contains pattern multiple times
      // Should match the last occurrence (at the end), not the first
      expect(
        getBaseNameFromFile(
          "/path/to/foo.js.js",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("foo.js");
      expect(
        getBaseNameFromFile(
          "/path/to/bar.ts.ts",
          jsConfig,
          jsConfig.sourcePatterns
        )
      ).toBe("bar.ts");
    });
  });

  describe("with null config", () => {
    it("should fallback to filename without extension", () => {
      expect(getBaseNameFromFile("/path/to/Component.js", null, [])).toBe(
        "Component"
      );
      // When config is null, it only removes the last extension
      expect(getBaseNameFromFile("/path/to/Component.test.js", null, [])).toBe(
        "Component.test"
      );
    });
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

  it("should find .spec.ts file for .js source (bidirectional hopping)", async () => {
    const sourcePath = "/project/src/SomeComponent.js";
    const testPath = "/project/src/SomeComponent.spec.ts";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("SomeComponent.spec.ts")) {
          return [vscode.Uri.file(testPath)];
        }
        return [];
      }
    );

    const result = await findTestFile(sourcePath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(testPath);
  });

  it("should find .test.tsx file for .jsx source (bidirectional hopping)", async () => {
    const sourcePath = "/project/src/MyComponent.jsx";
    const testPath = "/project/src/MyComponent.test.tsx";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("MyComponent.test.tsx")) {
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

  it("should find .js source file for .spec.ts test (bidirectional hopping - fixes issue #1)", async () => {
    const testPath = "/project/src/SomeComponent.spec.ts";
    const sourcePath = "/project/src/SomeComponent.js";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("SomeComponent.js")) {
          return [vscode.Uri.file(sourcePath)];
        }
        return [];
      }
    );

    const result = await findSourceFile(testPath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(sourcePath);
  });

  it("should find .jsx source file for .test.tsx test (bidirectional hopping)", async () => {
    const testPath = "/project/src/MyComponent.test.tsx";
    const sourcePath = "/project/src/MyComponent.jsx";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("MyComponent.jsx")) {
          return [vscode.Uri.file(sourcePath)];
        }
        return [];
      }
    );

    const result = await findSourceFile(testPath);

    expect(result).not.toBeNull();
    expect(result?.fsPath).toBe(sourcePath);
  });

  it("should find .ts source file for .spec.js test (bidirectional hopping)", async () => {
    const testPath = "/project/src/Component.spec.js";
    const sourcePath = "/project/src/Component.ts";

    (vscode.workspace.findFiles as jest.Mock).mockImplementation(
      async (pattern: string) => {
        if (pattern.includes("Component.ts")) {
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
