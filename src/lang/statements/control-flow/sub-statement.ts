import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

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

    public getIndentAdjustment(): number
    {
        return 1;
    }

    public execute(context: ExecutionContext, graphics: Graphics, audio: Audio): ExecutionStatus
    {
        return { result: ExecutionResult.Continue };
    }

    public toString(): string
    {
        const params = this.parameters.map(p => 
            (p.byRef ? 'BYREF ' : '') + p.name
        ).join(', ');

        let result = `SUB ${this.name}`;

        if (params)
        {
            result += ` ${params}`;
        }

        result += '\n';

        for (const statement of this.body)
        {
            result += `    ${statement.toString()}\n`;
        }

        result += 'END SUB';

        return result;
    }
}

