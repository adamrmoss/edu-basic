import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { ExecutionContext } from '../../execution-context';
import { Program } from '../../program';

export enum EndType
{
    Program,
    If,
    Unless,
    Select,
    Sub,
    Try
}

export class EndStatement extends Statement
{
    public constructor(public readonly endType: EndType = EndType.Program)
    {
        super();
    }

    public getIndentAdjustment(): number
    {
        return -1;
    }

    public execute(context: ExecutionContext, program: Program): ExecutionStatus
    {
        if (this.endType === EndType.Program)
        {
            return { result: ExecutionResult.End };
        }
        
        // Block endings are handled by block structure analysis
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        switch (this.endType)
        {
            case EndType.Program:
                return 'END';
            case EndType.If:
                return 'END IF';
            case EndType.Unless:
                return 'END UNLESS';
            case EndType.Select:
                return 'END SELECT';
            case EndType.Sub:
                return 'END SUB';
            case EndType.Try:
                return 'END TRY';
        }
    }
}
