import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { UendStatement } from './uend-statement';

export class UntilStatement extends Statement
{
    public constructor(
        public readonly condition: Expression,
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
        const conditionValue = this.condition.evaluate(context);

        if (conditionValue.type !== EduBasicType.Integer)
        {
            throw new Error('UNTIL condition must evaluate to an integer');
        }

        const uendLine = this.findUend(program, currentPc);
        if (uendLine === undefined)
        {
            throw new Error('UNTIL: missing UEND');
        }

        if (conditionValue.value !== 0)
        {
            return { result: ExecutionResult.Goto, gotoTarget: uendLine + 1 };
        }

        runtime.pushControlFrame({
            type: 'while',
            startLine: currentPc,
            endLine: uendLine
        });

        return { result: ExecutionResult.Continue };

        return { result: ExecutionResult.Continue };
    }

    private findUend(program: Program, startLine: number): number | undefined
    {
        const statements = program.getStatements();
        let depth = 0;

        for (let i = startLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof UntilStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof UendStatement)
            {
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    public override toString(): string
    {
        return `UNTIL ${this.condition.toString()}`;
    }
}
