import WebAudioTinySynth from 'webaudio-tinysynth';

/**
 * EduBASIC audio runtime.
 *
 * This class is a thin wrapper around the Web Audio API + `webaudio-tinysynth` to provide:
 * - An 8-voice General MIDI-style playback model (voice indices 0..7).
 * - Basic note playback by name/frequency.
 * - A small MML-like sequence syntax for timed playback.
 *
 * Hosting assumptions:
 * - This code is browser-oriented (`window.AudioContext`).
 * - When audio APIs are unavailable or initialization fails, the runtime becomes a no-op
 *   (`ready = false`) without throwing or logging.
 */
interface VoiceConfig
{
    program: number;
}

interface ScheduledNote
{
    frequency: number;
    startTime: number;
    duration: number;
    velocity: number;
}

/**
 * Stateful audio engine for the interpreter runtime.
 *
 * Notes:
 * - Calls are ignored until initialization succeeds (`ready === true`).
 * - Scheduling is tracked per-voice using `nextNoteTime` to avoid overlaps when a program
 *   issues back-to-back play commands.
 */
export class Audio
{
    private tempo: number = 120;
    private volume: number = 100;
    private currentVoice: number = 0;
    private muted: boolean = false;

    private audioContext: AudioContext | null = null;
    private synth: WebAudioTinySynth | null = null;
    private gainNode: GainNode | null = null;
    private ready: boolean = false;

    private voiceConfigs: Map<number, VoiceConfig> = new Map();
    private scheduledNotes: Map<number, ScheduledNote[]> = new Map();
    private nextNoteTime: Map<number, number> = new Map();

    public constructor()
    {
        this.initializeAudio();
    }

