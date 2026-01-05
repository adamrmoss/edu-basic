import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class ClsStatement extends Statement
{
    public constructor()
    {
        super();
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        graphics.clear();
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        return 'CLS';
    }
}

