import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Select/Case torture', () =>
{
    it('should produce stable console output for all SELECT CASE / CASE forms', () =>
    {
        const result = BasProgramTestRunner.runFile('SelectCaseTorture.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'SELECT CASE TORTURE',
            'NEG',
            'ZERO',
            'ODD',
            'RANGE',
            'ODD',
            'RANGE',
            'ODD',
            'BIG',
            'ODD',
            '12411'
        ]);
    });
});

