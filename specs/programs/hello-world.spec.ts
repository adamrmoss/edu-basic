import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - HelloWorld', () => {
    it('should print hello world to the console output', () => {
        const result = BasProgramTestRunner.runFile('HelloWorld.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual(['Hello, world!']);
        expect(result.consoleService.printOutput).toHaveBeenCalledWith('Hello, world!');
    });
});

