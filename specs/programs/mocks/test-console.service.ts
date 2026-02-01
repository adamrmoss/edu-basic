export class TestConsoleService
{
    public readonly output: string[] = [];
    public readonly errors: string[] = [];

    public printOutput = jest.fn((message: string) =>
    {
        this.output.push(message);
    });

    public printError = jest.fn((message: string) =>
    {
        this.errors.push(message);
    });
}

