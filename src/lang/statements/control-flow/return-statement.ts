import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class ReturnStatement extends Statement
{
    public constructor()
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement RETURN with return stack
        // Pop return address from stack and return Goto status with that target
        return { result: ExecutionResult.Return };
    }

    public toString(): string
    {
        return 'RETURN';
    }
}

