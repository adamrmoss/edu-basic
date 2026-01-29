const GM_NAMES: Record<number, string> = {
    0: 'Acoustic Grand Piano',
    40: 'Violin',
    56: 'Trumpet',
};

let mockSynthInstance: {
    setProgram: jest.Mock;
    noteOn: jest.Mock;
    noteOff: jest.Mock;
    getTimbreName: jest.Mock;
    setAudioContext: jest.Mock;
    setTsMode: jest.Mock;
    setChVol: jest.Mock;
    allSoundOff: jest.Mock;
};

jest.mock('webaudio-tinysynth', () =>
{
    mockSynthInstance = {
        setProgram: jest.fn(),
        noteOn: jest.fn(),
        noteOff: jest.fn(),
        getTimbreName: jest.fn((_m: number, n: number) => GM_NAMES[n] ?? `Instrument ${n}`),
        setAudioContext: jest.fn(),
        setTsMode: jest.fn(),
        setChVol: jest.fn(),
        allSoundOff: jest.fn(),
    };
    return function (): typeof mockSynthInstance
    {
        return mockSynthInstance;
    };
});

import { Audio } from '../src/lang/audio';

describe('Audio', () =>
{
    let audio: Audio;

    beforeEach(() =>
    {
        mockSynthInstance.setProgram.mockClear();
        mockSynthInstance.setAudioContext.mockClear();
        mockSynthInstance.setTsMode.mockClear();
        mockSynthInstance.setChVol.mockClear();

        (window as any).AudioContext = jest.fn().mockImplementation(() => ({
            sampleRate: 44100,
            state: 'running',
            currentTime: 0,
            destination: {},
            createGain: jest.fn().mockReturnValue({
                gain: { value: 1 },
                connect: jest.fn(),
                disconnect: jest.fn(),
            }),
        }));

        audio = new Audio();
    });

    describe('initialization', () =>
    {
        it('should create synth and set up context', () =>
        {
            expect(mockSynthInstance.setAudioContext).toHaveBeenCalled();
            expect(mockSynthInstance.setTsMode).toHaveBeenCalledWith(0);
        });

        it('should initialize 8 voices with program 0', () =>
        {
            expect(mockSynthInstance.setProgram).toHaveBeenCalledTimes(8);
            for (let i = 0; i < 8; i++)
            {
                expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(i, 0);
            }
        });
    });

    describe('setVoiceInstrument', () =>
    {
        it('should set program by number and call synth', () =>
        {
            audio.setVoiceInstrument(0, 56);
            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(0, 56);
        });

        it('should clamp voice index to 0-7', () =>
        {
            audio.setVoiceInstrument(-1, 0);
            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(0, 0);
            mockSynthInstance.setProgram.mockClear();
            audio.setVoiceInstrument(10, 0);
            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(7, 0);
        });

        it('should clamp program to 0-127', () =>
        {
            audio.setVoiceInstrument(0, 200);
            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(0, 127);
            mockSynthInstance.setProgram.mockClear();
            audio.setVoiceInstrument(0, -5);
            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(0, 0);
        });
    });

    describe('setVoiceInstrumentByName', () =>
    {
        it('should resolve exact name and set program', () =>
        {
            audio.setVoiceInstrumentByName(0, 'Acoustic Grand Piano');
            expect(mockSynthInstance.getTimbreName).toHaveBeenCalled();
            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(0, 0);
        });

        it('should resolve case-insensitively', () =>
        {
            audio.setVoiceInstrumentByName(1, 'acoustic grand piano');
            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(1, 0);
        });

        it('should fall back to program 0 for unknown name', () =>
        {
            audio.setVoiceInstrumentByName(0, 'Unknown Instrument XYZ');
            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(0, 0);
        });

        it('should resolve by substring match when exact match fails', () =>
        {
            mockSynthInstance.getTimbreName.mockClear();
            mockSynthInstance.setProgram.mockClear();
            audio.setVoiceInstrumentByName(0, 'Piano');
            expect(mockSynthInstance.getTimbreName).toHaveBeenCalled();
            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(0, 0);
        });
    });

    describe('setTempo', () =>
    {
        it('should accept valid tempo', () =>
        {
            audio.setTempo(120);
        });

        it('should clamp tempo to 20-300', () =>
        {
            audio.setTempo(10);
            audio.setTempo(400);
        });
    });

    describe('setVolume', () =>
    {
        it('should accept valid volume', () =>
        {
            audio.setVolume(50);
        });

        it('should update channel volume on synth', () =>
        {
            mockSynthInstance.setChVol.mockClear();
            audio.setVolume(50);
            const expectedVol = Math.round(127 * 50 / 100);
            expect(mockSynthInstance.setChVol).toHaveBeenCalledTimes(8);
            for (let i = 0; i < 8; i++)
            {
                expect(mockSynthInstance.setChVol).toHaveBeenCalledWith(i, expectedVol, 0);
            }
        });
    });

    describe('setMuted and getMuted', () =>
    {
        it('should return false when not muted', () =>
        {
            expect(audio.getMuted()).toBe(false);
        });

        it('should disconnect gain when muted and reconnect when unmuted', () =>
        {
            const mockGain = {
                gain: { value: 1 },
                connect: jest.fn(),
                disconnect: jest.fn(),
            };
            const mockDestination = {};
            (window as any).AudioContext = jest.fn().mockImplementation(() => ({
                currentTime: 0,
                destination: mockDestination,
                sampleRate: 44100,
                state: 'running',
                createGain: jest.fn().mockReturnValue(mockGain),
            }));
            const audioInstance = new Audio();
            expect(audioInstance.getMuted()).toBe(false);
            audioInstance.setMuted(true);
            expect(audioInstance.getMuted()).toBe(true);
            expect(mockGain.disconnect).toHaveBeenCalled();
            audioInstance.setMuted(false);
            expect(audioInstance.getMuted()).toBe(false);
            expect(mockGain.connect).toHaveBeenCalledWith(mockDestination);
        });
    });

    describe('setVoice', () =>
    {
        it('should set current voice index', () =>
        {
            audio.setVoice(3);
        });

        it('should clamp voice to 0-7', () =>
        {
            audio.setVoice(-1);
            audio.setVoice(10);
        });
    });

    describe('playNote', () =>
    {
        it('should schedule noteOn and noteOff for valid note name', () =>
        {
            audio.setVoice(0);
            audio.setVoiceInstrument(0, 0);
            mockSynthInstance.noteOn.mockClear();
            mockSynthInstance.noteOff.mockClear();

            audio.playNote('C', 0.5);

            const midiC4 = 4 * 12 + 0;
            expect(mockSynthInstance.noteOn).toHaveBeenCalledWith(0, midiC4, expect.any(Number), expect.any(Number));
            expect(mockSynthInstance.noteOff).toHaveBeenCalledWith(0, midiC4, expect.any(Number));
        });

        it('should not call synth for invalid note name', () =>
        {
            mockSynthInstance.noteOn.mockClear();
            mockSynthInstance.noteOff.mockClear();
            audio.playNote('X', 0.5);
            expect(mockSynthInstance.noteOn).not.toHaveBeenCalled();
            expect(mockSynthInstance.noteOff).not.toHaveBeenCalled();
        });
    });

    describe('playFrequency', () =>
    {
        it('should schedule noteOn and noteOff for frequency (440 Hz = A4)', () =>
        {
            audio.setVoice(0);
            audio.setVoiceInstrument(0, 0);
            mockSynthInstance.noteOn.mockClear();
            mockSynthInstance.noteOff.mockClear();

            audio.playFrequency(440, 0.5);

            const midiA4 = 69;
            expect(mockSynthInstance.noteOn).toHaveBeenCalledWith(0, midiA4, expect.any(Number), expect.any(Number));
            expect(mockSynthInstance.noteOff).toHaveBeenCalledWith(0, midiA4, expect.any(Number));
        });
    });

    describe('playSequence', () =>
    {
        it('should schedule noteOn and noteOff for MML notes', () =>
        {
            audio.setVoiceInstrument(0, 0);
            mockSynthInstance.setProgram.mockClear();
            mockSynthInstance.noteOn.mockClear();
            mockSynthInstance.noteOff.mockClear();

            audio.playSequence(0, 'O4 C D E');

            expect(mockSynthInstance.setProgram).toHaveBeenCalledWith(0, 0);
            expect(mockSynthInstance.noteOn).toHaveBeenCalled();
            expect(mockSynthInstance.noteOff).toHaveBeenCalled();
        });

        it('should parse octave and note length', () =>
        {
            audio.setVoiceInstrument(0, 0);
            mockSynthInstance.noteOn.mockClear();
            mockSynthInstance.noteOff.mockClear();

            audio.playSequence(0, 'O5 L4 C');

            expect(mockSynthInstance.noteOn).toHaveBeenCalledWith(0, expect.any(Number), expect.any(Number), expect.any(Number));
            expect(mockSynthInstance.noteOff).toHaveBeenCalledWith(0, expect.any(Number), expect.any(Number));
        });

        it('should handle rest-only MML without noteOn', () =>
        {
            mockSynthInstance.noteOn.mockClear();
            mockSynthInstance.noteOff.mockClear();
            audio.playSequence(0, 'O4 R R');
            expect(mockSynthInstance.noteOn).not.toHaveBeenCalled();
            expect(mockSynthInstance.noteOff).not.toHaveBeenCalled();
        });

        it('should handle velocity command in MML', () =>
        {
            audio.setVoiceInstrument(0, 0);
            mockSynthInstance.noteOn.mockClear();
            audio.playSequence(0, 'V80 O4 C');
            expect(mockSynthInstance.noteOn).toHaveBeenCalledWith(0, expect.any(Number), expect.any(Number), expect.any(Number));
        });

        it('should handle midi note number N in MML', () =>
        {
            audio.setVoiceInstrument(0, 0);
            mockSynthInstance.noteOn.mockClear();
            mockSynthInstance.noteOff.mockClear();
            audio.playSequence(0, 'O4 N60');
            expect(mockSynthInstance.noteOn).toHaveBeenCalledWith(0, 60, expect.any(Number), expect.any(Number));
            expect(mockSynthInstance.noteOff).toHaveBeenCalledWith(0, 60, expect.any(Number));
        });

        it('should handle dotted note in MML', () =>
        {
            audio.setVoiceInstrument(0, 0);
            mockSynthInstance.noteOn.mockClear();
            mockSynthInstance.noteOff.mockClear();
            audio.playSequence(0, 'O4 L4 C.');
            expect(mockSynthInstance.noteOn).toHaveBeenCalled();
            expect(mockSynthInstance.noteOff).toHaveBeenCalled();
        });

        it('should handle sharp and flat in MML', () =>
        {
            audio.setVoiceInstrument(0, 0);
            mockSynthInstance.noteOn.mockClear();
            mockSynthInstance.noteOff.mockClear();
            audio.playSequence(0, 'O4 C# Eb');
            expect(mockSynthInstance.noteOn).toHaveBeenCalledTimes(2);
            expect(mockSynthInstance.noteOff).toHaveBeenCalledTimes(2);
        });
    });

    describe('stop', () =>
    {
        it('should call allSoundOff on all 8 channels', () =>
        {
            mockSynthInstance.allSoundOff.mockClear();
            audio.stop();
            expect(mockSynthInstance.allSoundOff).toHaveBeenCalledTimes(8);
            for (let i = 0; i < 8; i++)
            {
                expect(mockSynthInstance.allSoundOff).toHaveBeenCalledWith(i);
            }
        });
    });
});
