import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class MkdirStatement extends Statement
{
    public constructor(
        public readonly path: Expression
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement MKDIR statement
        // - Evaluate path
        // - Create directory
        throw new Error('MKDIR statement not yet implemented');
    }

    public toString(): string
    {
        return `MKDIR ${this.path.toString()}`;
    }
}

