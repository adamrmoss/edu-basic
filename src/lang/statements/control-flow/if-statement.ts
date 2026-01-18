import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { EndStatement, EndType } from './end-statement';
import { ElseStatement } from './else-statement';
import { ElseIfStatement } from './elseif-statement';

export class IfStatement extends Statement
{
    public constructor(
        public readonly condition: Expression,
        public readonly thenBranch: Statement[],
        public readonly elseIfBranches: { condition: Expression; statements: Statement[] }[],
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
            throw new Error('IF condition must evaluate to an integer');
        }

        if (conditionValue.value !== 0)
        {
            if (this.thenBranch.length > 0)
            {
                runtime.pushControlFrame({
                    type: 'if',
                    startLine: currentPc,
                    endLine: this.findEndIf(program, currentPc) ?? currentPc,
                    nestedStatements: this.thenBranch,
                    nestedIndex: 0
                });

                return { result: ExecutionResult.Continue };
            }
            else
            {
                const endIfLine = this.findEndIf(program, currentPc);

                if (endIfLine !== undefined)
                {
                    return { result: ExecutionResult.Goto, gotoTarget: endIfLine };
                }
            }
        }
        else
        {
            let executedBranch = false;

            for (const elseIfBranch of this.elseIfBranches)
            {
                const elseIfConditionValue = elseIfBranch.condition.evaluate(context);

                if (elseIfConditionValue.type !== EduBasicType.Integer)
                {
                    throw new Error('ELSEIF condition must evaluate to an integer');
                }

                if (elseIfConditionValue.value !== 0)
                {
                    if (elseIfBranch.statements.length > 0)
                    {
                        runtime.pushControlFrame({
                            type: 'if',
                            startLine: currentPc,
                            endLine: this.findEndIf(program, currentPc) ?? currentPc,
                            nestedStatements: elseIfBranch.statements,
                            nestedIndex: 0
                        });

                        return { result: ExecutionResult.Continue };
                    }

                    executedBranch = true;
                    break;
                }
            }

            if (!executedBranch && this.elseBranch !== null && this.elseBranch.length > 0)
            {
                runtime.pushControlFrame({
                    type: 'if',
                    startLine: currentPc,
                    endLine: this.findEndIf(program, currentPc) ?? currentPc,
                    nestedStatements: this.elseBranch,
                    nestedIndex: 0
                });

                return { result: ExecutionResult.Continue };
            }
            else if (!executedBranch)
            {
                const endIfLine = this.findEndIf(program, currentPc);

                if (endIfLine !== undefined)
                {
                    return { result: ExecutionResult.Goto, gotoTarget: endIfLine };
                }
            }
        }

        return { result: ExecutionResult.Continue };
    }

    private findEndIf(program: Program, startLine: number): number | undefined
    {
        const statements = program.getStatements();

        for (let i = startLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof EndStatement && stmt.endType === EndType.If)
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
        let result = `IF ${this.condition.toString()} THEN\n`;

        for (const statement of this.thenBranch)
        {
            result += `    ${statement.toString()}\n`;
        }

        for (const elseIfBranch of this.elseIfBranches)
        {
            result += `ELSEIF ${elseIfBranch.condition.toString()} THEN\n`;
            for (const statement of elseIfBranch.statements)
            {
                result += `    ${statement.toString()}\n`;
            }
        }

        if (this.elseBranch !== null)
        {
            result += 'ELSE\n';
            for (const statement of this.elseBranch)
            {
                result += `    ${statement.toString()}\n`;
            }
        }

        result += 'END IF';

        return result;
    }
}
