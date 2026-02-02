import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

/**
 * Implements the `TEMPO` statement.
 */
export class TempoStatement extends Statement
{
    /**
     * Tempo expression (beats per minute).
     */
    public readonly bpm: Expression;

    /**
     * Create a new `TEMPO` statement.
     *
     * @param bpm Tempo expression.
     */
    public constructor(bpm: Expression)
    {
        super();
        this.bpm = bpm;
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
