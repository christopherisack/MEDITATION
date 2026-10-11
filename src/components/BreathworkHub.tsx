import React, { useState, useEffect } from 'react';
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Heart,
  Volume2,
} from 'lucide-react';
import { soundscapes } from '../utils/soundscapes';

type TechniqueKey = 'box' | 'relax478' | 'coherent55';

export const BreathworkHub: React.FC = () => {
  const TECHNIQUES = {
    box: {
      title: 'Box Breathing (4-4-4-4)',
      tagline: 'Navy SEAL Tactical Reset & Nervous System Balance',
      phases: [
        { name: 'Inhale', duration: 4, color: 'text-emerald-300', scale: 1.25 },
        { name: 'Hold', duration: 4, color: 'text-teal-300', scale: 1.25 },
        { name: 'Exhale', duration: 4, color: 'text-cyan-300', scale: 0.8 },
        { name: 'Hold Empty', duration: 4, color: 'text-slate-300', scale: 0.8 },
      ],
      description: 'Used by elite performers to eradicate cortisol spikes, steady the heart rate, and regain acute mental focus within minutes.',
    },
    relax478: {
      title: 'Relaxing 4-7-8 Breath',
      tagline: 'Dr. Andrew Weil Natural Tranquilizer for Anxiety & Insomnia',
      phases: [
        { name: 'Inhale through Nose', duration: 4, color: 'text-emerald-300', scale: 1.25 },
        { name: 'Hold Deeply', duration: 7, color: 'text-teal-300', scale: 1.25 },
        { name: 'Whoosh Exhale', duration: 8, color: 'text-indigo-300', scale: 0.75 },
      ],
      description: 'Forces oxygen absorption and triggers the parasympathetic vagus nerve, inducing deep muscle relaxation and sleepiness.',
    },
    coherent55: {
      title: 'Coherent 5-5 Heart Flow',
      tagline: 'Heart Rate Variability (HRV) Synchronization',
      phases: [
        { name: 'Gentle Inhale', duration: 5, color: 'text-emerald-300', scale: 1.2 },
        { name: 'Gentle Exhale', duration: 5, color: 'text-teal-300', scale: 0.85 },
      ],
      description: 'Synchronizes your heart rhythm with your respiratory cycle, generating emotional resilience and clear mental flow.',
    },
  };

  const [techniqueKey, setTechniqueKey] = useState<TechniqueKey>('box');
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TECHNIQUES.box.phases[0].duration);
  const [totalRounds, setTotalRounds] = useState(0);

  const currentTech = TECHNIQUES[techniqueKey];
  const currentPhase = currentTech.phases[phaseIndex];

  // Reset when technique changes
  useEffect(() => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsLeft(TECHNIQUES[techniqueKey].phases[0].duration);
    setTotalRounds(0);
  }, [techniqueKey]);

  // Main breath loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Play gentle singing bowl chime on transition
          soundscapes.strikeBowl();

          setPhaseIndex((currIdx) => {
            const nextIdx = (currIdx + 1) % currentTech.phases.length;
            if (nextIdx === 0) {
              setTotalRounds((r) => r + 1);
            }
            return nextIdx;
          });
          return currentTech.phases[(phaseIndex + 1) % currentTech.phases.length].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phaseIndex, currentTech]);

  const toggleStart = () => {
    if (!isActive) {
      soundscapes.strikeBowl();
    }
    setIsActive(!isActive);
  };

  const resetBreath = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsLeft(currentTech.phases[0].duration);
    setTotalRounds(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider">
          <Wind className="w-3.5 h-3.5" />
          <span>Somatic Breathwork Guide</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
          Breath as an Anchor
        </h1>
        <p className="text-sm text-slate-300 font-light">
          Regulate your autonomic nervous system with scientifically grounded rhythmic respiration patterns.
        </p>
      </div>

      {/* Technique Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(TECHNIQUES) as TechniqueKey[]).map((key) => {
          const t = TECHNIQUES[key];
          const isSelected = techniqueKey === key;

          return (
            <button
              key={key}
              onClick={() => setTechniqueKey(key)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-tr from-slate-900 to-teal-950/60 border-teal-400/60 shadow-lg shadow-teal-500/10'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <h3 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-teal-200' : 'text-slate-200'}`}>
                {t.title}
              </h3>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {t.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Visual Breathing Orb Container */}
      <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
        {/* Outer Pulsing Wave Ring */}
        <div
          className="absolute w-80 h-80 rounded-full border border-teal-500/20 transition-transform duration-1000 ease-in-out pointer-events-none"
          style={{
            transform: `scale(${isActive ? currentPhase.scale * 1.15 : 1})`,
          }}
        />

        {/* Core Glowing Breathing Ring */}
        <div
          className="relative z-10 w-56 h-56 rounded-full flex flex-col items-center justify-center backdrop-blur-2xl border border-teal-300/40 shadow-2xl shadow-teal-500/20 transition-transform duration-1000 ease-in-out bg-gradient-to-tr from-slate-950 via-teal-950/60 to-emerald-900/40"
          style={{
            transform: `scale(${isActive ? currentPhase.scale : 1})`,
          }}
        >
          <span className={`text-sm uppercase tracking-widest font-semibold ${currentPhase.color}`}>
            {currentPhase.name}
          </span>
          <span className="text-4xl font-light text-white my-1 font-mono">
            {secondsLeft}s
          </span>
          <span className="text-[10px] text-slate-400 tracking-wider">
            Round {totalRounds + 1}
          </span>
        </div>

        {/* Phase step indicator */}
        <div className="flex items-center gap-2 mt-8 z-10">
          {currentTech.phases.map((p, idx) => (
            <div
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                phaseIndex === idx
                  ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              {p.name} ({p.duration}s)
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-8 z-10">
          <button
            onClick={resetBreath}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleStart}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Exercise</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Begin Breathing Flow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">{currentTech.title}</strong>
          {currentTech.description}
        </div>
      </div>
    </div>
  );
};
