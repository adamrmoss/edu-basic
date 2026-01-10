import { CombOperation, applyCombOperation, combineOutputs } from '../../src/grit/comb-operation';

describe('COMB Operation', () =>
{
    describe('CombOperation enum', () =>
    {
        it('should have correct values for all operations', () =>
        {
            expect(CombOperation.Xor).toBe(0);
            expect(CombOperation.And).toBe(1);
            expect(CombOperation.Or).toBe(2);
            expect(CombOperation.Nand).toBe(3);
            expect(CombOperation.Nor).toBe(4);
            expect(CombOperation.Xnor).toBe(5);
            expect(CombOperation.Reserved6).toBe(6);
            expect(CombOperation.Reserved7).toBe(7);
        });
    });

    describe('applyCombOperation', () =>
    {
        describe('XOR operation', () =>
        {
            it('should return true when inputs differ', () =>
            {
                expect(applyCombOperation(CombOperation.Xor, true, false)).toBe(true);
                expect(applyCombOperation(CombOperation.Xor, false, true)).toBe(true);
            });

            it('should return false when inputs are the same', () =>
            {
                expect(applyCombOperation(CombOperation.Xor, true, true)).toBe(false);
                expect(applyCombOperation(CombOperation.Xor, false, false)).toBe(false);
            });
        });

        describe('AND operation', () =>
        {
            it('should return true only when both inputs are true', () =>
            {
                expect(applyCombOperation(CombOperation.And, true, true)).toBe(true);
                expect(applyCombOperation(CombOperation.And, true, false)).toBe(false);
                expect(applyCombOperation(CombOperation.And, false, true)).toBe(false);
                expect(applyCombOperation(CombOperation.And, false, false)).toBe(false);
            });
        });

        describe('OR operation', () =>
        {
            it('should return true when either input is true', () =>
            {
                expect(applyCombOperation(CombOperation.Or, true, true)).toBe(true);
                expect(applyCombOperation(CombOperation.Or, true, false)).toBe(true);
                expect(applyCombOperation(CombOperation.Or, false, true)).toBe(true);
                expect(applyCombOperation(CombOperation.Or, false, false)).toBe(false);
            });
        });

        describe('NAND operation', () =>
        {
            it('should return inverse of AND', () =>
            {
                expect(applyCombOperation(CombOperation.Nand, true, true)).toBe(false);
                expect(applyCombOperation(CombOperation.Nand, true, false)).toBe(true);
                expect(applyCombOperation(CombOperation.Nand, false, true)).toBe(true);
                expect(applyCombOperation(CombOperation.Nand, false, false)).toBe(true);
            });
        });

        describe('NOR operation', () =>
        {
            it('should return inverse of OR', () =>
            {
                expect(applyCombOperation(CombOperation.Nor, true, true)).toBe(false);
                expect(applyCombOperation(CombOperation.Nor, true, false)).toBe(false);
                expect(applyCombOperation(CombOperation.Nor, false, true)).toBe(false);
                expect(applyCombOperation(CombOperation.Nor, false, false)).toBe(true);
            });
        });

        describe('XNOR operation', () =>
        {
            it('should return true when inputs are the same', () =>
            {
                expect(applyCombOperation(CombOperation.Xnor, true, true)).toBe(true);
                expect(applyCombOperation(CombOperation.Xnor, false, false)).toBe(true);
            });

            it('should return false when inputs differ', () =>
            {
                expect(applyCombOperation(CombOperation.Xnor, true, false)).toBe(false);
                expect(applyCombOperation(CombOperation.Xnor, false, true)).toBe(false);
            });
        });

        describe('Reserved operations', () =>
        {
            it('should default to XOR behavior', () =>
            {
                expect(applyCombOperation(CombOperation.Reserved6, true, false)).toBe(true);
                expect(applyCombOperation(CombOperation.Reserved7, true, true)).toBe(false);
            });
        });
    });

    describe('combineOutputs', () =>
    {
        it('should return false for empty array', () =>
        {
            expect(combineOutputs(CombOperation.Xor, [])).toBe(false);
        });

        it('should return the single value for single-element array', () =>
        {
            expect(combineOutputs(CombOperation.Xor, [true])).toBe(true);
            expect(combineOutputs(CombOperation.Xor, [false])).toBe(false);
        });

        it('should combine two outputs correctly', () =>
        {
            expect(combineOutputs(CombOperation.Xor, [true, false])).toBe(true);
            expect(combineOutputs(CombOperation.And, [true, true])).toBe(true);
            expect(combineOutputs(CombOperation.Or, [false, true])).toBe(true);
        });

        it('should combine three outputs left-associatively with XOR', () =>
        {
            // XOR: odd number of trues = true
            expect(combineOutputs(CombOperation.Xor, [true, false, false])).toBe(true);
            expect(combineOutputs(CombOperation.Xor, [true, true, false])).toBe(false);
            expect(combineOutputs(CombOperation.Xor, [true, true, true])).toBe(true);
            expect(combineOutputs(CombOperation.Xor, [false, false, false])).toBe(false);
        });

        it('should combine three outputs left-associatively with AND', () =>
        {
            expect(combineOutputs(CombOperation.And, [true, true, true])).toBe(true);
            expect(combineOutputs(CombOperation.And, [true, true, false])).toBe(false);
            expect(combineOutputs(CombOperation.And, [true, false, true])).toBe(false);
        });

        it('should combine three outputs left-associatively with OR', () =>
        {
            expect(combineOutputs(CombOperation.Or, [false, false, false])).toBe(false);
            expect(combineOutputs(CombOperation.Or, [false, false, true])).toBe(true);
            expect(combineOutputs(CombOperation.Or, [true, false, false])).toBe(true);
        });
    });
});

