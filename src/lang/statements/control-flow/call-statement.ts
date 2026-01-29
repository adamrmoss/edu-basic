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

export class CallStatement extends Statement
{
    public constructor(
        public readonly subroutineName: string,
        public readonly args: Expression[]
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

                if (stmt.body.length > 0)
                {
                    runtime.pushControlFrame({
                        type: 'if',
                        startLine: i,
                        endLine: this.findEndSub(program, i) ?? i,
                        nestedStatements: stmt.body,
                        nestedIndex: 0
                    });

                    return { result: ExecutionResult.Goto, gotoTarget: i };
                }
            }
        }

        throw new Error(`SUB ${this.subroutineName} not found`);
    }

    private findEndSub(program: Program, startLine: number): number | undefined
    {
        const statements = program.getStatements();

        for (let i = startLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt.toString() === 'END SUB')
            {
                return i;
            }
        }

        return undefined;
    }

    public override toString(): string
    {
        const argStrings = this.args.map(a => a.toString()).join(', ');
        return `CALL ${this.subroutineName}${argStrings ? ' ' + argStrings : ''}`;
    }
}
