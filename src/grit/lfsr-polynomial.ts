/**
 * GRIT Primary LFSR Polynomial Types
 * 
 * Each polynomial defines an LFSR configuration with specific period and characteristics.
 * All maximal-length LFSR polynomials from POKEY are included, plus extended range.
 */
export enum LfsrPolynomial
{
    /**
     * 1-bit Square Wave (50/50 duty cycle)
     * Pattern: Alternating 0/1
     * Period: 2
     */
    SquareWave = 0,

    /**
     * 25/75 Pulse Wave
     * Pattern: Repeating 1,0,0,0 (25% high, 75% low)
     * Period: 4
     */
    PulseWave25_75 = 1,

    /**
     * 4-bit Maximal LFSR (POKEY-style)
     * Polynomial: 1 + x^3 + x^4
     * Period: 15
     */
    Lfsr4Bit = 2,

    /**
     * 5-bit Maximal LFSR (POKEY-style)
     * Polynomial: 1 + x^2 + x^5
     * Period: 31
     */
    Lfsr5Bit = 3,

    /**
     * 9-bit Maximal LFSR (POKEY-style, also TIA)
     * Polynomial: 1 + x^4 + x^9
     * Period: 511
     */
    Lfsr9Bit = 4,

    /**
     * 15-bit Maximal LFSR
     * Polynomial: 1 + x^14 + x^15
     * Period: 32,767
     */
    Lfsr15Bit = 5,

    /**
     * 17-bit Maximal LFSR (POKEY-style)
     * Polynomial: 1 + x^12 + x^17
     * Period: 131,071
     */
    Lfsr17Bit = 6,

    /**
     * 31-bit Maximal LFSR
     * Polynomial: 1 + x^28 + x^31
     * Period: 2,147,483,647
     */
    Lfsr31Bit = 7,
}

/**
 * LFSR configuration metadata for each polynomial type
 */
export interface LfsrConfig
{
    /**
     * Number of bits in the LFSR register (0 for special fixed patterns)
     */
    bits: number;

    /**
     * Period of the LFSR sequence
     */
    period: number;

    /**
     * Tap positions for the feedback polynomial (XOR taps)
     * Empty for fixed-pattern types (SquareWave, PulseWave25_75)
     */
    taps: number[];

    /**
     * Human-readable description
     */
    description: string;
}

/**
 * Configuration metadata for each LFSR polynomial type
 */
export const LFSR_CONFIGS: Record<LfsrPolynomial, LfsrConfig> =
{
    [LfsrPolynomial.SquareWave]:
    {
        bits: 1,
        period: 2,
        taps: [],
        description: '1-bit Square Wave (50/50 duty cycle)',
    },
    [LfsrPolynomial.PulseWave25_75]:
    {
        bits: 2,
        period: 4,
        taps: [],
        description: '25/75 Pulse Wave',
    },
    [LfsrPolynomial.Lfsr4Bit]:
    {
        bits: 4,
        period: 15,
        taps: [3, 4],
        description: '4-bit Maximal LFSR (POKEY-style)',
    },
    [LfsrPolynomial.Lfsr5Bit]:
    {
        bits: 5,
        period: 31,
        taps: [2, 5],
        description: '5-bit Maximal LFSR (POKEY-style)',
    },
    [LfsrPolynomial.Lfsr9Bit]:
    {
        bits: 9,
        period: 511,
        taps: [4, 9],
        description: '9-bit Maximal LFSR (POKEY/TIA-style)',
    },
    [LfsrPolynomial.Lfsr15Bit]:
    {
        bits: 15,
        period: 32767,
        taps: [14, 15],
        description: '15-bit Maximal LFSR',
    },
    [LfsrPolynomial.Lfsr17Bit]:
    {
        bits: 17,
        period: 131071,
        taps: [12, 17],
        description: '17-bit Maximal LFSR (POKEY-style)',
    },
    [LfsrPolynomial.Lfsr31Bit]:
    {
        bits: 31,
        period: 2147483647,
        taps: [28, 31],
        description: '31-bit Maximal LFSR',
    },
};
