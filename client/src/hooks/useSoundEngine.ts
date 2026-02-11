/**
 * useSoundEngine — Retro 8-bit sound effects using Web Audio API
 * Generates all sounds procedurally — no audio files needed
 * Respects GameSettings for volume and enabled state
 */
import { useCallback, useRef, useEffect } from "react";
import { useGameSettings } from "@/contexts/GameSettingsContext";

type SoundType =
  | "eat"        // snake eats apple, collect item
  | "score"      // score point
  | "jump"       // dino jump, flappy flap
  | "shoot"      // space invaders shoot
  | "hit"        // enemy hit, collision
  | "gameOver"   // game over
  | "levelUp"    // level up, new wave
  | "move"       // piece move (tetris)
  | "rotate"     // piece rotate (tetris)
  | "lineClear"  // tetris line clear
  | "bounce"     // pong ball bounce
  | "win"        // pong win point
  | "click"      // UI click
  | "start";     // game start

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = "square",
  fadeOut = true
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  }
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playFrequencySweep(
  ctx: AudioContext,
  startFreq: number,
  endFreq: number,
  duration: number,
  volume: number,
  type: OscillatorType = "square"
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(ctx: AudioContext, duration: number, volume: number) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
}

const soundGenerators: Record<SoundType, (ctx: AudioContext, vol: number) => void> = {
  eat: (ctx, vol) => {
    playTone(ctx, 587, 0.06, vol, "square");
    setTimeout(() => playTone(ctx, 784, 0.08, vol, "square"), 60);
    setTimeout(() => playTone(ctx, 1047, 0.1, vol, "square"), 130);
  },
  score: (ctx, vol) => {
    playTone(ctx, 523, 0.08, vol, "square");
    setTimeout(() => playTone(ctx, 659, 0.08, vol, "square"), 80);
    setTimeout(() => playTone(ctx, 784, 0.12, vol, "square"), 160);
  },
  jump: (ctx, vol) => {
    playFrequencySweep(ctx, 300, 600, 0.15, vol, "square");
  },
  shoot: (ctx, vol) => {
    playFrequencySweep(ctx, 800, 200, 0.1, vol, "square");
  },
  hit: (ctx, vol) => {
    playFrequencySweep(ctx, 400, 100, 0.15, vol, "sawtooth");
    playNoise(ctx, 0.1, vol);
  },
  gameOver: (ctx, vol) => {
    const notes = [440, 415, 392, 349, 330, 294, 262];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(ctx, freq, 0.2, vol * 0.8, "square"), i * 120);
    });
  },
  levelUp: (ctx, vol) => {
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(ctx, freq, 0.08, vol, "square"), i * 60);
    });
  },
  move: (ctx, vol) => {
    playTone(ctx, 200, 0.04, vol * 0.4, "square");
  },
  rotate: (ctx, vol) => {
    playTone(ctx, 400, 0.05, vol * 0.6, "square");
    setTimeout(() => playTone(ctx, 500, 0.05, vol * 0.6, "square"), 40);
  },
  lineClear: (ctx, vol) => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(ctx, freq, 0.1, vol, "square"), i * 70);
    });
  },
  bounce: (ctx, vol) => {
    playTone(ctx, 440, 0.05, vol * 0.6, "square");
  },
  win: (ctx, vol) => {
    playTone(ctx, 523, 0.1, vol, "square");
    setTimeout(() => playTone(ctx, 659, 0.1, vol, "square"), 100);
    setTimeout(() => playTone(ctx, 784, 0.15, vol, "square"), 200);
  },
  click: (ctx, vol) => {
    playTone(ctx, 600, 0.03, vol * 0.4, "square");
  },
  start: (ctx, vol) => {
    const notes = [262, 330, 392, 523];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(ctx, freq, 0.1, vol * 0.8, "square"), i * 80);
    });
  },
};

// Background music engine using Web Audio API
let musicOsc1: OscillatorNode | null = null;
let musicOsc2: OscillatorNode | null = null;
let musicGain: GainNode | null = null;
let musicInterval: ReturnType<typeof setInterval> | null = null;

function startBackgroundMusic(ctx: AudioContext, volume: number) {
  stopBackgroundMusic();

  musicGain = ctx.createGain();
  musicGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
  musicGain.connect(ctx.destination);

  // Simple repeating arpeggio pattern
  const bassNotes = [131, 165, 147, 175]; // C3, E3, D3, F3
  const melodyNotes = [
    [523, 659, 784, 659],  // C5, E5, G5, E5
    [587, 740, 880, 740],  // D5, F#5, A5, F#5
    [523, 659, 784, 659],
    [494, 622, 740, 622],  // B4, Eb5, F#5, Eb5
  ];

  let beatIndex = 0;
  let barIndex = 0;

  musicInterval = setInterval(() => {
    if (!musicGain || ctx.state === "closed") {
      stopBackgroundMusic();
      return;
    }

    const bassFreq = bassNotes[barIndex % bassNotes.length];
    const melodyFreq = melodyNotes[barIndex % melodyNotes.length][beatIndex % 4];

    // Bass
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "triangle";
    bassOsc.frequency.setValueAtTime(bassFreq, ctx.currentTime);
    bassGain.gain.setValueAtTime(volume * 0.08, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(ctx.currentTime);
    bassOsc.stop(ctx.currentTime + 0.2);

    // Melody
    const melOsc = ctx.createOscillator();
    const melGain = ctx.createGain();
    melOsc.type = "square";
    melOsc.frequency.setValueAtTime(melodyFreq, ctx.currentTime);
    melGain.gain.setValueAtTime(volume * 0.04, ctx.currentTime);
    melGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    melOsc.connect(melGain);
    melGain.connect(ctx.destination);
    melOsc.start(ctx.currentTime);
    melOsc.stop(ctx.currentTime + 0.15);

    beatIndex++;
    if (beatIndex % 4 === 0) barIndex++;
  }, 200);
}

function stopBackgroundMusic() {
  if (musicOsc1) { try { musicOsc1.stop(); } catch { /* */ } musicOsc1 = null; }
  if (musicOsc2) { try { musicOsc2.stop(); } catch { /* */ } musicOsc2 = null; }
  if (musicGain) { musicGain.disconnect(); musicGain = null; }
  if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
}

export function useSoundEngine() {
  const { soundEnabled, soundVolume, musicEnabled, musicVolume } = useGameSettings();
  const musicPlayingRef = useRef(false);

  const playSound = useCallback(
    (sound: SoundType) => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        const vol = soundVolume / 100;
        soundGenerators[sound](ctx, vol);
      } catch {
        // Audio not available
      }
    },
    [soundEnabled, soundVolume]
  );

  const startMusic = useCallback(() => {
    if (!musicEnabled) return;
    try {
      const ctx = getAudioContext();
      const vol = musicVolume / 100;
      startBackgroundMusic(ctx, vol);
      musicPlayingRef.current = true;
    } catch {
      // Audio not available
    }
  }, [musicEnabled, musicVolume]);

  const stopMusic = useCallback(() => {
    stopBackgroundMusic();
    musicPlayingRef.current = false;
  }, []);

  // Stop music on unmount
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  // Update music when settings change
  useEffect(() => {
    if (musicPlayingRef.current) {
      if (!musicEnabled) {
        stopBackgroundMusic();
      } else {
        try {
          const ctx = getAudioContext();
          const vol = musicVolume / 100;
          stopBackgroundMusic();
          startBackgroundMusic(ctx, vol);
        } catch { /* */ }
      }
    }
  }, [musicEnabled, musicVolume]);

  return { playSound, startMusic, stopMusic };
}

export type { SoundType };
