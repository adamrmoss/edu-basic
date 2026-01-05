export class Audio
{
    private tempo: number = 120;
    private volume: number = 100;
    private currentVoice: number = 0;

    public setTempo(bpm: number): void
    {
        this.tempo = Math.max(20, Math.min(300, bpm));
    }

    public setVolume(volume: number): void
    {
        this.volume = Math.max(0, Math.min(100, volume));
    }

    public setVoice(voiceIndex: number): void
    {
        this.currentVoice = voiceIndex;
    }

    public playNote(note: string, duration: number): void
    {
        // TODO: Implement note playback
    }

    public playFrequency(frequency: number, duration: number): void
    {
        // TODO: Implement frequency playback using Web Audio API
    }

    public playSequence(mml: string): void
    {
        // TODO: Implement MML parser and sequencer
    }

    public stop(): void
    {
        // TODO: Stop all audio playback
    }
}

