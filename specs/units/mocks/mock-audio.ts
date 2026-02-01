import { Audio } from '@/lang/audio';

export class MockAudio extends Audio
{
    public trackedTempo: number | null = null;
    public trackedVolume: number | null = null;
    public voice: number | null = null;
    public sequences: Array<{ voiceIndex: number; mml: string }> = [];
    public instrumentCalls: Array<{ voiceIndex: number; program: number }> = [];
    public instrumentByNameCalls: Array<{ voiceIndex: number; name: string }> = [];

    public override setTempo(bpm: number): void
    {
        super.setTempo(bpm);
        this.trackedTempo = bpm;
    }

    public override setVolume(volume: number): void
    {
        super.setVolume(volume);
        this.trackedVolume = volume;
    }

    public override setVoice(voiceIndex: number): void
    {
        super.setVoice(voiceIndex);
        this.voice = voiceIndex;
    }

    public override setVoiceInstrument(voiceIndex: number, programNum: number): void
    {
        super.setVoiceInstrument(voiceIndex, programNum);
        this.instrumentCalls.push({ voiceIndex, program: programNum });
    }

    public override setVoiceInstrumentByName(voiceIndex: number, name: string): void
    {
        super.setVoiceInstrumentByName(voiceIndex, name);
        this.instrumentByNameCalls.push({ voiceIndex, name });
    }

    public override playSequence(voiceIndex: number, mml: string): void
    {
        super.playSequence(voiceIndex, mml);
        this.sequences.push({ voiceIndex, mml });
    }
}

