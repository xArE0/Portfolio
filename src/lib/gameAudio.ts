import { useCallback, useEffect, useRef } from 'react';
import { getAudioContext } from './sound';
import { useSystem } from '../system';

export type Sfx =
  | 'click' | 'start' | 'move' | 'turn' | 'eat' | 'pop' | 'sweep' | 'flag' | 'flip' | 'match' | 'miss'
  | 'merge' | 'explode' | 'win' | 'lose' | 'key' | 'typo' | 'whack' | 'bad' | 'tick' | 'go'
  | 'flap' | 'score' | 'paddle' | 'wall' | 'brick' | 'levelup' | 'rotate' | 'drop' | 'lines' | 'pad';

let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function output(ac: AudioContext) {
  if (!master || master.context !== ac) {
    master = ac.createGain();
    master.gain.value = 0.7;
    master.connect(ac.destination);
    noiseBuffer = null;
  }
  return master;
}

function getNoise(ac: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function tone(ac: AudioContext, freq: number, start: number, length: number, peak: number, type: OscillatorType = 'square', endFreq?: number, dest?: AudioNode) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + length);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.01, length / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(dest ?? output(ac));
  osc.start(start);
  osc.stop(start + length + 0.02);
}

function burst(ac: AudioContext, start: number, length: number, peak: number, filter: BiquadFilterType, freq: number, endFreq?: number, dest?: AudioNode) {
  const src = ac.createBufferSource();
  const biquad = ac.createBiquadFilter();
  const gain = ac.createGain();
  src.buffer = getNoise(ac);
  biquad.type = filter;
  biquad.frequency.setValueAtTime(freq, start);
  if (endFreq) biquad.frequency.exponentialRampToValueAtTime(endFreq, start + length);
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  src.connect(biquad).connect(gain).connect(dest ?? output(ac));
  src.start(start, Math.random() * 0.5);
  src.stop(start + length + 0.02);
}

const arp = (ac: AudioContext, freqs: number[], start: number, gap: number, length: number, peak: number, type: OscillatorType = 'square') =>
  freqs.forEach((f, i) => tone(ac, f, start + i * gap, length, peak, type));

/** Simon pad pitches, also used for other "indexed" sounds. */
export const PAD_NOTES = [329.63, 277.18, 220, 164.81];

