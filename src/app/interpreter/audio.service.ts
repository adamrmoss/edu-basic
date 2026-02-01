import { Injectable } from '@angular/core';
import { Audio } from '../../lang/audio';

/**
 * Owns the shared `Audio` runtime instance and provides simple UI-facing controls.
 *
 * The underlying audio implementation lives in `src/lang/audio.ts` and uses `webaudio-tinysynth`.
 */
@Injectable({
    providedIn: 'root'
})
export class AudioService
{
    private readonly audio: Audio;

    public constructor()
    {
        this.audio = new Audio();
    }

    public getAudio(): Audio
    {
        return this.audio;
    }

    public setMuted(muted: boolean): void
    {
        this.audio.setMuted(muted);
    }

    public getMuted(): boolean
    {
        return this.audio.getMuted();
    }
}
