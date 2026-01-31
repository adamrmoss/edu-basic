import { Program } from './program';
import { Statement, ExecutionResult } from './statements/statement';
import { ExecutionContext } from './execution-context';
import { Graphics } from './graphics';
import { Audio } from './audio';
import { ControlFlowFrameStack } from './control-flow-frame-stack';
import { ControlStructureFrame, ControlStructureType } from './control-flow-frames';
import {
    DoLoopStatement,
    ElseIfStatement,
    ElseStatement,
    EndStatement,
    EndType,
    ForStatement,
    GotoStatement,
    IfStatement,
    LoopStatement,
    NextStatement,
    SubStatement,
    UnlessStatement,
    WendStatement,
    WhileStatement
} from './statements/control-flow';
import { FileSystemService } from '../app/disk/filesystem.service';
import { ConsoleService } from '../app/console/console.service';

export class RuntimeExecution
{
    private readonly controlFrames = new ControlFlowFrameStack();
    private tabSwitchCallback: ((tabId: string) => void) | null = null;
    private sleepUntilMs: number | null = null;

    public constructor(
        private readonly program: Program,
        private readonly context: ExecutionContext,
        private readonly graphics: Graphics,
        private readonly audio: Audio,
        private readonly fileSystem: FileSystemService,
        private readonly consoleService: ConsoleService | null = null
    )
    {
    }

    public getFileSystem(): FileSystemService
    {
        return this.fileSystem;
    }

    public getConsoleService(): ConsoleService | null
    {
        return this.consoleService;
    }

    public setTabSwitchCallback(callback: ((tabId: string) => void) | null): void
    {
        this.tabSwitchCallback = callback;
    }

    public requestTabSwitch(tabId: string): void
    {
        if (this.tabSwitchCallback)
        {
            this.tabSwitchCallback(tabId);
        }
    }

    public executeStep(): ExecutionResult
    {
        if (this.sleepUntilMs !== null)
        {
            if (Date.now() < this.sleepUntilMs)
            {
                return ExecutionResult.Continue;
            }

            this.sleepUntilMs = null;
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

        this.context.incrementProgramCounter();
        return ExecutionResult.Continue;
    }

    public sleep(milliseconds: number): void
    {
        const ms = Math.max(0, Math.floor(milliseconds));

        if (ms === 0)
        {
            return;
        }

        this.sleepUntilMs = Date.now() + ms;
    }

    public pushControlFrame(frame: ControlStructureFrame): void
    {
        this.controlFrames.push(frame);
    }

    public popControlFrame(): ControlStructureFrame | undefined
    {
        return this.controlFrames.pop();
    }

    public getCurrentControlFrame(): ControlStructureFrame | undefined
    {
        return this.controlFrames.peek();
    }

    public findControlFrame(type: ControlStructureType): ControlStructureFrame | undefined
    {
        return this.controlFrames.find(type);
    }

    public findControlFrameWhere(predicate: (frame: ControlStructureFrame) => boolean): ControlStructureFrame | undefined
    {
        return this.controlFrames.findWhere(predicate);
    }

    public popControlFramesToAndIncluding(type: ControlStructureType): void
    {
        this.controlFrames.popToAndIncluding(type);
    }

    public popControlFramesToAndIncludingWhere(predicate: (frame: ControlStructureFrame) => boolean): ControlStructureFrame | undefined
    {
        return this.controlFrames.popToAndIncludingWhere(predicate);
    }

    public findMatchingEndIf(ifLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        for (let i = ifLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof IfStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.If)
            {
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    public findMatchingEndUnless(unlessLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        for (let i = unlessLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof UnlessStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.Unless)
            {
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    public findNextIfClauseOrEnd(fromLine: number, endIfLine: number): number
    {
        const statements = this.program.getStatements();
        let depth = 0;

        for (let i = fromLine; i <= endIfLine && i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof IfStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.If)
            {
                if (depth > 0)
                {
                    depth--;
                    continue;
                }
            }

            if (depth === 0)
            {
                if (stmt instanceof ElseIfStatement || stmt instanceof ElseStatement)
                {
                    return i;
                }
            }
        }

        return endIfLine;
    }

    public findMatchingNext(forLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        for (let i = forLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof ForStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof NextStatement)
            {
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    public findMatchingWend(whileLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        for (let i = whileLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof WhileStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof WendStatement)
            {
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    public findMatchingLoop(doLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        for (let i = doLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof DoLoopStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof LoopStatement)
            {
                if (depth === 0)
                {
                    return i;
                }

                depth--;
            }
        }

        return undefined;
    }

    public findMatchingEndSub(subLine: number): number | undefined
    {
        const statements = this.program.getStatements();
        let depth = 0;

        for (let i = subLine + 1; i < statements.length; i++)
        {
            const stmt = statements[i];

            if (stmt instanceof SubStatement)
            {
                depth++;
                continue;
            }

            if (stmt instanceof EndStatement && stmt.endType === EndType.Sub)
            {
                if (depth === 0)
                {
                    return i;
                }

                depth--;
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
                    const endIfIndex = this.findEndIfByText(i);

                    if (endIfIndex !== undefined)
                    {
                        return endIfIndex;
                    }
                }

                if (stmt.indentLevel < indentLevel)
                {
                    const endIfIndex = this.findEndIfByText(i);

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

    private findEndIfByText(startIndex: number): number | undefined
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
