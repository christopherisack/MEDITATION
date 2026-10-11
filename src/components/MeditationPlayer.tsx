import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Sparkles,
  Mic,
  Eye,
  Wind,
  FileText,
  Clock,
  CheckCircle2,
  Share2,
  Loader2,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { MeditationSession, ScriptSegment } from '../types/meditation';
import { soundscapes } from '../utils/soundscapes';

interface MeditationPlayerProps {
  session: MeditationSession;
  onOpenGenerator: () => void;
  onRegenerateVoiceover?: (session: MeditationSession) => Promise<void>;
  onRegenerateVisual?: (session: MeditationSession) => Promise<void>;
  isGeneratingVoice?: boolean;
  isGeneratingVisual?: boolean;
}

export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({
  session,
  onOpenGenerator,
  onRegenerateVoiceover,
  onRegenerateVisual,
  isGeneratingVoice = false,
  isGeneratingVisual = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(session.durationMinutes * 60);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBreathingOrb, setShowBreathingOrb] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  // Breathing state: 'inhale' | 'hold' | 'exhale' | 'rest'
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [breathCounter, setBreathCounter] = useState(4);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Breath pacing timer (4-4-4-4 box pacing)
  useEffect(() => {
    if (!isPlaying || !showBreathingOrb) return;

    const timer = setInterval(() => {
      setBreathCounter((prev) => {
        if (prev <= 1) {
          setBreathPhase((curr) => {
            if (curr === 'inhale') return 'hold';
            if (curr === 'hold') return 'exhale';
            if (curr === 'exhale') return 'rest';
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, showBreathingOrb]);

  // Sync audio element with session
  useEffect(() => {
    if (audioRef.current && session.audioUrl) {
      audioRef.current.src = session.audioUrl;
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [session.audioUrl]);

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      setCurrentTime(cur);

      // Estimate active segment if segments exist
      if (session.segments && session.segments.length > 0) {
        const segDuration = (duration || 300) / session.segments.length;
        const index = Math.min(
          session.segments.length - 1,
          Math.floor(cur / Math.max(1, segDuration))
        );
        setActiveSegmentIndex(index);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!session.audioUrl) {
      // If no audio yet, trigger voice generation or start simulated playback timer
      if (onRegenerateVoiceover) {
        onRegenerateVoiceover(session);
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio play error:', e);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (amount: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + amount));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) setIsMuted(true);
      else if (isMuted) setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Download voiceover wav
  const downloadAudio = () => {
    if (!session.audioUrl) return;
    const a = document.createElement('a');
    a.href = session.audioUrl;
    a.download = `${session.title.toLowerCase().replace(/\s+/g, '-')}-voiceover.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download visual image
  const downloadImage = () => {
    if (!session.imageUrl) return;
    const a = document.createElement('a');
    a.href = session.imageUrl;
    a.download = `${session.title.toLowerCase().replace(/\s+/g, '-')}-${session.imageSize}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-slate-950 transition-all ${
        isFullscreen ? 'h-screen rounded-none' : 'min-h-[620px]'
      }`}
    >
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Background Visual Layer */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={session.imageUrl}
          alt={session.title}
          className={`w-full h-full object-cover transition-transform duration-10000 ease-out ${
            isPlaying ? 'scale-108' : 'scale-100'
          }`}
        />
        {/* Cinematic Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/40 to-slate-950/80" />

        {/* Ambient Subtle Particle Grid / Zen Aura Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Top Header Bar inside Player */}
      <div className="relative z-10 p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Voice: {session.voicePersona} ({session.voiceName})</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Visual: {session.imageSize} ({session.aspectRatio})</span>
          </div>

          {session.soundscape !== 'none' && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-teal-500/30 text-teal-300 text-xs font-medium">
              <Wind className="w-3.5 h-3.5" />
              <span className="capitalize">{session.soundscape} soundscape</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Breathing Orb */}
          <button
            onClick={() => setShowBreathingOrb(!showBreathingOrb)}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
              showBreathingOrb
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Toggle Breathing Guide"
          >
            <Wind className="w-4 h-4" />
          </button>

          {/* Toggle Script Transcript */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
              showTranscript
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Toggle Spoken Transcript"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Download Visual Image */}
          <button
            onClick={downloadImage}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white transition-all"
            title={`Download ${session.imageSize} High-Res Visual`}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Center Meditation Content & Breathing Guide */}
      <div className="relative z-10 px-6 sm:px-12 py-4 flex flex-col items-center justify-center min-h-[360px] text-center">
        {showBreathingOrb ? (
          <div className="relative flex flex-col items-center justify-center my-6">
            {/* Outer Pulsing Rings */}
            <div
              className={`absolute rounded-full border border-emerald-400/20 transition-all duration-1000 ${
                breathPhase === 'inhale'
                  ? 'w-64 h-64 scale-110 bg-emerald-500/10'
                  : breathPhase === 'hold'
                  ? 'w-64 h-64 scale-110 bg-teal-500/15 animate-pulse'
                  : breathPhase === 'exhale'
                  ? 'w-48 h-48 scale-90 bg-emerald-950/20'
                  : 'w-48 h-48 scale-95 bg-slate-900/20'
              }`}
            />
            <div
              className={`absolute rounded-full border border-emerald-300/40 transition-all duration-1000 ${
                breathPhase === 'inhale'
                  ? 'w-52 h-52 scale-105'
                  : breathPhase === 'hold'
                  ? 'w-52 h-52 scale-105'
                  : breathPhase === 'exhale'
                  ? 'w-36 h-36 scale-95'
                  : 'w-36 h-36'
              }`}
            />

            {/* Glowing Core Breathing Orb */}
            <div
              className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center backdrop-blur-xl border shadow-2xl transition-all duration-1000 ${
                breathPhase === 'inhale'
                  ? 'bg-gradient-to-tr from-emerald-600/60 to-teal-400/60 border-emerald-300/60 shadow-emerald-500/40 scale-110'
                  : breathPhase === 'hold'
                  ? 'bg-gradient-to-tr from-teal-600/60 to-cyan-400/60 border-cyan-300/60 shadow-cyan-500/40 scale-110'
                  : breathPhase === 'exhale'
                  ? 'bg-gradient-to-tr from-emerald-900/60 to-teal-800/60 border-emerald-500/30 shadow-emerald-900/30 scale-90'
                  : 'bg-gradient-to-tr from-slate-800/60 to-slate-700/60 border-slate-600/30 shadow-none scale-95'
              }`}
            >
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-200">
                {breathPhase === 'inhale' && 'Inhale'}
                {breathPhase === 'hold' && 'Hold'}
                {breathPhase === 'exhale' && 'Exhale'}
                {breathPhase === 'rest' && 'Rest'}
              </span>
              <span className="text-2xl font-light text-white mt-1">
                {breathCounter}s
              </span>
            </div>
          </div>
        ) : (
          <div className="my-8 max-w-xl">
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-white mb-2 tracking-wide drop-shadow-md">
              {session.title}
            </h1>
            <p className="text-sm sm:text-base text-emerald-200/90 font-light drop-shadow">
              {session.subtitle}
            </p>
          </div>
        )}

        {/* Current Spoken Script Line / Segment */}
        {showTranscript && session.segments && session.segments.length > 0 && (
          <div className="max-w-2xl px-6 py-4 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-emerald-500/20 shadow-2xl my-3 transition-all animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium mb-1.5 uppercase tracking-wider">
              <span>{session.segments[activeSegmentIndex]?.phase || 'Mindful Spoken Presence'}</span>
              <span>
                Part {activeSegmentIndex + 1} of {session.segments.length}
              </span>
            </div>
            <p className="text-base sm:text-lg font-serif font-light text-slate-100 leading-relaxed italic drop-shadow">
              "{session.segments[activeSegmentIndex]?.text || session.fullScript.slice(0, 160)}..."
            </p>
          </div>
        )}

        {/* Notice if Audio is missing */}
        {!session.audioUrl && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/60 backdrop-blur-md border border-emerald-500/40 text-slate-200 max-w-md flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Synthesize with Gemini 3.8 Flash TTS</span>
            </div>
            <p className="text-xs text-slate-300 text-center">
              Generate realistic vocal expression with natural breathing markers using the Gemini 3.8 Flash TTS flagship model.
            </p>
            <button
              onClick={() => onRegenerateVoiceover && onRegenerateVoiceover(session)}
              disabled={isGeneratingVoice}
              className="mt-1 flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isGeneratingVoice ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Voiceover...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Voiceover Now</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono text-slate-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 group">
            <input
              type="range"
              min="0"
              max={duration || 300}
              step="0.5"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 group-hover:h-2.5 transition-all"
            />
          </div>
          <span className="text-xs font-mono text-slate-400 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback Controls & Utility Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Session Info / Voice Details */}
          <div className="hidden sm:block text-left">
            <h2 className="text-sm font-medium text-white line-clamp-1">
              {session.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{session.durationMinutes} min</span>
              <span>•</span>
              <span className="text-emerald-400">{session.voicePersona}</span>
              <span>•</span>
              <span className="text-cyan-400">{session.imageSize} visual</span>
            </div>
          </div>

          {/* Center: Main Transport Buttons */}
          <div className="flex items-center gap-4 mx-auto sm:mx-0">
            {/* Rewind 10s */}
            <button
              onClick={() => skipTime(-10)}
              className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => skipTime(10)}
              className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              title="Fast Forward 10 seconds"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Sound & Speed Settings */}
          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-800">
              {[0.8, 1.0, 1.2].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                    playbackSpeed === s
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Voiceover Volume */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-18 accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Download Voiceover Audio (.wav) */}
            {session.audioUrl && (
              <button
                onClick={downloadAudio}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                title="Download Spoken Voiceover Audio (.wav)"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Customize / Edit Session */}
            <button
              onClick={onOpenGenerator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
