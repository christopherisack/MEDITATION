import React, { useState } from 'react';
import {
  Play,
  Trash2,
  Sparkles,
  Clock,
  Mic,
  Image as ImageIcon,
  Wind,
  Layers,
  Search,
} from 'lucide-react';
import { MeditationSession } from '../types/meditation';

interface SessionLibraryProps {
  sessions: MeditationSession[];
  onSelectSession: (session: MeditationSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionLibrary: React.FC<SessionLibraryProps> = ({
  sessions,
  onSelectSession,
  onDeleteSession,
}) => {
  const [filter, setFilter] = useState<'all' | 'custom' | 'curated'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'custom' && !s.isCustom) return false;
    if (filter === 'curated' && s.isCustom) return false;
    if (searchTerm) {
      const matchTitle = s.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = s.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchVoice = s.voicePersona.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTitle || matchDesc || matchVoice;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-white mb-1">
            Sanctuary Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse curated mindfulness environments and your bespoke AI-generated sessions.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {(['all', 'custom', 'curated'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === tab
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Sessions' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by intention, voice guide, or ambiance theme..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
        />
      </div>

      {/* Grid of Sessions */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <Layers className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-sm">No sanctuary sessions found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-3xl overflow-hidden bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-xl group flex flex-col"
            >
              {/* Image banner */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={session.imageUrl}
                  alt={session.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Badges on artwork */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {session.isCustom ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                      Bespoke AI
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950/60 backdrop-blur-md text-[10px] font-medium text-slate-300 border border-slate-700/60">
                      Curated
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 backdrop-blur-md text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                    {session.imageSize}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-medium text-slate-200 border border-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{session.durationMinutes} min</span>
                  </span>
                </div>

                {/* Hover Play Overlay */}
                <div
                  onClick={() => onSelectSession(session)}
                  className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-400/30 scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-light text-white mb-1 line-clamp-1 group-hover:text-emerald-200 transition-colors">
                    {session.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {session.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Mic className="w-3.5 h-3.5 text-teal-400" />
                    <span>{session.voicePersona}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectSession(session)}
                      className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Experience</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
