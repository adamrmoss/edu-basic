import { LfsrPolynomial, LFSR_CONFIGS } from '../../src/grit/lfsr-polynomial';

describe('LFSR Polynomial', () =>
{
    describe('LfsrPolynomial enum', () =>
    {
        it('should have 8 polynomial types (0-7)', () =>
        {
            expect(LfsrPolynomial.SquareWave).toBe(0);
            expect(LfsrPolynomial.PulseWave25_75).toBe(1);
            expect(LfsrPolynomial.Lfsr4Bit).toBe(2);
            expect(LfsrPolynomial.Lfsr5Bit).toBe(3);
            expect(LfsrPolynomial.Lfsr9Bit).toBe(4);
            expect(LfsrPolynomial.Lfsr15Bit).toBe(5);
            expect(LfsrPolynomial.Lfsr17Bit).toBe(6);
            expect(LfsrPolynomial.Lfsr31Bit).toBe(7);
        });
    });

    describe('LFSR_CONFIGS', () =>
    {
        it('should have configs for all 8 polynomial types', () =>
        {
            expect(Object.keys(LFSR_CONFIGS).length).toBe(8);
        });

        it('should have correct config for SquareWave', () =>
        {
            const config = LFSR_CONFIGS[LfsrPolynomial.SquareWave];

            expect(config.bits).toBe(1);
            expect(config.period).toBe(2);
            expect(config.taps).toEqual([]);
            expect(config.description).toContain('Square Wave');
        });

        it('should have correct config for PulseWave25_75', () =>
        {
            const config = LFSR_CONFIGS[LfsrPolynomial.PulseWave25_75];

            expect(config.bits).toBe(2);
            expect(config.period).toBe(4);
            expect(config.taps).toEqual([]);
            expect(config.description).toContain('25/75');
        });

        it('should have correct config for 4-bit LFSR', () =>
        {
            const config = LFSR_CONFIGS[LfsrPolynomial.Lfsr4Bit];

            expect(config.bits).toBe(4);
            expect(config.period).toBe(15);
            expect(config.taps).toEqual([3, 0]);
            expect(config.description).toContain('POKEY');
        });

        it('should have correct config for 5-bit LFSR', () =>
        {
            const config = LFSR_CONFIGS[LfsrPolynomial.Lfsr5Bit];

            expect(config.bits).toBe(5);
            expect(config.period).toBe(31);
            expect(config.taps).toEqual([2, 0]);
        });

        it('should have correct config for 9-bit LFSR', () =>
        {
            const config = LFSR_CONFIGS[LfsrPolynomial.Lfsr9Bit];

            expect(config.bits).toBe(9);
            expect(config.period).toBe(511);
            expect(config.taps).toEqual([4, 0]);
        });

        it('should have correct config for 15-bit LFSR', () =>
        {
            const config = LFSR_CONFIGS[LfsrPolynomial.Lfsr15Bit];

            expect(config.bits).toBe(15);
            expect(config.period).toBe(32767);
            expect(config.taps).toEqual([1, 0]);
        });

        it('should have correct config for 17-bit LFSR', () =>
        {
            const config = LFSR_CONFIGS[LfsrPolynomial.Lfsr17Bit];

            expect(config.bits).toBe(17);
            expect(config.period).toBe(131071);
            expect(config.taps).toEqual([3, 0]);
        });

        it('should have correct config for 31-bit LFSR', () =>
        {
            const config = LFSR_CONFIGS[LfsrPolynomial.Lfsr31Bit];

            expect(config.bits).toBe(31);
            expect(config.period).toBe(2147483647);
            expect(config.taps).toEqual([3, 0]);
        });

        it('should have maximal period for all true LFSRs (2^n - 1)', () =>
        {
            expect(LFSR_CONFIGS[LfsrPolynomial.Lfsr4Bit].period).toBe(Math.pow(2, 4) - 1);
            expect(LFSR_CONFIGS[LfsrPolynomial.Lfsr5Bit].period).toBe(Math.pow(2, 5) - 1);
            expect(LFSR_CONFIGS[LfsrPolynomial.Lfsr9Bit].period).toBe(Math.pow(2, 9) - 1);
            expect(LFSR_CONFIGS[LfsrPolynomial.Lfsr15Bit].period).toBe(Math.pow(2, 15) - 1);
            expect(LFSR_CONFIGS[LfsrPolynomial.Lfsr17Bit].period).toBe(Math.pow(2, 17) - 1);
            expect(LFSR_CONFIGS[LfsrPolynomial.Lfsr31Bit].period).toBe(Math.pow(2, 31) - 1);
        });
    });
});

