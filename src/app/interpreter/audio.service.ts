import { Injectable } from '@angular/core';
import { Audio } from '../../lang/audio';

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
}
