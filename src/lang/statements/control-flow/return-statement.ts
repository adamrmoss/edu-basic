import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class ReturnStatement extends Statement
{
    public constructor()
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        return { result: ExecutionResult.Return };
    }

    public toString(): string
    {
        return 'RETURN';
    }
}

