import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class PlayStatement extends Statement
{
    public constructor(
        public readonly voiceNumber: Expression,
        public readonly mml: Expression
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
        const voiceValue = this.voiceNumber.evaluate(context);
        const mmlValue = this.mml.evaluate(context);
        
        const voice = voiceValue.type === EduBasicType.Integer || voiceValue.type === EduBasicType.Real ? Math.floor(voiceValue.value as number) : 0;
        const mmlString = mmlValue.type === EduBasicType.String ? mmlValue.value as string : '';
        
        audio.playSequence(mmlString);
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `PLAY ${this.voiceNumber.toString()}, ${this.mml.toString()}`;
    }
}

