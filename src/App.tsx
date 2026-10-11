/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MeditationPlayer } from './components/MeditationPlayer';
import { SessionGenerator } from './components/SessionGenerator';
import { MindfulChatGuide } from './components/MindfulChatGuide';
import { BreathworkHub } from './components/BreathworkHub';
import { SessionLibrary } from './components/SessionLibrary';
import { DEFAULT_SESSIONS } from './data/defaultSessions';
import { MeditationSession, SoundscapeType } from './types/meditation';
import { soundscapes } from './utils/soundscapes';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'generator' | 'chat' | 'breath' | 'library'>('player');

  // Load custom sessions from localStorage
  const [customSessions, setCustomSessions] = useState<MeditationSession[]>(() => {
    try {
      const stored = localStorage.getItem('aurazen_custom_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const allSessions = [...customSessions, ...DEFAULT_SESSIONS];
  const [currentSession, setCurrentSession] = useState<MeditationSession>(allSessions[0]);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>(currentSession.soundscape || 'none');

  // Generator pre-fill from chat
  const [generatorIntention, setGeneratorIntention] = useState('');
  const [generatorPrompt, setGeneratorPrompt] = useState('');

  // Generation loading states for Player quick actions
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

  // Sync soundscape when switching sessions
  const handleSelectSession = (session: MeditationSession) => {
    setCurrentSession(session);
    setActiveTab('player');
    if (session.soundscape) {
      setCurrentSoundscape(session.soundscape);
      soundscapes.play(session.soundscape);
    }
  };

  const handleSessionCreated = (newSession: MeditationSession) => {
    setCustomSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession);
    setActiveTab('player');
    if (newSession.soundscape) {
      setCurrentSoundscape(newSession.soundscape);
      soundscapes.play(newSession.soundscape);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = customSessions.filter((s) => s.id !== sessionId);
    setCustomSessions(updated);
    try {
      localStorage.setItem('aurazen_custom_sessions', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    if (currentSession.id === sessionId) {
      setCurrentSession(DEFAULT_SESSIONS[0]);
    }
  };

  // Chat consultation -> Session Builder pre-fill
  const handleBuildSessionFromChat = (intention: string, promptNotes: string) => {
    setGeneratorIntention(intention);
    setGeneratorPrompt(promptNotes);
    setActiveTab('generator');
  };

  // Quick regenerate voiceover on current session (Gemini 3.8 Flash TTS)
  const handleRegenerateVoiceover = async (session: MeditationSession) => {
    setIsGeneratingVoice(true);
    try {
      const res = await fetch('/api/meditation/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: session.fullScript,
          voiceName: session.voiceName || 'Kore',
          speechStyle: session.speechStyle,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Voice synthesis failed');
      }

      const updated = { ...session, audioUrl: data.audioUrl };
      setCurrentSession(updated);

      // If it's custom, update stored list
      if (session.isCustom) {
        const updatedList = customSessions.map((s) => (s.id === session.id ? updated : s));
        setCustomSessions(updatedList);
        localStorage.setItem('aurazen_custom_sessions', JSON.stringify(updatedList));
      }
    } catch (err) {
      console.error('Error generating voiceover:', err);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Emergency calm handler
  const handleEmergencyCalm = () => {
    setActiveTab('breath');
    soundscapes.play('singingBowl');
    setCurrentSoundscape('singingBowl');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentSoundscape={currentSoundscape}
        setCurrentSoundscape={setCurrentSoundscape}
        onEmergencyCalm={handleEmergencyCalm}
      />

      {/* Main Body Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'player' && (
          <div className="space-y-10">
            <MeditationPlayer
              session={currentSession}
              onOpenGenerator={() => setActiveTab('generator')}
              onRegenerateVoiceover={handleRegenerateVoiceover}
              isGeneratingVoice={isGeneratingVoice}
              isGeneratingVisual={isGeneratingVisual}
            />

            {/* Quick Session Switcher Strip */}
            <div className="pt-4 border-t border-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-slate-200 font-light">
                  Explore Curated Environments
                </h3>
                <button
                  onClick={() => setActiveTab('library')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  View All Sanctuary Sessions →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {allSessions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all group flex items-center gap-3.5 ${
                      currentSession.id === s.id
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                        {s.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {s.durationMinutes} min • {s.voicePersona}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generator' && (
          <SessionGenerator
            onSessionCreated={handleSessionCreated}
            initialIntention={generatorIntention}
            initialPrompt={generatorPrompt}
          />
        )}

        {activeTab === 'chat' && (
          <MindfulChatGuide onBuildSessionFromChat={handleBuildSessionFromChat} />
        )}

        {activeTab === 'breath' && <BreathworkHub />}

        {activeTab === 'library' && (
          <SessionLibrary
            sessions={allSessions}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </main>

      {/* Zen Ambient Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/90 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
            <span>AuraZen AI Sanctuary</span>
            <span>•</span>
            <span>Powered by Gemini 3.8 Flash TTS, Gemini 3 Pro Image & Gemini Chat</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Image resolutions: 1K • 2K • 4K | Model: gemini-3-pro-image-preview
          </div>
        </div>
      </footer>
    </div>
  );
}
