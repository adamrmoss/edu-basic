import { Graphics } from '@/lang/graphics';

export class BufferGraphics extends Graphics
{
    public constructor(private readonly testBuffer: ImageData)
    {
        super();
    }

    public override getBuffer(): ImageData | null
    {
        return this.testBuffer;
    }
}

