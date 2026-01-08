/**
 * GRIT (Generative Random Iteration Tones) - Noise Synthesis System
 * 
 * A noise synthesis system that generates procedural audio through 
 * LFSR-based bitstream manipulation and pulse wave conversion.
 * 
 * GRIT represents the ultimate evolution of POKEY, taking the classic 
 * Atari POKEY chip's noise synthesis capabilities and extending them 
 * with modern flexibility and expressive power.
 */

// LFSR Polynomial types and configurations
export { LfsrPolynomial, LFSR_CONFIGS } from './lfsr-polynomial';
export type { LfsrConfig } from './lfsr-polynomial';

// Logical combination operations
export { CombOperation, applyCombOperation, combineOutputs } from './comb-operation';

// Shape modulation types
export { ShapeModulation, SHAPE_DESCRIPTIONS } from './shape-modulation';

// ADSR envelope
export {
    AdsrPhase,
    DEFAULT_ADSR_PERCUSSIVE,
    DEFAULT_ADSR_SUSTAINED,
    DEFAULT_ADSR_PAD,
    DEFAULT_ADSR_PLUCK,
    cloneAdsr,
    validateAdsr,
} from './adsr-envelope';
export type { AdsrEnvelope } from './adsr-envelope';

// NoiseCode bitfield
export {
    NOISE_CODE_BITS,
    decodeNoiseCode,
    encodeNoiseCode,
    createDefaultNoiseCode,
    setDecimation,
    setShape,
    setComb,
    formatNoiseCode,
    parseNoiseCode,
} from './noise-code';
export type { NoiseCodeFields } from './noise-code';

// Voice configuration
export {
    createDefaultVoice,
    createVoiceFromPreset,
    createVoiceState,
    resetVoiceState,
    cloneVoice,
} from './voice';
export type { GritVoice, VoiceState } from './voice';

// Presets
export {
    PRESET_CATEGORIES,
    PRESETS,
    PRESET_INFO,
    getPresetInfo,
    getPresetNoiseCode,
    getPresetsInCategory,
    searchPresets,
} from './presets';
export type { PresetInfo } from './presets';
