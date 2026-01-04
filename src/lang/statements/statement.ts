import { RuntimeNode } from '../runtime-node';
import { ExecutionContext } from '../execution-context';
import { Program } from '../program';

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

    public abstract execute(context: ExecutionContext, program: Program): ExecutionStatus;

    public getIndentAdjustment(): number
    {
        return 0;
    }
}
