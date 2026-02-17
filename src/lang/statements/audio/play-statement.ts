import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `PLAY` statement.
 */
export class PlayStatement extends Statement
{
    /**
     * Voice number expression.
     */
    public readonly voiceNumber: Expression;

    /**
     * Sequence text expression.
     */
    public readonly mml: Expression;

    /**
     * Create a new `PLAY` statement.
     *
     * @param voiceNumber Voice number expression.
     * @param mml Sequence text expression.
     */
    public constructor(voiceNumber: Expression, mml: Expression)
    {
        super();
        this.voiceNumber = voiceNumber;
        this.mml = mml;
    }

    /**
     * Execute the statement.
     *
     * @returns Execution status.
     */
    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        // Evaluate voice and MML; coerce to integer voice and string, then play sequence on audio.
        const voiceValue = this.voiceNumber.evaluate(context);
        const mmlValue = this.mml.evaluate(context);
        
        const voice = voiceValue.type === EduBasicType.Integer || voiceValue.type === EduBasicType.Real ? Math.floor(voiceValue.value as number) : 0;
        const mmlString = mmlValue.type === EduBasicType.String ? mmlValue.value as string : '';

        audio.playSequence(voice, mmlString);
        
        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `PLAY ${this.voiceNumber.toString()}, ${this.mml.toString()}`;
    }
}
