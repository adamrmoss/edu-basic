import { LfsrPolynomial } from './lfsr-polynomial';
import { CombOperation } from './comb-operation';
import { ShapeModulation } from './shape-modulation';

/**
 * NoiseCode Bitfield Structure (32-bit)
 * 
 * Encodes the complete synthesis configuration for a single GRIT voice.
 * 
 * Layout:
 *   Bits 31-30: Reserved (2 bits)
 *   Bits 29-27: DECIM - Decimation factor (3 bits, values 1-8, stored as 0-7)
 *   Bits 26-24: SHAPE - Shape modulation type (3 bits, 0-7)
 *   Bits 23-21: COMB - Logical combination operation (3 bits, 0-7)
 *   Bits 20-18: LFSR C polynomial selector (3 bits, 0-7)
 *   Bits 17-15: LFSR B polynomial selector (3 bits, 0-7)
 *   Bits 14-12: LFSR A polynomial selector (3 bits, 0-7)
 *   Bits 11-10: Clock coupling (2 bits: C_CLK_B, B_CLK_A)
 *   Bits 9-7:   LFSR invert flags (3 bits: C_INV, B_INV, A_INV)
 *   Bits 6-4:   LFSR enable flags (3 bits: C_EN, B_EN, A_EN)
 *   Bits 3-0:   Reserved (4 bits)
 */

/**
 * Bit masks and shifts for NoiseCode fields
 */
export const NOISE_CODE_BITS =
{
    // Enable flags (bits 6-4)
    A_EN_SHIFT: 4,
    B_EN_SHIFT: 5,
    C_EN_SHIFT: 6,
    A_EN_MASK: 0x00000010,
    B_EN_MASK: 0x00000020,
    C_EN_MASK: 0x00000040,

    // Invert flags (bits 9-7)
    A_INV_SHIFT: 7,
    B_INV_SHIFT: 8,
    C_INV_SHIFT: 9,
    A_INV_MASK: 0x00000080,
    B_INV_MASK: 0x00000100,
    C_INV_MASK: 0x00000200,

    // Clock coupling (bits 11-10)
    B_CLK_A_SHIFT: 10,
    C_CLK_B_SHIFT: 11,
    B_CLK_A_MASK: 0x00000400,
    C_CLK_B_MASK: 0x00000800,

    // Polynomial selectors (bits 20-12)
    A_POLY_SHIFT: 12,
    B_POLY_SHIFT: 15,
    C_POLY_SHIFT: 18,
    A_POLY_MASK: 0x00007000,
    B_POLY_MASK: 0x00038000,
    C_POLY_MASK: 0x001C0000,
    POLY_FIELD_MASK: 0x7,

    // COMB operation (bits 23-21)
    COMB_SHIFT: 21,
    COMB_MASK: 0x00E00000,
    COMB_FIELD_MASK: 0x7,

    // SHAPE modulation (bits 26-24)
    SHAPE_SHIFT: 24,
    SHAPE_MASK: 0x07000000,
    SHAPE_FIELD_MASK: 0x7,

    // DECIM decimation (bits 29-27)
    DECIM_SHIFT: 27,
    DECIM_MASK: 0x38000000,
    DECIM_FIELD_MASK: 0x7,

    // Reserved (bits 31-30 and 3-0)
    RESERVED_HIGH_MASK: 0xC0000000,
    RESERVED_LOW_MASK: 0x0000000F,
} as const;

/**
 * Decoded NoiseCode fields
 */
export interface NoiseCodeFields
{
    // Enable flags
    aEnabled: boolean;
    bEnabled: boolean;
    cEnabled: boolean;

    // Invert flags
    aInverted: boolean;
    bInverted: boolean;
    cInverted: boolean;

    // Clock coupling
    bClockedByA: boolean;
    cClockedByB: boolean;

    // Polynomial selectors
    aPolynomial: LfsrPolynomial;
    bPolynomial: LfsrPolynomial;
    cPolynomial: LfsrPolynomial;

    // Combination operation
    comb: CombOperation;

    // Shape modulation
    shape: ShapeModulation;

    // Decimation factor (actual value 1-8)
    decimation: number;
}

/**
 * Decodes a 32-bit NoiseCode into its component fields
 */
export function decodeNoiseCode(noiseCode: number): NoiseCodeFields
{
    return {
        // Enable flags
        aEnabled: ((noiseCode >>> NOISE_CODE_BITS.A_EN_SHIFT) & 1) === 1,
        bEnabled: ((noiseCode >>> NOISE_CODE_BITS.B_EN_SHIFT) & 1) === 1,
        cEnabled: ((noiseCode >>> NOISE_CODE_BITS.C_EN_SHIFT) & 1) === 1,

        // Invert flags
        aInverted: ((noiseCode >>> NOISE_CODE_BITS.A_INV_SHIFT) & 1) === 1,
        bInverted: ((noiseCode >>> NOISE_CODE_BITS.B_INV_SHIFT) & 1) === 1,
        cInverted: ((noiseCode >>> NOISE_CODE_BITS.C_INV_SHIFT) & 1) === 1,

        // Clock coupling
        bClockedByA: ((noiseCode >>> NOISE_CODE_BITS.B_CLK_A_SHIFT) & 1) === 1,
        cClockedByB: ((noiseCode >>> NOISE_CODE_BITS.C_CLK_B_SHIFT) & 1) === 1,

        // Polynomial selectors
        aPolynomial: ((noiseCode >>> NOISE_CODE_BITS.A_POLY_SHIFT) & NOISE_CODE_BITS.POLY_FIELD_MASK) as LfsrPolynomial,
        bPolynomial: ((noiseCode >>> NOISE_CODE_BITS.B_POLY_SHIFT) & NOISE_CODE_BITS.POLY_FIELD_MASK) as LfsrPolynomial,
        cPolynomial: ((noiseCode >>> NOISE_CODE_BITS.C_POLY_SHIFT) & NOISE_CODE_BITS.POLY_FIELD_MASK) as LfsrPolynomial,

        // COMB operation
        comb: ((noiseCode >>> NOISE_CODE_BITS.COMB_SHIFT) & NOISE_CODE_BITS.COMB_FIELD_MASK) as CombOperation,

        // Shape modulation
        shape: ((noiseCode >>> NOISE_CODE_BITS.SHAPE_SHIFT) & NOISE_CODE_BITS.SHAPE_FIELD_MASK) as ShapeModulation,

        // Decimation (stored as 0-7, actual value is 1-8)
        decimation: ((noiseCode >>> NOISE_CODE_BITS.DECIM_SHIFT) & NOISE_CODE_BITS.DECIM_FIELD_MASK) + 1,
    };
}