/** `value` lets callers vary pitch: merge tile value, brick row, lines cleared, pad index. */
export function playSfx(name: Sfx, value = 0) {
  try {
    const ac = getAudioContext();
    if (!ac) return;
    const t = ac.currentTime;
    switch (name) {
      case 'click': tone(ac, 880, t, 0.04, 0.05); break;
      case 'start': arp(ac, [523.25, 659.25, 783.99, 1046.5], t, 0.07, 0.12, 0.07); break;
      case 'move': tone(ac, 196, t, 0.06, 0.06, 'triangle', 150); break;
      case 'turn': tone(ac, 620, t, 0.03, 0.03, 'triangle'); break;
      case 'eat':
        tone(ac, 660, t, 0.06, 0.08);
        tone(ac, 990, t + 0.05, 0.08, 0.08);
        break;
      case 'pop': tone(ac, 380, t, 0.07, 0.1, 'sine', 900); break;
      case 'sweep':
        tone(ac, 300, t, 0.25, 0.08, 'sine', 1400);
        burst(ac, t, 0.2, 0.08, 'highpass', 3000);
        break;
      case 'flag': tone(ac, 1200, t, 0.05, 0.06, 'triangle', 800); break;
      case 'flip':
        burst(ac, t, 0.06, 0.12, 'bandpass', 2500);
        tone(ac, 700, t, 0.05, 0.03, 'sine');
        break;
      case 'match': arp(ac, [659.25, 880, 1318.5], t, 0.06, 0.15, 0.07, 'triangle'); break;
      case 'miss': tone(ac, 300, t, 0.2, 0.06, 'sawtooth', 180); break;
      case 'merge': {
        const step = Math.log2(Math.max(2, value));
        tone(ac, 220 * Math.pow(2, step / 6), t, 0.1, 0.07, 'triangle', 330 * Math.pow(2, step / 6));
        break;
      }
      case 'explode':
        burst(ac, t, 0.8, 0.5, 'lowpass', 1800, 80);
        tone(ac, 120, t, 0.6, 0.3, 'sine', 30);
        break;
      case 'win':
        arp(ac, [523.25, 659.25, 783.99, 1046.5], t, 0.1, 0.25, 0.08);
        arp(ac, [261.63, 329.63, 392, 523.25], t, 0.1, 0.25, 0.05, 'triangle');
        tone(ac, 1318.5, t + 0.45, 0.6, 0.07, 'triangle');
        break;
      case 'lose': arp(ac, [392, 329.63, 261.63, 196], t, 0.14, 0.22, 0.07); break;
      case 'key': burst(ac, t, 0.025, 0.12, 'highpass', 4000 + Math.random() * 2000); break;
      case 'typo': tone(ac, 110, t, 0.08, 0.08, 'square'); break;
      case 'whack':
        burst(ac, t, 0.12, 0.3, 'lowpass', 2500, 400);
        tone(ac, 220, t, 0.12, 0.2, 'sine', 60);
        break;
      case 'bad':
        tone(ac, 150, t, 0.3, 0.07, 'sawtooth');
        tone(ac, 155, t, 0.3, 0.07, 'sawtooth');
        break;
      case 'tick': tone(ac, 1400, t, 0.03, 0.05, 'sine'); break;
      case 'go': tone(ac, 1320, t, 0.25, 0.08, 'square'); break;
      case 'flap':
        tone(ac, 320, t, 0.09, 0.07, 'triangle', 640);
        burst(ac, t, 0.05, 0.05, 'bandpass', 1200);
        break;
      case 'score':
        tone(ac, 1046.5, t, 0.07, 0.06);
        tone(ac, 1568, t + 0.06, 0.12, 0.06);
        break;
      case 'paddle': tone(ac, 440, t, 0.06, 0.08, 'square'); break;
      case 'wall': tone(ac, 330, t, 0.04, 0.05, 'square'); break;
      case 'brick': tone(ac, 523.25 * Math.pow(2, (5 - value) / 12 * 2), t, 0.08, 0.07, 'square'); break;
      case 'levelup': arp(ac, [392, 523.25, 659.25, 783.99, 1046.5, 1318.5], t, 0.06, 0.12, 0.07); break;
      case 'rotate': tone(ac, 520, t, 0.04, 0.05, 'triangle', 700); break;
      case 'drop':
        burst(ac, t, 0.12, 0.25, 'lowpass', 900, 200);
        tone(ac, 140, t, 0.1, 0.12, 'sine', 70);
        break;
      case 'lines': {
        const n = Math.max(1, value);
        burst(ac, t, 0.3, 0.1, 'highpass', 1500, 6000);
        arp(ac, [523.25, 659.25, 783.99, 1046.5, 1318.5].slice(0, n + 1), t + 0.05, 0.06, 0.15, 0.07);
        break;
      }
      case 'pad': tone(ac, PAD_NOTES[value % PAD_NOTES.length], t, 0.35, 0.12, 'triangle'); break;
    }
  } catch {
    /* audio blocked */
  }
}

/** Returns a stable sfx player that respects the system sound toggle. */
export function useSfx() {
  const { soundEnabled } = useSystem();
  const enabled = useRef(soundEnabled);
  useEffect(() => {
    enabled.current = soundEnabled;
  }, [soundEnabled]);
  return useCallback((name: Sfx, value?: number) => {
    if (enabled.current) playSfx(name, value);
  }, []);
}

// ---------------------------------------------------------------- music

export type TrackId = 'neon' | 'puzzle' | 'korobeiniki' | 'tense';

interface Track {
  bpm: number;
  lead: string;
  bass: string;
  drums?: string;
  leadType: OscillatorType;
}

