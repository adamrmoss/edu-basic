import {
    NOISE_CODE_BITS,
    decodeNoiseCode,
    encodeNoiseCode,
    createDefaultNoiseCode,
    setDecimation,
    setShape,
    setComb,
    formatNoiseCode,
    parseNoiseCode,
    NoiseCodeFields,
} from '../../src/grit/noise-code';
import { LfsrPolynomial } from '../../src/grit/lfsr-polynomial';
import { CombOperation } from '../../src/grit/comb-operation';
import { ShapeModulation } from '../../src/grit/shape-modulation';

describe('NoiseCode', () =>
{
    describe('NOISE_CODE_BITS constants', () =>
    {
        it('should have correct enable flag shifts', () =>
        {
            expect(NOISE_CODE_BITS.A_EN_SHIFT).toBe(4);
            expect(NOISE_CODE_BITS.B_EN_SHIFT).toBe(5);
            expect(NOISE_CODE_BITS.C_EN_SHIFT).toBe(6);
        });

        it('should have correct enable flag masks', () =>
        {
            expect(NOISE_CODE_BITS.A_EN_MASK).toBe(0x00000010);
            expect(NOISE_CODE_BITS.B_EN_MASK).toBe(0x00000020);
            expect(NOISE_CODE_BITS.C_EN_MASK).toBe(0x00000040);
        });

        it('should have correct polynomial selector shifts', () =>
        {
            expect(NOISE_CODE_BITS.A_POLY_SHIFT).toBe(12);
            expect(NOISE_CODE_BITS.B_POLY_SHIFT).toBe(15);
            expect(NOISE_CODE_BITS.C_POLY_SHIFT).toBe(18);
        });

        it('should have correct COMB shift and mask', () =>
        {
            expect(NOISE_CODE_BITS.COMB_SHIFT).toBe(21);
            expect(NOISE_CODE_BITS.COMB_MASK).toBe(0x00E00000);
        });

        it('should have correct SHAPE shift and mask', () =>
        {
            expect(NOISE_CODE_BITS.SHAPE_SHIFT).toBe(24);
            expect(NOISE_CODE_BITS.SHAPE_MASK).toBe(0x07000000);
        });

        it('should have correct DECIM shift and mask', () =>
        {
            expect(NOISE_CODE_BITS.DECIM_SHIFT).toBe(27);
            expect(NOISE_CODE_BITS.DECIM_MASK).toBe(0x38000000);
        });
    });

    describe('decodeNoiseCode', () =>
    {
        it('should decode enable flags correctly', () =>
        {
            const fields = decodeNoiseCode(0x00000010);

            expect(fields.aEnabled).toBe(true);
            expect(fields.bEnabled).toBe(false);
            expect(fields.cEnabled).toBe(false);
        });

        it('should decode all LFSRs enabled', () =>
        {
            const fields = decodeNoiseCode(0x00000070);

            expect(fields.aEnabled).toBe(true);
            expect(fields.bEnabled).toBe(true);
            expect(fields.cEnabled).toBe(true);
        });

        it('should decode invert flags correctly', () =>
        {
            const fields = decodeNoiseCode(0x00000390);

            expect(fields.aInverted).toBe(true);
            expect(fields.bInverted).toBe(true);
            expect(fields.cInverted).toBe(true);
        });

        it('should decode clock coupling correctly', () =>
        {
            const fieldsB = decodeNoiseCode(0x00000400);
            expect(fieldsB.bClockedByA).toBe(true);
            expect(fieldsB.cClockedByB).toBe(false);

            const fieldsC = decodeNoiseCode(0x00000800);
            expect(fieldsC.bClockedByA).toBe(false);
            expect(fieldsC.cClockedByB).toBe(true);
        });

        it('should decode polynomial selectors correctly', () =>
        {
            // A = 4 (9-bit), B = 2 (4-bit), C = 6 (17-bit)
            const noiseCode = (4 << 12) | (2 << 15) | (6 << 18);
            const fields = decodeNoiseCode(noiseCode);

            expect(fields.aPolynomial).toBe(LfsrPolynomial.Lfsr9Bit);
            expect(fields.bPolynomial).toBe(LfsrPolynomial.Lfsr4Bit);
            expect(fields.cPolynomial).toBe(LfsrPolynomial.Lfsr17Bit);
        });

        it('should decode COMB operation correctly', () =>
        {
            const fields = decodeNoiseCode(CombOperation.And << 21);

            expect(fields.comb).toBe(CombOperation.And);
        });

        it('should decode SHAPE modulation correctly', () =>
        {
            const fields = decodeNoiseCode(ShapeModulation.Ring << 24);

            expect(fields.shape).toBe(ShapeModulation.Ring);
        });

        it('should decode decimation correctly (stored 0-7, returns 1-8)', () =>
        {
            // Decimation 1 (stored as 0)
            expect(decodeNoiseCode(0 << 27).decimation).toBe(1);

            // Decimation 8 (stored as 7)
            expect(decodeNoiseCode(7 << 27).decimation).toBe(8);

            // Decimation 4 (stored as 3)
            expect(decodeNoiseCode(3 << 27).decimation).toBe(4);
        });
    });

    describe('encodeNoiseCode', () =>
    {
        it('should encode enable flags correctly', () =>
        {
            const fields: NoiseCodeFields = {
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
            };

            const noiseCode = encodeNoiseCode(fields);

            expect(noiseCode & NOISE_CODE_BITS.A_EN_MASK).toBe(NOISE_CODE_BITS.A_EN_MASK);
            expect(noiseCode & NOISE_CODE_BITS.B_EN_MASK).toBe(0);
            expect(noiseCode & NOISE_CODE_BITS.C_EN_MASK).toBe(0);
        });

        it('should encode all LFSRs enabled', () =>
        {
            const fields: NoiseCodeFields = {
                aEnabled: true,
                bEnabled: true,
                cEnabled: true,
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
            };

            const noiseCode = encodeNoiseCode(fields);

            expect(noiseCode & 0x70).toBe(0x70);
        });

        it('should encode polynomial selectors correctly', () =>
        {
            const fields: NoiseCodeFields = {
                aEnabled: true,
                bEnabled: true,
                cEnabled: true,
                aInverted: false,
                bInverted: false,
                cInverted: false,
                bClockedByA: false,
                cClockedByB: false,
                aPolynomial: LfsrPolynomial.Lfsr9Bit,
                bPolynomial: LfsrPolynomial.Lfsr4Bit,
                cPolynomial: LfsrPolynomial.Lfsr17Bit,
                comb: CombOperation.Xor,
                shape: ShapeModulation.None,
                decimation: 1,
            };

            const noiseCode = encodeNoiseCode(fields);
            const decoded = decodeNoiseCode(noiseCode);

            expect(decoded.aPolynomial).toBe(LfsrPolynomial.Lfsr9Bit);
            expect(decoded.bPolynomial).toBe(LfsrPolynomial.Lfsr4Bit);
            expect(decoded.cPolynomial).toBe(LfsrPolynomial.Lfsr17Bit);
        });

        it('should encode decimation correctly (clamps 1-8)', () =>
        {
            const baseFields: NoiseCodeFields = {
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
            };

            expect(decodeNoiseCode(encodeNoiseCode({ ...baseFields, decimation: 1 })).decimation).toBe(1);
            expect(decodeNoiseCode(encodeNoiseCode({ ...baseFields, decimation: 8 })).decimation).toBe(8);
            expect(decodeNoiseCode(encodeNoiseCode({ ...baseFields, decimation: 4 })).decimation).toBe(4);
        });
    });

    describe('encode/decode roundtrip', () =>
    {
        it('should roundtrip a complex configuration', () =>
        {
            const original: NoiseCodeFields = {
                aEnabled: true,
                bEnabled: true,
                cEnabled: false,
                aInverted: true,
                bInverted: false,
                cInverted: true,
                bClockedByA: true,
                cClockedByB: false,
                aPolynomial: LfsrPolynomial.Lfsr17Bit,
                bPolynomial: LfsrPolynomial.Lfsr9Bit,
                cPolynomial: LfsrPolynomial.Lfsr4Bit,
                comb: CombOperation.And,
                shape: ShapeModulation.XorSquare,
                decimation: 4,
            };

            const encoded = encodeNoiseCode(original);
            const decoded = decodeNoiseCode(encoded);

            expect(decoded).toEqual(original);
        });
    });

    describe('createDefaultNoiseCode', () =>
    {
        it('should create a valid default noise code', () =>
        {
            const noiseCode = createDefaultNoiseCode();
            const fields = decodeNoiseCode(noiseCode);

            expect(fields.aEnabled).toBe(true);
            expect(fields.bEnabled).toBe(false);
            expect(fields.cEnabled).toBe(false);
            expect(fields.aPolynomial).toBe(LfsrPolynomial.SquareWave);
            expect(fields.comb).toBe(CombOperation.Xor);
            expect(fields.shape).toBe(ShapeModulation.None);
            expect(fields.decimation).toBe(1);
        });
    });

    describe('setDecimation', () =>
    {
        it('should modify only the decimation field', () =>
        {
            const original = createDefaultNoiseCode();
            const modified = setDecimation(original, 8);
            const fields = decodeNoiseCode(modified);

            expect(fields.decimation).toBe(8);
            expect(fields.aEnabled).toBe(true);
            expect(fields.aPolynomial).toBe(LfsrPolynomial.SquareWave);
        });

        it('should clamp decimation to valid range', () =>
        {
            const original = createDefaultNoiseCode();

            expect(decodeNoiseCode(setDecimation(original, 0)).decimation).toBe(1);
            expect(decodeNoiseCode(setDecimation(original, 10)).decimation).toBe(8);
        });
    });

    describe('setShape', () =>
    {
        it('should modify only the shape field', () =>
        {
            const original = createDefaultNoiseCode();
            const modified = setShape(original, ShapeModulation.Ring);
            const fields = decodeNoiseCode(modified);

            expect(fields.shape).toBe(ShapeModulation.Ring);
            expect(fields.aEnabled).toBe(true);
            expect(fields.decimation).toBe(1);
        });
    });

    describe('setComb', () =>
    {
        it('should modify only the COMB field', () =>
        {
            const original = createDefaultNoiseCode();
            const modified = setComb(original, CombOperation.Nand);
            const fields = decodeNoiseCode(modified);

            expect(fields.comb).toBe(CombOperation.Nand);
            expect(fields.aEnabled).toBe(true);
            expect(fields.shape).toBe(ShapeModulation.None);
        });
    });

    describe('formatNoiseCode', () =>
    {
        it('should format as uppercase hex with 0x prefix', () =>
        {
            expect(formatNoiseCode(0x00000010)).toBe('0x00000010');
            expect(formatNoiseCode(0x38003010)).toBe('0x38003010');
            expect(formatNoiseCode(0xFFFFFFFF)).toBe('0xFFFFFFFF');
        });

        it('should pad to 8 digits', () =>
        {
            expect(formatNoiseCode(0x10)).toBe('0x00000010');
            expect(formatNoiseCode(0)).toBe('0x00000000');
        });
    });

    describe('parseNoiseCode', () =>
    {
        it('should parse hex strings with 0x prefix', () =>
        {
            expect(parseNoiseCode('0x00000010')).toBe(0x00000010);
            expect(parseNoiseCode('0x38003010')).toBe(0x38003010);
        });

        it('should parse hex strings without prefix', () =>
        {
            expect(parseNoiseCode('00000010')).toBe(0x00000010);
            expect(parseNoiseCode('38003010')).toBe(0x38003010);
        });

        it('should be case insensitive', () =>
        {
            expect(parseNoiseCode('0xabcdef12')).toBe(0xABCDEF12);
            expect(parseNoiseCode('0xABCDEF12')).toBe(0xABCDEF12);
        });

        it('should roundtrip with formatNoiseCode', () =>
        {
            const original = 0x38003010;
            const formatted = formatNoiseCode(original);
            const parsed = parseNoiseCode(formatted);

            expect(parsed).toBe(original);
        });
    });
});

