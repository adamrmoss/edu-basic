import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';
import { WendStatement } from './wend-statement';

export class WhileStatement extends Statement
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
            throw new Error('WHILE condition must evaluate to an integer');
        }

        const wendLine = runtime.findMatchingWend(currentPc);
        if (wendLine === undefined)
        {
            throw new Error('WHILE: missing WEND');
        }

        if (conditionValue.value === 0)
        {
            return { result: ExecutionResult.Goto, gotoTarget: wendLine + 1 };
        }

        runtime.pushControlFrame({
            type: 'while',
            startLine: currentPc,
            endLine: wendLine
        });

        return { result: ExecutionResult.Continue };

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `WHILE ${this.condition.toString()}`;
    }
}
