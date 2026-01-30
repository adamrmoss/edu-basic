import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';

export interface SubParameter
{
    name: string;
    byRef: boolean;
}

export class SubStatement extends Statement
{
    public constructor(
        public readonly name: string,
        public readonly parameters: SubParameter[],
        public readonly body: Statement[]
    )
    {
        super();
    }

    public override getIndentAdjustment(): number
    {
        return 1;
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const currentPc = context.getProgramCounter();
        const endSubLine = runtime.findMatchingEndSub(currentPc);
        if (endSubLine === undefined)
        {
            throw new Error(`SUB ${this.name} is missing END SUB`);
        }

        return { result: ExecutionResult.Goto, gotoTarget: endSubLine + 1 };
    }

    public override toString(): string
    {
        const params = this.parameters.map(p => 
            (p.byRef ? 'BYREF ' : '') + p.name
        ).join(', ');

        if (params)
        {
            return `SUB ${this.name} ${params}`;
        }

        return `SUB ${this.name}`;
    }
}
