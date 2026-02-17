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

    /**
     * Create a new audio service with a shared `Audio` runtime instance.
     */
    public constructor()
    {
        // Create the shared Audio runtime instance used by the interpreter.
        this.audio = new Audio();
    }

    /**
     * Get the shared audio runtime instance.
     */
    public getAudio(): Audio
    {
        return this.audio;
    }

    /**
     * Enable or disable audio output.
     *
     * @param muted Whether audio should be muted.
     */
    public setMuted(muted: boolean): void
    {
        this.audio.setMuted(muted);
    }
    
    /**
     * Get the current mute state.
     */
    public getMuted(): boolean
    {
        return this.audio.getMuted();
    }
}
