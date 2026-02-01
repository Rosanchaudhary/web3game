"use client";

import { useRef, useState, useEffect } from "react";

type Key = {
  note: string;
  freq: number;
  isBlack: boolean;
};

type RecordedNote = {
  freq: number;
  time: number;
};

const NOTE_ORDER = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const BLACK_NOTES = new Set(["C#", "D#", "F#", "G#", "A#"]);

// Generate 88 keys (A0 → C8)
function generateKeys(): Key[] {
  const keys: Key[] = [];

  // Piano starts at A0 (MIDI note 21) and ends at C8 (108)
  for (let midi = 21; midi <= 108; midi++) {
    const noteIndex = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const note = NOTE_ORDER[noteIndex];
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    keys.push({
      note: `${note}${octave}`,
      freq,
      isBlack: BLACK_NOTES.has(note),
    });
  }

  return keys;
}

const KEYS = generateKeys();

export default function EnhancedPianoPage() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [waveType, setWaveType] = useState<OscillatorType>("sine");
  const [volume, setVolume] = useState(0.8);
  const [sustainActive, setSustainActive] = useState(false);
  const [reverbActive, setReverbActive] = useState(false);

  // Recording state
  const [recording, setRecording] = useState<RecordedNote[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordStartRef = useRef<number>(0);

  // Reverb convolver
  const convolverRef = useRef<ConvolverNode | null>(null);

  // Initialize reverb
  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext
      )();
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Create reverb impulse response
    const convolver = ctx.createConvolver();
    const reverbTime = 2;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * reverbTime;
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    convolver.buffer = impulse;
    convolverRef.current = convolver;
  }, []);

  // Keyboard mapping (home row and top row)
  const keyboardMap: Record<string, number> = {
    // Home row (white keys starting from C4)
    a: 39,
    s: 41,
    d: 43,
    f: 44,
    g: 46,
    h: 48,
    j: 50,
    k: 51,
    l: 53,
    // Top row (black keys)
    w: 40,
    e: 42,
    t: 45,
    y: 47,
    u: 49,
  };

  const playNote = (frequency: number, keyIndex?: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext
      )();
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Record note if recording
    if (isRecording) {
      setRecording((prev) => [
        ...prev,
        {
          freq: frequency,
          time: Date.now() - recordStartRef.current,
        },
      ]);
    }

    // Visual feedback
    if (keyIndex !== undefined) {
      setActiveKeys((prev) => new Set(prev).add(keyIndex));
      const releaseTime = sustainActive ? 3000 : 1000;
      setTimeout(() => {
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(keyIndex);
          return next;
        });
      }, releaseTime);
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = waveType;
    oscillator.frequency.value = frequency;

    const now = ctx.currentTime;
    const releaseTime = sustainActive ? now + 3 : now + 1;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseTime);

    oscillator.connect(gainNode);

    // Apply reverb if active
    if (reverbActive && convolverRef.current) {
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();

      dryGain.gain.value = 0.7;
      wetGain.gain.value = 0.3;

      gainNode.connect(dryGain);
      gainNode.connect(wetGain);

      dryGain.connect(ctx.destination);
      wetGain.connect(convolverRef.current);
      convolverRef.current.connect(ctx.destination);
    } else {
      gainNode.connect(ctx.destination);
    }

    oscillator.start(now);
    oscillator.stop(releaseTime);

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  };

  const startRecording = () => {
    setRecording([]);
    recordStartRef.current = Date.now();
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const playback = () => {
    if (recording.length === 0 || isPlaying) return;

    setIsPlaying(true);
    recording.forEach(({ freq, time }) => {
      setTimeout(() => playNote(freq), time);
    });

    // Reset playing state after playback
    const maxTime = Math.max(...recording.map((r) => r.time));
    setTimeout(() => setIsPlaying(false), maxTime + 2000);
  };

  const clearRecording = () => {
    setRecording([]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyIndex = keyboardMap[e.key.toLowerCase()];
      if (keyIndex !== undefined && !e.repeat) {
        playNote(KEYS[keyIndex].freq, keyIndex);
      }
      // Space bar for sustain
      if (e.code === "Space" && !e.repeat) {
        setSustainActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [waveType, volume, sustainActive, reverbActive, isRecording]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col items-center justify-center overflow-x-auto p-4">
      <div className="max-w-7xl w-full">
        <h1 className="text-white text-3xl font-bold mb-8 text-center">
          Enhanced 88-Key Piano
        </h1>

        {/* Controls Panel */}
        <div className="bg-neutral-800 rounded-lg p-6 mb-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Instrument Selection */}
            <div>
              <label className="block text-neutral-300 text-sm font-medium mb-2">
                Instrument
              </label>
              <select
                value={waveType}
                onChange={(e) => setWaveType(e.target.value as OscillatorType)}
                className="w-full bg-neutral-700 text-white p-3 rounded-lg border border-neutral-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="sine">Piano (Sine)</option>
                <option value="square">Organ (Square)</option>
                <option value="sawtooth">Strings (Sawtooth)</option>
                <option value="triangle">Flute (Triangle)</option>
              </select>
            </div>

            {/* Volume Control */}
            <div>
              <label className="block text-neutral-300 text-sm font-medium mb-2">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-3 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Effects */}
            <div className="flex gap-3">
              <button
                onClick={() => setSustainActive(!sustainActive)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  sustainActive
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                }`}
              >
                Sustain {sustainActive ? "ON" : "OFF"}
              </button>
              <button
                onClick={() => setReverbActive(!reverbActive)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  reverbActive
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                    : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                }`}
              >
                Reverb {reverbActive ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="mt-6 pt-6 border-t border-neutral-700">
            <h3 className="text-white text-lg font-semibold mb-3">Recording</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isPlaying}
                className={`px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isRecording ? "⏺ Stop Recording" : "⏺ Start Recording"}
              </button>

              <button
                onClick={playback}
                disabled={recording.length === 0 || isPlaying}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                {isPlaying ? "▶ Playing..." : "▶ Playback"}
              </button>

              <button
                onClick={clearRecording}
                disabled={recording.length === 0 || isRecording || isPlaying}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                🗑 Clear
              </button>

              <div className="flex items-center text-neutral-400 ml-auto">
                <span className="text-sm">
                  {recording.length > 0
                    ? `${recording.length} notes recorded`
                    : "No recording"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Piano Keys */}
        <div className="bg-neutral-800 rounded-lg p-6 shadow-2xl overflow-x-auto">
          <div className="relative flex min-w-max">
            {/* White Keys */}
            <div className="flex">
              {KEYS.filter((k) => !k.isBlack).map((key, i) => {
                const originalIndex = KEYS.indexOf(key);
                const isActive = activeKeys.has(originalIndex);

                return (
                  <button
                    key={i}
                    onPointerDown={() => playNote(key.freq, originalIndex)}
                    style={{ touchAction: "none" }}
                    className={`w-12 h-64 border border-neutral-400 relative transition-all duration-75 ${
                      isActive
                        ? "bg-blue-300 scale-95 shadow-inner"
                        : "bg-white hover:bg-neutral-50 active:bg-neutral-200"
                    }`}
                  >
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-neutral-600 font-medium">
                      {key.note}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Black Keys */}
            <div className="absolute left-0 top-0 flex pointer-events-none">
              {KEYS.map((key, i) => {
                if (!key.isBlack) return null;

                const whiteIndex = KEYS.slice(0, i).filter(
                  (k) => !k.isBlack,
                ).length;
                const isActive = activeKeys.has(i);

                return (
                  <button
                    key={i}
                    onPointerDown={() => playNote(key.freq, i)}
                    style={{
                      left: `${whiteIndex * 48 - 16}px`,
                      touchAction: "none",
                    }}
                    className={`absolute w-8 h-40 rounded-b-md pointer-events-auto transition-all duration-75 shadow-lg ${
                      isActive
                        ? "bg-blue-600 scale-95"
                        : "bg-black hover:bg-neutral-800 active:bg-neutral-700"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-neutral-400 text-sm mb-2">
            🖱️ Click or tap keys to play | ⌨️ Use keyboard: A-L for white keys,
            W-U for black keys
          </p>
          <p className="text-neutral-500 text-xs">
            Press Space for sustain toggle
          </p>
        </div>
      </div>
    </div>
  );
}
