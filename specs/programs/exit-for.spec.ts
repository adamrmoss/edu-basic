import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - EXIT FOR', () => {
    it('EXIT FOR should exit only the innermost FOR', () => {
        const result = BasProgramTestRunner.runFile('ExitForNested.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'EXIT FOR NESTED',
            '3',
            '3',
        ]);
    });

    it('EXIT FOR j% should exit the specified (inner) FOR loop', () => {
        const result = BasProgramTestRunner.runFile('ExitForExplicitInner.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'EXIT FOR EXPLICIT INNER',
            '3',
            '3',
        ]);
    });

    it('EXIT FOR i% should exit an outer FOR loop from inside an inner loop', () => {
        const result = BasProgramTestRunner.runFile('ExitForExplicitOuter.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'EXIT FOR EXPLICIT OUTER',
            '1',
            '0',
        ]);
    });
});

