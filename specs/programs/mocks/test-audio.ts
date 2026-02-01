export class TestAudio
{
    public muted: boolean = false;
    public tempo: number = 120;
    public volume: number = 100;
    public currentVoice: number = 0;

    public readonly mutedCalls: boolean[] = [];
    public readonly tempoCalls: number[] = [];
    public readonly volumeCalls: number[] = [];
    public readonly voiceCalls: number[] = [];
    public readonly sequences: Array<{ voiceIndex: number; mml: string }> = [];
    public readonly notes: Array<{ note: string; duration: number }> = [];
    public readonly frequencies: Array<{ frequency: number; duration: number }> = [];

    public setMuted(muted: boolean): void
    {
        this.muted = muted;
        this.mutedCalls.push(muted);
    }

    public getMuted(): boolean
    {
        return this.muted;
    }

    public setTempo(bpm: number): void
    {
        this.tempo = bpm;
        this.tempoCalls.push(bpm);
    }

    public setVolume(volume: number): void
    {
        this.volume = volume;
        this.volumeCalls.push(volume);
    }

    public setVoice(voiceIndex: number): void
    {
        this.currentVoice = voiceIndex;
        this.voiceCalls.push(voiceIndex);
    }

    public setVoiceInstrument(_voiceIndex: number, _programNum: number): void
    {
    }

    public setVoiceInstrumentByName(_voiceIndex: number, _name: string): void
    {
    }

    public playSequence(voiceIndex: number, mml: string): void
    {
        this.sequences.push({ voiceIndex, mml });
    }

    public playNote(note: string, duration: number): void
    {
        this.notes.push({ note, duration });
    }

    public playFrequency(frequency: number, duration: number): void
    {
        this.frequencies.push({ frequency, duration });
    }

    public stop(): void
    {
    }
}

