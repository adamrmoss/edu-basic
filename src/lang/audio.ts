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

const MAX_QUEUE_SIZE = 1024;

type QueueEntry =
    | { kind: 'length'; value: number }
    | { kind: 'octave'; value: number }
    | { kind: 'velocity'; value: number }
    | { kind: 'note'; midiNote: number; duration: number; velocity: number }
    | { kind: 'rest'; duration: number };

/**
 * Stateful audio engine for the interpreter runtime.
 *
 * No scheduling: each voice has a queue. A "player" dequeues one note/rest at a time,
 * plays it now, pauses (setTimeout) for its duration, then continues. NOTES = queue length + 1 if currently playing.
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
    private voiceQueues: Map<number, QueueEntry[]> = new Map();
    private voicePlaying: Map<number, boolean> = new Map();
    private voiceTimeouts: Map<number, ReturnType<typeof setTimeout>> = new Map();

    /**
     * Create a new audio runtime instance and begin async initialization.
     */
    public constructor()
    {
        for (let i = 0; i < 8; i++)
        {
            this.voiceQueues.set(i, []);
            this.voicePlaying.set(i, false);
        }
        this.initializeAudio();
    }

    /**
     * Create and initialize the underlying Web Audio objects.
     *
     * This is intentionally defensive: missing APIs or exceptions simply result in `ready = false`.
     */
    private async initializeAudio(): Promise<void>
    {
        // Detect the browser-specific AudioContext constructor.
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

        // When audio is unavailable (e.g. tests / restricted environments), remain a no-op.
        if (!AudioContextClass)
        {
            this.ready = false;
            return;
        }

        try
        {
            // Create the core Web Audio objects.
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
                this.synth.setProgram(i, 0);
                this.synth.setChVol(i, Math.round(127 * this.volume / 100), 0);
            }
        }
        catch
        {
            // Any unexpected audio initialization failure should leave the runtime in a no-op state.
            this.ready = false;
        }
    }

    /**
     * Set playback tempo used by `playSequence()` (beats per minute).
     */
    public setTempo(bpm: number): void
    {
        // Clamp to a sane tempo range for predictable scheduling.
        this.tempo = Math.max(20, Math.min(300, bpm));
    }

    /**
     * Set master volume (0..100).
     *
     * This updates both the gain node and per-channel synth volume.
     */
    public setVolume(volume: number): void
    {
        // Clamp to percent range used by the UI and synth mapping.
        this.volume = Math.max(0, Math.min(100, volume));

        // Apply volume to the gain node when available.
        if (this.gainNode)
        {
            this.gainNode.gain.value = this.volume / 100;
        }

        // Mirror volume into each synth channel (0..127) for consistent loudness.
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
        // Store the flag for callers; then adjust the audio graph if possible.
        this.muted = muted;

        if (this.synth && this.audioContext)
        {
            if (muted)
            {
                // Muting is implemented by disconnecting the gain node from the destination.
                if (this.gainNode)
                {
                    this.gainNode.disconnect();
                }
            }
            else
            {
                // Unmuting reconnects the gain node.
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
        // Clamp to the supported voice indices 0..7.
        this.currentVoice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
    }

    /**
     * Set the General MIDI program number (instrument) for a voice.
     */
    public setVoiceInstrument(voiceIndex: number, programNum: number): void
    {
        // Clamp voice and program into valid ranges.
        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const program = Math.max(0, Math.min(127, Math.floor(programNum)));
        this.voiceConfigs.set(voice, { program });

        // Apply immediately when the synth is ready.
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
        // Resolve the name into a program number and apply it.
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
        // Default to program 0 when the synth is missing or the name is empty.
        if (!this.synth || !name.trim())
        {
            return 0;
        }

        // Normalize for case-insensitive matching.
        const normalized = name.trim().toLowerCase();

        // First pass: exact match.
        for (let i = 0; i < 128; i++)
        {
            const timbreName = this.synth.getTimbreName(0, i);
            if (timbreName && timbreName.toLowerCase() === normalized)
            {
                return i;
            }
        }

        // Second pass: substring match.
        for (let i = 0; i < 128; i++)
        {
            const timbreName = this.synth.getTimbreName(0, i);
            if (timbreName && timbreName.toLowerCase().includes(normalized))
            {
                return i;
            }
        }

        // Fallback: program 0 (usually piano).
        return 0;
    }

    /**
     * Convert a MIDI note number to frequency (Hz).
     */
    private midiNoteToFrequency(note: number): number
    {
        // Use A4=440Hz with 12-TET.
        return 440 * Math.pow(2, (note - 60) / 12);
    }

    /**
     * Convert frequency (Hz) to a nearest MIDI note number.
     */
    private frequencyToMidiNote(frequency: number): number
    {
        // Invert the MIDI->frequency mapping and round to nearest semitone.
        return Math.round(69 + 12 * Math.log2(frequency / 440));
    }

    /**
     * Parse a note name into a MIDI note number.
     *
     * Note letters may be upper or lower case. Sharp: + or # after the letter. Flat: - after the letter.
     * Example note names: "C", "c+", "C#", "C-", "D-".
     */
    private parseNoteName(noteName: string, octave: number): number | null
    {
        const noteMap: Record<string, number> = {
            'C': 0, 'C+': 1, 'C#': 1, 'C-': 11,
            'D': 2, 'D+': 3, 'D#': 3, 'D-': 1,
            'E': 4, 'E+': 4, 'E#': 4, 'E-': 3,
            'F': 5, 'F+': 6, 'F#': 6, 'F-': 4,
            'G': 7, 'G+': 8, 'G#': 8, 'G-': 6,
            'A': 9, 'A+': 10, 'A#': 10, 'A-': 8,
            'B': 11, 'B+': 12, 'B#': 12, 'B-': 10,
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
        // Ignore playback requests until the runtime is ready.
        if (!this.ready || !this.audioContext)
        {
            return;
        }

        // Parse the note name; invalid names are ignored.
        const midiNote = this.parseNoteName(note, 4);

        if (midiNote === null)
        {
            return;
        }

        // Delegate to MIDI playback using the current voice.
        this.playMidiNote(this.currentVoice, midiNote, duration, 100);
    }

    /**
     * Play a frequency (Hz) on the current voice.
     */
    public playFrequency(frequency: number, duration: number): void
    {
        // Ignore playback requests until the runtime is ready.
        if (!this.ready || !this.synth || !this.audioContext)
        {
            return;
        }

        // Read current voice configuration.
        const voice = this.currentVoice;
        const config = this.voiceConfigs.get(voice);

        if (!config)
        {
            return;
        }

        const midiNote = this.frequencyToMidiNote(frequency);
        const now = this.audioContext.currentTime;
        const vel = Math.round(127 * this.volume / 100);

        this.synth.setProgram(voice, config.program);
        this.synth.noteOn(voice, midiNote, vel, now);
        this.recordScheduledNote(voice, midiNote, now, duration, vel);
        setTimeout(() =>
        {
            const stopTime = this.audioContext?.currentTime ?? now + duration;
            this.synth?.noteOff(voice, midiNote, stopTime);
        }, duration * 1000);
    }

    /**
     * Play a MIDI note on a given voice with a given duration and velocity.
     */
    private playMidiNote(voiceIndex: number, midiNote: number, duration: number, velocity: number): void
    {
        // Ignore playback requests until the runtime is ready.
        if (!this.ready || !this.synth || !this.audioContext)
        {
            return;
        }

        // Clamp voice index and read configuration.
        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const config = this.voiceConfigs.get(voice);

        if (!config)
        {
            return;
        }

        const now = this.audioContext.currentTime;
        const vel = Math.round(velocity * this.volume / 100);

        this.synth.setProgram(voice, config.program);
        this.synth.noteOn(voice, midiNote, vel, now);
        this.recordScheduledNote(voice, midiNote, now, duration, vel);
        setTimeout(() =>
        {
            const stopTime = this.audioContext?.currentTime ?? now + duration;
            this.synth?.noteOff(voice, midiNote, stopTime);
        }, duration * 1000);
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

        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const entries = this.parseMml(mml);
        const queue = this.voiceQueues.get(voice) ?? [];

        if (queue.length + entries.length > MAX_QUEUE_SIZE)
        {
            throw new Error('Music Overflow');
        }

        if (this.audioContext.state === 'suspended')
        {
            this.enqueueOnly(voiceIndex, entries);
            this.audioContext.resume().then(() =>
            {
                this.processVoiceQueue(voice);
            }).catch(() =>
            {
            });
            return;
        }

        this.enqueueAndKick(voiceIndex, entries);
    }

    /**
     * Append to queue without starting the player (used when context is suspended).
     */
    private enqueueOnly(voiceIndex: number, entries: QueueEntry[]): void
    {
        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const queue = this.voiceQueues.get(voice) ?? [];
        this.voiceQueues.set(voice, [...queue, ...entries]);
    }

    /**
     * Append to queue and start the player if it is not already running.
     */
    private enqueueAndKick(voiceIndex: number, entries: QueueEntry[]): void
    {
        if (!this.ready || !this.synth || !this.audioContext)
        {
            return;
        }

        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const queue = this.voiceQueues.get(voice) ?? [];
        this.voiceQueues.set(voice, [...queue, ...entries]);
        this.processVoiceQueue(voice);
    }

    /**
     * Process one entry from the voice queue: dequeue, play (or wait for rest), pause for duration, then continue.
     * No scheduling: noteOn(now), setTimeout(duration), noteOff(now), then process next.
     */
    private processVoiceQueue(voice: number): void
    {
        if (!this.ready || !this.synth || !this.audioContext)
        {
            return;
        }

        if (this.voicePlaying.get(voice))
        {
            return;
        }

        const queue = this.voiceQueues.get(voice) ?? [];
        const beatDuration = 60 / this.tempo;

        while (queue.length > 0)
        {
            const entry = queue.shift()!;

            if (entry.kind === 'length' || entry.kind === 'octave' || entry.kind === 'velocity')
            {
                continue;
            }

            if (entry.kind === 'rest')
            {
                const durationMs = (entry.duration * beatDuration) * 1000;
                this.voicePlaying.set(voice, true);
                const id = setTimeout(() =>
                {
                    this.voicePlaying.set(voice, false);
                    this.voiceTimeouts.delete(voice);
                    this.processVoiceQueue(voice);
                }, durationMs);
                this.voiceTimeouts.set(voice, id);
                return;
            }

            if (entry.kind === 'note')
            {
                const durationSec = entry.duration * beatDuration;
                const durationMs = durationSec * 1000;
                const vel = Math.round(entry.velocity * this.volume / 100);
                const now = this.audioContext.currentTime;

                this.synth.setProgram(voice, this.voiceConfigs.get(voice)?.program ?? 0);
                this.synth.noteOn(voice, entry.midiNote, vel, now);
                this.recordScheduledNote(voice, entry.midiNote, now, durationSec, vel);

                this.voicePlaying.set(voice, true);
                const id = setTimeout(() =>
                {
                    const stopTime = this.audioContext?.currentTime ?? now + durationSec;
                    this.synth?.noteOff(voice, entry.midiNote, stopTime);
                    this.voicePlaying.set(voice, false);
                    this.voiceTimeouts.delete(voice);
                    this.processVoiceQueue(voice);
                }, durationMs);
                this.voiceTimeouts.set(voice, id);
                return;
            }
        }
    }

    /**
     * Return the number of entries remaining: queue length plus 1 if a note/rest is currently playing (paused in its duration).
     */
    public getNotesRemaining(voiceIndex: number): number
    {
        if (!this.ready || !this.audioContext)
        {
            return 0;
        }

        const voice = Math.max(0, Math.min(7, Math.floor(voiceIndex)));
        const queueLen = (this.voiceQueues.get(voice) ?? []).length;
        const playing = this.voicePlaying.get(voice) ? 1 : 0;
        return queueLen + playing;
    }

    /**
     * Record metadata about a scheduled note for status queries.
     */
    private recordScheduledNote(voice: number, midiNote: number, startTime: number, duration: number, velocity: number): void
    {
        // Append metadata for status queries (frequency is stored for display/debug use).
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
     * Parse MML into queue entries (one per token, including O, L, V, >, <) for the note queue.
     */
    private parseMml(mml: string): QueueEntry[]
    {
        const result: QueueEntry[] = [];
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
                    result.push({ kind: 'octave', value: octave });
                    i += 1 + octaveMatch[0].length;
                    continue;
                }
            }

            if (mml[i] === '>')
            {
                octave = Math.min(9, octave + 1);
                result.push({ kind: 'octave', value: octave });
                i++;
                continue;
            }

            if (mml[i] === '<')
            {
                octave = Math.max(0, octave - 1);
                result.push({ kind: 'octave', value: octave });
                i++;
                continue;
            }

            if (char === 'L' && i + 1 < mml.length)
            {
                const lengthMatch = mml.substring(i + 1).match(/^\d+/);
                if (lengthMatch)
                {
                    defaultLength = parseInt(lengthMatch[0], 10);
                    result.push({ kind: 'length', value: defaultLength });
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
                    result.push({ kind: 'velocity', value: velocity });
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
                    kind: 'rest',
                    duration: hasDot ? 6 / length : 4 / length
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
                        kind: 'note',
                        midiNote,
                        duration: hasDot ? 6 / length : 4 / length,
                        velocity
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
                'C': 0, 'C+': 1, 'C#': 1, 'C-': 11,
                'D': 2, 'D+': 3, 'D#': 3, 'D-': 1,
                'E': 4, 'E+': 4, 'E#': 4, 'E-': 3,
                'F': 5, 'F+': 6, 'F#': 6, 'F-': 4,
                'G': 7, 'G+': 8, 'G#': 8, 'G-': 6,
                'A': 9, 'A+': 10, 'A#': 10, 'A-': 8,
                'B': 11, 'B+': 12, 'B#': 12, 'B-': 10,
            };

            if (baseNoteNames.includes(char))
            {
                let noteName = char;
                if (i + 1 < mml.length)
                {
                    const next = mml[i + 1];
                    if (next === '#' || next === '+')
                    {
                        noteName = char + next;
                        i++;
                    }
                    else if (next === '-')
                    {
                        noteName = char + '-';
                        i++;
                    }
                }
                const noteIndex = noteIndexMap[noteName] ?? 0;
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
                    kind: 'note',
                    midiNote,
                    duration: hasDot ? 6 / length : 4 / length,
                    velocity
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
        // All sound off on each voice, then clear scheduling metadata so status queries reset.
        if (this.synth)
        {
            for (let i = 0; i < 8; i++)
            {
                this.synth.allSoundOff(i);
            }
        }

        for (let i = 0; i < 8; i++)
        {
            const timeoutId = this.voiceTimeouts.get(i);
            if (timeoutId !== undefined)
            {
                clearTimeout(timeoutId);
                this.voiceTimeouts.delete(i);
            }
            this.voicePlaying.set(i, false);
            this.scheduledNotes.set(i, []);
            this.voiceQueues.set(i, []);
        }
    }
}
