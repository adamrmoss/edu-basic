import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Array torture', () =>
{
    it('should produce stable console output for array operations', () =>
    {
        const result = BasProgramTestRunner.runFile('ArrayTorture.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'ARRAY TORTURE',
            '[1, 2, 3]',
            '[0, 1, 2, 3, 4]',
            '4',
            '0',
            '[1, 2, 3]',
            '[1, 2, 3, 10, 20]',
            '[2, 3, 10]',
            'DONE'
        ]);
    });
});

