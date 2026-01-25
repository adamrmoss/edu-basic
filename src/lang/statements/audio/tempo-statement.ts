import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class TempoStatement extends Statement
{
    public constructor(
        public readonly bpm: Expression
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
        const bpmValue = this.bpm.evaluate(context);
        const bpm = bpmValue.type === EduBasicType.Integer || bpmValue.type === EduBasicType.Real ? bpmValue.value as number : 120;
        
        audio.setTempo(bpm);
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `TEMPO ${this.bpm.toString()}`;
    }
}
