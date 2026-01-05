import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';

export class ForStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly startValue: Expression,
        public readonly endValue: Expression,
        public readonly stepValue: Expression | null,
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
        throw new Error('FOR statement not yet implemented');
    }

    public toString(): string
    {
        let result = `FOR ${this.variableName} = ${this.startValue.toString()} TO ${this.endValue.toString()}`;

        if (this.stepValue !== null)
        {
            result += ` STEP ${this.stepValue.toString()}`;
        }

        result += '\n';

        for (const statement of this.body)
        {
            result += `    ${statement.toString()}\n`;
        }

        result += `NEXT ${this.variableName}`;

        return result;
    }
}

