import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Do/Loop torture', () =>
{
    it('should produce stable console output for complex DO/LOOP forms', () =>
    {
        const result = BasProgramTestRunner.runFile('DoLoopTorture.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'DO LOOP TORTURE',
            'DO LOOP',
            '1',
            'CONTINUE',
            '3',
            '4',
            'DO WHILE',
            '1',
            '2',
            '3',
            'DO UNTIL',
            '1',
            '2',
            '3',
            'DO LOOP WHILE',
            '1',
            '2',
            '3',
            'DO LOOP UNTIL',
            '1',
            '2',
            '3',
            'NESTED DO',
            '3',
            '6',
            'DONE'
        ]);
    });
});

