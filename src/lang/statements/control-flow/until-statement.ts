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

        if (conditionValue.value !== 0)
        {
            const uendLine = this.findUend(program, currentPc);

            if (uendLine !== undefined)
            {
                return { result: ExecutionResult.Goto, gotoTarget: uendLine };
            }
        }
        else
        {
            if (this.body.length > 0)
            {
                runtime.pushControlFrame({
                    type: 'while',
                    startLine: currentPc,
                    endLine: this.findUend(program, currentPc) ?? currentPc,
                    nestedStatements: this.body,
                    nestedIndex: 0,
                    condition: this.condition
                });

                return { result: ExecutionResult.Continue };
            }
        }

        return { result: ExecutionResult.Continue };
    }

    private findUend(program: Program, startLine: number): number | undefined
    {
        const statements = program.getStatements();

        for (let i = startLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof UendStatement)
            {
                if (stmt.indentLevel === this.indentLevel)
                {
                    return i;
                }
            }

            if (stmt.indentLevel < this.indentLevel)
            {
                break;
            }
        }

        return undefined;
    }

    public override toString(): string
    {
        let result = `UNTIL ${this.condition.toString()}\n`;

        for (const statement of this.body)
        {
            result += `    ${statement.toString()}\n`;
        }

        result += 'UEND';

        return result;
    }
}

