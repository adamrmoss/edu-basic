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

        const endIfLine = runtime.findMatchingEndIf(currentPc);
        if (endIfLine === undefined)
        {
            throw new Error('IF: missing END IF');
        }

        const branchTaken = conditionValue.value !== 0;

        runtime.pushControlFrame({
            type: 'if',
            startLine: currentPc,
            endLine: endIfLine,
            branchTaken
        });

        if (branchTaken)
        {
            return { result: ExecutionResult.Continue };
        }

        const nextClause = runtime.findNextIfClauseOrEnd(currentPc + 1, endIfLine);
        return { result: ExecutionResult.Goto, gotoTarget: nextClause };

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `IF ${this.condition.toString()} THEN`;
    }
}
