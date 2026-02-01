import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - While/Wend torture', () =>
{
    it('should produce stable console output for complex WHILE/WEND forms', () =>
    {
        const result = BasProgramTestRunner.runFile('WhileWendTorture.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'WHILE WEND TORTURE',
            'MAIN',
            '1',
            'SKIP2',
            '3',
            '4',
            '4',
            'NESTED WHILE',
            '3',
            '6',
            'DONE'
        ]);
    });
});

