import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class VolumeStatement extends Statement
{
    public constructor(
        public readonly level: Expression
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
        const volumeValue = this.level.evaluate(context);
        const volume = volumeValue.type === EduBasicType.Integer || volumeValue.type === EduBasicType.Real ? volumeValue.value as number : 100;
        
        audio.setVolume(volume);
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `VOLUME ${this.level.toString()}`;
    }
}
