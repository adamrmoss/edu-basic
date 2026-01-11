# Grit Audio Synthesis System

This document describes the Grit noise synthesis engine for audio generation.

## Overview

Grit is a custom noise-based synthesis engine that generates sounds using Linear Feedback Shift Registers (LFSR) and ADSR envelopes. It runs in a Web Audio API AudioWorklet for real-time, low-latency audio processing.

## Key Components

### Voice Management

**Location**: `src/grit/voice.ts`

Manages individual voice channels for polyphonic synthesis.

**Features**:
- Multiple independent voices
- Per-voice ADSR envelope configuration
- Voice state management
- Note scheduling

### ADSR Envelopes

**Location**: `src/grit/adsr-envelope.ts`

Attack-Decay-Sustain-Release envelope system for shaping sounds.

**Preset Envelopes**:
- `DEFAULT_ADSR_SUSTAINED` - Long attack, sustained
- `DEFAULT_ADSR_PERCUSSIVE` - Quick attack, short release
- `DEFAULT_ADSR_PAD` - Slow attack, long sustain
- `DEFAULT_ADSR_PLUCK` - Instant attack, quick decay

**Envelope Stages**:
- **Attack**: Time to reach peak amplitude
- **Decay**: Time to reach sustain level
- **Sustain**: Sustained amplitude level
- **Release**: Time to fade to zero

### Noise Generation

**Location**: `src/grit/noise-code.ts`

LFSR-based noise generation for creating different timbres.

**Features**:
- Linear Feedback Shift Register implementation
- Polynomial-based noise codes
- Different noise patterns for different sounds

### Presets

**Location**: `src/grit/presets.ts`

Pre-configured voice presets for common sounds.

**Available Presets**:
- Sawtooth wave
- Square wave
- Triangle wave
- Noise-based sounds
- Custom timbres

**Preset System**:
- Noise code generation
- ADSR envelope selection
- Shape modulation parameters

### Shape Modulation

**Location**: `src/grit/shape-modulation.ts`

Modulates waveform shape for timbre variation.

### Comb Operation

**Location**: `src/grit/comb-operation.ts`

Comb filter for creating metallic or resonant sounds.

### LFSR Polynomial

**Location**: `src/grit/lfsr-polynomial.ts`

Polynomial calculations for LFSR noise generation.

## Audio Worklet

**Location**: `src/grit/worklet/grit-worklet-processor.ts`

Real-time audio processing in separate thread.

**Features**:
- Receives voice state messages
- Generates audio samples in real-time
- Applies ADSR envelopes
- Outputs to audio context

**Communication**:
- Messages via `port.postMessage()`
- Voice state updates
- Note scheduling

**Processing**:
- Runs at audio sample rate (typically 44.1kHz or 48kHz)
- Low-latency synthesis
- Per-sample processing

## Integration

### With Audio Class

**Location**: `src/lang/audio.ts`

The `Audio` class wraps the Grit system:
- Manages voice configurations
- Schedules notes
- Controls tempo and volume
- Interfaces with AudioWorklet

### With Statements

**PlayStatement**:
- Parses note strings (e.g., "C D E F G A B")
- Converts to frequencies
- Schedules notes via `Audio.playNote()`

**TempoStatement**:
- Sets tempo via `Audio.setTempo()`

**VoiceStatement**:
- Sets voice preset via `Audio.setVoice()`

**VolumeStatement**:
- Sets volume via `Audio.setVolume()`

## Synthesis Process

### Note Playback Flow

```
PlayStatement.execute()
    ↓
Audio.playNote(frequency, duration, velocity, voice)
    ↓
Schedule note in voice
    ↓
AudioWorklet receives message
    ↓
Generate samples with ADSR envelope
    ↓
Output to audio context
```

### Sample Generation

1. Calculate current time in note
2. Determine ADSR envelope stage
3. Calculate envelope amplitude
4. Generate noise sample from LFSR
5. Apply shape modulation
6. Apply envelope amplitude
7. Output sample

## Configuration

### Voice Configuration

```typescript
interface VoiceConfig {
    noiseCode: number;
    adsr: AdsrEnvelope;
}
```

### Scheduled Note

```typescript
interface ScheduledNote {
    frequency: number;
    startTime: number;
    duration: number;
    velocity: number;
}
```

## Performance Considerations

**Real-Time Processing**:
- AudioWorklet runs in separate thread
- Must complete processing within buffer time
- No blocking operations allowed

**Polyphony**:
- Multiple voices can play simultaneously
- Each voice processes independently
- CPU usage scales with active voices

## Future Enhancements

Potential additions:
- **Effects**: Reverb, delay, distortion
- **Filters**: Low-pass, high-pass, band-pass
- **Sequencing**: Pattern-based sequencing
- **MIDI**: MIDI input/output support
- **More Presets**: Additional voice configurations
