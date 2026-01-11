# Audio System

This document describes the audio synthesis system using the Grit noise synthesis engine.

## Audio Class

**Location**: `src/lang/audio.ts`

Manages audio synthesis using Web Audio API and the Grit synthesis system.

## Grit Synthesis System

**Location**: `src/grit/`

Custom noise-based synthesis engine for generating sounds.

### Key Components

**Voice Management**:
- Multiple voices (channels) for polyphony
- Independent voice configurations
- Per-voice ADSR envelopes

**Noise Generation**:
- Linear Feedback Shift Register (LFSR) for noise
- Preset noise codes for different timbres
- Shape modulation for timbre variation

**ADSR Envelopes**:
- Attack, Decay, Sustain, Release
- Per-voice envelope configuration
- Preset envelopes (sustained, percussive, pad, pluck)

**Audio Worklet**:
- Real-time audio processing
- Runs in separate thread
- Low-latency synthesis

## Audio Features

### Tempo Control

**setTempo(bpm: number)**:
- Sets tempo in beats per minute
- Default: 120 BPM
- Affects note timing

### Volume Control

**setVolume(volume: number)**:
- Sets master volume (0-100)
- Applied to all voices
- Default: 100

### Voice Management

**setVoice(voiceIndex: number, preset: string)**:
- Sets voice preset
- Available presets: sawtooth, square, triangle, noise, etc.
- Each voice independent

**playNote(frequency: number, duration: number, velocity: number, voice?: number)**:
- Plays note at frequency
- Duration in beats
- Velocity (0-100) for dynamics
- Optional voice selection

## Integration

### With AudioService

**AudioService**:
- Maintains single `Audio` instance
- Provides audio to execution context
- Wraps Grit synthesis system

### With Statements

**PlayStatement**:
- Parses note strings (e.g., "C D E F G A B")
- Converts to frequencies
- Schedules notes for playback

**TempoStatement**:
- Sets tempo via `setTempo()`

**VoiceStatement**:
- Sets voice preset via `setVoice()`

**VolumeStatement**:
- Sets volume via `setVolume()`

## Audio Worklet

**Location**: `src/grit/worklet/grit-worklet-processor.ts`

Real-time audio processing in separate thread.

**Features**:
- Receives voice state messages
- Generates audio samples
- Applies ADSR envelopes
- Outputs to audio context

**Communication**:
- Messages via `port.postMessage()`
- Voice state updates
- Note scheduling

## Presets

**Location**: `src/grit/presets.ts`

Pre-configured voice presets:
- Sawtooth, square, triangle waves
- Noise-based sounds
- Custom timbres

**Preset System**:
- Noise code generation
- ADSR envelope selection
- Shape modulation parameters

## Future Enhancements

Potential additions:
- **Effects**: Reverb, delay, distortion
- **Filters**: Low-pass, high-pass, band-pass
- **Sequencing**: Pattern-based sequencing
- **MIDI**: MIDI input/output support
