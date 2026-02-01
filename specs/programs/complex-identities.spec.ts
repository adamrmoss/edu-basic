import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Complex identities', () =>
{
    it('should numerically validate complex trig/transcendental identities', () =>
    {
        const result = BasProgramTestRunner.runFile('ComplexIdentities.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'COMPLEX IDENTITIES',
            'EULER',
            'OK',
            'EXP(i*pi)+1',
            'OK',
            'SIN(i*x)=i*SINH',
            'OK',
            'COS(i*x)=COSH',
            'OK',
            'REAL(3+4i)',
            'OK',
            'IMAG(3+4i)',
            'OK',
            'CABS(3+4i)',
            'OK',
            'CONJ(3+4i)',
            'OK',
            'CONJ(z)*z=|z|^2',
            'OK',
            'FAILURES',
            '0'
        ]);
    });
});

