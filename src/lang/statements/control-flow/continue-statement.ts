import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export enum ContinueTarget
{
    For,
    While,
    Do
}

export class ContinueStatement extends Statement
{
    public constructor(
        public readonly target: ContinueTarget
    )
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement CONTINUE statement with loop context tracking
        // Need to return a special continue status that the containing loop recognizes
        throw new Error('CONTINUE statement not yet implemented');
    }

    public toString(): string
    {
        switch (this.target)
        {
            case ContinueTarget.For:
                return 'CONTINUE FOR';
            case ContinueTarget.While:
                return 'CONTINUE WHILE';
            case ContinueTarget.Do:
                return 'CONTINUE DO';
            default:
                return 'CONTINUE';
        }
    }
}

