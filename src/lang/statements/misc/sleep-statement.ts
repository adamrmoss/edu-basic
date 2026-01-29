import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class SleepStatement extends Statement
{
    public constructor(
        public readonly milliseconds: Expression
    )
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        const value = this.milliseconds.evaluate(context);
        if (value.type !== EduBasicType.Integer && value.type !== EduBasicType.Real)
        {
            throw new Error('SLEEP: milliseconds must be a number');
        }

        const ms = Math.max(0, Math.floor(value.value as number));
        runtime.sleep(ms);
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `SLEEP ${this.milliseconds.toString()}`;
    }
}
