import { RuntimeNode } from '../runtime-node';
import { ExecutionContext } from '../execution-context';
import { Graphics } from '../graphics';
import { Audio } from '../audio';
import { Program } from '../program';
import { RuntimeExecution } from '../runtime-execution';

export enum ExecutionResult
{
    Continue,
    End,
    Goto,
    Return,
}

export interface ExecutionStatus
{
    result: ExecutionResult;
    gotoTarget?: number;
}

export abstract class Statement extends RuntimeNode
{
    public indentLevel: number = 0;

    public abstract execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus;

    public getIndentAdjustment(): number
    {
        return 0;
    }
}
