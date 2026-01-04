import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class SeekStatement extends Statement
{
    public constructor(
        public readonly position: Expression,
        public readonly fileHandle: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement SEEK statement
        // - Evaluate position and file handle
        // - Set file pointer position
        throw new Error('SEEK statement not yet implemented');
    }

    public toString(): string
    {
        return `SEEK ${this.position.toString()} IN #${this.fileHandle.toString()}`;
    }
}