    /**
     * Create and initialize the underlying Web Audio objects.
     *
     * This is intentionally defensive: missing APIs or exceptions simply result in `ready = false`.
     */
    private async initializeAudio(): Promise<void>
    {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

        if (!AudioContextClass)
        {
            this.ready = false;
            return;
        }

        try
        {
            this.audioContext = new AudioContextClass();
            this.synth = new WebAudioTinySynth({ quality: 0, useReverb: 0, voices: 32 });
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume / 100;
            this.synth.setAudioContext(this.audioContext, this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            this.synth.setTsMode(0);
            this.ready = true;

            for (let i = 0; i < 8; i++)
            {
                this.voiceConfigs.set(i, { program: 0 });
                this.scheduledNotes.set(i, []);
                this.nextNoteTime.set(i, 0);
                this.synth.setProgram(i, 0);
                this.synth.setChVol(i, Math.round(127 * this.volume / 100), 0);
            }
        }
        catch
        {
            this.ready = false;
        }
    }

    /**
     * Set playback tempo used by `playSequence()` (beats per minute).
     */
    public setTempo(bpm: number): void
    {
        this.tempo = Math.max(20, Math.min(300, bpm));
    }

    /**
     * Set master volume (0..100).
     *
     * This updates both the gain node and per-channel synth volume.
     */
    public setVolume(volume: number): void
    {
        this.volume = Math.max(0, Math.min(100, volume));

        if (this.gainNode)
        {
            this.gainNode.gain.value = this.volume / 100;
        }

        if (this.synth)
        {
            const chVol = Math.round(127 * this.volume / 100);
            for (let i = 0; i < 8; i++)
            {
                this.synth.setChVol(i, chVol, 0);
            }
        }
    }

    /**
     * Mute/unmute audio output without destroying the audio graph.
     */
    public setMuted(muted: boolean): void
    {
        this.muted = muted;

        if (this.synth && this.audioContext)
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
                if (this.synth && this.gainNode && this.audioContext)
                {
                    this.gainNode.connect(this.audioContext.destination);
                }
            }
        }
    }

    /**
     * Whether the output is currently muted.
     */
    public getMuted(): boolean
    {
        return this.muted;
    }

    /**
     * Select the active voice (clamped to 0..7) used by convenience playback methods.
     */
    public setVoice(voiceIndex: number): void
    {
        this.currentVoice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
    }

    /**
     * Set the General MIDI program number (instrument) for a voice.
     */
    public setVoiceInstrument(voiceIndex: number, programNum: number): void
    {
        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const program = Math.max(0, Math.min(127, Math.floor(programNum)));
        this.voiceConfigs.set(voice, { program });

        if (this.ready && this.synth)
        {
            this.synth.setProgram(voice, program);
        }
    }

    /**
     * Resolve an instrument name and set the voice's General MIDI program number.
     */
    public setVoiceInstrumentByName(voiceIndex: number, name: string): void
    {
        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const program = this.resolveProgramByName(name);
        this.voiceConfigs.set(voice, { program });

        if (this.ready && this.synth)
        {
            this.synth.setProgram(voice, program);
        }
    }

    /**
     * Resolve a synth timbre by name.
     *
     * Strategy:
     * - First attempt an exact case-insensitive match.
     * - Then attempt a substring match.
     * - Fall back to 0 (usually piano).
     */
    private resolveProgramByName(name: string): number
    {
        if (!this.synth || !name.trim())
        {
            return 0;
        }

        const normalized = name.trim().toLowerCase();

        for (let i = 0; i < 128; i++)
        {
            const timbreName = this.synth.getTimbreName(0, i);
            if (timbreName && timbreName.toLowerCase() === normalized)
            {
                return i;
            }
        }

        for (let i = 0; i < 128; i++)
        {
            const timbreName = this.synth.getTimbreName(0, i);
            if (timbreName && timbreName.toLowerCase().includes(normalized))
            {
                return i;
            }
        }

        return 0;
    }

    /**
     * Convert a MIDI note number to frequency (Hz).
     */
    private midiNoteToFrequency(note: number): number
    {
        return 440 * Math.pow(2, (note - 60) / 12);
    }

    /**
     * Convert frequency (Hz) to a nearest MIDI note number.
     */
    private frequencyToMidiNote(frequency: number): number
    {
        return Math.round(69 + 12 * Math.log2(frequency / 440));
    }

    /**
     * Parse a note name into a MIDI note number.
     *
     * Example note names: "C", "C#", "Db".
     */
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

    /**
     * Play a note name (default octave 4) on the current voice.
     */
    public playNote(note: string, duration: number): void
    {
        if (!this.ready || !this.audioContext)
        {
            return;
        }

        const midiNote = this.parseNoteName(note, 4);

        if (midiNote === null)
        {
            return;
        }

        this.playMidiNote(this.currentVoice, midiNote, duration, 100);
    }

    /**
     * Play a frequency (Hz) on the current voice.
     */
    public playFrequency(frequency: number, duration: number): void
    {
        if (!this.ready || !this.synth || !this.audioContext)
        {
            return;
        }

        const voice = this.currentVoice;
        const config = this.voiceConfigs.get(voice);

        if (!config)
        {
            return;
        }

        const midiNote = this.frequencyToMidiNote(frequency);
        const currentTime = this.audioContext.currentTime;
        const startTime = Math.max(currentTime, this.nextNoteTime.get(voice) || currentTime);

        this.synth.setProgram(voice, config.program);
        this.synth.noteOn(voice, midiNote, Math.round(127 * this.volume / 100), startTime);
        this.synth.noteOff(voice, midiNote, startTime + duration);

        this.recordScheduledNote(voice, midiNote, startTime, duration, Math.round(127 * this.volume / 100));
        this.nextNoteTime.set(voice, startTime + duration);
    }

    /**
     * Play a MIDI note on a given voice with a given duration and velocity.
     */
    private playMidiNote(voiceIndex: number, midiNote: number, duration: number, velocity: number): void
    {
        if (!this.ready || !this.synth || !this.audioContext)
        {
            return;
        }

        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const config = this.voiceConfigs.get(voice);

        if (!config)
        {
            return;
        }

        const currentTime = this.audioContext.currentTime;
        const startTime = Math.max(currentTime, this.nextNoteTime.get(voice) || currentTime);
        const vel = Math.round(velocity * this.volume / 100);

        this.synth.setProgram(voice, config.program);
        this.synth.noteOn(voice, midiNote, vel, startTime);
        this.synth.noteOff(voice, midiNote, startTime + duration);

        this.recordScheduledNote(voice, midiNote, startTime, duration, vel);
        this.nextNoteTime.set(voice, startTime + duration);
    }

    /**
     * Play a short sequence using a simple MML-like string.
     *
     * If the audio context is suspended (common before user gesture), we resume it and then play.
     */
    public playSequence(voiceIndex: number, mml: string): void
    {
        if (!this.ready || !this.audioContext)
        {
            return;
        }

        if (this.audioContext.state === 'suspended')
        {
            this.audioContext.resume().then(() =>
            {
                this.playSequenceInternal(voiceIndex, mml);
            }).catch(() =>
            {
            });
            return;
        }

        this.playSequenceInternal(voiceIndex, mml);
    }

    /**
     * Internal implementation for `playSequence()` once the audio context is running.
     */
    private playSequenceInternal(voiceIndex: number, mml: string): void
    {
        if (!this.ready || !this.synth || !this.audioContext)
        {
            return;
        }

        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const notes = this.parseMml(mml);
        const currentTime = this.audioContext.currentTime;
        let time = Math.max(currentTime, this.nextNoteTime.get(voice) || currentTime);
        const beatDuration = 60 / this.tempo;

        for (const note of notes)
        {
            if (note.type === 'rest')
            {
                time += note.duration * beatDuration;
            }
            else if (note.type === 'note' && note.midiNote !== undefined)
            {
                const duration = note.duration * beatDuration;
                const vel = Math.round((note.velocity ?? 64) * this.volume / 100);

                this.synth.setProgram(voice, this.voiceConfigs.get(voice)?.program ?? 0);
                this.synth.noteOn(voice, note.midiNote, vel, time);
                this.synth.noteOff(voice, note.midiNote, time + duration);

                this.recordScheduledNote(voice, note.midiNote, time, duration, vel);
                time += duration;
            }
        }

        this.nextNoteTime.set(voice, time);
    }

    /**
     * Return the number of scheduled notes that have not finished yet for a voice.
     */
    public getNotesRemaining(voiceIndex: number): number
    {
        if (!this.ready || !this.audioContext)
        {
            return 0;
        }

        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const notes = this.scheduledNotes.get(voice) ?? [];
        const now = this.audioContext.currentTime;

        /*
         * Keep only notes that have not finished yet.
         */
        const remainingNotes = notes.filter((n) => (n.startTime + n.duration) > now);
        this.scheduledNotes.set(voice, remainingNotes);

        return remainingNotes.length;
    }

    /**
     * Record metadata about a scheduled note for status queries.
     */
    private recordScheduledNote(voice: number, midiNote: number, startTime: number, duration: number, velocity: number): void
    {
        const current = this.scheduledNotes.get(voice) ?? [];
        current.push({
            duration,
            frequency: this.midiNoteToFrequency(midiNote),
            startTime,
            velocity
        });
        this.scheduledNotes.set(voice, current);
    }

    /**
     * Parse a simple MML-like string into timed note/rest tokens.
     */
    private parseMml(mml: string): Array<{ type: 'note' | 'rest'; midiNote?: number; duration: number; velocity?: number }>
    {
        const result: Array<{ type: 'note' | 'rest'; midiNote?: number; duration: number; velocity?: number }> = [];
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
                        velocity,
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
                    velocity,
                });

                i++;
                continue;
            }

            i++;
        }

        return result;
    }

    /**
     * Stop all voices and clear all scheduled-note tracking.
     */
    public stop(): void
    {
        if (this.synth)
        {
            for (let i = 0; i < 8; i++)
            {
                this.synth.allSoundOff(i);
            }
        }

        for (let i = 0; i < 8; i++)
        {
            this.scheduledNotes.set(i, []);
            this.nextNoteTime.set(i, 0);
        }
    }
}
