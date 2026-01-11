import {
    getPresetNoiseCode,
    PRESETS,
} from '../grit/presets';
import {
    DEFAULT_ADSR_SUSTAINED,
    DEFAULT_ADSR_PERCUSSIVE,
    DEFAULT_ADSR_PAD,
    DEFAULT_ADSR_PLUCK,
    AdsrEnvelope,
} from '../grit/adsr-envelope';

interface VoiceConfig
{
    noiseCode: number;
    adsr: AdsrEnvelope;
}

interface ScheduledNote
{
    frequency: number;
    startTime: number;
    duration: number;
    velocity: number;
}

export class Audio
{
    private tempo: number = 120;
    private volume: number = 100;
    private currentVoice: number = 0;

    private audioContext: AudioContext | null = null;
    private workletNode: AudioWorkletNode | null = null;
    private workletReady: boolean = false;

    private voiceConfigs: Map<number, VoiceConfig> = new Map();
    private scheduledNotes: Map<number, ScheduledNote[]> = new Map();
    private nextNoteTime: Map<number, number> = new Map();

    public constructor()
    {
        this.initializeAudio();
    }

    private async initializeAudio(): Promise<void>
    {
        try
        {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            await this.audioContext.audioWorklet.addModule('/grit-worklet.js');

            this.workletNode = new AudioWorkletNode(this.audioContext, 'grit-processor');
            this.workletNode.connect(this.audioContext.destination);

            this.workletReady = true;

            for (let i = 0; i < 8; i++)
            {
                this.voiceConfigs.set(i, {
                    noiseCode: PRESETS[0],
                    adsr: { ...DEFAULT_ADSR_SUSTAINED },
                });
                this.scheduledNotes.set(i, []);
                this.nextNoteTime.set(i, 0);
            }
        }
        catch (error)
        {
            console.error('Failed to initialize audio:', error);
            this.workletReady = false;
        }
    }

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
        this.currentVoice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
    }

    public configureVoice(
        voiceIndex: number,
        preset: number | null,
        noiseCode: number | null,
        adsrPreset: number | null,
        adsrCustom: number[] | null
    ): void
    {
        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));

        let noiseCodeValue: number;

        if (preset !== null)
        {
            const presetNoiseCode = getPresetNoiseCode(preset);

            if (presetNoiseCode !== undefined)
            {
                noiseCodeValue = presetNoiseCode;
            }
            else
            {
                noiseCodeValue = PRESETS[0];
            }
        }
        else if (noiseCode !== null)
        {
            noiseCodeValue = noiseCode;
        }
        else
        {
            const current = this.voiceConfigs.get(voice);

            if (current)
            {
                noiseCodeValue = current.noiseCode;
            }
            else
            {
                noiseCodeValue = PRESETS[0];
            }
        }

        let adsr: AdsrEnvelope;

        if (adsrPreset !== null)
        {
            adsr = this.getAdsrPreset(adsrPreset);
        }
        else if (adsrCustom !== null && adsrCustom.length >= 4)
        {
            adsr = {
                attack: Math.max(0, adsrCustom[0]),
                decay: Math.max(0, adsrCustom[1]),
                sustain: Math.max(0, Math.min(1, adsrCustom[2])),
                release: Math.max(0, adsrCustom[3]),
            };
        }
        else
        {
            const current = this.voiceConfigs.get(voice);

            if (current)
            {
                adsr = current.adsr;
            }
            else
            {
                adsr = { ...DEFAULT_ADSR_SUSTAINED };
            }
        }

        this.voiceConfigs.set(voice, { noiseCode: noiseCodeValue, adsr });

        if (this.workletReady && this.workletNode && this.audioContext)
        {
            this.workletNode.port.postMessage({
                type: 'setVoice',
                voiceIndex: voice,
                noiseCode: noiseCodeValue,
                frequency: 440,
                adsr,
            });
        }
    }

    private getAdsrPreset(preset: number): AdsrEnvelope
    {
        switch (preset)
        {
            case 0:
                return { ...DEFAULT_ADSR_SUSTAINED };
            case 1:
                return { ...DEFAULT_ADSR_PERCUSSIVE };
            case 2:
                return { ...DEFAULT_ADSR_PLUCK };
            case 3:
                return { ...DEFAULT_ADSR_PAD };
            case 4:
                return { attack: 1.0, decay: 0.5, sustain: 0.6, release: 4.0 };
            case 5:
                return { attack: 0.01, decay: 0.05, sustain: 0.0, release: 0.1 };
            case 6:
                return { attack: 0.1, decay: 0.2, sustain: 0.9, release: 2.0 };
            case 7:
                return { attack: 0.01, decay: 0.3, sustain: 0.3, release: 1.0 };
            case 8:
                return { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.3 };
            case 9:
                return { attack: 0.2, decay: 0.4, sustain: 0.7, release: 1.0 };
            case 10:
                return { attack: 0.01, decay: 0.1, sustain: 1.0, release: 0.1 };
            case 11:
                return { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.5 };
            case 12:
                return { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.3 };
            case 13:
                return { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 };
            case 14:
                return { attack: 0.001, decay: 0.05, sustain: 0.0, release: 0.2 };
            case 15:
                return { attack: 0.001, decay: 0.01, sustain: 0.0, release: 0.05 };
            default:
                return { ...DEFAULT_ADSR_SUSTAINED };
        }
    }

    private midiNoteToFrequency(note: number): number
    {
        return 440 * Math.pow(2, (note - 60) / 12);
    }

    private parseNoteName(noteName: string, octave: number): number | null
    {
        const noteMap: Record<string, number> = {
            'C': 0, 'C#': 1, 'Db': 1,
            'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4,
            'F': 5, 'F#': 6, 'Gb': 6,
            'G': 7, 'G#': 8, 'Ab': 8,
            'A': 9, 'A#': 10, 'Bb': 10,
            'B': 11,
        };

        const upper = noteName.toUpperCase();

        if (noteMap[upper] !== undefined)
        {
            return octave * 12 + noteMap[upper];
        }

        return null;
    }

    public playNote(note: string, duration: number): void
    {
        if (!this.workletReady || !this.audioContext)
        {
            return;
        }

        const midiNote = this.parseNoteName(note, 4);

        if (midiNote === null)
        {
            return;
        }

        const frequency = this.midiNoteToFrequency(midiNote);
        this.playFrequency(frequency, duration);
    }

    public playFrequency(frequency: number, duration: number): void
    {
        if (!this.workletReady || !this.workletNode || !this.audioContext)
        {
            return;
        }

        const voice = this.currentVoice;
        const config = this.voiceConfigs.get(voice);

        if (!config)
        {
            return;
        }

        const currentTime = this.audioContext.currentTime;
        const startTime = Math.max(currentTime, this.nextNoteTime.get(voice) || currentTime);

        this.workletNode.port.postMessage({
            type: 'setVoice',
            voiceIndex: voice,
            noiseCode: config.noiseCode,
            frequency,
            adsr: config.adsr,
        });

        this.workletNode.port.postMessage({
            type: 'noteOn',
            voiceIndex: voice,
        });

        const volumeMultiplier = this.volume / 100;

        setTimeout(() =>
        {
            if (this.workletNode)
            {
                this.workletNode.port.postMessage({
                    type: 'noteOff',
                    voiceIndex: voice,
                });
            }
        }, (startTime - currentTime + duration) * 1000);

        this.nextNoteTime.set(voice, startTime + duration);
    }

    public playSequence(mml: string): void
    {
        if (!this.workletReady || !this.audioContext)
        {
            return;
        }

        const voice = this.currentVoice;
        const notes = this.parseMml(mml);

        const currentTime = this.audioContext.currentTime;
        let time = Math.max(currentTime, this.nextNoteTime.get(voice) || currentTime);

        const beatDuration = 60 / this.tempo;
        const volumeMultiplier = this.volume / 100;

        for (const note of notes)
        {
            if (note.type === 'rest')
            {
                time += note.duration * beatDuration;
            }
            else if (note.type === 'note' && note.midiNote !== undefined)
            {
                const frequency = this.midiNoteToFrequency(note.midiNote);
                const duration = note.duration * beatDuration;

                setTimeout(() =>
                {
                    if (this.workletReady && this.workletNode)
                    {
                        const config = this.voiceConfigs.get(voice);

                        if (config)
                        {
                            this.workletNode.port.postMessage({
                                type: 'setVoice',
                                voiceIndex: voice,
                                noiseCode: config.noiseCode,
                                frequency,
                                adsr: config.adsr,
                            });

                            this.workletNode.port.postMessage({
                                type: 'noteOn',
                                voiceIndex: voice,
                            });

                            setTimeout(() =>
                            {
                                if (this.workletNode)
                                {
                                    this.workletNode.port.postMessage({
                                        type: 'noteOff',
                                        voiceIndex: voice,
                                    });
                                }
                            }, duration * 1000);
                        }
                    }
                }, (time - currentTime) * 1000);

                time += duration;
            }
        }

        this.nextNoteTime.set(voice, time);
    }

    private parseMml(mml: string): Array<{ type: 'note' | 'rest'; midiNote?: number; duration: number }>
    {
        const result: Array<{ type: 'note' | 'rest'; midiNote?: number; duration: number }> = [];
        let i = 0;
        let octave = 4;
        let defaultLength = 4;
        let velocity = 64;

        while (i < mml.length)
        {
            const char = mml[i].toUpperCase();

            if (char === 'O' && i + 1 < mml.length)
            {
                const octaveMatch = mml.substring(i + 1).match(/^\d+/);

                if (octaveMatch)
                {
                    octave = parseInt(octaveMatch[0], 10);
                    i += 1 + octaveMatch[0].length;
                    continue;
                }
            }

            if (char === 'L' && i + 1 < mml.length)
            {
                const lengthMatch = mml.substring(i + 1).match(/^\d+/);

                if (lengthMatch)
                {
                    defaultLength = parseInt(lengthMatch[0], 10);
                    i += 1 + lengthMatch[0].length;
                    continue;
                }
            }

            if (char === 'V' && i + 1 < mml.length)
            {
                const velocityMatch = mml.substring(i + 1).match(/^\d+/);

                if (velocityMatch)
                {
                    velocity = parseInt(velocityMatch[0], 10);
                    i += 1 + velocityMatch[0].length;
                    continue;
                }
            }

            if (char === 'R')
            {
                let length = defaultLength;
                let hasDot = false;

                if (i + 1 < mml.length)
                {
                    const lengthMatch = mml.substring(i + 1).match(/^(\d+)(\.?)/);

                    if (lengthMatch)
                    {
                        length = parseInt(lengthMatch[1], 10);
                        hasDot = lengthMatch[2] === '.';
                    }
                }

                result.push({
                    type: 'rest',
                    duration: hasDot ? 1.5 / length : 1 / length,
                });

                i++;

                if (i < mml.length && mml[i] === '.')
                {
                    i++;
                }

                continue;
            }

            if (char === 'N' && i + 1 < mml.length)
            {
                const noteMatch = mml.substring(i + 1).match(/^(\d+)/);

                if (noteMatch)
                {
                    const midiNote = parseInt(noteMatch[0], 10);
                    let length = defaultLength;
                    let hasDot = false;

                    if (i + 1 + noteMatch[0].length < mml.length)
                    {
                        const lengthMatch = mml.substring(i + 1 + noteMatch[0].length).match(/^(\d+)(\.?)/);

                        if (lengthMatch)
                        {
                            length = parseInt(lengthMatch[1], 10);
                            hasDot = lengthMatch[2] === '.';
                        }
                    }

                    result.push({
                        type: 'note',
                        midiNote,
                        duration: hasDot ? 1.5 / length : 1 / length,
                    });

                    i += 1 + noteMatch[0].length;

                    if (i < mml.length && mml[i] === '.')
                    {
                        i++;
                    }

                    continue;
                }
            }

            const baseNoteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
            const noteIndexMap: Record<string, number> = {
                'C': 0, 'C#': 1, 'Db': 1,
                'D': 2, 'D#': 3, 'Eb': 3,
                'E': 4,
                'F': 5, 'F#': 6, 'Gb': 6,
                'G': 7, 'G#': 8, 'Ab': 8,
                'A': 9, 'A#': 10, 'Bb': 10,
                'B': 11,
            };

            if (baseNoteNames.includes(char))
            {
                let noteName = char;
                let noteIndex: number;

                if (i + 1 < mml.length)
                {
                    if (mml[i + 1] === '#')
                    {
                        noteName = char + '#';
                        i++;
                    }
                    else if (mml[i + 1].toLowerCase() === 'b' && char !== 'B')
                    {
                        noteName = char + 'b';
                        i++;
                    }
                }

                noteIndex = noteIndexMap[noteName] ?? 0;

                let length = defaultLength;
                let hasDot = false;

                if (i + 1 < mml.length)
                {
                    const lengthMatch = mml.substring(i + 1).match(/^(\d+)(\.?)/);

                    if (lengthMatch)
                    {
                        length = parseInt(lengthMatch[1], 10);
                        hasDot = lengthMatch[2] === '.';
                        i += lengthMatch[0].length;
                    }
                }

                const midiNote = octave * 12 + noteIndex;

                result.push({
                    type: 'note',
                    midiNote,
                    duration: hasDot ? 1.5 / length : 1 / length,
                });

                i++;
                continue;
            }

            i++;
        }

        return result;
    }

    public stop(): void
    {
        if (this.workletNode)
        {
            this.workletNode.port.postMessage({ type: 'stopAll' });
        }

        for (let i = 0; i < 8; i++)
        {
            this.scheduledNotes.set(i, []);
            this.nextNoteTime.set(i, 0);
        }
    }
}
