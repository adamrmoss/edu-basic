import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - GCD', () => {
    it('should print gcd results for known pairs', () => {
        const result = BasProgramTestRunner.runFile('Gcd.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'GCD',
            'gcd(48,18)=6',
            'gcd(54,24)=6',
            'gcd(1071,462)=21',
            'DONE',
        ]);
    });
});

