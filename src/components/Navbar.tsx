import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  Heart,
  Wind,
  Layers,
  MessageCircle,
  Compass,
  Music,
} from 'lucide-react';
import { soundscapes } from '../utils/soundscapes';
import { SoundscapeType } from '../types/meditation';

interface NavbarProps {
  activeTab: 'player' | 'generator' | 'chat' | 'breath' | 'library';
  setActiveTab: (tab: 'player' | 'generator' | 'chat' | 'breath' | 'library') => void;
  currentSoundscape: SoundscapeType;
  setCurrentSoundscape: (soundscape: SoundscapeType) => void;
  onEmergencyCalm: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentSoundscape,
  setCurrentSoundscape,
  onEmergencyCalm,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [soundscapeMenuOpen, setSoundscapeMenuOpen] = useState(false);
  const [volume, setVolume] = useState(0.35);

  const handleSoundscapeChange = (type: SoundscapeType) => {
    setCurrentSoundscape(type);
    soundscapes.play(type);
    setSoundscapeMenuOpen(false);
  };

  const toggleMute = () => {
    const muted = soundscapes.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    soundscapes.setVolume(v);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('#soundscape-dropdown')) {
        setSoundscapeMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-emerald-500/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand & Logo */}
        <div
          onClick={() => setActiveTab('player')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/30 border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:border-emerald-400/60 transition-all">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 blur-sm -z-10 group-hover:bg-emerald-400/20 transition-all" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-light tracking-wide text-white group-hover:text-emerald-200 transition-colors">
                Aura<span className="font-semibold text-emerald-400">Zen</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                AI Sanctuary
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wider">
              Generative Visuals & Voiceovers
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'player'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Sanctuary Player
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Create Custom Session
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
            Mindful AI Guide
          </button>

          <button
            onClick={() => setActiveTab('breath')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'breath'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            Breathwork
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Library
          </button>
        </nav>

        {/* Ambient Soundscapes & Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* Ambient Soundscape Dropdown */}
          <div className="relative" id="soundscape-dropdown">
            <button
              onClick={() => setSoundscapeMenuOpen(!soundscapeMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                currentSoundscape !== 'none'
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Ambient Soundscape"
            >
              <Music className={`w-3.5 h-3.5 ${currentSoundscape !== 'none' ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline capitalize">
                {currentSoundscape === 'none' ? 'Soundscape Off' : currentSoundscape}
              </span>
            </button>

            {soundscapeMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Synthesized Ambient Audio</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Web Audio</span>
                </div>

                <div className="space-y-1 mb-3">
                  {[
                    { id: 'none', label: 'Mute Soundscape', desc: 'Silence' },
                    { id: 'singingBowl', label: 'Tibetan Singing Bowl', desc: 'Periodic sacred harmonic chime' },
                    { id: 'rain', label: 'Forest Rain & Stream', desc: 'Continuous organic pink noise' },
                    { id: 'ocean', label: 'Gentle Ocean Tide', desc: 'Swelling deep wave cycles' },
                    { id: 'alphaDrone', label: '432Hz Alpha Waves', desc: 'Binaural meditative beat' },
                    { id: 'cosmicOm', label: 'Earth Om Resonance', desc: '136.1Hz harmonic drone' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSoundscapeChange(item.id as SoundscapeType)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                        currentSoundscape === item.id
                          ? 'bg-emerald-500/20 text-emerald-200 font-medium border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div>
                        <div>{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                      {currentSoundscape === item.id && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </button>
                  ))}
                </div>

                {currentSoundscape !== 'none' && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Soundscape Volume</span>
                      <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emergency Calm Anchor */}
          <button
            onClick={onEmergencyCalm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all hover:scale-102 active:scale-98 shadow-sm"
            title="Instant 1-Minute Grounding Calm"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="hidden sm:inline">Emergency Calm</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 py-2 px-2">
        <button
          onClick={() => setActiveTab('player')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'player' ? 'text-emerald-400 font-medium' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Player</span>
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'generator' ? 'text-emerald-400 font-medium' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Create</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'chat' ? 'text-cyan-400 font-medium' : 'text-slate-400'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('breath')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'breath' ? 'text-teal-400 font-medium' : 'text-slate-400'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Breath</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'library' ? 'text-emerald-400 font-medium' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Library</span>
        </button>
      </div>
    </header>
  );
};
