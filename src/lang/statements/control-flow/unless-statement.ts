import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { EndStatement, EndType } from './end-statement';

export class UnlessStatement extends Statement
{
    public constructor(
        public readonly condition: Expression,
        public readonly thenBranch: Statement[],
        public readonly elseBranch: Statement[] | null
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
            throw new Error('UNLESS condition must evaluate to an integer');
        }

        if (conditionValue.value === 0)
        {
            if (this.thenBranch.length > 0)
            {
                runtime.pushControlFrame({
                    type: 'if',
                    startLine: currentPc,
                    endLine: this.findEndUnless(program, currentPc) ?? currentPc,
                    nestedStatements: this.thenBranch,
                    nestedIndex: 0
                });

                return { result: ExecutionResult.Continue };
            }
            else
            {
                const endUnlessLine = this.findEndUnless(program, currentPc);

                if (endUnlessLine !== undefined)
                {
                    return { result: ExecutionResult.Goto, gotoTarget: endUnlessLine };
                }
            }
        }
        else
        {
            if (this.elseBranch !== null && this.elseBranch.length > 0)
            {
                runtime.pushControlFrame({
                    type: 'if',
                    startLine: currentPc,
                    endLine: this.findEndUnless(program, currentPc) ?? currentPc,
                    nestedStatements: this.elseBranch,
                    nestedIndex: 0
                });

                return { result: ExecutionResult.Continue };
            }
            else
            {
                const endUnlessLine = this.findEndUnless(program, currentPc);

                if (endUnlessLine !== undefined)
                {
                    return { result: ExecutionResult.Goto, gotoTarget: endUnlessLine };
                }
            }
        }

        return { result: ExecutionResult.Continue };
    }

    private findEndUnless(program: Program, startLine: number): number | undefined
    {
        const statements = program.getStatements();

        for (let i = startLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof EndStatement && stmt.endType === EndType.Unless)
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
        let result = `UNLESS ${this.condition.toString()} THEN\n`;

        for (const statement of this.thenBranch)
        {
            result += `    ${statement.toString()}\n`;
        }

        if (this.elseBranch !== null)
        {
            result += 'ELSE\n';
            for (const statement of this.elseBranch)
            {
                result += `    ${statement.toString()}\n`;
            }
        }

        result += 'END UNLESS';

        return result;
    }
}
