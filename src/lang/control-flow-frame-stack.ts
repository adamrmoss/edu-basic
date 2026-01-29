import { ControlStructureType, ControlStructureFrame } from './control-flow-frames';

export class ControlFlowFrameStack
{
    private readonly frames: ControlStructureFrame[] = [];

    public get size(): number
    {
        return this.frames.length;
    }

    public clear(): void
    {
        this.frames.length = 0;
    }

    public push(frame: ControlStructureFrame): void
    {
        this.frames.push(frame);
    }

    public pop(): ControlStructureFrame | undefined
    {
        return this.frames.pop();
    }

    public peek(): ControlStructureFrame | undefined
    {
        if (this.frames.length === 0)
        {
            return undefined;
        }

        return this.frames[this.frames.length - 1];
    }

    public find(type: ControlStructureType): ControlStructureFrame | undefined
    {
        for (let i = this.frames.length - 1; i >= 0; i--)
        {
            const frame = this.frames[i];
            if (frame.type === type)
            {
                return frame;
            }
        }

        return undefined;
    }

    public popToAndIncluding(type: ControlStructureType): void
    {
        while (this.frames.length > 0)
        {
            const popped = this.pop();
            if (popped && popped.type === type)
            {
                return;
            }
        }
    }
}

