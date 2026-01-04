import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class CallStatement extends Statement
{
    public constructor(
        public readonly subroutineName: string,
        public readonly args: Expression[]
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement SUB procedure calls
        // - Look up SUB definition
        // - Create new scope with parameters
        // - Execute SUB body
        // - Handle BYREF parameters
        throw new Error('CALL statement not yet implemented');
    }

    public toString(): string
    {
        const argStrings = this.args.map(a => a.toString()).join(', ');
        return `CALL ${this.subroutineName}${argStrings ? ' ' + argStrings : ''}`;
    }
}

