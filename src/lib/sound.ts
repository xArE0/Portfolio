import type { SoundType } from '../types';

let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx || ctx.state === 'closed') ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(ac: AudioContext, freq: number, start: number, length: number, peak: number, type: OscillatorType = 'sine', endFreq?: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + length);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.05, length / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

export function playSound(type: SoundType) {
  try {
    const ac = getAudioContext();
    if (!ac) return;
    const now = ac.currentTime;
    switch (type) {
      case 'startup':
        [155.56, 233.08, 311.13, 392.0, 466.16].forEach((f, i) =>
          tone(ac, f, now + i * 0.12, 2.5, 0.12, i % 2 ? 'triangle' : 'sine'));
        break;
      case 'shutdown':
        tone(ac, 261.63, now, 1.2, 0.2, 'sine', 130.81);
        break;
      case 'beep':
        tone(ac, 440, now, 0.12, 0.1);
        break;
      case 'unlock':
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ac, f, now + i * 0.08, 0.4, 0.08, 'triangle'));
        break;
      case 'error':
        tone(ac, 220, now, 0.18, 0.12, 'square');
        tone(ac, 196, now + 0.2, 0.25, 0.12, 'square');
        break;
    }
  } catch {
    /* audio blocked */
  }
}
