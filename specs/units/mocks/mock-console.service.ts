export class MockConsoleService
{
    public readonly output: string[] = [];

    public printOutput = jest.fn((message: string) =>
    {
        this.output.push(message);
    });
}

