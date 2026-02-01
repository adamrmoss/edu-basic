import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Loops', () => {
    it('should produce stable console output for basic loop forms', () => {
        const result = BasProgramTestRunner.runFile('Loops.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'LOOPS',
            'FOR',
            '1',
            '2',
            '3',
            '4',
            '5',
            'WHILE',
            '1',
            '2',
            '3',
            'UNTIL',
            '0',
            '1',
            '2',
            'DO WHILE',
            '1',
            '2',
            'DONE',
        ]);
    });
});

