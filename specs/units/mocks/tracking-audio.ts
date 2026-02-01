import { Audio } from '@/lang/audio';

export class TrackingAudio extends Audio
{
    public mutedCalls: boolean[] = [];

    public override setMuted(muted: boolean): void
    {
        this.mutedCalls.push(muted);
        super.setMuted(muted);
    }
}

