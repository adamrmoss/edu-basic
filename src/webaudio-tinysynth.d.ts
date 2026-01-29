declare module 'webaudio-tinysynth'
{
    interface WebAudioTinySynthOptions
    {
        quality?: number;
        useReverb?: number;
        voices?: number;
    }

    interface WebAudioTinySynth
    {
        getAudioContext(): AudioContext;
        setAudioContext(audioContext: AudioContext, destinationNode?: AudioNode): void;
        setTsMode(mode: number): void;
        setProgram(ch: number, pg: number): void;
        setChVol(ch: number, val: number, t?: number): void;
        noteOn(ch: number, note: number, velo: number, t?: number): void;
        noteOff(ch: number, note: number, t?: number): void;
        getTimbreName(m: number, n: number): string;
        allSoundOff(ch: number): void;
        setMasterVol(lev: number): void;
    }

    interface WebAudioTinySynthConstructor
    {
        new (options?: WebAudioTinySynthOptions): WebAudioTinySynth;
    }

    const WebAudioTinySynth: WebAudioTinySynthConstructor;
    export = WebAudioTinySynth;
}
