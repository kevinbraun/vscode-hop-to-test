// Mock vscode module for testing
export const Uri = {
  file: jest.fn((filePath: string) => ({
    fsPath: filePath,
    scheme: 'file',
    path: filePath,
    toString: () => `file://${filePath}`,
  })),
};

export const window = {
  activeTextEditor: null,
  showWarningMessage: jest.fn(),
  showTextDocument: jest.fn(),
};

export const workspace = {
  openTextDocument: jest.fn(),
};

export const commands = {
  registerCommand: jest.fn(),
};

