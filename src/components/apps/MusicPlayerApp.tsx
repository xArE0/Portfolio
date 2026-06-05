import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

interface MusicPlayerAppProps {
  darkMode: boolean;
}

interface Track {
  name: string;
  artist: string;
  duration: string;
  baseFreq: number;
  color: string;
}

const playlist: Track[] = [
  { name: 'lofi_coding_beats.wav', artist: 'PortfolioOS Radio', duration: '∞', baseFreq: 220, color: '#8b5cf6' },
  { name: 'midnight_debug.wav', artist: 'Terminal Vibes', duration: '∞', baseFreq: 196, color: '#06b6d4' },
  { name: 'async_dreams.wav', artist: 'Promise.resolve()', duration: '∞', baseFreq: 262, color: '#f59e0b' },
  { name: 'syntax_chill.wav', artist: 'Compiler FM', duration: '∞', baseFreq: 174, color: '#10b981' },
  { name: 'binary_sunset.wav', artist: 'Stack Overflow', duration: '∞', baseFreq: 233, color: '#ef4444' },
];

export const MusicPlayerApp: React.FC<MusicPlayerAppProps> = ({ darkMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  const currentTrack = playlist[currentTrackIdx];

  const stopAudio = useCallback(() => {
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    if (lfoRef.current) {
      try { lfoRef.current.stop(); } catch { /* already stopped */ }
    }
    oscillatorsRef.current = [];
    gainNodesRef.current = [];
    lfoRef.current = null;
  }, []);

  const startAudio = useCallback(() => {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    stopAudio();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const baseFreq = currentTrack.baseFreq;

    // Create a pad-like ambient sound with multiple detuned oscillators
    const chordNotes = [1, 1.25, 1.5, 2]; // root, major 3rd, 5th, octave
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    chordNotes.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * ratio, ctx.currentTime);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 10, ctx.currentTime);

      gain.gain.setValueAtTime(0.08 / chordNotes.length, ctx.currentTime);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();

      oscillators.push(osc);
      gains.push(gain);
    });

    // LFO for subtle tremolo effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.3, ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.015, ctx.currentTime);
    lfo.connect(lfoGain);
    chordNotes.forEach((_, i) => {
      lfoGain.connect(gains[i].gain);
    });
    lfo.start();

    oscillatorsRef.current = oscillators;
    gainNodesRef.current = gains;
    lfoRef.current = lfo;
  }, [currentTrack, volume, isMuted, stopAudio]);

  // Update volume in real time
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [stopAudio]);

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio();
      setIsPlaying(true);
    }
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      stopAudio();
    }
    const nextIdx = direction === 'next'
      ? (currentTrackIdx + 1) % playlist.length
      : (currentTrackIdx - 1 + playlist.length) % playlist.length;
    setCurrentTrackIdx(nextIdx);
    if (wasPlaying) {
      // Small delay to let state update
      setTimeout(() => {
        setIsPlaying(true);
      }, 50);
    }
  };

  // Restart audio when track changes and we're playing
  useEffect(() => {
    if (isPlaying) {
      startAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIdx]);

  // Generate visualizer bars data
  const barCount = 24;

  return (
    <div className={`flex flex-col h-full w-full select-none ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#f9f9f9] text-gray-800'
    }`}>
      {/* Album Art / Visualizer Area */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: darkMode
            ? `radial-gradient(ellipse at center, ${currentTrack.color}15 0%, transparent 70%)`
            : `radial-gradient(ellipse at center, ${currentTrack.color}10 0%, transparent 70%)`
        }}
      >
        {/* Visualizer Bars */}
        <div className="flex items-end gap-[2px] h-20 mb-6">
          {Array.from({ length: barCount }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-t-full ${isPlaying ? 'music-bar' : ''}`}
              style={{
                backgroundColor: isPlaying ? currentTrack.color : (darkMode ? '#333' : '#ccc'),
                height: isPlaying ? undefined : '4px',
                ['--bar-height' as string]: `${6 + Math.random() * 20}px`,
                ['--bar-speed' as string]: `${0.3 + Math.random() * 0.5}s`,
                ['--bar-delay' as string]: `${i * 0.04}s`,
              }}
            />
          ))}
        </div>

        {/* Track Icon */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-all duration-300 ${
            isPlaying ? 'music-pulse' : ''
          }`}
          style={{
            backgroundColor: currentTrack.color + '25',
            border: `2px solid ${currentTrack.color}40`
          }}
        >
          <Music size={32} style={{ color: currentTrack.color }} />
        </div>

        {/* Track Info */}
        <div className="text-center animate-fade-in" key={currentTrackIdx}>
          <h3 className="font-semibold text-sm mb-1 font-mono">{currentTrack.name}</h3>
          <p className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={`px-5 py-4 border-t ${
        darkMode ? 'bg-[#181818] border-neutral-800' : 'bg-white border-gray-200'
      }`}>
        {/* Progress bar (decorative for ambient tracks) */}
        <div className={`w-full h-1 rounded-full mb-4 overflow-hidden ${
          darkMode ? 'bg-neutral-800' : 'bg-gray-200'
        }`}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: isPlaying ? '100%' : '0%',
              backgroundColor: currentTrack.color,
              transition: isPlaying ? 'width 30s linear' : 'width 0.3s ease',
            }}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          {/* Volume Control */}
          <div className="flex items-center gap-2 w-28">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1 rounded transition-colors ${
                darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-200'
              }`}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${currentTrack.color} 0%, ${currentTrack.color} ${(isMuted ? 0 : volume) * 100}%, ${darkMode ? '#333' : '#ddd'} ${(isMuted ? 0 : volume) * 100}%, ${darkMode ? '#333' : '#ddd'} 100%)`,
              }}
            />
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => skipTrack('prev')}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-200'
              }`}
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: currentTrack.color }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            <button
              onClick={() => skipTrack('next')}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-200'
              }`}
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Duration */}
          <div className="w-28 text-right">
            <span className={`text-[10px] font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {currentTrack.duration} • Ambient
            </span>
          </div>
        </div>

        {/* Playlist */}
        <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-neutral-800' : 'border-gray-200'}`}>
          <span className={`text-[9px] uppercase font-bold tracking-wider ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Up Next
          </span>
          <div className="mt-1.5 flex flex-col gap-1">
            {playlist.map((track, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const wasPlaying = isPlaying;
                  if (wasPlaying) stopAudio();
                  setCurrentTrackIdx(idx);
                  if (wasPlaying) setTimeout(() => setIsPlaying(true), 50);
                }}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-left transition-all duration-150 ${
                  idx === currentTrackIdx
                    ? 'bg-win11-blue/15 text-win11-blue'
                    : (darkMode ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600')
                }`}
              >
                <Music size={12} style={{ color: track.color }} />
                <span className="text-[10px] font-mono truncate flex-1">{track.name}</span>
                <span className={`text-[9px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  {track.artist}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
