jest.mock('vscode', () => require('./vscode.mock').default);

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at:', reason);
});
