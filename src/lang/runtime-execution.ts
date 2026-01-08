import { Program } from './program';
import { Statement, ExecutionResult } from './statements/statement';
import { ExecutionContext } from './execution-context';
import { Graphics } from './graphics';
import { Audio } from './audio';
import { IfStatement } from './statements/control-flow/if-statement';
import { WhileStatement } from './statements/control-flow/while-statement';
import { DoLoopStatement } from './statements/control-flow/do-loop-statement';
import { ForStatement } from './statements/control-flow/for-statement';
import { GotoStatement } from './statements/control-flow/goto-statement';
import { EduBasicType } from './edu-basic-value';

interface ControlStructureFrame
{
    type: 'if' | 'while' | 'do' | 'for';
    startLine: number;
    endLine: number;
    nestedStatements?: Statement[];
    nestedIndex?: number;
    loopVariable?: string;
    loopStartValue?: number;
    loopEndValue?: number;
    loopStepValue?: number;
    condition?: any;
}

export class RuntimeExecution
{
    private controlStack: ControlStructureFrame[] = [];

    public constructor(
        private readonly program: Program,
        private readonly context: ExecutionContext,
        private readonly graphics: Graphics,
        private readonly audio: Audio
    )
    {
    }

    public executeStep(): ExecutionResult
    {
        const frame = this.getCurrentControlFrame();

        if (frame && frame.nestedStatements && frame.nestedIndex !== undefined)
        {
            if (frame.nestedIndex < frame.nestedStatements.length)
            {
                const nestedStmt = frame.nestedStatements[frame.nestedIndex];
                const status = nestedStmt.execute(this.context, this.graphics, this.audio, this.program, this);

                if (status.result === ExecutionResult.Goto && status.gotoTarget !== undefined)
                {
                    this.context.setProgramCounter(status.gotoTarget);
                    this.popControlFrame();
                    return ExecutionResult.Continue;
                }

                if (status.result === ExecutionResult.End)
                {
                    return ExecutionResult.End;
                }

                if (status.result === ExecutionResult.Return)
                {
                    const returnAddress = this.context.popStackFrame();

                    if (returnAddress !== undefined)
                    {
                        this.context.setProgramCounter(returnAddress);
                        this.popControlFrame();
                        return ExecutionResult.Continue;
                    }

                    return ExecutionResult.End;
                }

                frame.nestedIndex++;

                if (frame.nestedIndex >= frame.nestedStatements.length)
                {
                    frame.nestedIndex = undefined;

                    if (frame.type === 'if')
                    {
                        this.popControlFrame();
                        this.context.incrementProgramCounter();
                    }
                }

                return ExecutionResult.Continue;
            }
        }

        const pc = this.context.getProgramCounter();
        const statement = this.program.getStatement(pc);

        if (!statement)
        {
            return ExecutionResult.End;
        }

        const status = statement.execute(this.context, this.graphics, this.audio, this.program, this);

        if (status.result === ExecutionResult.Goto && status.gotoTarget !== undefined)
        {
            this.context.setProgramCounter(status.gotoTarget);
            return ExecutionResult.Continue;
        }

        if (status.result === ExecutionResult.End)
        {
            return ExecutionResult.End;
        }

        if (status.result === ExecutionResult.Return)
        {
            const returnAddress = this.context.popStackFrame();

            if (returnAddress !== undefined)
            {
                this.context.setProgramCounter(returnAddress);
                return ExecutionResult.Continue;
            }

            return ExecutionResult.End;
        }

        const nextFrame = this.getCurrentControlFrame();

        if (nextFrame && nextFrame.nestedStatements && Array.isArray(nextFrame.nestedStatements) && nextFrame.nestedStatements.length > 0)
        {
            const nestedIndex = nextFrame.nestedIndex;

            if (nestedIndex !== undefined && nestedIndex !== null)
            {
                if (nestedIndex >= 0 && nestedIndex < nextFrame.nestedStatements.length)
                {
                    return ExecutionResult.Continue;
                }
            }
        }

        this.context.incrementProgramCounter();
        return ExecutionResult.Continue;
    }

    public pushControlFrame(frame: ControlStructureFrame): void
    {
        this.controlStack.push(frame);
    }

    public popControlFrame(): ControlStructureFrame | undefined
    {
        return this.controlStack.pop();
    }

    public getCurrentControlFrame(): ControlStructureFrame | undefined
    {
        if (this.controlStack.length === 0)
        {
            return undefined;
        }

        return this.controlStack[this.controlStack.length - 1];
    }

    public findControlFrame(type: 'if' | 'while' | 'do' | 'for'): ControlStructureFrame | undefined
    {
        for (let i = this.controlStack.length - 1; i >= 0; i--)
        {
            if (this.controlStack[i].type === type)
            {
                return this.controlStack[i];
            }
        }

        return undefined;
    }

    public getIfEndLine(ifLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let indentLevel = 0;
        let foundIf = false;

        for (let i = ifLine; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (i === ifLine && stmt instanceof IfStatement)
            {
                foundIf = true;
                indentLevel = stmt.indentLevel + 1;
                continue;
            }

            if (foundIf)
            {
                if (stmt instanceof IfStatement && stmt.indentLevel === indentLevel - 1)
                {
                    const endIfIndex = this.findEndIf(i);

                    if (endIfIndex !== undefined)
                    {
                        return endIfIndex;
                    }
                }

                if (stmt.indentLevel < indentLevel)
                {
                    const endIfIndex = this.findEndIf(i);

                    if (endIfIndex !== undefined)
                    {
                        return endIfIndex;
                    }
                }
            }
        }

        return undefined;
    }

    public getWhileEndLine(whileLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let indentLevel = 0;
        let foundWhile = false;

        for (let i = whileLine; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (i === whileLine && stmt instanceof WhileStatement)
            {
                foundWhile = true;
                indentLevel = stmt.indentLevel + 1;
                continue;
            }

            if (foundWhile)
            {
                if (stmt.indentLevel < indentLevel)
                {
                    for (let j = i; j < statements.length; j++)
                    {
                        const checkStmt = statements[j];

                        if (checkStmt.indentLevel === indentLevel - 1)
                        {
                            return j;
                        }
                    }
                }
            }
        }

        return undefined;
    }

    public getDoLoopEndLine(doLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let indentLevel = 0;
        let foundDo = false;

        for (let i = doLine; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (i === doLine && stmt instanceof DoLoopStatement)
            {
                foundDo = true;
                indentLevel = stmt.indentLevel + 1;
                continue;
            }

            if (foundDo)
            {
                if (stmt.indentLevel < indentLevel)
                {
                    for (let j = i; j < statements.length; j++)
                    {
                        const checkStmt = statements[j];

                        if (checkStmt.indentLevel === indentLevel - 1)
                        {
                            return j;
                        }
                    }
                }
            }
        }

        return undefined;
    }

    public getForEndLine(forLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        const forStmt = statements[forLine] as ForStatement;

        if (!(forStmt instanceof ForStatement))
        {
            return undefined;
        }

        let indentLevel = forStmt.indentLevel + 1;

        for (let i = forLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt.indentLevel < indentLevel)
            {
                return i;
            }
        }

        return undefined;
    }

    private findEndIf(startIndex: number): number | undefined
    {
        const statements = this.program.getStatements();

        for (let i = startIndex; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt.toString().startsWith('END IF'))
            {
                return i;
            }
        }

        return undefined;
    }
}