/**
 * Encodes NoiseCode fields into a 32-bit NoiseCode
 */
export function encodeNoiseCode(fields: NoiseCodeFields): number
{
    let noiseCode = 0;

    // Enable flags
    if (fields.aEnabled)
    {
        noiseCode |= NOISE_CODE_BITS.A_EN_MASK;
    }

    if (fields.bEnabled)
    {
        noiseCode |= NOISE_CODE_BITS.B_EN_MASK;
    }

    if (fields.cEnabled)
    {
        noiseCode |= NOISE_CODE_BITS.C_EN_MASK;
    }

    // Invert flags
    if (fields.aInverted)
    {
        noiseCode |= NOISE_CODE_BITS.A_INV_MASK;
    }

    if (fields.bInverted)
    {
        noiseCode |= NOISE_CODE_BITS.B_INV_MASK;
    }

    if (fields.cInverted)
    {
        noiseCode |= NOISE_CODE_BITS.C_INV_MASK;
    }

    // Clock coupling
    if (fields.bClockedByA)
    {
        noiseCode |= NOISE_CODE_BITS.B_CLK_A_MASK;
    }

    if (fields.cClockedByB)
    {
        noiseCode |= NOISE_CODE_BITS.C_CLK_B_MASK;
    }

    // Polynomial selectors
    noiseCode |= (fields.aPolynomial & NOISE_CODE_BITS.POLY_FIELD_MASK) << NOISE_CODE_BITS.A_POLY_SHIFT;
    noiseCode |= (fields.bPolynomial & NOISE_CODE_BITS.POLY_FIELD_MASK) << NOISE_CODE_BITS.B_POLY_SHIFT;
    noiseCode |= (fields.cPolynomial & NOISE_CODE_BITS.POLY_FIELD_MASK) << NOISE_CODE_BITS.C_POLY_SHIFT;

    // COMB operation
    noiseCode |= (fields.comb & NOISE_CODE_BITS.COMB_FIELD_MASK) << NOISE_CODE_BITS.COMB_SHIFT;

    // Shape modulation
    noiseCode |= (fields.shape & NOISE_CODE_BITS.SHAPE_FIELD_MASK) << NOISE_CODE_BITS.SHAPE_SHIFT;

    // Decimation (actual value 1-8, stored as 0-7)
    const decimStored = Math.max(0, Math.min(7, fields.decimation - 1));
    noiseCode |= (decimStored & NOISE_CODE_BITS.DECIM_FIELD_MASK) << NOISE_CODE_BITS.DECIM_SHIFT;

    return noiseCode >>> 0;
}

/**
 * Creates a default NoiseCode with only LFSR A enabled using square wave
 */
export function createDefaultNoiseCode(): number
{
    return encodeNoiseCode({
        aEnabled: true,
        bEnabled: false,
        cEnabled: false,
        aInverted: false,
        bInverted: false,
        cInverted: false,
        bClockedByA: false,
        cClockedByB: false,
        aPolynomial: LfsrPolynomial.SquareWave,
        bPolynomial: LfsrPolynomial.SquareWave,
        cPolynomial: LfsrPolynomial.SquareWave,
        comb: CombOperation.Xor,
        shape: ShapeModulation.None,
        decimation: 1,
    });
}

/**
 * Modifies the decimation field in an existing NoiseCode
 */
export function setDecimation(noiseCode: number, decimation: number): number
{
    const decimStored = Math.max(0, Math.min(7, decimation - 1));
    return ((noiseCode & ~NOISE_CODE_BITS.DECIM_MASK) | (decimStored << NOISE_CODE_BITS.DECIM_SHIFT)) >>> 0;
}

/**
 * Modifies the shape field in an existing NoiseCode
 */
export function setShape(noiseCode: number, shape: ShapeModulation): number
{
    return ((noiseCode & ~NOISE_CODE_BITS.SHAPE_MASK) | (shape << NOISE_CODE_BITS.SHAPE_SHIFT)) >>> 0;
}

/**
 * Modifies the COMB field in an existing NoiseCode
 */
export function setComb(noiseCode: number, comb: CombOperation): number
{
    return ((noiseCode & ~NOISE_CODE_BITS.COMB_MASK) | (comb << NOISE_CODE_BITS.COMB_SHIFT)) >>> 0;
}

/**
 * Formats a NoiseCode as a hexadecimal string
 */
export function formatNoiseCode(noiseCode: number): string
{
    return '0x' + (noiseCode >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Parses a NoiseCode from a hexadecimal string
 */
export function parseNoiseCode(hex: string): number
{
    const cleaned = hex.replace(/^0x/i, '');
    return parseInt(cleaned, 16) >>> 0;
}
