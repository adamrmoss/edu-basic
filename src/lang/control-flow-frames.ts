import { EduBasicValue } from './edu-basic-value';

/**
 * Structured control-flow metadata tracked during execution.
 *
 * These frames are pushed/popped by control flow statements and used by `RuntimeExecution`
 * to understand which IF/WHILE/FOR/etc. blocks are currently active.
 */
export type ControlStructureType = 'if' | 'unless' | 'while' | 'do' | 'for' | 'sub' | 'select';

/**
 * A single active structured-control block.
 *
 * `startLine` and `endLine` are statement indices (0-based) spanning the full block.
 */
export interface ControlStructureFrame
{
    /**
     * Control structure discriminator.
     */
    type: ControlStructureType;

    /**
     * 0-based statement index where the block starts.
     */
    startLine: number;

    /**
     * 0-based statement index where the block ends.
     */
    endLine: number;

    /**
     * Used by IF/UNLESS blocks to ensure only one branch runs.
     */
    branchTaken?: boolean;

    /**
     * FOR/NEXT loop metadata for iteration.
     */
    loopVariable?: string;
    loopEndValue?: number;
    loopStepValue?: number;

    /**
     * SELECT CASE metadata for matching CASE branches.
     */
    selectTestValue?: EduBasicValue;
    selectMatched?: boolean;
}

