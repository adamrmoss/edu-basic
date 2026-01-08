import {
    createDefaultVoice,
    createVoiceFromPreset,
    createVoiceState,
    resetVoiceState,
    cloneVoice,
    GritVoice,
    VoiceState,
} from '../../src/grit/voice';
import { DEFAULT_ADSR_SUSTAINED, DEFAULT_ADSR_PERCUSSIVE } from '../../src/grit/adsr-envelope';

describe('Voice', () =>
{
    describe('createDefaultVoice', () =>
    {
        it('should create a voice with default settings', () =>
        {
            const voice = createDefaultVoice();

            expect(voice.noiseCode).toBe(0x00000010);
            expect(voice.frequency).toBe(440.0);
            expect(voice.adsr.attack).toBe(DEFAULT_ADSR_SUSTAINED.attack);
            expect(voice.adsr.decay).toBe(DEFAULT_ADSR_SUSTAINED.decay);
            expect(voice.adsr.sustain).toBe(DEFAULT_ADSR_SUSTAINED.sustain);
            expect(voice.adsr.release).toBe(DEFAULT_ADSR_SUSTAINED.release);
        });
    });

    describe('createVoiceFromPreset', () =>
    {
        it('should create a voice with specified NoiseCode', () =>
        {
            const voice = createVoiceFromPreset(0x38003010);

            expect(voice.noiseCode).toBe(0x38003010);
        });

        it('should use default frequency of 440 Hz', () =>
        {
            const voice = createVoiceFromPreset(0x00000010);

            expect(voice.frequency).toBe(440.0);
        });

        it('should allow custom frequency', () =>
        {
            const voice = createVoiceFromPreset(0x00000010, 880.0);

            expect(voice.frequency).toBe(880.0);
        });

        it('should use default ADSR when not specified', () =>
        {
            const voice = createVoiceFromPreset(0x00000010);

            expect(voice.adsr).toEqual(DEFAULT_ADSR_SUSTAINED);
        });

        it('should use custom ADSR when specified', () =>
        {
            const voice = createVoiceFromPreset(0x00000010, 440.0, DEFAULT_ADSR_PERCUSSIVE);

            expect(voice.adsr).toEqual(DEFAULT_ADSR_PERCUSSIVE);
        });
    });

    describe('createVoiceState', () =>
    {
        it('should create initial state with default seed', () =>
        {
            const state = createVoiceState();

            expect(state.lfsrAState).toBe(1);
            expect(state.lfsrBState).toBe(1);
            expect(state.lfsrCState).toBe(1);
        });

        it('should create initial state with custom seed', () =>
        {
            const state = createVoiceState(42);

            expect(state.lfsrAState).toBe(42);
            expect(state.lfsrBState).toBe(42);
            expect(state.lfsrCState).toBe(42);
        });

        it('should initialize previous bits to false', () =>
        {
            const state = createVoiceState();

            expect(state.lfsrAPrevBit).toBe(false);
            expect(state.lfsrBPrevBit).toBe(false);
        });

        it('should initialize counters to zero', () =>
        {
            const state = createVoiceState();

            expect(state.decimationCounter).toBe(0);
            expect(state.shapePhase).toBe(0);
            expect(state.envelopeTime).toBe(0);
            expect(state.envelopeAmplitude).toBe(0);
        });

        it('should initialize envelope to idle', () =>
        {
            const state = createVoiceState();

            expect(state.envelopePhase).toBe('idle');
            expect(state.gateOn).toBe(false);
        });
    });

    describe('resetVoiceState', () =>
    {
        it('should reset all state to initial values', () =>
        {
            const state: VoiceState = {
                lfsrAState: 12345,
                lfsrBState: 67890,
                lfsrCState: 11111,
                lfsrAPrevBit: true,
                lfsrBPrevBit: true,
                decimationCounter: 100,
                shapePhase: 0.75,
                envelopePhase: 'sustain',
                envelopeTime: 5.0,
                envelopeAmplitude: 0.8,
                gateOn: true,
            };

            resetVoiceState(state);

            expect(state.lfsrAState).toBe(1);
            expect(state.lfsrBState).toBe(1);
            expect(state.lfsrCState).toBe(1);
            expect(state.lfsrAPrevBit).toBe(false);
            expect(state.lfsrBPrevBit).toBe(false);
            expect(state.decimationCounter).toBe(0);
            expect(state.shapePhase).toBe(0);
            expect(state.envelopePhase).toBe('idle');
            expect(state.envelopeTime).toBe(0);
            expect(state.envelopeAmplitude).toBe(0);
            expect(state.gateOn).toBe(false);
        });

        it('should reset with custom seed', () =>
        {
            const state = createVoiceState();
            resetVoiceState(state, 999);

            expect(state.lfsrAState).toBe(999);
            expect(state.lfsrBState).toBe(999);
            expect(state.lfsrCState).toBe(999);
        });
    });

    describe('cloneVoice', () =>
    {
        it('should create an independent copy', () =>
        {
            const original: GritVoice = {
                noiseCode: 0x38003010,
                frequency: 880.0,
                adsr: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.3 },
            };

            const cloned = cloneVoice(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original);
            expect(cloned.adsr).not.toBe(original.adsr);
        });

        it('should copy all properties', () =>
        {
            const original = createDefaultVoice();
            const cloned = cloneVoice(original);

            expect(cloned.noiseCode).toBe(original.noiseCode);
            expect(cloned.frequency).toBe(original.frequency);
            expect(cloned.adsr.attack).toBe(original.adsr.attack);
            expect(cloned.adsr.decay).toBe(original.adsr.decay);
            expect(cloned.adsr.sustain).toBe(original.adsr.sustain);
            expect(cloned.adsr.release).toBe(original.adsr.release);
        });

        it('should not affect original when clone is modified', () =>
        {
            const original = createDefaultVoice();
            const cloned = cloneVoice(original);

            cloned.frequency = 880.0;
            cloned.adsr.attack = 1.0;

            expect(original.frequency).toBe(440.0);
            expect(original.adsr.attack).toBe(DEFAULT_ADSR_SUSTAINED.attack);
        });
    });
});

