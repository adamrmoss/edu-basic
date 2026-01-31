import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Primes', () => {
    it('should print primes up to 30', () => {
        const result = BasProgramTestRunner.runFile('Primes.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'PRIMES',
            'UP TO 30',
            '2',
            '3',
            '5',
            '7',
            '11',
            '13',
            '17',
            '19',
            '23',
            '29',
            'DONE',
        ]);
    });
});

