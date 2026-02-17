import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { SubStatement } from './sub-statement';
import { VariableExpression } from '../../expressions/special/variable-expression';
import { EduBasicValue } from '../../edu-basic-value';

/**
 * Implements the `CALL` statement.
 */
export class CallStatement extends Statement
{
    /**
     * Linked `SUB` declaration line index (0-based).
     *
     * Populated by static syntax analysis.
     */
    public subLine?: number;

    /**
     * Subroutine name to invoke.
     */
    public readonly subroutineName: string;

    /**
     * Argument expressions.
     */
    public readonly args: Expression[];

    /**
     * Create a new `CALL` statement.
     *
     * @param subroutineName Subroutine name to invoke.
     * @param args Argument expressions.
     */
    public constructor(subroutineName: string, args: Expression[])
    {
        super();
        this.subroutineName = subroutineName;
        this.args = args;
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
        if (!this.isLinkedToProgram)
        {
            return { result: ExecutionResult.Continue };
        }

        const currentPc = context.getProgramCounter();
        if (this.subLine === undefined)
        {
            throw new Error(`SUB ${this.subroutineName} not found`);
        }

        const stmt = program.getStatement(this.subLine);
        if (!(stmt instanceof SubStatement))
        {
            throw new Error(`CALL: target SUB ${this.subroutineName} is invalid`);
        }

        if (stmt.parameters.length !== this.args.length)
        {
            throw new Error(`SUB ${this.subroutineName} expects ${stmt.parameters.length} parameters, got ${this.args.length}`);
        }

        const byRefBindings = new Map<string, string>();
        const byValValues = new Map<string, EduBasicValue>();

        // Build by-ref map (param name -> caller variable name) and by-val map; BYREF args must be variables.
        for (let j = 0; j < stmt.parameters.length; j++)
        {
            const param = stmt.parameters[j];

            if (param.byRef)
            {
                const argExpr = this.args[j];
                if (!(argExpr instanceof VariableExpression))
                {
                    throw new Error('CALL: BYREF argument must be a variable');
                }

                byRefBindings.set(param.name.toUpperCase(), argExpr.name);
                continue;
            }

            const argValue = this.args[j].evaluate(context);
            byValValues.set(param.name, argValue);
        }

        context.pushStackFrame(currentPc + 1, byRefBindings);

        for (const [paramName, value] of byValValues.entries())
        {
            context.setVariable(paramName, value, true);
        }

        if (stmt.endSubLine === undefined)
        {
            throw new Error(`SUB ${this.subroutineName} is missing END SUB`);
        }

        runtime.pushControlFrame({
            type: 'sub',
            startLine: this.subLine,
            endLine: stmt.endSubLine
        });

        return { result: ExecutionResult.Goto, gotoTarget: this.subLine + 1 };
    }

    public override toString(): string
    {
        const argStrings = this.args.map(a => a.toString()).join(', ');
        return `CALL ${this.subroutineName}${argStrings ? ' ' + argStrings : ''}`;
    }
}
