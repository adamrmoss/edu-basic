import { ShapeModulation, SHAPE_DESCRIPTIONS } from '../../src/grit/shape-modulation';

describe('Shape Modulation', () =>
{
    describe('ShapeModulation enum', () =>
    {
        it('should have correct values for all modulation types', () =>
        {
            expect(ShapeModulation.None).toBe(0);
            expect(ShapeModulation.XorSquare).toBe(1);
            expect(ShapeModulation.XorSine).toBe(2);
            expect(ShapeModulation.XorTriangle).toBe(3);
            expect(ShapeModulation.XorSaw).toBe(4);
            expect(ShapeModulation.Am).toBe(5);
            expect(ShapeModulation.Ring).toBe(6);
            expect(ShapeModulation.Reserved).toBe(7);
        });
    });

    describe('SHAPE_DESCRIPTIONS', () =>
    {
        it('should have descriptions for all 8 modulation types', () =>
        {
            expect(Object.keys(SHAPE_DESCRIPTIONS).length).toBe(8);
        });

        it('should have meaningful descriptions', () =>
        {
            expect(SHAPE_DESCRIPTIONS[ShapeModulation.None]).toContain('pass-through');
            expect(SHAPE_DESCRIPTIONS[ShapeModulation.XorSquare]).toContain('Square');
            expect(SHAPE_DESCRIPTIONS[ShapeModulation.XorSine]).toContain('Sine');
            expect(SHAPE_DESCRIPTIONS[ShapeModulation.XorTriangle]).toContain('Triangle');
            expect(SHAPE_DESCRIPTIONS[ShapeModulation.XorSaw]).toContain('Sawtooth');
            expect(SHAPE_DESCRIPTIONS[ShapeModulation.Am]).toContain('Amplitude');
            expect(SHAPE_DESCRIPTIONS[ShapeModulation.Ring]).toContain('Ring');
            expect(SHAPE_DESCRIPTIONS[ShapeModulation.Reserved]).toContain('Reserved');
        });
    });
});

