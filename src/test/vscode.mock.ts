export default {
    window: {
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        createOutputChannel: jest.fn(() => ({
            appendLine: jest.fn(),
            show: jest.fn(),
        })),
    },
    workspace: {
        getConfiguration: jest.fn(() => ({
            get: jest.fn(),
        })),
    },
    commands: {
        registerCommand: jest.fn(),
    },
};
