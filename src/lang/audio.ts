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
    private muted: boolean = false;

    private audioContext: AudioContext | null = null;
    private workletNode: AudioWorkletNode | null = null;
    private gainNode: GainNode | null = null;
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
        console.log('[Audio] Initializing audio system...');
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        
        if (!AudioContextClass)
        {
            console.error('[Audio] AudioContext not available');
            this.workletReady = false;
            return;
        }

        try
        {
            this.audioContext = new AudioContextClass();
            console.log('[Audio] AudioContext created, sample rate:', this.audioContext.sampleRate, 'state:', this.audioContext.state);

            await this.audioContext.audioWorklet.addModule('/grit-worklet.js');
            console.log('[Audio] Worklet module loaded');

            this.workletNode = new AudioWorkletNode(this.audioContext, 'grit-processor');
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume / 100;
            this.workletNode.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            console.log('[Audio] Worklet node created and connected with gain node, volume:', this.volume);

            this.workletReady = true;

            for (let i = 0; i < 8; i++)
            {
                const defaultNoiseCode = PRESETS[0];
                const defaultAdsr = { ...DEFAULT_ADSR_SUSTAINED };
                
                this.voiceConfigs.set(i, {
                    noiseCode: defaultNoiseCode,
                    adsr: defaultAdsr,
                });
                this.scheduledNotes.set(i, []);
                this.nextNoteTime.set(i, 0);
                
                if (this.workletNode)
                {
                    this.workletNode.port.postMessage({
                        type: 'setVoice',
                        voiceIndex: i,
                        noiseCode: defaultNoiseCode,
                        frequency: 440,
                        adsr: defaultAdsr,
                    });
                }
                
                console.log(`[Audio] Voice ${i} initialized with preset 0 (${defaultNoiseCode.toString(16)}), ADSR:`, defaultAdsr);
            }
            
            console.log('[Audio] Audio system initialized successfully');
        }
        catch (error)
        {
            console.error('[Audio] Failed to initialize audio system:', error);
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
        console.log(`[Audio] Volume set to ${this.volume}%`);
        
        if (this.gainNode)
        {
            this.gainNode.gain.value = this.volume / 100;
            console.log(`[Audio] Gain node updated to ${this.gainNode.gain.value}`);
        }
    }

    public setMuted(muted: boolean): void
    {
        this.muted = muted;
        console.log(`[Audio] Mute ${muted ? 'enabled' : 'disabled'}`);
        
        if (this.workletNode && this.audioContext)
        {
            if (muted)
            {
                if (this.gainNode)
                {
                    this.gainNode.disconnect();
                }
            }
            else
            {
                if (this.workletNode && this.gainNode && this.audioContext)
                {
                    this.workletNode.disconnect();
                    this.gainNode.disconnect();
                    this.workletNode.connect(this.gainNode);
                    this.gainNode.connect(this.audioContext.destination);
                }
            }
        }
    }

    public getMuted(): boolean
    {
        return this.muted;
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
        console.log(`[Audio] configureVoice: Voice ${voice}, preset=${preset}, noiseCode=${noiseCode?.toString(16)}, adsrPreset=${adsrPreset}, adsrCustom=${adsrCustom?.join(',')}`);

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
        console.log(`[Audio] Voice ${voice} configured: noiseCode=0x${noiseCodeValue.toString(16)}, ADSR=`, adsr);

        if (this.workletReady && this.workletNode && this.audioContext)
        {
            this.workletNode.port.postMessage({
                type: 'setVoice',
                voiceIndex: voice,
                noiseCode: noiseCodeValue,
                frequency: 440,
                adsr,
            });
            console.log(`[Audio] Voice ${voice} configuration sent to worklet`);
        }
        else
        {
            console.warn(`[Audio] Cannot send voice config to worklet (ready=${this.workletReady}, node=${!!this.workletNode}, context=${!!this.audioContext})`);
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

    public playSequence(voiceIndex: number, mml: string): void
    {
        if (!this.workletReady || !this.audioContext)
        {
            console.warn('[Audio] playSequence: Audio not ready', { workletReady: this.workletReady, audioContext: !!this.audioContext });
            return;
        }

        if (this.audioContext.state === 'suspended')
        {
            console.log('[Audio] AudioContext is suspended, resuming...');
            this.audioContext.resume().then(() =>
            {
                console.log('[Audio] AudioContext resumed, state:', this.audioContext?.state);
                this.playSequenceInternal(voiceIndex, mml);
            }).catch((error) =>
            {
                console.error('[Audio] Failed to resume AudioContext:', error);
            });
            return;
        }

        this.playSequenceInternal(voiceIndex, mml);
    }

    private playSequenceInternal(voiceIndex: number, mml: string): void
    {
        if (!this.workletReady || !this.audioContext)
        {
            return;
        }

        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        console.log(`[Audio] playSequence: Voice ${voice}, MML: "${mml}", tempo: ${this.tempo} BPM, context state: ${this.audioContext.state}`);
        
        const notes = this.parseMml(mml);
        console.log(`[Audio] Parsed ${notes.length} notes/rests`);

        const currentTime = this.audioContext.currentTime;
        let time = Math.max(currentTime, this.nextNoteTime.get(voice) || currentTime);

        const beatDuration = 60 / this.tempo;
        const volumeMultiplier = this.volume / 100;
        console.log(`[Audio] Tempo: ${this.tempo} BPM, beat duration: ${beatDuration.toFixed(3)}s`);

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

                const scheduleDelay = (time - currentTime) * 1000;
                console.log(`[Audio] Scheduling note: voice ${voice}, frequency ${frequency.toFixed(2)}Hz, duration ${duration.toFixed(3)}s, delay ${scheduleDelay.toFixed(0)}ms`);
                
                setTimeout(() =>
                {
                    if (!this.workletReady || !this.workletNode || !this.audioContext)
                    {
                        console.warn(`[Audio] Cannot play note: workletReady=${this.workletReady}, node=${!!this.workletNode}, context=${!!this.audioContext}`);
                        return;
                    }

                    if (this.muted)
                    {
                        console.log(`[Audio] Note skipped (muted): voice ${voice}`);
                        return;
                    }

                    if (this.audioContext.state !== 'running')
                    {
                        console.warn(`[Audio] AudioContext not running, state: ${this.audioContext.state}`);
                        return;
                    }

                    const config = this.voiceConfigs.get(voice);

                    if (!config)
                    {
                        console.warn(`[Audio] No config found for voice ${voice}`);
                        return;
                    }

                    console.log(`[Audio] Playing note NOW: voice ${voice}, frequency ${frequency.toFixed(2)}Hz, duration ${duration.toFixed(3)}s, context time: ${this.audioContext.currentTime.toFixed(3)}s`);
                    console.log(`[Audio] Voice config: noiseCode=0x${config.noiseCode.toString(16)}, ADSR=`, config.adsr);
                    
                    this.workletNode.port.postMessage({
                        type: 'setVoice',
                        voiceIndex: voice,
                        noiseCode: config.noiseCode,
                        frequency,
                        adsr: config.adsr,
                    });
                    console.log(`[Audio] Sent setVoice message to worklet`);

                    this.workletNode.port.postMessage({
                        type: 'noteOn',
                        voiceIndex: voice,
                    });
                    console.log(`[Audio] Sent noteOn message to worklet`);

                    setTimeout(() =>
                    {
                        if (this.workletNode)
                        {
                            console.log(`[Audio] Note OFF: voice ${voice}`);
                            this.workletNode.port.postMessage({
                                type: 'noteOff',
                                voiceIndex: voice,
                            });
                        }
                    }, duration * 1000);
                }, scheduleDelay);

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
