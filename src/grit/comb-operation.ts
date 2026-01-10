/**
 * GRIT Logical Combination Operations
 * 
 * Defines how enabled LFSR outputs are combined using bitwise logical operations.
 * COMB is applied to all enabled LFSRs simultaneously, bit-by-bit.
 */
export enum CombOperation
{
    /**
     * Exclusive OR - creates complex, uncorrelated noise
     * Most common operation for noise synthesis.
     * With 2 LFSRs: Output is 1 when inputs differ
     * With 3 LFSRs: Output is 1 when odd number of inputs are 1
     */
    Xor = 0,

    /**
     * Logical AND - creates sparse, gated patterns
     * With 2 LFSRs: Output is 1 only when both are 1
     * With 3 LFSRs: Output is 1 only when all three are 1
     */
    And = 1,

    /**
     * Logical OR - creates dense, filled patterns
     * With 2 LFSRs: Output is 1 when either is 1
     * With 3 LFSRs: Output is 1 when any are 1
     */
    Or = 2,

    /**
     * Negated AND - inverted AND pattern
     * Creates different spectral characteristics than AND due to different duty cycle.
     * With 2 LFSRs: Output is 0 only when both are 1 (inverse of AND)
     */
    Nand = 3,

    /**
     * Negated OR - inverted OR pattern
     * Creates different spectral characteristics than OR.
     * With 2 LFSRs: Output is 0 when either is 1 (inverse of OR)
     */
    Nor = 4,

    /**
     * Exclusive NOR - inverted XOR pattern
     * Creates different spectral characteristics than XOR.
     * With 2 LFSRs: Output is 1 when inputs are the same (inverse of XOR)
     */
    Xnor = 5,

    /**
     * Reserved for future expansion
     */
    Reserved6 = 6,

    /**
     * Reserved for future expansion
     */
    Reserved7 = 7,
}

/**
 * Applies the specified COMB operation to two boolean values
 */
export function applyCombOperation(operation: CombOperation, a: boolean, b: boolean): boolean
{
    switch (operation)
    {
        case CombOperation.Xor:
            return a !== b;
        case CombOperation.And:
            return a && b;
        case CombOperation.Or:
            return a || b;
        case CombOperation.Nand:
            return !(a && b);
        case CombOperation.Nor:
            return !(a || b);
        case CombOperation.Xnor:
            return a === b;
        case CombOperation.Reserved6:
        case CombOperation.Reserved7:
            return a !== b;
        default:
            return a !== b;
    }
}

/**
 * Combines multiple LFSR outputs using the specified operation (left-associative)
 */
export function combineOutputs(operation: CombOperation, outputs: boolean[]): boolean
{
    if (outputs.length === 0)
    {
        return false;
    }

    if (outputs.length === 1)
    {
        return outputs[0];
    }

    let result = outputs[0];

    for (let i = 1; i < outputs.length; i++)
    {
        result = applyCombOperation(operation, result, outputs[i]);
    }

    return result;
}
