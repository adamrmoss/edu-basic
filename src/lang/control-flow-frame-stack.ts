import { ControlStructureType, ControlStructureFrame } from './control-flow-frames';

/**
 * Stack for active structured-control frames.
 *
 * The executor and control-flow statements treat this as a LIFO stack, but it also
 * supports searching from the top to find the nearest frame of a given type.
 */
export class ControlFlowFrameStack
{
    private readonly frames: ControlStructureFrame[] = [];

    /**
     * Current number of frames on the stack.
     */
    public get size(): number
    {
        return this.frames.length;
    }

    /**
     * Remove all frames.
     */
    public clear(): void
    {
        // Clear in-place to preserve the `frames` array identity.
        this.frames.length = 0;
    }

    /**
     * Push a frame onto the stack.
     */
    public push(frame: ControlStructureFrame): void
    {
        this.frames.push(frame);
    }

    /**
     * Pop the top frame from the stack.
     */
    public pop(): ControlStructureFrame | undefined
    {
        return this.frames.pop();
    }

    /**
     * Peek the top frame without mutating the stack.
     */
    public peek(): ControlStructureFrame | undefined
    {
        if (this.frames.length === 0)
        {
            return undefined;
        }

        return this.frames[this.frames.length - 1];
    }

    /**
     * Find the nearest frame of the given type (searching from top to bottom).
     */
    public find(type: ControlStructureType): ControlStructureFrame | undefined
    {
        // Search from top (most recent) to bottom for the nearest frame of this type.
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

    /**
     * Find the nearest frame that satisfies the predicate (searching from top to bottom).
     */
    public findWhere(predicate: (frame: ControlStructureFrame) => boolean): ControlStructureFrame | undefined
    {
        // Search from top to bottom to find the nearest matching frame.
        for (let i = this.frames.length - 1; i >= 0; i--)
        {
            const frame = this.frames[i];
            if (predicate(frame))
            {
                return frame;
            }
        }

        return undefined;
    }

    /**
     * Pop frames until (and including) the nearest frame of the requested type.
     */
    public popToAndIncluding(type: ControlStructureType): void
    {
        // Pop from top until a frame of the given type is removed (or stack empty).
        while (this.frames.length > 0)
        {
            const popped = this.pop();
            if (popped && popped.type === type)
            {
                return;
            }
        }
    }

    /**
     * Pop frames until (and including) the first that matches the predicate.
     */
    public popToAndIncludingWhere(predicate: (frame: ControlStructureFrame) => boolean): ControlStructureFrame | undefined
    {
        // Pop frames until the predicate matches (or the stack is empty).
        while (this.frames.length > 0)
        {
            const popped = this.pop();
            if (popped && predicate(popped))
            {
                return popped;
            }
        }

        return undefined;
    }
}

