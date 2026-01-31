import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Transcendental identities', () =>
{
    it('should numerically validate real identities for trig/hyperbolic/log/exp/roots', () =>
    {
        const result = BasProgramTestRunner.runFile('TranscendentalIdentities.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'TRANSCENDENTAL IDENTITIES',
            'SIN2+COS2',
            'OK',
            'COS(2x)=C2-S2',
            'OK',
            'COSH2-SINH2',
            'OK',
            'EXP(LOG x)=x',
            'OK',
            'LOG(EXP x)=x',
            'OK',
            'LOG10(10^x)=x',
            'OK',
            'LOG2(2^x)=x',
            'OK',
            'SQRT(x)^2=x',
            'OK',
            'CBRT(x)^3=x',
            'OK',
            'FAILURES',
            '0'
        ]);
    });
});

