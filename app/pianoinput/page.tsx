"use client";
import { useState, useRef } from "react";
import * as Tone from "tone";

export default function MusicPlayer() {
  const [musicText, setMusicText] = useState(`tempo:100
loop:true
notes:
[C4,E4,G4]:1, rest:1/2,
C2:1/2, D2:1/2,
A3:1, [F4,A4,C5]:2`);

  const synthRef = useRef(null);
  const kickRef = useRef(null);
  const snareRef = useRef(null);

  const parseDuration = (value) => {
    if (!value) return 1; // default 1 beat

    const v = value.trim();

    if (v.includes("/")) {
      const [a, b] = v.split("/").map(Number);
      if (!b) return 1;
      return a / b;
    }

    const n = parseFloat(v);
    return isNaN(n) ? 1 : n;
  };

  const playMusic = async () => {
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();

    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      kickRef.current = new Tone.MembraneSynth().toDestination();
      snareRef.current = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
      }).toDestination();
    }

    const lines = musicText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const tempo =
      parseInt(lines.find((l) => l.startsWith("tempo"))?.split(":")[1]) || 120;

    const loop =
      lines.find((l) => l.startsWith("loop"))?.split(":")[1] === "true";

    Tone.Transport.bpm.value = tempo;
    Tone.Transport.loop = loop;

    const notesText = lines
      .filter(
        (l) =>
          !l.startsWith("tempo") &&
          !l.startsWith("loop") &&
          !l.startsWith("notes"),
      )
      .join("");
    const events = notesText
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    let time = 0;

    events.forEach((e) => {
      const parts = e.split(":");
      const rawNote = parts[0]?.trim();
      const rawDur = parts[1]?.trim();

      if (!rawNote) return;

      const duration = parseDuration(rawDur);

      Tone.Transport.schedule((t) => {
        if (rawNote === "rest") return;

        if (rawNote.startsWith("[")) {
          const chord = rawNote.replace("[", "").replace("]", "").split(",");
          synthRef.current.triggerAttackRelease(chord, duration, t);
        } else if (rawNote === "C2") {
          kickRef.current.triggerAttackRelease("C1", "8n", t);
        } else if (rawNote === "D2") {
          snareRef.current.triggerAttackRelease("16n", t);
        } else {
          synthRef.current.triggerAttackRelease(rawNote, duration, t);
        }
      }, time);

      time += duration;
    });

    Tone.Transport.loopEnd = time;
    Tone.Transport.start();
  };

  const pauseMusic = () => Tone.Transport.pause();
  const stopMusic = () => Tone.Transport.stop();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Text Music Sequencer 🎶</h1>

      <textarea
        className="w-full h-48 p-2 border rounded"
        value={musicText}
        onChange={(e) => setMusicText(e.target.value)}
      />

      <div className="space-x-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={playMusic}
        >
          ▶ Play
        </button>

        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded"
          onClick={pauseMusic}
        >
          ⏸ Pause
        </button>

        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={stopMusic}
        >
          ⏹ Stop
        </button>
      </div>
    </div>
  );
}
