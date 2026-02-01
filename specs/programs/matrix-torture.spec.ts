import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Matrix torture', () =>
{
    it('should produce stable console output for 2D matrix operations and bounds', () =>
    {
        const result = BasProgramTestRunner.runFile('MatrixTorture.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'MATRIX TORTURE',
            'C11',
            'OK',
            'C12',
            'OK',
            'C21',
            'OK',
            'C22',
            'OK',
            'AT12',
            'OK',
            'AT31',
            'OK',
            'R00',
            'OK',
            'R12',
            'OK',
            'FAILURES',
            '0'
        ]);
    });
});

