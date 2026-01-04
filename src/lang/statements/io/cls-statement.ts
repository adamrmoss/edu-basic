import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export class ClsStatement extends Statement
{
    public constructor()
    {
        super();
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        // TODO: Implement CLS statement
        // Clear the video buffer/screen
        // program.videoBuffer.clear();
        throw new Error('CLS statement not yet implemented');
    }

    public toString(): string
    {
        return 'CLS';
    }
}

