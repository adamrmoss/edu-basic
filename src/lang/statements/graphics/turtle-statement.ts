import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicType } from '../../edu-basic-value';

export class TurtleStatement extends Statement
{
    private static turtles: Map<number, { x: number; y: number; angleDeg: number; penDown: boolean }> = new Map();

    public constructor(
        public readonly commands: Expression
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
        const commandsValue = this.commands.evaluate(context);
        if (commandsValue.type !== EduBasicType.String)
        {
            throw new Error('TURTLE: commands must be a string');
        }

        const commandString = commandsValue.value as string;
        const turtleId = 0;

        const state = TurtleStatement.getOrCreateTurtle(graphics, turtleId);
        TurtleStatement.executeCommands(graphics, state, commandString);

        graphics.flush();
        runtime.requestTabSwitch('output');

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `TURTLE ${this.commands.toString()}`;
    }

    private static getOrCreateTurtle(graphics: Graphics, turtleId: number): { x: number; y: number; angleDeg: number; penDown: boolean }
    {
        const existing = this.turtles.get(turtleId);
        if (existing)
        {
            return existing;
        }

        const created = {
            x: graphics.width / 2,
            y: graphics.height / 2,
            angleDeg: 90,
            penDown: true
        };
        this.turtles.set(turtleId, created);
        return created;
    }

    private static executeCommands(graphics: Graphics, state: { x: number; y: number; angleDeg: number; penDown: boolean }, commands: string): void
    {
        const tokens = commands.trim().split(/\s+/).filter(t => t.length > 0);

        let i = 0;
        while (i < tokens.length)
        {
            const cmd = tokens[i].toUpperCase();

            switch (cmd)
            {
                case 'FD':
                case 'BK':
                {
                    const amountToken = tokens[i + 1];
                    if (amountToken === undefined)
                    {
                        throw new Error(`TURTLE: missing value for ${cmd}`);
                    }

                    const amount = Number.parseFloat(amountToken);
                    if (!Number.isFinite(amount))
                    {
                        throw new Error(`TURTLE: invalid value for ${cmd}`);
                    }

                    const signed = cmd === 'BK' ? -amount : amount;
                    TurtleStatement.move(graphics, state, signed);
                    i += 2;
                    break;
                }
                case 'RT':
                case 'LT':
                {
                    const amountToken = tokens[i + 1];
                    if (amountToken === undefined)
                    {
                        throw new Error(`TURTLE: missing value for ${cmd}`);
                    }

                    const amount = Number.parseFloat(amountToken);
                    if (!Number.isFinite(amount))
                    {
                        throw new Error(`TURTLE: invalid value for ${cmd}`);
                    }

                    state.angleDeg += (cmd === 'LT' ? amount : -amount);
                    i += 2;
                    break;
                }
                case 'PU':
                    state.penDown = false;
                    i += 1;
                    break;
                case 'PD':
                    state.penDown = true;
                    i += 1;
                    break;
                case 'HOME':
                    state.x = graphics.width / 2;
                    state.y = graphics.height / 2;
                    state.angleDeg = 90;
                    i += 1;
                    break;
                default:
                    throw new Error(`TURTLE: unknown command ${cmd}`);
            }
        }
    }

    private static move(graphics: Graphics, state: { x: number; y: number; angleDeg: number; penDown: boolean }, distance: number): void
    {
        const radians = (state.angleDeg * Math.PI) / 180;
        const startX = state.x;
        const startY = state.y;

        const endX = startX + Math.cos(radians) * distance;
        const endY = startY + Math.sin(radians) * distance;

        if (state.penDown)
        {
            graphics.drawLine(Math.round(startX), Math.round(startY), Math.round(endX), Math.round(endY));
        }

        state.x = endX;
        state.y = endY;
    }
}
