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
     * 
     * IMPORTANT - Tap Convention:
     * --------------------------
     * Taps are 0-INDEXED BIT POSITIONS that get XORed together.
     * 
     * For primitive polynomial x^n + x^a + 1:
     *   - n = register size (bits field)
     *   - taps = [a, 0]
     *   - The "1" constant term → tap at bit 0 (the output bit)
     *   - The x^a term → tap at bit a (NOT a-1!)
     * 
     * Example: x^5 + x^2 + 1 (5-bit, period 31)
     *   - taps = [2, 0]
     *   - feedback = bit[2] XOR bit[0]
     *   - new_state = (state >> 1) | (feedback << 4)
     * 
     * The step operation is:
     *   feedback = XOR of all bits at tap positions
     *   state = (state >>> 1) | (feedback << (bits - 1))
     */
    taps: number[];

    /**
     * Human-readable description
     */
    description: string;
}

/**
 * Configuration metadata for each LFSR polynomial type
 * 
 * POLYNOMIAL TO TAPS MAPPING:
 * ---------------------------
 * For polynomial x^n + x^a + 1, taps = [a, 0]
 * 
 *   Polynomial        | Bits | Period        | Taps
 *   ------------------|------|---------------|--------
 *   x^4 + x^3 + 1     |  4   | 15            | [3, 0]
 *   x^5 + x^2 + 1     |  5   | 31            | [2, 0]
 *   x^9 + x^4 + 1     |  9   | 511           | [4, 0]
 *   x^15 + x + 1      | 15   | 32,767        | [1, 0]
 *   x^17 + x^3 + 1    | 17   | 131,071       | [3, 0]
 *   x^31 + x^3 + 1    | 31   | 2,147,483,647 | [3, 0]
 * 
 * All polynomials above are primitive (maximal-length sequences).
 * Multiple primitive polynomials exist for each size; these are chosen
 * for simplicity and compatibility with classic hardware (POKEY, TIA).
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
        taps: [3, 0],
        description: '4-bit Maximal LFSR (POKEY-style)',
    },
    [LfsrPolynomial.Lfsr5Bit]:
    {
        bits: 5,
        period: 31,
        taps: [2, 0],
        description: '5-bit Maximal LFSR (POKEY-style)',
    },
    [LfsrPolynomial.Lfsr9Bit]:
    {
        bits: 9,
        period: 511,
        taps: [4, 0],
        description: '9-bit Maximal LFSR (POKEY/TIA-style)',
    },
    [LfsrPolynomial.Lfsr15Bit]:
    {
        bits: 15,
        period: 32767,
        taps: [1, 0],
        description: '15-bit Maximal LFSR',
    },
    [LfsrPolynomial.Lfsr17Bit]:
    {
        bits: 17,
        period: 131071,
        taps: [3, 0],
        description: '17-bit Maximal LFSR (POKEY-style)',
    },
    [LfsrPolynomial.Lfsr31Bit]:
    {
        bits: 31,
        period: 2147483647,
        taps: [3, 0],
        description: '31-bit Maximal LFSR',
    },
};
