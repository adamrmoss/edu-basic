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
        const currentPc = context.getProgramCounter();
        const statements = program.getStatements();

        for (let i = 0; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof SubStatement && stmt.name.toUpperCase() === this.subroutineName.toUpperCase())
            {
                if (stmt.parameters.length !== this.args.length)
                {
                    throw new Error(`SUB ${this.subroutineName} expects ${stmt.parameters.length} parameters, got ${this.args.length}`);
                }

                const byRefBindings = new Map<string, string>();
                const byValValues = new Map<string, EduBasicValue>();

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

                const endSubLine = runtime.findMatchingEndSub(i);
                if (endSubLine === undefined)
                {
                    throw new Error(`SUB ${this.subroutineName} is missing END SUB`);
                }

                runtime.pushControlFrame({
                    type: 'sub',
                    startLine: i,
                    endLine: endSubLine
                });

                return { result: ExecutionResult.Goto, gotoTarget: i + 1 };
            }
        }

        throw new Error(`SUB ${this.subroutineName} not found`);
    }

    public override toString(): string
    {
        const argStrings = this.args.map(a => a.toString()).join(', ');
        return `CALL ${this.subroutineName}${argStrings ? ' ' + argStrings : ''}`;
    }
}