// One token per eighth note. "." rests, "-" holds the previous note. Drums: k kick, s snare, h hat.
const TRACKS: Record<TrackId, Track> = {
  neon: {
    bpm: 140,
    leadType: 'square',
    lead: 'A4 C5 E5 C5 A4 C5 E5 A5 F4 A4 C5 A4 F4 A4 C5 F5 E4 G4 C5 G4 E4 G4 C5 E5 D4 G4 B4 G4 D4 G4 B4 D5',
    bass: 'A2 . A2 A3 A2 . A2 A3 F2 . F2 F3 F2 . F2 F3 C3 . C3 C4 C3 . C3 C4 G2 . G2 G3 G2 . G2 G3',
    drums: 'k h s h k h s h k h s h k h s h k h s h k h s h k h s h k k s s',
  },
  puzzle: {
    bpm: 96,
    leadType: 'triangle',
    lead: 'E5 - G5 - C5 - . . D5 - E5 - B4 - . . C5 - A4 - C5 - F5 - D5 - B4 - G4 - . .',
    bass: 'C3 - - - G2 - - - A2 - - - E2 - - - F2 - - - C3 - - - G2 - - - G2 - - -',
    drums: 'k . h . . . h . k . h . . . h . k . h . . . h . k . h . . . h h',
  },
  korobeiniki: {
    bpm: 150,
    leadType: 'square',
    lead:
      'E5 - B4 C5 D5 - C5 B4 A4 - A4 C5 E5 - D5 C5 B4 - - C5 D5 - E5 - C5 - A4 - A4 - . . ' +
      '. D5 - F5 A5 - G5 F5 E5 - - C5 E5 - D5 C5 B4 - B4 C5 D5 - E5 - C5 - A4 - A4 - . .',
    bass:
      'E2 E3 E2 E3 E2 E3 E2 E3 A2 A3 A2 A3 A2 A3 A2 A3 G#2 G#3 G#2 G#3 E2 E3 E2 E3 A2 A3 A2 A3 A2 A3 B2 C3 ' +
      'D3 D2 D3 D2 D3 D2 D3 D2 C3 C2 C3 C2 C3 C2 C3 C2 B2 B1 B2 B1 E2 E3 E2 E3 A2 A3 A2 A3 A2 . . .',
    drums: 'k h s h k h s h',
  },
  tense: {
    bpm: 120,
    leadType: 'sawtooth',
    lead: 'D5 . . F5 . . A5 . G5 . F5 . E5 - - . F5 . . D5 . . A#4 . C5 . E5 . G5 - - .',
    bass: 'D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 . A#1 . A#2 . A#1 . A#2 . C2 . C3 . C2 . C3 .',
    drums: 'k . h . s . h . k . h k s . h h',
  },
};

const NOTE_INDEX: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

const noteFreq = (note: string) => {
  const m = /^([A-G]#?)(\d)$/.exec(note);
  if (!m) return 0;
  const midi = NOTE_INDEX[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
};

/** Turns a token string into [freq, lengthInSteps] per step (0 length = nothing starts there). */
const parseVoice = (src: string) => {
  const tokens = src.trim().split(/\s+/);
  const out: [number, number][] = tokens.map(() => [0, 0]);
  let last = -1;
  tokens.forEach((tok, i) => {
    if (tok === '-') {
      if (last >= 0) out[last][1]++;
    } else if (tok === '.') {
      last = -1;
    } else {
      out[i] = [noteFreq(tok), 1];
      last = i;
    }
  });
  return out;
};

let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicGain: GainNode | null = null;

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  if (musicGain) {
    const ac = musicGain.context;
    musicGain.gain.setTargetAtTime(0, ac.currentTime, 0.05);
    const g = musicGain;
    setTimeout(() => g.disconnect(), 400);
  }
  musicGain = null;
}

export function startMusic(id: TrackId) {
  stopMusic();
  const ac = getAudioContext();
  if (!ac) return;
  const track = TRACKS[id];
  const lead = parseVoice(track.lead);
  const bass = parseVoice(track.bass);
  const drums = (track.drums ?? '').trim().split(/\s+/);
  const stepLen = 60 / track.bpm / 2;
  const gain = ac.createGain();
  gain.gain.value = 0.0001;
  gain.gain.setTargetAtTime(0.35, ac.currentTime, 0.3);
  gain.connect(output(ac));
  musicGain = gain;

  let step = 0;
  let nextTime = ac.currentTime + 0.1;
  const schedule = () => {
    while (nextTime < ac.currentTime + 0.2) {
      const [lf, ll] = lead[step % lead.length];
      if (ll) tone(ac, lf, nextTime, ll * stepLen * 0.92, 0.035, track.leadType, undefined, gain);
      const [bf, bl] = bass[step % bass.length];
      if (bl) tone(ac, bf, nextTime, bl * stepLen * 0.9, 0.07, 'triangle', undefined, gain);
      const hit = drums[step % drums.length];
      if (hit === 'k') tone(ac, 150, nextTime, 0.12, 0.25, 'sine', 40, gain);
      else if (hit === 's') burst(ac, nextTime, 0.1, 0.08, 'bandpass', 1800, undefined, gain);
      else if (hit === 'h') burst(ac, nextTime, 0.03, 0.04, 'highpass', 7000, undefined, gain);
      nextTime += stepLen;
      step++;
    }
  };
  schedule();
  musicTimer = setInterval(schedule, 50);
}

/** Plays a background loop while `active`, respecting the system sound toggle and tab visibility. */
export function useMusic(id: TrackId | null, active: boolean) {
  const { soundEnabled } = useSystem();
  useEffect(() => {
    if (!id || !active || !soundEnabled) return;
    const sync = () => (document.hidden ? stopMusic() : startMusic(id));
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      stopMusic();
    };
  }, [id, active, soundEnabled]);
}
